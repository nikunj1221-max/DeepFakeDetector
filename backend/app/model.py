"""
DeepGuard model module.
Architecture: EfficientNet-B0 with a 2-class head (FAKE=0, REAL=1).
"""

import io
import numpy as np
import torch
import torch.nn as nn
from PIL import Image
from torchvision import models, transforms
from torchvision.models import EfficientNet_B0_Weights


# ---------------------------------------------------------------------------
# Preprocessing (must match training transforms exactly)
# ---------------------------------------------------------------------------
INFERENCE_TRANSFORMS = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


# ---------------------------------------------------------------------------
# Model definition
# ---------------------------------------------------------------------------
class DeepfakeDetector(nn.Module):
    def __init__(self, pretrained: bool = True) -> None:
        super().__init__()
        weights = EfficientNet_B0_Weights.DEFAULT if pretrained else None
        backbone = models.efficientnet_b0(weights=weights)
        in_features: int = backbone.classifier[1].in_features  # 1280
        backbone.classifier = nn.Sequential(
            nn.Dropout(p=0.2, inplace=True),
            nn.Linear(in_features, 2),
        )
        self.backbone = backbone

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.backbone(x)


# ---------------------------------------------------------------------------
# Inference wrapper
# ---------------------------------------------------------------------------
class ModelInference:
    # Training dataset: Fake=0, Real=1
    CLASS_NAMES = ["FAKE", "REAL"]

    def __init__(
        self,
        model_path: str | None = None,
        device: str | None = None,
    ) -> None:
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")

        # Always build with pretrained=False when loading custom weights
        self.model = DeepfakeDetector(pretrained=(model_path is None))

        if model_path is not None:
            checkpoint = torch.load(model_path, map_location=self.device)
            state_dict = checkpoint.get("model_state_dict", checkpoint)

            # Kaggle saved bare EfficientNet keys: "features.x.x"
            # DeepfakeDetector wraps inside self.backbone so expects: "backbone.features.x.x"
            # Remap if needed
            first_key = next(iter(state_dict.keys()))
            if not first_key.startswith("backbone."):
                state_dict = {f"backbone.{k}": v for k, v in state_dict.items()}
                print("[model] Remapped state dict keys → added 'backbone.' prefix")

            self.model.load_state_dict(state_dict, strict=True)
            print(f"[model] ✅ Loaded fine-tuned weights from {model_path}")
        else:
            print("[model] ⚠ Using ImageNet-pretrained backbone only.")
            print("[model] ⚠ Run train.py to fine-tune on deepfake data for accurate results.")

        self.model.to(self.device)
        self.model.eval()

    def _preprocess(self, image_bytes: bytes) -> torch.Tensor:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = INFERENCE_TRANSFORMS(image).unsqueeze(0)
        return tensor.to(self.device)

    @torch.no_grad()
    def predict(self, image_bytes: bytes) -> dict:
        tensor = self._preprocess(image_bytes)
        logits = self.model(tensor)
        probs: np.ndarray = (
            torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()
        )

        predicted_idx: int = int(np.argmax(probs))
        verdict = self.CLASS_NAMES[predicted_idx]
        confidence = float(probs[predicted_idx]) * 100

        return {
            "verdict": verdict,
            "confidence": round(confidence, 2),
            "probabilities": {
                "fake": round(float(probs[0]) * 100, 2),
                "real": round(float(probs[1]) * 100, 2),
            },
        }
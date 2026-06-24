"""
DeepGuard model module.

Architecture: EfficientNet-B0 with a 2-class head (REAL=0, FAKE=1).

Out of the box the backbone uses ImageNet-pretrained weights – the model
will run but predictions will be random/meaningless until you replace
the classifier head weights with fine-tuned deepfake-detection weights.

See train.py for a complete fine-tuning script on FaceForensics++ or
any dataset with a real/ and fake/ folder structure.
"""

import io

import numpy as np
import torch
import torch.nn as nn
from PIL import Image
from torchvision import models, transforms
from torchvision.models import EfficientNet_B0_Weights


# ---------------------------------------------------------------------------
# Preprocessing  (must match training transforms exactly)
# ---------------------------------------------------------------------------
INFERENCE_TRANSFORMS = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],  # ImageNet stats
        std=[0.229, 0.224, 0.225],
    ),
])


# ---------------------------------------------------------------------------
# Model definition
# ---------------------------------------------------------------------------
class DeepfakeDetector(nn.Module):
    """
    EfficientNet-B0 with a two-class classification head.

    The default EfficientNet classifier is:
        Sequential(Dropout(p=0.2), Linear(1280, 1000))
    We replace it with:
        Sequential(Dropout(p=0.2), Linear(1280, 2))
    which gives logits for [REAL, FAKE].
    """

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
    """
    Loads the model (optionally from a fine-tuned checkpoint) and exposes
    a single `predict(image_bytes) -> dict` method.
    """

    CLASS_NAMES = ["REAL", "FAKE"]

    def __init__(
        self,
        model_path: str | None = None,
        device: str | None = None,
    ) -> None:
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")

        # Build model – use ImageNet weights if no custom checkpoint supplied
        self.model = DeepfakeDetector(pretrained=(model_path is None))

        if model_path is not None:
            checkpoint = torch.load(model_path, map_location=self.device)
            # Support both raw state-dicts and dicts saved by train.py
            state_dict = checkpoint.get("model_state_dict", checkpoint)
            self.model.load_state_dict(state_dict)
            print(f"[model] Loaded fine-tuned weights from {model_path}")
        else:
            print("[model] ⚠ Using ImageNet-pretrained backbone only.")
            print("[model] ⚠ Run train.py to fine-tune on deepfake data for accurate results.")

        self.model.to(self.device)
        self.model.eval()

    # ------------------------------------------------------------------
    def _preprocess(self, image_bytes: bytes) -> torch.Tensor:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = INFERENCE_TRANSFORMS(image).unsqueeze(0)  # (1, 3, 224, 224)
        return tensor.to(self.device)

    @torch.no_grad()
    def predict(self, image_bytes: bytes) -> dict:
        """
        Returns a dict with:
        {
            "verdict":       "REAL" | "FAKE",
            "confidence":    float (0–100),
            "probabilities": {"real": float, "fake": float},
        }
        """
        tensor = self._preprocess(image_bytes)
        logits = self.model(tensor)                                  # (1, 2)
        probs: np.ndarray = (
            torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()   # (2,)
        )

        predicted_idx: int = int(np.argmax(probs))
        verdict = self.CLASS_NAMES[predicted_idx]
        confidence = float(probs[predicted_idx]) * 100

        return {
            "verdict": verdict,
            "confidence": round(confidence, 2),
            "probabilities": {
                "real": round(float(probs[0]) * 100, 2),
                "fake": round(float(probs[1]) * 100, 2),
            },
        }

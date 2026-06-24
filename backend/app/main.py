"""
DeepGuard — FastAPI backend
Exposes a single /predict endpoint that accepts an image upload
and returns a REAL/FAKE verdict from the EfficientNet-B0 model.
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .model import ModelInference
from .schemas import HealthResponse, ModelInfoResponse, PredictionResponse

# ---------------------------------------------------------------------------
# Global model instance (loaded once at startup)
# ---------------------------------------------------------------------------
_model: ModelInference | None = None

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the model before accepting traffic; release resources on shutdown."""
    global _model
    model_path = os.getenv("MODEL_PATH")  # None → uses ImageNet pretrained weights
    print(f"[startup] Loading model (checkpoint={model_path or 'ImageNet pretrained'}) …")
    _model = ModelInference(model_path=model_path)
    print(f"[startup] Model ready on {_model.device}")
    yield
    # Nothing to clean up for a CPU/GPU PyTorch model


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="DeepGuard API",
    description="Detect AI-generated / deepfake images using EfficientNet-B0",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow the Vite dev server and any local preview to reach this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:4173",
        "http://localhost:3000",
        os.getenv("FRONTEND_ORIGIN", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/health", response_model=HealthResponse, tags=["meta"])
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        model_loaded=_model is not None,
        device=_model.device if _model else "none",
    )


@app.get("/model/info", response_model=ModelInfoResponse, tags=["meta"])
async def model_info() -> ModelInfoResponse:
    if _model is None:
        raise HTTPException(status_code=503, detail="Model not initialised")
    return ModelInfoResponse(
        architecture="EfficientNet-B0",
        input_size="224×224",
        classes=["REAL", "FAKE"],
        device=_model.device,
        using_finetuned_weights=os.getenv("MODEL_PATH") is not None,
    )


@app.post("/predict", response_model=PredictionResponse, tags=["inference"])
async def predict(file: UploadFile = File(...)) -> PredictionResponse:
    """
    Accept a single image (JPEG / PNG / WebP, ≤ 10 MB) and return:
    - verdict      : "REAL" or "FAKE"
    - confidence   : 0–100 (%)
    - probabilities: {"real": x, "fake": y}
    """
    if _model is None:
        raise HTTPException(status_code=503, detail="Model not ready")

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported media type '{file.content_type}'. Use JPEG, PNG or WebP.",
        )

    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_BYTES:
        raise HTTPException(
            status_code=413, detail="File exceeds 10 MB limit."
        )

    try:
        result = _model.predict(image_bytes)
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Inference error: {exc}"
        ) from exc

    return PredictionResponse(**result)

from pydantic import BaseModel, Field
from typing import Dict


class PredictionResponse(BaseModel):
    verdict: str = Field(..., examples=["FAKE"], description="'REAL' or 'FAKE'")
    confidence: float = Field(..., ge=0, le=100, examples=[94.3], description="Confidence in the verdict (0–100 %)")
    probabilities: Dict[str, float] = Field(
        ...,
        examples=[{"real": 5.7, "fake": 94.3}],
        description="Per-class softmax probabilities (0–100 %)",
    )


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    device: str


class ModelInfoResponse(BaseModel):
    architecture: str
    input_size: str
    classes: list[str]
    device: str
    using_finetuned_weights: bool

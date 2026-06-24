# DeepGuard — Forensic Image Analyzer

A fullstack deepfake detection app built on **EfficientNet-B0** (PyTorch),
served by a **FastAPI** backend and a **React + Vite** frontend.

```
 User uploads image
       │
       ▼
 React (Vite)          FastAPI            PyTorch
 ┌──────────┐  POST   ┌──────────┐  →   ┌──────────────────┐
 │ Drag &   │ /predict│ Validate │       │ EfficientNet-B0  │
 │ drop UI  │ ──────► │ + parse  │ ───► │ 2-class head     │
 │ Scan anim│         │ response │ ◄─── │ softmax output   │
 └──────────┘ ◄────── └──────────┘       └──────────────────┘
       │
 Verdict: REAL / FAKE + confidence %
```

---

## Project structure

```
deepfake-detector/
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI app, CORS, /predict endpoint
│   │   ├── model.py       # DeepfakeDetector (EfficientNet-B0) + inference wrapper
│   │   └── schemas.py     # Pydantic response models
│   ├── models/            # Drop your .pth checkpoint here
│   ├── train.py           # Fine-tuning script (FaceForensics++ or custom data)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # State machine (idle → analyzing → done)
│   │   ├── components/
│   │   │   ├── Header.jsx             # Nav + API status
│   │   │   ├── Uploader.jsx           # Drag-and-drop zone
│   │   │   └── ResultCard.jsx         # Verdict + animated probability bars
│   │   └── index.css                  # Design system + scan animation
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── docker-compose.yml
```

---

## Quick start (local, no Docker)

### 1 — Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

pip install -r requirements.txt

# Run without a checkpoint (uses ImageNet weights — demo only)
uvicorn app.main:app --reload --port 8000

# Run with fine-tuned weights
MODEL_PATH=./models/deepguard_efficientnet_b0.pth \
  uvicorn app.main:app --reload --port 8000
```

### 2 — Frontend

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

### Quick start (Docker)

```bash
docker-compose up --build
# Frontend → http://localhost:5173
# API docs  → http://localhost:8000/docs
```

---

## API reference

| Method | Path          | Description                              |
|--------|---------------|------------------------------------------|
| GET    | `/health`     | Returns `{ status, model_loaded, device }` |
| GET    | `/model/info` | Architecture metadata                    |
| POST   | `/predict`    | Upload image → verdict + probabilities   |

### POST `/predict`

**Request** — `multipart/form-data`

| Field | Type | Notes |
|-------|------|-------|
| `file` | binary | JPEG / PNG / WebP, ≤ 10 MB |

**Response**

```json
{
  "verdict":       "FAKE",
  "confidence":    94.3,
  "probabilities": { "real": 5.7, "fake": 94.3 }
}
```

---

## Model architecture

```
Input image (any size)
       │
       ▼
  Resize → 256px
  CenterCrop → 224×224
  Normalize (ImageNet stats)
       │
       ▼
 EfficientNet-B0 backbone
 (MBConv blocks, Squeeze-and-Excitation)
       │
       ▼
 Classifier head
   Dropout(0.2)
   Linear(1280 → 2)
       │
       ▼
  Softmax → [P(real), P(fake)]
```

The model is a drop-in binary classifier on top of EfficientNet-B0. Class
indices are **0 = REAL, 1 = FAKE** — ensure your training data folder
names (`real/` and `fake/`) sort in this order so `ImageFolder` maps them
correctly.

---

## Training on your own deepfake dataset

### 1 — Get a dataset

| Dataset | Size | Link |
|---------|------|------|
| FaceForensics++ | ~600 GB | [github.com/ondyari/FaceForensics](https://github.com/ondyari/FaceForensics) — requires request |
| Celeb-DF-v2 | ~2 GB | [github.com/yuezunli/celeb-deepfakeforensics](https://github.com/yuezunli/celeb-deepfakeforensics) |
| DFDC (Kaggle) | ~470 GB | [kaggle.com/competitions/deepfake-detection-challenge](https://www.kaggle.com/competitions/deepfake-detection-challenge) |

Extract face crops (FaceForensics++ ships an extraction script) and arrange
them as:

```
data/
  train/
    real/   ← authentic face frames
    fake/   ← manipulated face frames
  val/
    real/
    fake/
```

### 2 — Fine-tune

```bash
cd backend
python train.py \
  --data_dir    ./data \
  --epochs      20 \
  --batch_size  32 \
  --output_path ./models/deepguard_efficientnet_b0.pth
```

Training runs ~15 min/epoch on a single T4 GPU for Celeb-DF-v2.
Expect **≥ 95% val accuracy** after 20 epochs.

### 3 — Plug in the checkpoint

```bash
MODEL_PATH=./models/deepguard_efficientnet_b0.pth \
  uvicorn app.main:app --reload --port 8000
```

---

## Environment variables

| Variable          | Default                   | Description                               |
|-------------------|---------------------------|-------------------------------------------|
| `MODEL_PATH`      | *(none)*                  | Path to `.pth` checkpoint. Omit to use ImageNet pretrained weights (demo mode). |
| `FRONTEND_ORIGIN` | `http://localhost:5173`   | Allowed CORS origin                       |
| `VITE_API_URL`    | `http://localhost:8000`   | Backend URL seen by the browser           |

---

## Extending the project

- **Face detection pre-crop** — run MTCNN (`facenet-pytorch`) before inference to crop the face region; this significantly boosts accuracy on full-scene photos.
- **Batch endpoint** — add `POST /predict/batch` that accepts a ZIP of images and returns a CSV.
- **Grad-CAM overlay** — use `pytorch-grad-cam` to highlight which image regions drove the prediction.
- **Auth** — add JWT-based auth with FastAPI's `OAuth2PasswordBearer` if you deploy publicly.
- **Model versioning** — store checkpoints in S3 and add a `/model/switch` endpoint.

---

## Disclaimer

DeepGuard is a research / portfolio tool. Prediction accuracy depends on the
quality and diversity of the fine-tuning dataset. Do **not** rely on it as
sole evidence in legal, journalistic, or safety-critical contexts.

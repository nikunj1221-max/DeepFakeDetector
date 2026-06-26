FROM python:3.11-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

# System deps for Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN python -m pip install -r requirements.txt

COPY . .

# Add this right above EXPOSE 8000 to make it compatible with Hugging Face
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app
COPY --chown=user . $HOME/app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--log-level", "info"]

# Optional: set MODEL_PATH at runtime via env var
# ENV MODEL_PATH=/app/models/deepguard_efficientnet_b0.pth
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--log-level", "info"]

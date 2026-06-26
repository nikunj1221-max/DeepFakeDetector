"""
train.py — Fine-tune EfficientNet-B0 for deepfake detection.

Dataset layout expected:
    data/
        train/
            real/   ← frames extracted from pristine videos
            fake/   ← frames extracted from manipulated videos
        val/
            real/
            fake/

FaceForensics++ dataset: https://github.com/ondyari/FaceForensics
  1. Request access and download the dataset.
  2. Run their provided extraction script to get face-cropped frames.
  3. Split into train/val and place in the structure above.

Usage:
    python train.py \
        --data_dir ./data \
        --epochs 20 \
        --batch_size 32 \
        --output_path ./models/deepguard_efficientnet_b0.pth
"""

import argparse
import time
from pathlib import Path

import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

from app.model import DeepfakeDetector


# ---------------------------------------------------------------------------
# Transforms
# ---------------------------------------------------------------------------
TRAIN_TRANSFORMS = transforms.Compose([
    transforms.Resize(256),
    transforms.RandomCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1, hue=0.05),
    transforms.RandomGrayscale(p=0.05),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

VAL_TRANSFORMS = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


# ---------------------------------------------------------------------------
# Training loop
# ---------------------------------------------------------------------------
def train_one_epoch(model, loader, criterion, optimiser, device, epoch):
    model.train()
    total_loss = 0.0
    correct = 0
    total = 0

    for batch_idx, (images, labels) in enumerate(loader):
        images, labels = images.to(device), labels.to(device)

        optimiser.zero_grad()
        logits = model(images)
        loss = criterion(logits, labels)
        loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimiser.step()

        total_loss += loss.item()
        preds = logits.argmax(dim=1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)

        if batch_idx % 50 == 0:
            print(
                f"  epoch {epoch} | batch {batch_idx}/{len(loader)} "
                f"| loss {loss.item():.4f}"
            )

    return total_loss / len(loader), correct / total


@torch.no_grad()
def evaluate(model, loader, criterion, device):
    model.eval()
    total_loss = 0.0
    correct = 0
    total = 0

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        logits = model(images)
        loss = criterion(logits, labels)
        total_loss += loss.item()
        preds = logits.argmax(dim=1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)

    return total_loss / len(loader), correct / total


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", type=str, default="./data")
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--num_workers", type=int, default=4)
    parser.add_argument("--output_path", type=str, default="./models/deepguard_efficientnet_b0.pth")
    args = parser.parse_args()

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Training on: {device}")

    # Datasets  (ImageFolder expects class folders: real/ and fake/)
    train_dataset = datasets.ImageFolder(
        root=Path(args.data_dir) / "train",
        transform=TRAIN_TRANSFORMS,
    )
    val_dataset = datasets.ImageFolder(
        root=Path(args.data_dir) / "val",
        transform=VAL_TRANSFORMS,
    )

    # Verify class ordering: class_to_idx must be {"real": 0, "fake": 1}
    print(f"Class mapping: {train_dataset.class_to_idx}")
    assert "real" in train_dataset.class_to_idx and "fake" in train_dataset.class_to_idx, \
        "Dataset must have 'real' and 'fake' subdirectories."
    if train_dataset.class_to_idx["real"] != 0:
        raise ValueError(
            "class_to_idx['real'] must be 0. "
            "Rename your folders so 'fake' sorts after 'real' alphabetically "
            "or adjust CLASS_NAMES in model.py."
        )

    train_loader = DataLoader(
        train_dataset,
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=args.num_workers,
        pin_memory=True,
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=args.num_workers,
        pin_memory=True,
    )

    # Model, loss, optimiser
    model = DeepfakeDetector(pretrained=True).to(device)
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimiser = AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    scheduler = CosineAnnealingLR(optimiser, T_max=args.epochs)

    best_val_acc = 0.0
    output_path = Path(args.output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    for epoch in range(1, args.epochs + 1):
        t0 = time.time()
        train_loss, train_acc = train_one_epoch(
            model, train_loader, criterion, optimiser, device, epoch
        )
        val_loss, val_acc = evaluate(model, val_loader, criterion, device)
        scheduler.step()

        elapsed = time.time() - t0
        print(
            f"Epoch {epoch:02d}/{args.epochs} | "
            f"train loss {train_loss:.4f} acc {train_acc:.3f} | "
            f"val loss {val_loss:.4f} acc {val_acc:.3f} | "
            f"{elapsed:.1f}s"
        )

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(
                {
                    "epoch": epoch,
                    "model_state_dict": model.state_dict(),
                    "val_acc": val_acc,
                    "class_to_idx": train_dataset.class_to_idx,
                },
                output_path,
            )
            print(f"  ✓ Best model saved → {output_path} (val_acc={val_acc:.3f})")

    print(f"\nTraining complete. Best val accuracy: {best_val_acc:.3f}")


if __name__ == "__main__":
    main()

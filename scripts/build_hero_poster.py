#!/usr/bin/env python3
"""Build hero poster: composite Frankfurt + circle + overlay to match CSS (one-off asset)."""
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
FRANKFURT = ROOT / "assets" / "Video_Frankfurt.mp4"
CIRCLE = ROOT / "assets" / "Circle Animation_2.mp4"
OUT_JPG = ROOT / "assets" / "Hero_Poster_Composite.jpg"
OUT_WEBP = ROOT / "assets" / "Hero_Poster_Composite.webp"

# Match styles.css hero stack (approx.): grayscale+brightness on base; circle opacity 0.3 + filters; blue overlay 20%
TARGET_W = 2560
TARGET_H = 1440  # 16:9 canvas at max practical web width


def object_fit_cover(bgr: np.ndarray, tw: int, th: int) -> np.ndarray:
    h, w = bgr.shape[:2]
    scale = max(tw / w, th / h)
    nw, nh = int(round(w * scale)), int(round(h * scale))
    resized = cv2.resize(bgr, (nw, nh), interpolation=cv2.INTER_LANCZOS4)
    x0 = max(0, (nw - tw) // 2)
    y0 = max(0, (nh - th) // 2)
    return resized[y0 : y0 + th, x0 : x0 + tw]


def read_frame(cap: cv2.VideoCapture, frame_index: int) -> np.ndarray:
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_index)
    ok, frame = cap.read()
    if not ok or frame is None:
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        ok, frame = cap.read()
    if not ok:
        raise RuntimeError("Could not read video frame")
    return frame


def frankfurt_style(bgr: np.ndarray) -> np.ndarray:
    """grayscale(100%) brightness(0.55) on BGR."""
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    g = np.clip(gray.astype(np.float32) * 0.55, 0, 255).astype(np.uint8)
    return cv2.cvtColor(g, cv2.COLOR_GRAY2BGR)


def circle_style(bgr: np.ndarray) -> np.ndarray:
    """hue-rotate(170deg) saturate(140%) brightness(50%) — OpenCV HSV."""
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    shift = int(round(170 * 180 / 360)) % 180
    hn = (h.astype(np.int16) + shift) % 180
    h = hn.astype(np.uint8)
    s = np.clip(s.astype(np.float32) * 1.4, 0, 255).astype(np.uint8)
    v = np.clip(v.astype(np.float32) * 0.5, 0, 255).astype(np.uint8)
    out = cv2.cvtColor(cv2.merge([h, s, v]), cv2.COLOR_HSV2BGR)
    return out


def main() -> int:
    cf = cv2.VideoCapture(str(FRANKFURT))
    cc = cv2.VideoCapture(str(CIRCLE))
    if not cf.isOpened() or not cc.isOpened():
        print("Failed to open videos", file=sys.stderr)
        return 1

    fps = cf.get(cv2.CAP_PROP_FPS) or 30
    idx = max(1, int(fps * 0.35))
    base = read_frame(cf, idx)
    circ = read_frame(cc, 0)
    cf.release()
    cc.release()

    base = object_fit_cover(base, TARGET_W, TARGET_H)
    circ = object_fit_cover(circ, TARGET_W, TARGET_H)

    base = frankfurt_style(base)
    circ = circle_style(circ)

    bf = base.astype(np.float32)
    overlay_bgr = np.array([16, 52, 106], dtype=np.float32)
    # Stack matches DOM: Frankfurt (z0) → blue overlay (z1) → circle (z2)
    after_overlay = bf * (1.0 - 0.2) + overlay_bgr * 0.2
    cf_ = circ.astype(np.float32)
    comp = after_overlay * (1.0 - 0.3) + cf_ * 0.3
    out = np.clip(comp, 0, 255).astype(np.uint8)

    cv2.imwrite(str(OUT_JPG), out, [cv2.IMWRITE_JPEG_QUALITY, 90])
    try:
        cv2.imwrite(str(OUT_WEBP), out, [cv2.IMWRITE_WEBP_QUALITY, 88])
    except Exception:
        pass
    print("Wrote", OUT_JPG, OUT_WEBP if OUT_WEBP.exists() else "(webp skip)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""
Capture the hero media stack (Frankfurt + overlay + circle) as the browser renders it —
no approximated filters. Requires: pip install playwright && playwright install chromium

Usage (from repo root):
  python3 scripts/capture_hero_poster.py
"""
from __future__ import annotations

import http.server
import os
import socketserver
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PORT = 8765
VIEWPORT = {"width": 2560, "height": 1440}
POSTER_TIME = 0.05

INJECT_CSS = """
body.pw-hero-poster-capture .status-bar,
body.pw-hero-poster-capture .hero-poster-layer,
body.pw-hero-poster-capture .hero-content,
body.pw-hero-poster-capture .hero-scroll-indicator {
  display: none !important;
}
body.pw-hero-poster-capture .hero-photo-video {
  opacity: 1 !important;
}
body.pw-hero-poster-capture .circle-video-bg {
  opacity: 0.3 !important;
}
body.pw-hero-poster-capture .hero-overlay {
  opacity: 1 !important;
}
"""


def main() -> int:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print(
            "Install Playwright: pip install playwright && playwright install chromium",
            flush=True,
        )
        return 1

    assets = ROOT / "assets"
    out_png = assets / "Hero_Poster_Composite.png"
    out_webp = assets / "Hero_Poster_Composite.webp"
    out_jpg = assets / "Hero_Poster_Composite.jpg"

    os.chdir(ROOT)

    class _ReuseAddr(socketserver.TCPServer):
        allow_reuse_address = True

    handler = http.server.SimpleHTTPRequestHandler
    httpd = _ReuseAddr(("127.0.0.1", PORT), handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()

    url = f"http://127.0.0.1:{PORT}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport=VIEWPORT)
        # Do not wait for networkidle — hero videos are large; we only need DOM + decode.
        page.goto(url, wait_until="domcontentloaded", timeout=120_000)

        page.add_style_tag(content=INJECT_CSS)
        page.evaluate(
            """() => {
          document.body.classList.add('pw-hero-poster-capture');
          const c = document.getElementById('circleVideo');
          if (c) {
            c.preload = 'auto';
            c.load();
          }
        }"""
        )

        page.wait_for_function(
            """() => {
          const h = document.querySelector('.hero-photo-video');
          const c = document.getElementById('circleVideo');
          return h && c && h.readyState >= 3 && c.readyState >= 3;
        }""",
            timeout=120_000,
        )

        page.evaluate(
            f"""() => {{
          const h = document.querySelector('.hero-photo-video');
          const c = document.getElementById('circleVideo');
          for (const v of [h, c]) {{
            if (!v) continue;
            v.pause();
            try {{ v.currentTime = {POSTER_TIME}; }} catch (e) {{}}
          }}
        }}"""
        )

        page.wait_for_timeout(400)
        page.locator("#hero").screenshot(path=str(out_png), type="png")

        browser.close()

    httpd.shutdown()

    try:
        from PIL import Image

        img = Image.open(out_png).convert("RGB")
        img.save(out_webp, "WEBP", quality=88, method=6)
        img.save(out_jpg, "JPEG", quality=90, optimize=True)
        print(f"Wrote {out_png}, {out_webp}, {out_jpg}")
    except ImportError:
        print(f"Wrote {out_png} (install pillow for webp/jpg: pip install pillow)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

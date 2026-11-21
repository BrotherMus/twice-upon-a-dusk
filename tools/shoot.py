"""Takes the game's screenshots: serves game/ is assumed running on PORT, and headless Chrome renders
each ?shot= scene at 1280x720 to PNG, then Pillow saves it as a JPEG under 256 KiB in screenshots/.

    python tools/shoot.py [port]
"""
import io
import os
import subprocess
import sys
import tempfile

from PIL import Image

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
SHOTS = [
    ("1-cover.jpg", "?shot=cover&seed=3"),
    ("2-title.jpg", "?shot=title&seed=3"),
    ("3-pressure.jpg", "?shot=pressure&seed=3"),
    ("4-clear.jpg", "?shot=clear&seed=3"),
]
LIMIT = 256 * 1024


def render(url, path, profile):
    subprocess.run([
        CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
        f"--user-data-dir={profile}", "--window-size=1280,720", "--virtual-time-budget=1500",
        f"--screenshot={path}", url,
    ], check=True, capture_output=True, timeout=60)


def save_jpeg(png_path, out_path):
    image = Image.open(png_path).convert("RGB")
    for quality in (92, 88, 84, 80, 75, 70):
        buffer = io.BytesIO()
        image.save(buffer, "JPEG", quality=quality, optimize=True, progressive=True)
        if buffer.tell() <= LIMIT:
            with open(out_path, "wb") as handle:
                handle.write(buffer.getvalue())
            return quality, buffer.tell()
    raise SystemExit(f"{out_path}: cannot get under 256 KiB")


def main():
    port = sys.argv[1] if len(sys.argv) > 1 else "8093"
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_dir = os.path.join(root, "screenshots")
    os.makedirs(out_dir, exist_ok=True)
    with tempfile.TemporaryDirectory() as scratch:
        for name, query in SHOTS:
            png = os.path.join(scratch, name + ".png")
            render(f"http://localhost:{port}/{query}", png, os.path.join(scratch, "profile-" + name))
            quality, size = save_jpeg(png, os.path.join(out_dir, name))
            print(f"{name}: quality {quality}, {size} bytes")


if __name__ == "__main__":
    main()

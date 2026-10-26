from __future__ import annotations

from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public-assets" / "photography"


PHOTOS = [
    # Reflective question carousel.
    ("reflection-child-bike", 17979332, "standard", (0.50, 0.48)),
    ("reflection-departure-station", 26443229, "standard", (0.50, 0.54)),
    ("reflection-crossroads", 18051283, "standard", (0.50, 0.50)),
    ("reflection-window-silhouette", 15509019, "standard", (0.50, 0.45)),
    ("reflection-unspoken", 6669851, "standard", (0.50, 0.44)),
    ("reflection-family-shore", 11889769, "standard", (0.50, 0.50)),
    ("reflection-self-mirror", 4042109, "standard", (0.50, 0.38)),
    ("reflection-memory-photos", 7545249, "standard", (0.50, 0.43)),
    # Three different memory-card photographs per visual theme.
    ("memory-blue-bike", 5792903, "standard", (0.50, 0.45)),
    ("memory-blue-boardwalk", 8575916, "standard", (0.50, 0.46)),
    ("memory-blue-beach", 15162143, "standard", (0.50, 0.50)),
    ("memory-journal-train", 6466385, "standard", (0.48, 0.48)),
    ("memory-journal-cafe", 5047032, "standard", (0.50, 0.48)),
    ("memory-journal-photo", 8865413, "standard", (0.50, 0.45)),
    ("memory-editorial-work", 33393704, "standard", (0.50, 0.42)),
    ("memory-editorial-window", 3340299, "standard", (0.50, 0.42)),
    ("memory-editorial-building", 4010286, "standard", (0.50, 0.48)),
    ("memory-night-station", 15978265, "standard", (0.50, 0.50)),
    ("memory-night-room", 28113351, "standard", (0.50, 0.50)),
    ("memory-night-umbrella", 35539030, "standard", (0.50, 0.45)),
    # Three theme-matched hero photographs per theme. Each gets a mobile crop.
    ("hero-blue-lake", 6805484, "hero", (0.55, 0.52)),
    ("hero-blue-coast", 30642919, "hero", (0.50, 0.52)),
    ("hero-blue-morning", 15871634, "hero", (0.50, 0.48)),
    ("hero-journal-alley", 39771209, "hero", (0.50, 0.53)),
    ("hero-journal-road", 37832996, "hero", (0.50, 0.52)),
    ("hero-journal-train", 16919849, "hero", (0.50, 0.50)),
    ("hero-editorial-architecture", 14440898, "hero", (0.52, 0.48)),
    ("hero-editorial-gallery", 29095460, "hero", (0.50, 0.50)),
    ("hero-editorial-apartment", 7587375, "hero", (0.50, 0.50)),
    ("hero-night-rain", 9501140, "hero", (0.50, 0.50)),
    ("hero-night-skyline", 7245349, "hero", (0.55, 0.48)),
    ("hero-night-windows", 17726304, "hero", (0.50, 0.50)),
]


def fetch(photo_id: int) -> Image.Image:
    url = (
        f"https://images.pexels.com/photos/{photo_id}/"
        f"pexels-photo-{photo_id}.jpeg?auto=compress&cs=tinysrgb&w=2000"
    )
    request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(request, timeout=60) as response:
        data = response.read()
    image = Image.open(BytesIO(data))
    image.load()
    return ImageOps.exif_transpose(image).convert("RGB")


def save_crop(image: Image.Image, name: str, size: tuple[int, int], centering: tuple[float, float]) -> None:
    result = ImageOps.fit(image, size, method=Image.Resampling.LANCZOS, centering=centering)
    result.save(OUT / f"{name}.avif", "AVIF", quality=61, speed=6)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, photo_id, kind, centering in PHOTOS:
        image = fetch(photo_id)
        if kind == "hero":
            save_crop(image, name, (1600, 1000), centering)
            save_crop(image, f"{name}-mobile", (900, 1200), centering)
        else:
            save_crop(image, name, (1260, 750), centering)
        print(f"prepared {name} from Pexels {photo_id}")


if __name__ == "__main__":
    main()

"""Génère public/og-image.png (1200x630) pour les previews Open Graph / Twitter Card de voclaire.fr."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1200, 630
BG_COLOR = "#030712"
EMERALD = "#10b981"
WHITE = "#ffffff"
GRAY = "#9ca3af"

OUTPUT_PATH = Path(__file__).resolve().parent.parent / "public" / "og-image.png"
ICON_PATH = Path(__file__).resolve().parent.parent / "public" / "voclaire-logo-icon-wave.png"

# Polices système Windows, avec repli sur la police par défaut Pillow si absentes.
FONT_CANDIDATES_BOLD = [
    "segoeuib.ttf",
    "arialbd.ttf",
    "C:/Windows/Fonts/segoeuib.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
]
FONT_CANDIDATES_REGULAR = [
    "segoeui.ttf",
    "arial.ttf",
    "C:/Windows/Fonts/segoeui.ttf",
    "C:/Windows/Fonts/arial.ttf",
]


def load_font(candidates: list[str], size: int) -> ImageFont.FreeTypeFont:
    for name in candidates:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default(size=size)


def draw_logo(img: Image.Image, x: int, y: int, height: int) -> None:
    """Colle le logo officiel (voclaire-logo-icon-wave.png, non carré), mis à l'échelle par hauteur et composité avec sa transparence."""
    icon = Image.open(ICON_PATH).convert("RGBA")
    width = round(icon.width * height / icon.height)
    icon = icon.resize((width, height), Image.LANCZOS)
    img.paste(icon, (x, y), icon)


def main() -> None:
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Logo coin haut-gauche
    draw_logo(img, x=64, y=64, height=64)

    # Titre centré
    title_font = load_font(FONT_CANDIDATES_BOLD, 110)
    title = "Voclaire"
    bbox = draw.textbbox((0, 0), title, font=title_font)
    title_w = bbox[2] - bbox[0]
    title_x = (WIDTH - title_w) // 2
    title_y = 230
    draw.text((title_x, title_y), title, font=title_font, fill=WHITE)

    # Ligne décorative emerald sous le titre
    line_y = title_y + (bbox[3] - bbox[1]) + 40
    line_w = 160
    line_x = (WIDTH - line_w) // 2
    draw.rounded_rectangle(
        [line_x, line_y, line_x + line_w, line_y + 6], radius=3, fill=EMERALD
    )

    # Sous-titre
    subtitle_font = load_font(FONT_CANDIDATES_REGULAR, 40)
    subtitle = "Transcription audio par IA"
    bbox_sub = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    subtitle_w = bbox_sub[2] - bbox_sub[0]
    subtitle_x = (WIDTH - subtitle_w) // 2
    draw.text((subtitle_x, line_y + 36), subtitle, font=subtitle_font, fill=GRAY)

    # Bas de l'image : URL
    url_font = load_font(FONT_CANDIDATES_REGULAR, 28)
    url_text = "voclaire.fr"
    bbox_url = draw.textbbox((0, 0), url_text, font=url_font)
    url_w = bbox_url[2] - bbox_url[0]
    url_x = (WIDTH - url_w) // 2
    draw.text((url_x, HEIGHT - 90), url_text, font=url_font, fill=EMERALD)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUTPUT_PATH, "PNG")
    print(f"OK: {OUTPUT_PATH} ({WIDTH}x{HEIGHT})")


if __name__ == "__main__":
    main()

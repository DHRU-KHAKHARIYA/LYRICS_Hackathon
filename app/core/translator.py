import re

from deep_translator import GoogleTranslator
from openai import OpenAI

from app.config import settings

_openai_client: OpenAI | None = None


def _get_client() -> OpenAI | None:
    global _openai_client
    if _openai_client is None and settings.OPENAI_API_KEY:
        _openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
    return _openai_client


# ── GPT batch translation ──────────────────────────────────────────────────────

def _translate_batch_gpt(lines: list[str], title: str, artist: str) -> list[str] | None:
    """
    Translate all lines in one GPT call for context-aware, lyric-quality output.
    Returns None if GPT is unavailable or fails, so caller can fall back.
    """
    client = _get_client()
    if not client:
        return None

    numbered = "\n".join(f"{i + 1}. {line}" for i, line in enumerate(lines))
    prompt = (
        f'You are translating lyrics from the song "{title}" by {artist}.\n'
        "Translate each numbered line to natural English, preserving poetic tone and feeling.\n"
        "If a line is already in English, return it unchanged.\n"
        "Reply with ONLY the numbered translations, one per line. No commentary.\n\n"
        f"{numbered}"
    )

    try:
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        raw = response.choices[0].message.content or ""
        return _parse_numbered(raw, len(lines), lines)
    except Exception as e:
        print(f"[translator] GPT failed: {e}")
        return None


def _parse_numbered(raw: str, expected: int, fallback: list[str]) -> list[str]:
    """Parse '1. text' format back into an ordered list."""
    mapping: dict[int, str] = {}
    for line in raw.strip().splitlines():
        line = line.strip()
        if not line:
            continue
        m = re.match(r"^(\d+)\.\s*(.+)$", line)
        if m:
            mapping[int(m.group(1))] = m.group(2)
    return [mapping.get(i + 1, fallback[i]) for i in range(expected)]


# ── Google Translate fallback ──────────────────────────────────────────────────

def _translate_single_google(line: str) -> str:
    try:
        return GoogleTranslator(source="auto", target="en").translate(line) or line
    except Exception:
        return line


# ── Public API ─────────────────────────────────────────────────────────────────

def translate_lines(
    lines: list[str],
    languages: list[str],
    title: str,
    artist: str,
) -> tuple[list[str], str]:
    """
    Translate a list of lyric lines to English.

    - English lines are passed through unchanged (no API call)
    - Non-English lines are translated via GPT (batch) with Google fallback
    - Returns (translations, method_used)
    """
    translations = list(lines)  # default: original

    non_en_indices = [i for i, lang in enumerate(languages) if lang != "en"]
    non_en_lines = [lines[i] for i in non_en_indices]

    if not non_en_lines:
        return translations, "passthrough"

    # Try GPT first (batch, context-aware)
    gpt_results = _translate_batch_gpt(non_en_lines, title, artist)
    if gpt_results:
        for idx, translated in zip(non_en_indices, gpt_results):
            translations[idx] = translated
        return translations, "gpt"

    # Fall back to Google Translate per line
    for idx in non_en_indices:
        translations[idx] = _translate_single_google(lines[idx])
    return translations, "google"

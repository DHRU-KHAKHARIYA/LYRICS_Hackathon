from langdetect import detect, LangDetectException

# Unicode block ranges
_HANGUL_START, _HANGUL_END = 0xAC00, 0xD7A3
_HIRAGANA_START, _HIRAGANA_END = 0x3040, 0x309F
_KATAKANA_START, _KATAKANA_END = 0x30A0, 0x30FF
_CJK_START, _CJK_END = 0x4E00, 0x9FFF

# Minimum ratio for Unicode analysis to be considered authoritative
_DOMINANCE_THRESHOLD = 0.60


def _char_script(char: str) -> str:
    cp = ord(char)
    if _HANGUL_START <= cp <= _HANGUL_END:
        return "ko"
    if _HIRAGANA_START <= cp <= _HIRAGANA_END or _KATAKANA_START <= cp <= _KATAKANA_END:
        return "ja"
    if _CJK_START <= cp <= _CJK_END:
        return "ja"  # CJK without kana context → assume Japanese
    if char.isalpha() and char.isascii():
        return "en"
    return "unknown"


def detect_language(line: str) -> tuple[str, float]:
    """
    Detect the dominant language of a line.

    Strategy:
      1. Count characters by Unicode block (deterministic, fast)
      2. If one script dominates (>60%), trust it
      3. Otherwise fall back to langdetect

    Returns:
        (language_code, confidence) — e.g. ("ko", 0.92)
    """
    counts: dict[str, int] = {"ko": 0, "ja": 0, "en": 0, "unknown": 0}

    for char in line:
        if not char.isalpha():
            continue
        counts[_char_script(char)] += 1

    total = sum(counts.values())
    if total == 0:
        return "unknown", 0.0

    dominant = max(counts, key=counts.get)  # type: ignore[arg-type]
    confidence = counts[dominant] / total

    # Detect mixed: if a non-English CJK script AND English both have >15% presence
    non_latin = counts["ko"] + counts["ja"]
    english = counts["en"]
    non_latin_ratio = non_latin / total
    english_ratio = english / total

    if non_latin_ratio > 0.15 and english_ratio > 0.15:
        return "mixed", round(min(non_latin_ratio, english_ratio), 2)

    # Trust Unicode analysis if clearly dominant and not just "unknown"
    if dominant != "unknown" and confidence >= _DOMINANCE_THRESHOLD:
        return dominant, round(confidence, 2)

    # Mixed scripts or very short — try langdetect
    try:
        lang = detect(line)
        if lang in ("ko", "ja", "en", "zh"):
            return lang, 0.70
        return lang, 0.50
    except LangDetectException:
        pass

    # Check if genuinely mixed (multiple non-unknown scripts present)
    active = {k for k, v in counts.items() if v > 0 and k != "unknown"}
    if len(active) > 1:
        return "mixed", round(confidence, 2)

    return dominant, round(confidence, 2)


def dominant_song_language(languages: list[str]) -> str:
    """
    Return the most common non-English, non-unknown language across all lines.
    Falls back to 'en' if the song is predominantly English.
    """
    counts: dict[str, int] = {}
    for lang in languages:
        if lang not in ("en", "unknown", "mixed"):
            counts[lang] = counts.get(lang, 0) + 1
    return max(counts, key=counts.get) if counts else "en"  # type: ignore[arg-type]

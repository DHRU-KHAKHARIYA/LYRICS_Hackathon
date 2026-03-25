import pykakasi
from hangul_romanize import Transliter
from hangul_romanize.rule import academic

_hangul_romanizer = Transliter(academic)
_kakasi = pykakasi.kakasi()

# Unicode ranges for per-token script detection
_HANGUL_START, _HANGUL_END = 0xAC00, 0xD7A3
_HIRAGANA_START, _HIRAGANA_END = 0x3040, 0x309F
_KATAKANA_START, _KATAKANA_END = 0x30A0, 0x30FF


def _has_hangul(text: str) -> bool:
    return any(_HANGUL_START <= ord(c) <= _HANGUL_END for c in text)


def _has_japanese(text: str) -> bool:
    return any(
        (_HIRAGANA_START <= ord(c) <= _HIRAGANA_END)
        or (_KATAKANA_START <= ord(c) <= _KATAKANA_END)
        for c in text
    )


def _romanize_korean(text: str) -> str:
    return _hangul_romanizer.translit(text)


def _romanize_japanese(text: str) -> str:
    result = _kakasi.convert(text)
    return " ".join(item["hepburn"] for item in result if item["hepburn"]).strip()


def _romanize_mixed(line: str) -> str:
    """
    Romanize only non-Latin tokens; preserve English words as-is.
    Handles lines like '나의 baby 사랑해 you know'.
    """
    tokens = line.split()
    output = []
    for token in tokens:
        if _has_hangul(token):
            output.append(_romanize_korean(token))
        elif _has_japanese(token):
            output.append(_romanize_japanese(token))
        else:
            output.append(token)
    return " ".join(output)


def romanize(line: str, language: str) -> str | None:
    """
    Romanize a lyric line based on its detected language.

    Returns None if romanization is not applicable (e.g. English).
    """
    try:
        if language == "ko":
            return _romanize_korean(line)
        if language == "ja":
            return _romanize_japanese(line)
        if language == "mixed":
            return _romanize_mixed(line)
    except Exception:
        return None

    # English or unknown — romanization not applicable
    return None

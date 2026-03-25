import re


# Genius-specific artifacts to strip
_GENIUS_ARTIFACTS = re.compile(
    r"(EmbedShare|URLCopy|EmbedCopy|\d+\s*Embed|\d+\s*Contributors?)",
    re.IGNORECASE,
)
_SECTION_HEADER = re.compile(r"^\[(.+?)\]$")
_ONLY_DIGITS = re.compile(r"^\d+$")


def clean_lyrics(raw: str) -> tuple[list[str], list[str | None]]:
    """
    Strip Genius noise, split into lines, track section headers.

    Returns:
        lines    — clean lyric lines
        sections — parallel list; each entry is the section name the line belongs to
    """
    lines: list[str] = []
    sections: list[str | None] = []
    current_section: str | None = None

    for raw_line in raw.split("\n"):
        line = raw_line.strip()

        if not line:
            continue

        # Remove Genius embed/contributor artifacts
        if _GENIUS_ARTIFACTS.search(line):
            continue

        # Skip pure digit lines (e.g. view counts appended by Genius)
        if _ONLY_DIGITS.match(line):
            continue

        # Detect section headers like [Verse 1], [Chorus], [Bridge]
        m = _SECTION_HEADER.match(line)
        if m:
            current_section = m.group(1)
            continue

        lines.append(line)
        sections.append(current_section)

    return lines, sections

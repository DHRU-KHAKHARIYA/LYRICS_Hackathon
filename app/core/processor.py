from app.core.detector import detect_language, dominant_song_language
from app.core.fetcher import fetch_lyrics
from app.core.preprocess import clean_lyrics
from app.core.romanizer import romanize
from app.core.translator import translate_lines
from app.models.process import LyricLine, ProcessedOutput, ProcessRequest


def process(request: ProcessRequest) -> ProcessedOutput:
    # ── Step 1: Fetch ──────────────────────────────────────────────────────────
    print(f"[pipeline] Fetching '{request.title}' by {request.artist}...")
    song = fetch_lyrics(request.title, request.artist)

    # ── Step 2: Preprocess ────────────────────────────────────────────────────
    lines, sections = clean_lyrics(song.raw_lyrics)
    print(f"[pipeline] {len(lines)} lines after cleaning.")

    if not lines:
        return ProcessedOutput(
            title=song.title,
            artist=song.artist,
            dominant_language="unknown",
            total_lines=0,
            translation_method="none",
            lyrics=[],
        )

    # ── Step 3: Detect language per line ──────────────────────────────────────
    print("[pipeline] Detecting languages...")
    lang_results = [detect_language(line) for line in lines]
    languages = [lang for lang, _ in lang_results]
    confidences = [conf for _, conf in lang_results]

    # ── Step 4: Romanize ──────────────────────────────────────────────────────
    print("[pipeline] Romanizing...")
    romanized_lines = [romanize(line, lang) for line, lang in zip(lines, languages)]

    # ── Step 5: Translate ────────────────────────────────────────────────────
    print("[pipeline] Translating...")
    translations, method = translate_lines(lines, languages, song.title, song.artist)

    # ── Step 6: Assemble output ───────────────────────────────────────────────
    lyric_entries = [
        LyricLine(
            section=sections[i],
            line=lines[i],
            language=languages[i],
            romanized=romanized_lines[i],
            translation=translations[i],
            is_translated=languages[i] != "en",
            confidence=confidences[i],
        )
        for i in range(len(lines))
    ]

    print("[pipeline] Done.")
    return ProcessedOutput(
        title=song.title,
        artist=song.artist,
        dominant_language=dominant_song_language(languages),
        total_lines=len(lines),
        translation_method=method,
        lyrics=lyric_entries,
    )

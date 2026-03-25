import lyricsgenius

from app.config import settings
from app.models.lyrics import LyricsResult


class LyricsFetchError(Exception):
    pass


def fetch_lyrics(title: str, artist: str) -> LyricsResult:
    if not settings.GENIUS_API_TOKEN:
        raise LyricsFetchError("GENIUS_API_TOKEN is not set in .env")

    genius = lyricsgenius.Genius(
        settings.GENIUS_API_TOKEN,
        verbose=False,
        remove_section_headers=False,  # we handle section parsing ourselves
        retries=2,
    )

    try:
        song = genius.search_song(title, artist)
    except Exception as e:
        raise LyricsFetchError(f"Genius API error: {e}") from e

    if not song:
        raise LyricsFetchError(f"Song not found: '{title}' by {artist}")

    return LyricsResult(
        title=song.title,
        artist=song.artist,
        raw_lyrics=song.lyrics,
    )

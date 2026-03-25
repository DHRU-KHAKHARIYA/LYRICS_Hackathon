from fastapi import APIRouter, HTTPException

from app.core.fetcher import LyricsFetchError, fetch_lyrics
from app.models.lyrics import FetchRequest, LyricsResult

router = APIRouter()


@router.post("/fetch", response_model=LyricsResult)
def fetch(request: FetchRequest) -> LyricsResult:
    try:
        return fetch_lyrics(request.title, request.artist)
    except LyricsFetchError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/search", response_model=LyricsResult)
def search(title: str, artist: str) -> LyricsResult:
    try:
        return fetch_lyrics(title, artist)
    except LyricsFetchError as e:
        raise HTTPException(status_code=404, detail=str(e))

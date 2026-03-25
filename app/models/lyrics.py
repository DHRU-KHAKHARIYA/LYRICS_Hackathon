from pydantic import BaseModel


class FetchRequest(BaseModel):
    title: str
    artist: str


class LyricsResult(BaseModel):
    title: str
    artist: str
    raw_lyrics: str

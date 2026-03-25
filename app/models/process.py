from enum import Enum
from pydantic import BaseModel

from app.models.lyrics import FetchRequest


class LanguageCode(str, Enum):
    KO = "ko"
    JA = "ja"
    ZH = "zh"
    EN = "en"
    MIXED = "mixed"
    UNKNOWN = "unknown"


class ProcessRequest(FetchRequest):
    target_language: str = "en"


class LyricLine(BaseModel):
    section: str | None
    line: str
    language: str
    romanized: str | None
    translation: str
    is_translated: bool
    confidence: float


class ProcessedOutput(BaseModel):
    title: str
    artist: str
    dominant_language: str
    total_lines: int
    translation_method: str
    lyrics: list[LyricLine]

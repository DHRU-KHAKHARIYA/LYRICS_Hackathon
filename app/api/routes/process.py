from fastapi import APIRouter, HTTPException

from app.core.fetcher import LyricsFetchError
from app.core.processor import process
from app.models.process import ProcessedOutput, ProcessRequest

router = APIRouter()


@router.post("/process", response_model=ProcessedOutput)
def process_lyrics(request: ProcessRequest) -> ProcessedOutput:
    try:
        return process(request)
    except LyricsFetchError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {e}")

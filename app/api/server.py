from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import lyrics, process

app = FastAPI(
    title="Lyrics Pipeline API",
    description="Fetch, romanize, and translate song lyrics.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(lyrics.router, prefix="/api/v1/lyrics", tags=["Lyrics"])
app.include_router(process.router, prefix="/api/v1", tags=["Process"])


@app.get("/health", tags=["Health"])
def health() -> dict:
    return {"status": "ok"}


# Serve built React frontend (only if frontend/dist exists)
_dist = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if _dist.exists():
    app.mount("/assets", StaticFiles(directory=_dist / "assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str) -> FileResponse:
        return FileResponse(_dist / "index.html")

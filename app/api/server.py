from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import lyrics, process

app = FastAPI(
    title="Lyrics Pipeline API",
    description="Fetch, romanize, and translate song lyrics.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this in production
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(lyrics.router, prefix="/api/v1/lyrics", tags=["Lyrics"])
app.include_router(process.router, prefix="/api/v1", tags=["Process"])


@app.get("/health", tags=["Health"])
def health() -> dict:
    return {"status": "ok"}

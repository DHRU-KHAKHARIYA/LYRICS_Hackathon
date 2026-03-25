"""
CLI entry point for the lyrics pipeline.

Usage:
    python main.py process "Dynamite" "BTS"
    python main.py process "Dynamite" "BTS" --output output/result.json
    python main.py serve
"""

import argparse
import json
import sys
from pathlib import Path


def cmd_process(args: argparse.Namespace) -> None:
    from app.core.fetcher import LyricsFetchError
    from app.core.processor import process
    from app.models.process import ProcessRequest

    request = ProcessRequest(title=args.title, artist=args.artist)

    try:
        result = process(request)
    except LyricsFetchError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    output = result.model_dump()

    json_str = json.dumps(output, ensure_ascii=False, indent=2)

    if args.output:
        path = Path(args.output)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json_str, encoding="utf-8")
        print(f"Saved to {path}")
    else:
        sys.stdout.reconfigure(encoding="utf-8")
        print(json_str)


def cmd_serve(_args: argparse.Namespace) -> None:
    import uvicorn
    from app.config import settings

    uvicorn.run(
        "app.api.server:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Lyrics Pipeline")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # process command
    p = subparsers.add_parser("process", help="Fetch and process song lyrics")
    p.add_argument("title", help="Song title")
    p.add_argument("artist", help="Artist name")
    p.add_argument("--output", "-o", help="Save JSON result to this file path")

    # serve command
    subparsers.add_parser("serve", help="Start the FastAPI server")

    args = parser.parse_args()

    if args.command == "process":
        cmd_process(args)
    elif args.command == "serve":
        cmd_serve(args)


if __name__ == "__main__":
    main()

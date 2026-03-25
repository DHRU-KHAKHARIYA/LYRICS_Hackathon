from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    GENIUS_API_TOKEN: str = ""
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    TARGET_LANGUAGE: str = "en"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000


settings = Settings()

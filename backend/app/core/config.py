from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "SignLingo AI"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = Field(default="postgresql://postgres:postgres@localhost:5432/sign_lang_db")
    SECRET_KEY: str = Field(default="SUPER_SECRET_SECURITY_KEY_DO_NOT_SHARE_SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()

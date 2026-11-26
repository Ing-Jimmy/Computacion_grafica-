from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Hospital User API"

    database_host: str = "127.0.0.1"
    database_port: int = 3306
    database_user: str = "root"
    database_password: str = ""
    database_name: str = "db_jimmyalpala"

    cors_origins: str = "http://localhost:4200,http://127.0.0.1:4200"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def allowed_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


settings = Settings()

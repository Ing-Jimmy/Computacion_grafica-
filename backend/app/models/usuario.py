from datetime import datetime

from sqlalchemy import (
    Enum as SqlEnum,
    FetchedValue,
    String,
    TIMESTAMP,
    UniqueConstraint,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.enums import Cargo, Estado


class Usuario(Base):
    __tablename__ = "usuarios"
    __table_args__ = (
        UniqueConstraint("email", name="uq_usuarios_email"),
        UniqueConstraint("nombre_usuario", name="uq_usuarios_nombre_usuario"),
    )

    identificacion: Mapped[str] = mapped_column(String(20), primary_key=True)
    nombre: Mapped[str] = mapped_column(String(80), nullable=False)
    apellido: Mapped[str] = mapped_column(String(80), nullable=False)
    email: Mapped[str] = mapped_column(String(120), nullable=False)
    cargo: Mapped[Cargo] = mapped_column(
        SqlEnum(
            Cargo,
            name="cargo",
            values_callable=lambda enum_type: [item.value for item in enum_type],
        ),
        nullable=False,
    )
    telefono: Mapped[str] = mapped_column(String(20), nullable=False)
    nombre_usuario: Mapped[str] = mapped_column(String(50), nullable=False)
    contrasena: Mapped[str] = mapped_column(String(255), nullable=False)
    estado: Mapped[Estado] = mapped_column(
        SqlEnum(
            Estado,
            name="estado",
            values_callable=lambda enum_type: [item.value for item in enum_type],
        ),
        nullable=False,
        server_default=text("'Activado'"),
    )
    fecha_creacion: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    fecha_actualizacion: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
        server_onupdate=FetchedValue(),
    )

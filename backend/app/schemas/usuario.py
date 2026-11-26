from datetime import datetime
from typing import Annotated

from email_validator import EmailNotValidError, validate_email
from pydantic import AfterValidator, BaseModel, ConfigDict, Field, model_validator

from app.enums import Cargo, Estado


def _validate_email_address(value: str) -> str:
    address = value.strip()
    address_to_validate = address
    is_local_domain = address.lower().endswith(".local")

    if is_local_domain:
        local_part, separator, domain = address.rpartition("@")
        if not separator:
            raise ValueError("Debe proporcionar una dirección de correo válida.")
        address_to_validate = f"{local_part}@{domain[:-6]}.com"

    try:
        validated = validate_email(address_to_validate, check_deliverability=False)
    except EmailNotValidError as error:
        raise ValueError(str(error)) from error

    return address if is_local_domain else validated.normalized


EmailAddress = Annotated[str, AfterValidator(_validate_email_address)]


class UsuarioRegistro(BaseModel):
    model_config = ConfigDict(extra="forbid")

    identificacion: str = Field(min_length=1, max_length=20)
    nombre: str = Field(min_length=1, max_length=80)
    apellido: str = Field(min_length=1, max_length=80)
    email: EmailAddress
    cargo: Cargo
    telefono: str = Field(min_length=1, max_length=20)
    nombre_usuario: str = Field(min_length=1, max_length=50)
    contrasena: str = Field(min_length=8, max_length=128)


class UsuarioActualizacion(BaseModel):
    nombre: str | None = Field(default=None, min_length=1, max_length=80)
    apellido: str | None = Field(default=None, min_length=1, max_length=80)
    email: EmailAddress | None = None
    cargo: Cargo | None = None
    telefono: str | None = Field(default=None, min_length=1, max_length=20)
    nombre_usuario: str | None = Field(default=None, min_length=1, max_length=50)
    contrasena: str | None = Field(default=None, min_length=8, max_length=128)

    @model_validator(mode="after")
    def validate_patch(self) -> "UsuarioActualizacion":
        if not self.model_fields_set:
            raise ValueError("Debe proporcionar al menos un campo para actualizar.")
        if any(getattr(self, field) is None for field in self.model_fields_set):
            raise ValueError("Los campos enviados para actualizar no pueden ser nulos.")
        return self


class UsuarioLogin(BaseModel):
    identificacion: str = Field(min_length=1, max_length=20)
    contrasena: str = Field(min_length=1, max_length=128)


class UsuarioCambioEstado(BaseModel):
    estado: Estado


class UsuarioRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    identificacion: str
    nombre: str
    apellido: str
    email: EmailAddress
    cargo: Cargo
    telefono: str
    nombre_usuario: str
    estado: Estado
    fecha_creacion: datetime
    fecha_actualizacion: datetime

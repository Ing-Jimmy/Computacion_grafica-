from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import date
from typing import Optional

class ProgramaResponse(BaseModel):
    id: int
    nombre_programa: str

    model_config = ConfigDict(from_attributes=True)


class FormularioBase(BaseModel):
    codigo_estudiante: str = Field(
        ...,
        min_length=1,
        max_length=20,
        pattern=r"^\d+$",
        description="Código numérico único del estudiante"
    )
    nombres: str = Field(..., min_length=1, max_length=100)
    apellidos: str = Field(..., min_length=1, max_length=100)
    fecha_nacimiento: date
    genero: str = Field(..., min_length=1, max_length=20)
    id_programa: int = Field(..., gt=0)
    direccion: str = Field(..., min_length=1, max_length=150)
    telefono: str = Field(
        ...,
        min_length=7,
        max_length=15,
        pattern=r"^\d+$",
        description="Solo dígitos numéricos conservando ceros iniciales"
    )

    @field_validator("nombres", "apellidos", "genero", "direccion")
    @classmethod
    def no_espacios_vacios(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("El campo no puede estar vacío ni contener solo espacios")
        return v.strip()

    @field_validator("fecha_nacimiento")
    @classmethod
    def validar_fecha_no_futura(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("La fecha de nacimiento no puede ser una fecha futura")
        return v


class FormularioCreate(FormularioBase):
    pass


class FormularioUpdate(FormularioBase):
    pass


class FormularioResponse(FormularioBase):
    id: int
    programa: Optional[ProgramaResponse] = None

    model_config = ConfigDict(from_attributes=True)
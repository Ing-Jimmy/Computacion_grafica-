from enum import Enum


class Cargo(str, Enum):
    DOCTOR = "Doctor"
    ESPECIALISTA = "Especialista"
    ADMINISTRATIVO = "Administrativo"


class Estado(str, Enum):
    ACTIVADO = "Activado"
    DESACTIVADO = "Desactivado"

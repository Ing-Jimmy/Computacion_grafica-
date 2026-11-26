from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.enums import Estado
from app.models import Usuario
from app.schemas.usuario import (
    UsuarioActualizacion,
    UsuarioCambioEstado,
    UsuarioLogin,
    UsuarioRegistro,
)


class UsuarioNoEncontrado(Exception):
    pass


class UsuarioDuplicado(Exception):
    def __init__(self, campo: str | None = None) -> None:
        self.campo = campo
        super().__init__(campo)


class CredencialesInvalidas(Exception):
    pass


class CuentaDesactivada(Exception):
    pass


def registrar_usuario(db: Session, datos: UsuarioRegistro) -> Usuario:
    for campo in ("identificacion", "email", "nombre_usuario"):
        valor = getattr(datos, campo)
        existente = db.scalar(select(Usuario.identificacion).where(
            getattr(Usuario, campo) == valor
        ))
        if existente is not None:
            raise UsuarioDuplicado(campo)

    usuario = Usuario(
        **datos.model_dump(exclude={"contrasena"}),
        contrasena=hash_password(datos.contrasena),
        estado=Estado.ACTIVADO,
    )
    db.add(usuario)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise UsuarioDuplicado() from error
    db.refresh(usuario)
    return usuario


def iniciar_sesion(db: Session, datos: UsuarioLogin) -> Usuario:
    usuario = db.get(Usuario, datos.identificacion)
    if usuario is None or not verify_password(datos.contrasena, usuario.contrasena):
        raise CredencialesInvalidas

    if usuario.estado == Estado.DESACTIVADO:
        raise CuentaDesactivada

    if not usuario.contrasena.startswith("pbkdf2_sha256$"):
        usuario.contrasena = hash_password(datos.contrasena)
        db.commit()
        db.refresh(usuario)
    return usuario


def listar_usuarios(db: Session) -> Sequence[Usuario]:
    return db.scalars(select(Usuario).order_by(Usuario.apellido, Usuario.nombre)).all()


def obtener_usuario(db: Session, identificacion: str) -> Usuario:
    usuario = db.get(Usuario, identificacion)
    if usuario is None:
        raise UsuarioNoEncontrado
    return usuario


def actualizar_usuario(
    db: Session,
    identificacion: str,
    datos: UsuarioActualizacion,
) -> Usuario:
    usuario = obtener_usuario(db, identificacion)
    cambios = datos.model_dump(exclude_unset=True)

    for campo in ("email", "nombre_usuario"):
        if campo in cambios:
            existente = db.scalar(
                select(Usuario.identificacion).where(
                    getattr(Usuario, campo) == cambios[campo],
                    Usuario.identificacion != identificacion,
                )
            )
            if existente is not None:
                raise UsuarioDuplicado(campo)

    if "contrasena" in cambios:
        cambios["contrasena"] = hash_password(cambios["contrasena"])

    for campo, valor in cambios.items():
        setattr(usuario, campo, valor)

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise UsuarioDuplicado() from error
    db.refresh(usuario)
    return usuario


def cambiar_estado(
    db: Session,
    identificacion: str,
    datos: UsuarioCambioEstado,
) -> Usuario:
    usuario = obtener_usuario(db, identificacion)
    usuario.estado = datos.estado
    db.commit()
    db.refresh(usuario)
    return usuario


def eliminar_usuario(db: Session, identificacion: str) -> None:
    usuario = obtener_usuario(db, identificacion)
    db.delete(usuario)
    db.commit()

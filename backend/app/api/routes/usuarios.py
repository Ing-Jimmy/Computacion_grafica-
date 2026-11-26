from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.usuario import (
    UsuarioActualizacion,
    UsuarioCambioEstado,
    UsuarioLogin,
    UsuarioRegistro,
    UsuarioRespuesta,
)
from app.services import usuarios as usuario_service
from app.services.usuarios import (
    CuentaDesactivada,
    CredencialesInvalidas,
    UsuarioDuplicado,
    UsuarioNoEncontrado,
)


router = APIRouter(prefix="/api/usuarios", tags=["usuarios"])
DbSession = Annotated[Session, Depends(get_db)]


def _map_duplicate(error: UsuarioDuplicado) -> HTTPException:
    if error.campo is None:
        detail = "Ya existe un usuario con uno de los valores únicos."
    else:
        detail = f"Ya existe un usuario con ese valor para '{error.campo}'."
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


def _map_not_found() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Usuario no encontrado.",
    )


@router.post(
    "/registro",
    response_model=UsuarioRespuesta,
    status_code=status.HTTP_201_CREATED,
)
def registrar(datos: UsuarioRegistro, db: DbSession) -> UsuarioRespuesta:
    try:
        return usuario_service.registrar_usuario(db, datos)
    except UsuarioDuplicado as error:
        raise _map_duplicate(error) from error


@router.post("/login", response_model=UsuarioRespuesta)
def login(datos: UsuarioLogin, db: DbSession) -> UsuarioRespuesta:
    try:
        return usuario_service.iniciar_sesion(db, datos)
    except CredencialesInvalidas as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identificación o contraseña incorrectas.",
        ) from error
    except CuentaDesactivada as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La cuenta está desactivada.",
        ) from error


@router.get("/", response_model=list[UsuarioRespuesta])
def listar(db: DbSession) -> list[UsuarioRespuesta]:
    return list(usuario_service.listar_usuarios(db))


@router.put("/{identificacion}", response_model=UsuarioRespuesta)
def actualizar(
    identificacion: str,
    datos: UsuarioActualizacion,
    db: DbSession,
) -> UsuarioRespuesta:
    try:
        return usuario_service.actualizar_usuario(db, identificacion, datos)
    except UsuarioNoEncontrado as error:
        raise _map_not_found() from error
    except UsuarioDuplicado as error:
        raise _map_duplicate(error) from error


@router.delete(
    "/{identificacion}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def eliminar(identificacion: str, db: DbSession) -> Response:
    try:
        usuario_service.eliminar_usuario(db, identificacion)
    except UsuarioNoEncontrado as error:
        raise _map_not_found() from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{identificacion}/estado", response_model=UsuarioRespuesta)
def actualizar_estado(
    identificacion: str,
    datos: UsuarioCambioEstado,
    db: DbSession,
) -> UsuarioRespuesta:
    try:
        return usuario_service.cambiar_estado(db, identificacion, datos)
    except UsuarioNoEncontrado as error:
        raise _map_not_found() from error

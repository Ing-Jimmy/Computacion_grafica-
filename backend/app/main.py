from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from typing import List

from . import models, schemas
from .database import get_db

app = FastAPI(
    title="API Backend - db_jimmyalpala",
    description="Servicio REST con catálogo de programas y CRUD de estudiantes",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/", tags=["Estado"])
def inicio():
    return {"mensaje": "Servidor FastAPI activo"}

# --- CATÁLOGO DE PROGRAMAS ACADÉMICOS ---

@app.get(
    "/programas",
    response_model=List[schemas.ProgramaResponse],
    tags=["Programas Académicos"]
)
def listar_programas_academicos(db: Session = Depends(get_db)):
    return (
        db.query(models.ProgramaAcademico)
        .order_by(models.ProgramaAcademico.id.asc())
        .all()
    )

# --- CRUD COMPLETO PARA FORMULARIO_CRUD ---

@app.get(
    "/estudiantes",
    response_model=List[schemas.FormularioResponse],
    summary="Listar todos los registros",
    tags=["Estudiantes CRUD"]
)
def listar_estudiantes(db: Session = Depends(get_db)):
    return (
        db.query(models.FormularioCrud)
        .options(joinedload(models.FormularioCrud.programa))
        .order_by(models.FormularioCrud.id.desc())
        .all()
    )

@app.get(
    "/estudiantes/{estudiante_id}",
    response_model=schemas.FormularioResponse,
    summary="Consultar un registro por ID",
    tags=["Estudiantes CRUD"]
)
def obtener_estudiante(estudiante_id: int, db: Session = Depends(get_db)):
    estudiante = (
        db.query(models.FormularioCrud)
        .options(joinedload(models.FormularioCrud.programa))
        .filter(models.FormularioCrud.id == estudiante_id)
        .first()
    )
    if not estudiante:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró el registro con ID {estudiante_id}"
        )
    return estudiante

@app.post(
    "/estudiantes",
    response_model=schemas.FormularioResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nuevo estudiante",
    tags=["Estudiantes CRUD"]
)
def crear_estudiante(datos: schemas.FormularioCreate, db: Session = Depends(get_db)):
    # 1. Verificar unicidad de codigo_estudiante
    existe_codigo = (
        db.query(models.FormularioCrud)
        .filter(models.FormularioCrud.codigo_estudiante == datos.codigo_estudiante)
        .first()
    )
    if existe_codigo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El código '{datos.codigo_estudiante}' ya se encuentra registrado."
        )

    # 2. Verificar que la llave foránea id_programa exista
    programa = (
        db.query(models.ProgramaAcademico)
        .filter(models.ProgramaAcademico.id == datos.id_programa)
        .first()
    )
    if not programa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El programa académico con ID {datos.id_programa} no existe."
        )

    nuevo_registro = models.FormularioCrud(**datos.model_dump())
    db.add(nuevo_registro)
    db.commit()
    db.refresh(nuevo_registro)
    return nuevo_registro

@app.put(
    "/estudiantes/{estudiante_id}",
    response_model=schemas.FormularioResponse,
    summary="Actualizar registro existente",
    tags=["Estudiantes CRUD"]
)
def actualizar_estudiante(
    estudiante_id: int,
    datos: schemas.FormularioUpdate,
    db: Session = Depends(get_db)
):
    estudiante = (
        db.query(models.FormularioCrud)
        .filter(models.FormularioCrud.id == estudiante_id)
        .first()
    )
    if not estudiante:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró el registro con ID {estudiante_id}"
        )

    # 1. Verificar que codigo_estudiante no pertenezca a otro registro
    codigo_duplicado = (
        db.query(models.FormularioCrud)
        .filter(
            models.FormularioCrud.codigo_estudiante == datos.codigo_estudiante,
            models.FormularioCrud.id != estudiante_id
        )
        .first()
    )
    if codigo_duplicado:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El código '{datos.codigo_estudiante}' ya pertenece a otro estudiante."
        )

    # 2. Verificar existencia de la llave foránea id_programa
    programa = (
        db.query(models.ProgramaAcademico)
        .filter(models.ProgramaAcademico.id == datos.id_programa)
        .first()
    )
    if not programa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El programa académico con ID {datos.id_programa} no existe."
        )

    for campo, valor in datos.model_dump().items():
        setattr(estudiante, campo, valor)

    db.commit()
    db.refresh(estudiante)
    return estudiante

@app.delete(
    "/estudiantes/{estudiante_id}",
    status_code=status.HTTP_200_OK,
    summary="Eliminar registro por ID",
    tags=["Estudiantes CRUD"]
)
def eliminar_estudiante(estudiante_id: int, db: Session = Depends(get_db)):
    estudiante = (
        db.query(models.FormularioCrud)
        .filter(models.FormularioCrud.id == estudiante_id)
        .first()
    )
    if not estudiante:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró el reg¿istro con ID {estudiante_id}"
        )

    db.delete(estudiante)
    db.commit()
    return {"mensaje": f"Registro con ID {estudiante_id} eliminado correctamente"}
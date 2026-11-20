from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class ProgramaAcademico(Base):
    __tablename__ = "programas_academicos"

    id = Column(Integer, primary_key=True, index=True)
    nombre_programa = Column(String(150), nullable=False)

    estudiantes = relationship("FormularioCrud", back_populates="programa")


class FormularioCrud(Base):
    __tablename__ = "formulario_crud"

    id = Column(Integer, primary_key=True, index=True)
    codigo_estudiante = Column(String(20), unique=True, nullable=False, index=True)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    genero = Column(String(20), nullable=False)
    id_programa = Column(Integer, ForeignKey("programas_academicos.id"), nullable=False)
    direccion = Column(String(150), nullable=False)
    telefono = Column(String(15), nullable=False)

    programa = relationship("ProgramaAcademico", back_populates="estudiantes")
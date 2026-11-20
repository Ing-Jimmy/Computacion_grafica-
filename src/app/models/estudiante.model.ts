export interface ProgramaAcademico {
  id: number;
  nombre_programa: string;
}

export interface Estudiante {
  id?: number;
  codigo_estudiante: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  genero: string;
  id_programa: number;
  direccion: string;
  telefono: string;
  programa?: ProgramaAcademico;
}
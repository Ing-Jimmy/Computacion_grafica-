export type Cargo = 'Doctor' | 'Especialista' | 'Administrativo';
export type Estado = 'Activado' | 'Desactivado';

export interface Usuario {
  identificacion: string;
  nombre: string;
  apellido: string;
  email: string;
  cargo: Cargo;
  telefono: string;
  nombre_usuario: string;
  estado: Estado;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface UsuarioRegistro {
  identificacion: string;
  nombre: string;
  apellido: string;
  email: string;
  cargo: Cargo;
  telefono: string;
  nombre_usuario: string;
  contrasena: string;
}

export interface UsuarioLogin {
  identificacion: string;
  contrasena: string;
}

export type UsuarioActualizacion = Partial<
  Pick<
    UsuarioRegistro,
    | 'nombre'
    | 'apellido'
    | 'email'
    | 'cargo'
    | 'telefono'
    | 'nombre_usuario'
    | 'contrasena'
  >
>;

import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import {
  Estado,
  Usuario,
  UsuarioActualizacion,
  UsuarioLogin,
  UsuarioRegistro,
} from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/usuarios';
  private readonly sessionKey = 'hospital_usuario';

  readonly currentUser = signal<Usuario | null>(this.readStoredUser());

  constructor(private readonly http: HttpClient) {}

  registrar(datos: UsuarioRegistro): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/registro`, datos);
  }

  iniciarSesion(datos: UsuarioLogin): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/login`, datos).pipe(
      tap((usuario) => {
        sessionStorage.setItem(this.sessionKey, JSON.stringify(usuario));
        this.currentUser.set(usuario);
      }),
    );
  }

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/`);
  }

  actualizar(
    identificacion: string,
    cambios: UsuarioActualizacion,
  ): Observable<Usuario> {
    return this.http.put<Usuario>(
      `${this.apiUrl}/${encodeURIComponent(identificacion)}`,
      cambios,
    );
  }

  eliminar(identificacion: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${encodeURIComponent(identificacion)}`,
    );
  }

  cambiarEstado(
    identificacion: string,
    estado: Estado,
  ): Observable<Usuario> {
    return this.http.patch<Usuario>(
      `${this.apiUrl}/${encodeURIComponent(identificacion)}/estado`,
      { estado },
    );
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  cerrarSesion(): void {
    sessionStorage.removeItem(this.sessionKey);
    this.currentUser.set(null);
  }

  private readStoredUser(): Usuario | null {
    const stored = sessionStorage.getItem(this.sessionKey);
    if (!stored) {
      return null;
    }

    try {
      const value: unknown = JSON.parse(stored);
      if (this.isUsuario(value)) {
        return value;
      }
    } catch {
      sessionStorage.removeItem(this.sessionKey);
      return null;
    }

    sessionStorage.removeItem(this.sessionKey);
    return null;
  }

  private isUsuario(value: unknown): value is Usuario {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const usuario = value as Record<string, unknown>;
    return (
      typeof usuario['identificacion'] === 'string' &&
      typeof usuario['nombre'] === 'string' &&
      typeof usuario['apellido'] === 'string' &&
      (usuario['estado'] === 'Activado' ||
        usuario['estado'] === 'Desactivado')
    );
  }
}

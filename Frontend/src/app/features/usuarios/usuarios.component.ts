import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { Cargo, Estado, Usuario, UsuarioActualizacion } from '../../core/models/usuario.model';
import { UsuarioService } from '../../core/services/usuario.service';
import { apiErrorMessage } from '../../core/utils/api-error';
import { hospitalEmailValidator } from '../../core/utils/email.validators';

@Component({
  selector: 'app-usuarios',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    MessageModule,
    PasswordModule,
    SelectModule,
    TableModule,
    TagModule,
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);

  readonly usuarios = signal<Usuario[]>([]);
  readonly cargos: Cargo[] = ['Doctor', 'Especialista', 'Administrativo'];
  readonly currentUser = this.usuarioService.currentUser;
  readonly form = this.formBuilder.nonNullable.group({
    identificacion: ['', [Validators.required, Validators.maxLength(20)]],
    nombre: ['', [Validators.required, Validators.maxLength(80)]],
    apellido: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, hospitalEmailValidator]],
    cargo: this.formBuilder.nonNullable.control<Cargo>('Doctor'),
    telefono: ['', [Validators.required, Validators.maxLength(20)]],
    nombre_usuario: ['', [Validators.required, Validators.maxLength(50)]],
    contrasena: ['', [Validators.minLength(8), Validators.maxLength(128)]],
  });

  dialogVisible = false;
  cargando = false;
  guardando = false;
  error = '';
  mensaje = '';
  busyId: string | null = null;
  editandoId: string | null = null;

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.error = '';
    this.cargando = true;
    this.usuarioService
      .listar()
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (usuarios) => this.usuarios.set(usuarios),
        error: (error: unknown) => {
          this.error = apiErrorMessage(
            error,
            'No fue posible cargar los usuarios. Revisa la conexión con el servidor.',
          );
        },
      });
  }

  crear(): void {
      this.error = '';
      this.mensaje = '';
      this.editandoId = null;
      this.setPasswordRequired(true);
      this.resetForm();
      this.dialogVisible = true;
  }

  editar(usuario: Usuario): void {
      this.editandoId = usuario.identificacion;
    this.mensaje = '';
    this.error = '';
      this.setPasswordRequired(false);
    this.form.reset({
        identificacion: usuario.identificacion,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      cargo: usuario.cargo,
      telefono: usuario.telefono,
      nombre_usuario: usuario.nombre_usuario,
      contrasena: '',
    });
    this.dialogVisible = true;
  }

  cerrarFormulario(): void {
    if (this.guardando) {
      return;
    }
    this.dialogVisible = false;
    this.editandoId = null;
    this.setPasswordRequired(false);
    this.resetForm();
  }

  alCerrarDialogo(): void {
    if (this.guardando) {
      return;
    }
    this.editandoId = null;
    this.setPasswordRequired(false);
    this.resetForm();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos = this.form.getRawValue();
    const identificacionEditada = this.editandoId;
    const cambios: UsuarioActualizacion = {
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      cargo: datos.cargo,
      telefono: datos.telefono,
      nombre_usuario: datos.nombre_usuario,
    };
    if (datos.contrasena) {
      cambios.contrasena = datos.contrasena;
    }

    this.error = '';
    this.mensaje = '';
    this.guardando = true;
    const solicitud =
      identificacionEditada === null
        ? this.usuarioService.registrar(datos)
        : this.usuarioService.actualizar(identificacionEditada, cambios);

    solicitud
      .pipe(finalize(() => (this.guardando = false)))
      .subscribe({
        next: (guardado) => {
          this.usuarios.update((usuarios) => {
            if (identificacionEditada === null) {
              return [...usuarios, guardado];
            }
            return usuarios.map((usuario) =>
              usuario.identificacion === guardado.identificacion
                ? guardado
                : usuario,
            );
          });
          this.dialogVisible = false;
          this.editandoId = null;
          this.setPasswordRequired(false);
          this.resetForm();
          this.mensaje =
            identificacionEditada === null
              ? 'El usuario se creó correctamente.'
              : 'Los datos del usuario se actualizaron.';
        },
        error: (error: unknown) => {
          this.error = apiErrorMessage(
            error,
            'No fue posible guardar el usuario.',
          );
        },
      });
  }

  cambiarEstado(usuario: Usuario): void {
    const estado: Estado =
      usuario.estado === 'Activado' ? 'Desactivado' : 'Activado';
    this.error = '';
    this.mensaje = '';
    this.busyId = usuario.identificacion;
    this.usuarioService
      .cambiarEstado(usuario.identificacion, estado)
      .pipe(finalize(() => (this.busyId = null)))
      .subscribe({
        next: (actualizado) => {
          this.reemplazarUsuario(actualizado);
          this.mensaje = `El usuario ahora está ${actualizado.estado}.`;
        },
        error: (error: unknown) => {
          this.error = apiErrorMessage(
            error,
            'No fue posible cambiar el estado del usuario.',
          );
        },
      });
  }

  eliminar(usuario: Usuario): void {
    const confirmado = window.confirm(
      `¿Eliminar la cuenta de ${usuario.nombre} ${usuario.apellido}?`,
    );
    if (!confirmado) {
      return;
    }

    this.error = '';
    this.mensaje = '';
    this.busyId = usuario.identificacion;
    this.usuarioService
      .eliminar(usuario.identificacion)
      .pipe(finalize(() => (this.busyId = null)))
      .subscribe({
        next: () =>
          this.usuarios.update((usuarios) =>
            usuarios.filter(
              (item) => item.identificacion !== usuario.identificacion,
            ),
          ),
        error: (error: unknown) => {
          this.error = apiErrorMessage(
            error,
            'No fue posible eliminar el usuario.',
          );
        },
      });
  }

  cerrarSesion(): void {
    this.usuarioService.cerrarSesion();
    void this.router.navigateByUrl('/login');
  }

  private reemplazarUsuario(actualizado: Usuario): void {
    this.usuarios.update((usuarios) =>
      usuarios.map((usuario) =>
        usuario.identificacion === actualizado.identificacion
          ? actualizado
          : usuario,
      ),
    );
  }

  private setPasswordRequired(required: boolean): void {
    const validators = [Validators.minLength(8), Validators.maxLength(128)];
    if (required) {
      validators.unshift(Validators.required);
    }
    this.form.controls.contrasena.setValidators(validators);
    this.form.controls.contrasena.updateValueAndValidity({ emitEvent: false });
  }

  private resetForm(): void {
    this.form.reset({
      identificacion: '',
      nombre: '',
      apellido: '',
      email: '',
      cargo: 'Doctor',
      telefono: '',
      nombre_usuario: '',
      contrasena: '',
    });
  }
}

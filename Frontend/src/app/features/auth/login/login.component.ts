import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { apiErrorMessage } from '../../../core/utils/api-error';
import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.formBuilder.nonNullable.group({
    identificacion: ['', [Validators.required, Validators.maxLength(20)]],
    contrasena: ['', [Validators.required, Validators.maxLength(128)]],
  });
  readonly registroExitoso = this.route.snapshot.queryParamMap.get('registro') === 'exitoso';
  cargando = signal(false);
  error = signal('');
  mostrarContrasena = false;

  ingresar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set('');
    this.cargando.set(true);
    this.usuarioService
      .iniciarSesion(this.form.getRawValue())
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl('/usuarios'),
        error: (error: unknown) => {
          this.error.set(
            apiErrorMessage(
              error,
              'No fue posible iniciar sesión. Revisa la conexión con el servidor.',
            ),
          );
        },
      });
  }
}

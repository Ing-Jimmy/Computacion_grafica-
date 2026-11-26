import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';

import { Cargo } from '../../../core/models/usuario.model';
import { UsuarioService } from '../../../core/services/usuario.service';
import { apiErrorMessage } from '../../../core/utils/api-error';
import { hospitalEmailValidator } from '../../../core/utils/email.validators';

@Component({
  selector: 'app-registro',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    MessageModule,
    PasswordModule,
    SelectModule,
  ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);

  readonly cargos: Cargo[] = ['Doctor', 'Especialista', 'Administrativo'];
  readonly form = this.formBuilder.nonNullable.group({
    identificacion: ['', [Validators.required, Validators.maxLength(20)]],
    nombre: ['', [Validators.required, Validators.maxLength(80)]],
    apellido: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, hospitalEmailValidator]],
    cargo: this.formBuilder.nonNullable.control<Cargo>('Doctor'),
    telefono: ['', [Validators.required, Validators.maxLength(20)]],
    nombre_usuario: ['', [Validators.required, Validators.maxLength(50)]],
    contrasena: [
      '',
      [Validators.required, Validators.minLength(8), Validators.maxLength(128)],
    ],
  });
  cargando = false;
  error = '';

  registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error = '';
    this.cargando = true;
    this.usuarioService
      .registrar(this.form.getRawValue())
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: () =>
          void this.router.navigate(['/login'], {
            queryParams: { registro: 'exitoso' },
          }),
        error: (error: unknown) => {
          this.error = apiErrorMessage(
            error,
            'No fue posible crear la cuenta. Revisa la conexión con el servidor.',
          );
        },
      });
  }
}

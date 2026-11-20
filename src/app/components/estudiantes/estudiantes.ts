import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { Estudiante, ProgramaAcademico } from '../../models/estudiante.model';
import { EstudianteService } from '../../services/estudiante.service';


@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    TooltipModule,
    DialogModule,
    DatePickerModule,
    SelectModule,
    MessageModule
  ],
  templateUrl: './estudiantes.html',
  styleUrl: './estudiantes.css'
})
export class EstudiantesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private estudianteService = inject(EstudianteService);

fechaMaxima: Date = new Date();
  estudiantes: Estudiante[] = [];
  programas: ProgramaAcademico[] = [];
  generos = [
    { label: 'Masculino', value: 'Masculino' },
    { label: 'Femenino', value: 'Femenino' },
    { label: 'Otro', value: 'Otro' }
  ];
formatearFechaVisual(fechaIso: string): string {
    if (!fechaIso) return '';
    const [anio, mes, dia] = fechaIso.split('-');
    return `${dia}/${mes}/${anio}`;
  }
  cargando: boolean = false;
  mostrarModal: boolean = false;
  esEdicion: boolean = false;
  estudianteSeleccionadoId: number | null = null;
  errorServidor: string = '';

  estudianteForm!: FormGroup;

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarProgramas();
    this.cargarEstudiantes();
  }

  inicializarFormulario(): void {
    this.estudianteForm = this.fb.group({
      codigo_estudiante: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]+$/),
        Validators.minLength(5),
        Validators.maxLength(20)
      ]],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      fecha_nacimiento: [null, [Validators.required]],
      genero: ['', [Validators.required]],
      id_programa: [null, [Validators.required]],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      telefono: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{7,15}$/)
      ]]
    });
  }

  cargarProgramas(): void {
    this.estudianteService.obtenerProgramas().subscribe({
      next: (data) => {
        this.programas = data;
      },
      error: (err) => {
        console.error('Error cargando programas desde FastAPI:', err);
      }
    });
  }

  cargarEstudiantes(): void {
    this.cargando = true;
    this.estudianteService.obtenerEstudiantes().subscribe({
      next: (data) => {
        this.estudiantes = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando estudiantes:', err);
        this.cargando = false;
      }
    });
  }

  abrirNuevoEstudiante(): void {
    this.esEdicion = false;
    this.estudianteSeleccionadoId = null;
    this.errorServidor = '';
    this.estudianteForm.reset();
    this.mostrarModal = true;
  }

  editarEstudiante(estudiante: Estudiante): void {
    this.esEdicion = true;
    this.estudianteSeleccionadoId = estudiante.id ?? null;
    this.errorServidor = '';

    // Convertir string YYYY-MM-DD a objeto Date local para el DatePicker
    const [anio, mes, dia] = estudiante.fecha_nacimiento.split('-').map(Number);
    const fechaLocal = new Date(anio, mes - 1, dia);

    this.estudianteForm.patchValue({
      codigo_estudiante: estudiante.codigo_estudiante,
      nombres: estudiante.nombres,
      apellidos: estudiante.apellidos,
      fecha_nacimiento: fechaLocal,
      genero: estudiante.genero,
      id_programa: estudiante.id_programa,
      direccion: estudiante.direccion,
      telefono: estudiante.telefono
    });

    this.mostrarModal = true;
  }

  guardarEstudiante(): void {
    if (this.estudianteForm.invalid) {
      this.estudianteForm.markAllAsTouched();
      return;
    }

    const valores = this.estudianteForm.value;
    const fechaObj: Date = valores.fecha_nacimiento;
    const fechaFormateada = `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}-${String(fechaObj.getDate()).padStart(2, '0')}`;

    const payload: Estudiante = {
      ...valores,
      fecha_nacimiento: fechaFormateada
    };

    if (this.esEdicion && this.estudianteSeleccionadoId !== null) {
      this.estudianteService.actualizarEstudiante(this.estudianteSeleccionadoId, payload).subscribe({
        next: () => {
          this.mostrarModal = false;
          this.cargarEstudiantes();
        },
        error: (err) => {
          this.errorServidor = err.error?.detail || 'Error al actualizar el estudiante.';
        }
      });
    } else {
      this.estudianteService.crearEstudiante(payload).subscribe({
        next: () => {
          this.mostrarModal = false;
          this.cargarEstudiantes();
        },
        error: (err) => {
          this.errorServidor = err.error?.detail || 'El código de estudiante ya existe o hay datos inválidos.';
        }
      });
    }
  }

  eliminarEstudiante(estudiante: Estudiante): void {
    if (!estudiante.id) return;
    if (confirm(`¿Estás seguro de eliminar al estudiante ${estudiante.nombres} ${estudiante.apellidos}?`)) {
      this.estudianteService.eliminarEstudiante(estudiante.id).subscribe({
        next: () => this.cargarEstudiantes(),
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }

  campoInvalido(campo: string): boolean {
    const control = this.estudianteForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
import { Component } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { EstudiantesComponent } from './components/estudiantes/estudiantes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ToolbarModule, ButtonModule, EstudiantesComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'Gestión Académica - Universidad de Nariño';
}
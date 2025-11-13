import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Asegurar que CommonModule esté disponible

@Component({
  selector: 'app-background',
  // AÑADIDO: Esto resuelve el error en main-layout.component.ts
  standalone: true, 
  imports: [CommonModule], 
  templateUrl: './background.component.html',
  styleUrl: './background.component.css'
})
export class BackgroundComponent {

}
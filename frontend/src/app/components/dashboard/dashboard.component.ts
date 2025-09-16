import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../services/users.service';
import { Router } from '@angular/router';

interface UserProfile {
  _id: string;
  nombre: string;
  tipoDocumento: string;
  numeroDocumento: string;
  telefono: string;
  direccion: string;
  email: string;
  esVendedor: boolean;
  datosVendedor?: {
    tipoActividad: string;
    nombreEmpresa?: string;
    descripcionEmpresa?: string;
    nit: string;
  };
  fechaRegistro: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  userProfile: UserProfile | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  activeTab: string = 'personal';

  constructor(private usersService: UsersService, private router: Router) {}

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.isLoading = true;
    
    try {
      // Get user data from localStorage
      const userData = localStorage.getItem('currentUser');
      
      if (userData) {
        this.userProfile = JSON.parse(userData);
        this.isLoading = false;
      } else {
        // No user data found, redirect to login
        this.errorMessage = 'No se encontró información del usuario. Por favor, inicia sesión.';
        this.isLoading = false;
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.errorMessage = 'Error al cargar el perfil del usuario.';
      this.isLoading = false;
    }
  }

  getDocumentType(type: string): string {
    if (!type) return 'No especificado';
    const types: { [key: string]: string } = {
      'ti': 'Tarjeta de Identidad',
      'cc': 'Cédula de Ciudadanía',
      'ce': 'Cédula de Extranjería',
      'pp': 'Pasaporte'
    };
    return types[type] || 'No especificado';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  logout() {
    localStorage.removeItem('userData');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/']);
  }
}

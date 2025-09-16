import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  userProfile: UserProfile | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  activeTab: string = 'personal';
  showEditModal: boolean = false;
  editForm: any = {};
  isUpdating: boolean = false;

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
      const userData = localStorage.getItem('userData');
      
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

  openEditModal() {
    this.editForm = {
      nombre: this.userProfile?.nombre || '',
      telefono: this.userProfile?.telefono || '',
      direccion: this.userProfile?.direccion || ''
    };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editForm = {};
  }

  updateProfile() {
    this.isUpdating = true;
    
    this.usersService.updateProfile(this.userProfile?._id!, this.editForm).subscribe({
      next: (response) => {
        // Update local profile
        if (this.userProfile) {
          this.userProfile.nombre = this.editForm.nombre;
          this.userProfile.telefono = this.editForm.telefono;
          this.userProfile.direccion = this.editForm.direccion;
        }
        
        // Update localStorage
        localStorage.setItem('userData', JSON.stringify(this.userProfile));
        
        this.isUpdating = false;
        this.closeEditModal();
        
        // Show success message
        Swal.fire({
          title: '¡Perfil actualizado!',
          text: 'Los cambios se han guardado correctamente.',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.isUpdating = false;
        Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar el perfil. Inténtalo de nuevo.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  logout() {
    localStorage.removeItem('userData');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/']);
  }
}

import { Component, OnInit, inject, computed, effect, signal } from '@angular/core';
import { RouterLink, Router } from "@angular/router";
import { CommonModule } from '@angular/common';
import { UsersService } from '../../services/users.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  private router = inject(Router);
  private usersService = inject(UsersService);

  // Estado reactivo basado en el userId del servicio
  isLoggedIn = computed(() => {
    const userId = this.usersService.userId();
    console.log('🔍 Header - isLoggedIn:', !!userId);
    return !!userId;
  });
  
  // Signals para datos del usuario
  private userDataSignal = signal<any>(null);
  
  // Propiedades computadas
  username = computed(() => {
    if (!this.isLoggedIn()) return '';
    const userData = this.userDataSignal();
    return userData?.nombre || 'Usuario';
  });

  isAdmin = computed(() => {
    if (!this.isLoggedIn()) return false;
    const userData = this.userDataSignal();
    return userData?.isAdmin || false;
  });

  // ✅ NUEVO: Computed para obtener la ruta correcta del dashboard
  dashboardRoute = computed(() => {
    return this.isAdmin() ? '/admin-profile' : '/dashboard';
  });

  showUserMenu = false;

  constructor() {
    // Effect para sincronizar datos del usuario desde localStorage
    effect(() => {
      if (this.isLoggedIn()) {
        try {
          const userData = localStorage.getItem('userData');
          if (userData) {
            const parsedData = JSON.parse(userData);
            this.userDataSignal.set(parsedData);
            console.log('✅ Header: Usuario cargado -', parsedData.nombre, '- Admin:', parsedData.isAdmin);
          }
        } catch (e) {
          console.error('❌ Error parsing userData:', e);
          this.userDataSignal.set(null);
        }
      } else {
        this.userDataSignal.set(null);
      }
    });

    // Effect para resetear el menú cuando el usuario se desloguea
    effect(() => {
      if (!this.isLoggedIn()) {
        this.showUserMenu = false;
      }
    });
  }

  ngOnInit() {
    console.log('🚀 Header inicializado');
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas salir?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    }).then((result) => {
      if (result.isConfirmed) {
        const currentUserId = this.usersService.userId();
        
        if (currentUserId) {
          this.usersService.logout(currentUserId).subscribe({
            next: () => {
              Swal.fire({
                title: '¡Hasta pronto!',
                text: 'Has cerrado sesión correctamente',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
              });
              
              this.userDataSignal.set(null);
              this.showUserMenu = false;
              this.router.navigate(['/']);
            },
            error: (err) => {
              console.error('❌ Error durante el logout:', err);
              localStorage.removeItem('userData');
              localStorage.removeItem('userId');
              localStorage.removeItem('token');
              this.userDataSignal.set(null);
              this.showUserMenu = false;
              this.router.navigate(['/']);
            }
          });
        }
      }
    });
  }

  closeMenuOnClickOutside() {
    this.showUserMenu = false;
  }

  accessPQRS() {
    if (!this.isLoggedIn()) {
      Swal.fire({
        title: 'Acceso restringido',
        text: 'Debes iniciar sesión para acceder al sistema PQRS',
        icon: 'warning',
        confirmButtonText: 'Ir a Login',
        confirmButtonColor: '#3b82f6'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.router.navigate(['/pqrs']);
    }
  }
}
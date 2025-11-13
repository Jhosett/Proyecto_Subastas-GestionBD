import { Component, OnInit, inject, computed, effect, signal } from '@angular/core';
import { RouterLink, Router } from "@angular/router";
import { CommonModule } from '@angular/common';
import { UsersService } from '../../services/users.service';

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
  isLoggedIn = computed(() => !!this.usersService.userId);
  
  // Signals para datos del usuario (más reactivos que computed)
  private userDataSignal = signal<any>(null);
  
  // Propiedades para mostrar información del usuario
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

  showUserMenu = false;

  constructor() {
    // Effect para sincronizar datos del usuario desde localStorage
    effect(() => {
      if (this.isLoggedIn()) {
        try {
          const userData = localStorage.getItem('userData');
          if (userData) {
            this.userDataSignal.set(JSON.parse(userData));
          }
        } catch (e) {
          console.error('Error parsing userData:', e);
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
    // Ciclo de vida del componente
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    const currentUserId = this.usersService.userId;
    
    if (currentUserId) {
      this.usersService.logout(currentUserId).subscribe({
        next: () => {
          console.log('Logout exitoso.');
        },
        error: (err) => {
          console.error('Error durante el logout:', err);
        },
        complete: () => {
          localStorage.removeItem('userData');
          this.userDataSignal.set(null);
          this.showUserMenu = false;
          this.router.navigate(['/']);
        }
      });
    } else {
      localStorage.removeItem('userData');
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      this.userDataSignal.set(null);
      this.showUserMenu = false;
      this.router.navigate(['/']);
    }
  }
}

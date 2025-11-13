import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { UsersService } from '../../../services/users.service';
import Swal from 'sweetalert2';
import { BackgroundComponent } from '../../background/background.component';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink, BackgroundComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  showPassword: boolean = false;
  rememberMe: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  private usersService = inject(UsersService);
  private router = inject(Router);
  
  loginData = {
    email: '',
    password: ''
  };

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  isFormValid(): boolean {
    return !!(this.loginData.email && this.loginData.password);
  }

  onSubmit() {
    if (!this.isFormValid()) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos',
        icon: 'warning',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    this.usersService.login(this.loginData.email, this.loginData.password).subscribe({
      next: (response) => {
        console.log(' Login successful:', response);
        
        // El UsersService ya guardó todo en el tap(), pero verificamos
        const userId = response.userId || response.user?._id || response.user?.id;
        const token = response.token;
        
        // Debug: Verificar que todo se guardó correctamente
        console.log('🔍 Verificando datos guardados:');
        console.log('  - userId:', userId);
        console.log('  - userId en localStorage:', localStorage.getItem('userId'));
        console.log('  - userId en service (signal):', this.usersService.userId());
        console.log('  - token:', token ? '✅ Existe' : '❌ No existe');
        console.log('  - userData:', localStorage.getItem('userData') ? '✅ Existe' : '❌ No existe');
        
        // Forzar refresh del signal por si acaso (opcional pero seguro)
        this.usersService.refreshUserId();
        
        // Verificar que el signal se actualizó correctamente
        const finalUserId = this.usersService.userId();
        if (!finalUserId) {
          console.error('⚠️ ADVERTENCIA: userId signal está vacío después del login');
          // Intentar recuperar manualmente
          if (userId) {
            localStorage.setItem('userId', userId.toString());
            this.usersService.refreshUserId();
          }
        }
        
        this.isLoading = false;
        
        // Mostrar mensaje de bienvenida
        Swal.fire({
          title: '¡Bienvenido!',
          text: `Hola ${response.user?.nombre || 'Usuario'}, has iniciado sesión correctamente.`,
          icon: 'success',
          confirmButtonText: response.user?.isAdmin ? 'Ir al Panel de Admin' : 'Ir al Dashboard',
          confirmButtonColor: '#3b82f6',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => {
          // Redirigir según el rol
          if (response.user?.isAdmin) {
            this.router.navigate(['/admin-profile']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        });
      },
      error: (error) => {
        console.error('❌ Login error:', error);
        console.error('  - Status:', error.status);
        console.error('  - Error completo:', error);
        
        this.isLoading = false;
        
        let errorTitle = 'Error de autenticación';
        let errorMessage = 'Email o contraseña incorrectos.';
        
        // Manejo de errores específicos
        if (error.status === 0) {
          errorTitle = 'Error de conexión';
          errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión a internet.';
        } else if (error.status === 401) {
          errorMessage = error.error?.message || error.error?.error || 'Credenciales inválidas.';
        } else if (error.status === 404) {
          errorMessage = 'Usuario no encontrado. Verifica tu email.';
        } else if (error.status === 500) {
          errorTitle = 'Error del servidor';
          errorMessage = 'Hubo un problema en el servidor. Intenta más tarde.';
        } else if (error.error?.message || error.error?.error) {
          errorMessage = error.error.message || error.error.error;
        }
        
        Swal.fire({
          title: errorTitle,
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'Intentar de nuevo',
          confirmButtonColor: '#ef4444'
        });
        
        // Limpiar password por seguridad
        this.loginData.password = '';
      }
    });
  }

  // Método para manejar "Enter" en el formulario
  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.isFormValid()) {
      this.onSubmit();
    }
  }
}
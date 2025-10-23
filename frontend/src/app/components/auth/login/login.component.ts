import { Component } from '@angular/core';
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

  constructor(
    private usersService: UsersService,
    private router: Router
  ) {}
  
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
    if (this.isFormValid()) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.usersService.login(this.loginData.email, this.loginData.password).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.isLoading = false;
          
          // Store user data in localStorage
          localStorage.setItem('userData', JSON.stringify(response.user));
          
          Swal.fire({
            title: '¡Bienvenido!',
            text: `Hola ${response.user.nombre}, has iniciado sesión correctamente.`,
            icon: 'success',
            confirmButtonText: 'Ir al Dashboard',
            confirmButtonColor: '#3b82f6'
          }).then(() => {
            this.router.navigate(['/dashboard']);
          });
        },
        error: (error) => {
          console.error('Login error:', error);
          this.isLoading = false;
          
          Swal.fire({
            title: 'Error de autenticación',
            text: 'Email o contraseña incorrectos. Por favor, verifica tus credenciales.',
            icon: 'error',
            confirmButtonText: 'Intentar de nuevo',
            confirmButtonColor: '#ef4444'
          });
        }
      });
    }
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { UsersService } from '../../../services/users.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  constructor(
    private usersService: UsersService,
    private router: Router
  ) {}
  activeTab: string = 'personal';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  confirmPassword: string = '';
  acceptTerms: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  wantToSell: boolean = false;

  isOn = false; // estado inicial (false = No)

  toggle() {
    this.isOn = !this.isOn;
  }
  
  registerData = {
    nombre: '',
    tipoDocumento: '',
    numeroDocumento: '',
    telefono: '',
    direccion: '',
    email: '',
    password: ''
  };

  sellerData = {
    tipoActividad: '',
    nombreEmpresa: '',
    descripcionEmpresa: '',
    nit: ''
  };

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  isPersonalInfoValid(): boolean {
    return !!(this.registerData.nombre && 
             this.registerData.tipoDocumento && 
             this.registerData.numeroDocumento && 
             this.registerData.telefono && 
             this.registerData.direccion);
  }

  isFormValid(): boolean {
    const basicFormValid = this.isPersonalInfoValid() && 
                          !!(this.registerData.email && 
                             this.registerData.password && 
                             this.confirmPassword && 
                             this.registerData.password === this.confirmPassword && 
                             this.acceptTerms);
    
    if (!this.wantToSell) {
      return basicFormValid;
    }
    
    return basicFormValid && this.isSellerInfoValid();
  }

  isSellerInfoValid(): boolean {
    if (!this.wantToSell) return true;
    
    const basicSellerValid = !!(this.sellerData.tipoActividad && this.sellerData.nit);
    
    if (this.sellerData.tipoActividad === 'empresa') {
      return basicSellerValid && !!(this.sellerData.nombreEmpresa && this.sellerData.descripcionEmpresa);
    }
    
    return basicSellerValid;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  toggleSeller() {
    this.wantToSell = !this.wantToSell;
    if (!this.wantToSell) {
      this.sellerData = {
        tipoActividad: '',
        nombreEmpresa: '',
        descripcionEmpresa: '',
        nit: ''
      };
    }
  }

  soloNumeros(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const userData = {
        ...this.registerData,
        esVendedor: this.wantToSell,
        datosVendedor: this.wantToSell ? this.sellerData : undefined
      };
      
      this.usersService.register(userData).subscribe({
        next: (response) => {
          console.log('User registered successfully:', response);
          this.isLoading = false;
          
          Swal.fire({
            title: '¡Registro exitoso!',
            text: 'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.',
            icon: 'success',
            confirmButtonText: 'Ir a iniciar sesión',
            confirmButtonColor: '#3b82f6'
          }).then(() => {
            this.router.navigate(['/login']);
          });
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.isLoading = false;
          
          Swal.fire({
            title: 'Error en el registro',
            text: 'Hubo un problema al crear tu cuenta. Por favor, inténtalo nuevamente.',
            icon: 'error',
            confirmButtonText: 'Intentar de nuevo',
            confirmButtonColor: '#ef4444'
          });
        }
      });
    }
  }
}

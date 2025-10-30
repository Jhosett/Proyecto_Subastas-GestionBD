import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { UsersService } from '../../../services/users.service';
import { BackgroundComponent } from '../../background/background.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink, BackgroundComponent],
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
    pais: '',
    departamento: '',
    ciudad: '',
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

  isBasicInfoValid(): boolean {
    return !!(this.registerData.nombre && 
             this.registerData.tipoDocumento && 
             this.registerData.numeroDocumento && 
             this.registerData.telefono && 
             this.registerData.direccion);
  }

  isLocationInfoValid(): boolean {
    return !!(this.registerData.pais &&
             this.registerData.departamento &&
             this.registerData.ciudad);
  }

  isPersonalInfoValid(): boolean {
    return this.isBasicInfoValid() && this.isLocationInfoValid();
  }

  isFormValid(): boolean {
    const basicFormValid = this.isPersonalInfoValid() && 
                          !!(this.registerData.email && 
                             this.registerData.password && 
                             this.confirmPassword && 
                             this.registerData.password === this.confirmPassword && 
                             this.acceptTerms);
    
    const hasValidationErrors = Object.keys(this.validationErrors).length > 0;
    
    if (!this.wantToSell) {
      return basicFormValid && !hasValidationErrors;
    }
    
    return basicFormValid && this.isSellerInfoValid() && !hasValidationErrors;
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
          
          const errorMessage = error.error?.error || 'Hubo un problema al crear tu cuenta. Por favor, inténtalo nuevamente.';
          
          Swal.fire({
            title: 'Error en el registro',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'Intentar de nuevo',
            confirmButtonColor: '#ef4444'
          });
        }
      });
    }
  }

  validationErrors: any = {};

  validateUniqueField(field: string, value: string): void {
    if (!value) return;
    
    this.usersService.validateField(field, value).subscribe({
      next: (response) => {
        if (response.exists) {
          this.validationErrors[field] = this.getFieldErrorMessage(field);
        } else {
          delete this.validationErrors[field];
        }
      },
      error: () => delete this.validationErrors[field]
    });
  }

  getFieldErrorMessage(field: string): string {
    const messages: any = {
      'email': 'Este correo electrónico ya está registrado',
      'numeroDocumento': 'Este número de documento ya está registrado',
      'telefono': 'Este teléfono ya está registrado',
      'datosVendedor.nit': 'Este NIT ya está registrado'
    };
    return messages[field] || 'Este valor ya está registrado';
  }
}

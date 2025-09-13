import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
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
      // Implement registration logic here
      console.log('Form submitted:', this.registerData);
    }
  }
}

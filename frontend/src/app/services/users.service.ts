import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterData {
  nombre: string;
  tipoDocumento: string;
  numeroDocumento: string;
  telefono: string;
  direccion: string;
  email: string;
  password: string;
  esVendedor?: boolean;
  datosVendedor?: {
    tipoActividad: string;
    nombreEmpresa?: string;
    descripcionEmpresa?: string;
    nit: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  register(userData: RegisterData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  updateProfile(userId: string, profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}`, profileData);
  }

  validateField(field: string, value: string, userId?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate`, { field, value, userId });
  }

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  logout(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, { userId });
  }
}
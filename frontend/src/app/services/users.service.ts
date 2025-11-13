import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

// Interfaz para la respuesta esperada al iniciar sesión
export interface LoginResponse {
  token: string;
  userId: string; // Esencial para el registro de analíticas
  [key: string]: any; 
}

// Interfaz para los datos de registro (Añadidas ubicación para consistencia con Backend)
export interface RegisterData {
  nombre: string;
  tipoDocumento: string;
  numeroDocumento: string;
  telefono: string;
  direccion: string;
  pais: string; // <-- AÑADIDO: Necesario para Analytics
  departamento: string; // <-- AÑADIDO: Necesario para Analytics
  ciudad: string; // <-- AÑADIDO: Necesario para Analytics
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

  // Usamos signals para manejar el estado de autenticación
  // Inicializa con el valor en localStorage si existe
  private currentUserId = signal<string | null>(this.getStoredUserId());

  constructor(private http: HttpClient) {
    // Escuchar cambios en el localStorage para sincronizar el signal
    window.addEventListener('storage', () => {
      this.currentUserId.set(this.getStoredUserId());
    });
  }

  private getStoredUserId(): string | null {
    return localStorage.getItem('userId');
  }

  // Getter para obtener el ID del usuario de forma reactiva
  get userId(): string | null {
    // Siempre revisar localStorage para mantener sincronización
    const storedId = this.getStoredUserId();
    if (storedId !== this.currentUserId()) {
      this.currentUserId.set(storedId);
    }
    return this.currentUserId();
  }
  
  register(userData: RegisterData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Se actualiza para guardar el estado de la sesión local
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        // Asumiendo que la respuesta incluye el userId
        if (response.userId) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.userId);
          this.currentUserId.set(response.userId); // Actualiza el signal
        }
      })
    );
  }

  // Se actualiza para limpiar el estado local
  logout(userId: string): Observable<any> {
    // Limpia el estado local antes de llamar a la API
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.currentUserId.set(null);
    // Llama al endpoint de logout del backend (si lo tienes implementado para actualizar ultimoLogout)
    return this.http.post(`${this.apiUrl}/logout`, { userId }); 
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

  getUsersWithFilters(url: string): Observable<any> {
    return this.http.get(`${this.apiUrl}${url}`);
  }
}
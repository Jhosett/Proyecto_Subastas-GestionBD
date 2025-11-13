import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

// Interfaz para la respuesta esperada al iniciar sesión
export interface LoginResponse {
  token: string;
  userId: string;
  user?: any; // Agregar el objeto user completo
  [key: string]: any; 
}

// Interfaz para los datos de registro
export interface RegisterData {
  nombre: string;
  tipoDocumento: string;
  numeroDocumento: string;
  telefono: string;
  direccion: string;
  pais: string;
  departamento: string;
  ciudad: string;
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

  // Signal privado que maneja el estado del userId
  private currentUserId = signal<string | null>(this.getStoredUserId());

  // Exponer como computed para que sea de solo lectura y reactivo
  public userId = computed(() => this.currentUserId());

  constructor(private http: HttpClient) {
    // Escuchar cambios en el localStorage para sincronizar el signal
    window.addEventListener('storage', (event) => {
      if (event.key === 'userId') {
        this.currentUserId.set(this.getStoredUserId());
        console.log('📡 UsersService: userId actualizado desde storage event');
      }
    });
  }

  private getStoredUserId(): string | null {
    return localStorage.getItem('userId');
  }

  register(userData: RegisterData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Login actualizado para manejar el signal correctamente
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        console.log('🔐 Login response:', response);
        
        // Guardar token
        if (response.token) {
          localStorage.setItem('token', response.token);
        }

        // Guardar userId (prioridad: userId directo, luego user._id)
        const userId = response.userId || response.user?._id || response.user?.id;
        if (userId) {
          localStorage.setItem('userId', userId.toString());
          this.currentUserId.set(userId.toString());
          console.log(' UsersService: userId actualizado ->', userId);
        }

        // Guardar userData completo si existe
        if (response.user) {
          localStorage.setItem('userData', JSON.stringify(response.user));
          console.log(' UsersService: userData guardado');
        }
      })
    );
  }

  // Logout actualizado para limpiar el signal
  logout(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, { userId }).pipe(
      tap(() => {
        // Limpiar todo el estado local
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userData');
        this.currentUserId.set(null);
        console.log('🚪 UsersService: Logout completado, signal limpiado');
      })
    );
  }

  // Método para forzar actualización del signal (útil para debugging)
  refreshUserId(): void {
    const storedId = this.getStoredUserId();
    this.currentUserId.set(storedId);
    console.log('🔄 UsersService: Signal refrescado ->', storedId);
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
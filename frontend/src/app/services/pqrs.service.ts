import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsersService } from './users.service';

export interface PQRSData {
  type: 'peticion' | 'queja' | 'reclamo' | 'sugerencia';
  subject: string;
  description: string;
  productId?: string;
  relatedUserId?: string;
  isAnonymous: boolean;
}

export interface PQRS extends PQRSData {
  _id: string;
  userId: string;
  status: 'pendiente' | 'en_proceso' | 'resuelto' | 'cerrado';
  response?: string;
  responseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PqrsService {
  private apiUrl = 'http://localhost:8000/api/pqrs';
  private usersService = inject(UsersService);

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const userId = this.usersService.userId() || localStorage.getItem('userId');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (userId) {
      headers = headers.set('X-User-Id', userId);
    }

    return headers;
  }

  createPQRS(pqrsData: PQRSData): Observable<PQRS> {
    const headers = this.getAuthHeaders();
    return this.http.post<PQRS>(this.apiUrl, pqrsData, { headers });
  }

  getUserPQRS(): Observable<PQRS[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<PQRS[]>(`${this.apiUrl}/user`, { headers });
  }

  getAllPQRS(): Observable<PQRS[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<PQRS[]>(`${this.apiUrl}/all`, { headers });
  }

  getPQRSById(id: string): Observable<PQRS> {
    const headers = this.getAuthHeaders();
    return this.http.get<PQRS>(`${this.apiUrl}/${id}`, { headers });
  }

  updatePQRSStatus(id: string, status: string, response?: string): Observable<PQRS> {
    const headers = this.getAuthHeaders();
    return this.http.put<PQRS>(`${this.apiUrl}/${id}/status`, { status, response }, { headers });
  }

  getUserNotifications(): Observable<PQRS[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<PQRS[]>(`${this.apiUrl}/notifications`, { headers });
  }
}
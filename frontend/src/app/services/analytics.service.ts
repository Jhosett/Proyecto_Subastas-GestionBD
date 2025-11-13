import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalyticsSession } from '../models/analytics-session.model'; // Nuevo modelo

// URL base del backend. Asegúrate de que esta URL sea correcta.
const BASE_URL = 'http://localhost:8000/api/analytics'; 

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);

  // 1. Registrar entrada (Inicio de sesión)
  registerEntry(userId: string): Observable<AnalyticsSession> {
    return this.http.post<AnalyticsSession>(`${BASE_URL}/entry`, { userId });
  }

  // 2. Registrar clic en una categoría
  registerCategoryClick(sessionId: string, categoryName: string): Observable<any> {
    return this.http.post(`${BASE_URL}/click`, { sessionId, categoryName });
  }

  /**
   * 3. NUEVO: Registrar intento de subastar un producto.
   * Llama al endpoint POST /api/analytics/attempt.
   */
  registerAuctionAttempt(sessionId: string): Observable<any> {
    return this.http.post(`${BASE_URL}/attempt`, { sessionId });
  }

  // 4. Registrar egreso (Cierre de sesión)
  registerExit(sessionId: string): Observable<any> {
    // El backend solo necesita el sessionId para calcular el tiempo y cerrar la sesión.
    return this.http.post(`${BASE_URL}/exit`, { sessionId });
  }
}
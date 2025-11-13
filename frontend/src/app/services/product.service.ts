import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { UsersService } from './users.service';

export type { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8000/api/products'; 

  constructor(
    private http: HttpClient,
    private usersService: UsersService
  ) {}

  // Método helper para obtener headers con autenticación
  private getAuthHeaders(): HttpHeaders {
    // userId es un computed signal, llamarlo como función para obtener el valor
    const userId = this.usersService.userId() || localStorage.getItem('userId');
    
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // El backend solo necesita el userId en el header
    if (userId) {
      headers = headers.set('X-User-Id', userId);
      console.log(' Headers enviados con userId:', userId);
    } else {
      console.warn(' No hay userId disponible para los headers');
    }

    return headers;
  }

  //  Obtener todos los productos
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  //  Obtener un producto por id
  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  //  Crear producto (con sellerId asociado)
  createProduct(product: Product, sellerId: string): Observable<Product> {
    const payload = { ...product, vendedorId: sellerId };
    const headers = this.getAuthHeaders();
    return this.http.post<Product>(this.apiUrl, payload, { headers });
  }

  //  Actualizar producto
  updateProduct(id: string, product: Product): Observable<Product> {
    const headers = this.getAuthHeaders();
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product, { headers });
  }

  //  Eliminar producto
  deleteProduct(id: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  //  Hacer puja - CORREGIDO
  bid(id: string, amount: number): Observable<Product> {
    // userId es un computed signal, llamarlo como función
    const userId = this.usersService.userId() || localStorage.getItem('userId');
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    const headers = this.getAuthHeaders();
    
    // Enviar userId tanto en el body como en headers para máxima compatibilidad
    return this.http.post<Product>(
      `${this.apiUrl}/${id}/bid`, 
      { amount, userId },
      { headers }
    );
  }

  //  Obtener las pujas de un producto
  getBids(productId: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/${productId}/bids`, { headers });
  }

  //  Asignar ganador (seller)
  award(
    productId: string, 
    sellerId: string, 
    winnerId: string, 
    paymentMethod?: string, 
    paymentDetails?: string
  ): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiUrl}/${productId}/award`, 
      { sellerId, winnerId, paymentMethod, paymentDetails },
      { headers }
    );
  }

  //  Obtener productos de un vendedor específico
  getProductsBySeller(sellerId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/seller/${sellerId}`);
  }
}
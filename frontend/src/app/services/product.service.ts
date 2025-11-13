
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    const payload = { ...product, vendedorId: sellerId }; // ✅ Cambiar a vendedorId
    return this.http.post<Product>(this.apiUrl, payload);
  }

  //  Actualizar producto
  updateProduct(id: string, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  //  Eliminar producto
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  //  Hacer puja
  bid(id: string, amount: number): Observable<Product> {
    const userId = this.usersService.userId;
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.post<Product>(`${this.apiUrl}/${id}/bid`, { 
      amount, 
      userId 
    });
  }

  //  Obtener las pujas de un producto
  getBids(productId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${productId}/bids`);
  }

  //  Asignar ganador (seller)
  award(productId: string, sellerId: string, winnerId: string, paymentMethod?: string, paymentDetails?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${productId}/award`, { sellerId, winnerId, paymentMethod, paymentDetails });
  }

  //  Obtener productos de un vendedor específico
  getProductsBySeller(sellerId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/seller/${sellerId}`);
  }
}
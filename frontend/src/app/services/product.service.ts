// services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

export type { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8000/api/products'; 

  constructor(private http: HttpClient) {}

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
    const payload = { ...product, sellerId }; // se asegura que quede ligado al vendedor
    return this.http.post<Product>(this.apiUrl, payload);
  }

  //  Actualizar producto
  updateProduct(id: string, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  // 🔹 Eliminar producto
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // 🔹 Hacer puja
  bid(id: string, amount: number): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/${id}/bid`, { amount });
  }

  // 🔹 Obtener productos de un vendedor específico
  getProductsBySeller(sellerId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/seller/${sellerId}`);
  }
}
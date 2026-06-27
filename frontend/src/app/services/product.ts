import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IProduct } from '../interface/product';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Use the modern inject keyword
  private http = inject(HttpClient);
  
  // Point this to your backend products URL
  private apiUrl = `${environment.apiUrl}/products`; 

  //create products

  //all products
  getAllProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`);
  }

  //get all products by category
  getProductsByCategory(categoryId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/category/${categoryId}`)
  }

  getProductByID(productId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${productId}`)
  }

  updateProduct(productId: string, updateData: Partial<IProduct>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${productId}`, updateData)
  }
}
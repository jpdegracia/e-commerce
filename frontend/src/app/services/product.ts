import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Use the modern inject keyword
  private http = inject(HttpClient);
  
  // Point this to your backend products URL
  private apiUrl = 'http://localhost:5000/api/products'; 

  // Fetch all products from your Node.js backend
  getAllProducts(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
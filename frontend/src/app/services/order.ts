import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`; 

  // Sends the shipping details to the backend to finalize the order
  createOrder(shippingDetails: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, shippingDetails);
  }
}
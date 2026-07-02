import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  
  // 🚀 Points directly to the payment routes on your backend
  private apiUrl = `${environment.apiUrl}/payments`; 

  /**
   * 💸 Requests a secure PayMongo Checkout Session URL from the backend.
   * @param orderId The ID of the order we want to pay for.
   * @returns An observable containing the checkoutUrl.
   */
  createCheckoutSession(orderId: string) {
    return this.http.post<{ checkoutUrl: string }>(`${this.apiUrl}/checkout/${orderId}`, {});
  }
}
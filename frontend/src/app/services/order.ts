import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ISingleOrderResponse, IOrderListResponse } from '../interface/order';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  
  // Assuming your express routes are mounted at '/orders'
  private apiUrl = `${environment.apiUrl}/orders`;

  // ==========================================
  // 🛒 CUSTOMER FACING ENDPOINTS
  // ==========================================

  // Submit checkout cart data (address & payment method)
  placeOrder(payload: { shippingAddress: string; paymentMethod: string }): Observable<ISingleOrderResponse> {
    return this.http.post<ISingleOrderResponse>(`${this.apiUrl}/checkout`, payload);
  }

  // Fetch the logged-in user's personal purchase history
  getUserOrderHistory(): Observable<IOrderListResponse> {
    return this.http.get<IOrderListResponse>(`${this.apiUrl}/history`);
  }

  // ==========================================
  // 👑 ADMIN FACING ENDPOINTS
  // ==========================================

  // Fetch every single order in the store (Mapped to router.get("/all"))
  getAllOrders(): Observable<IOrderListResponse> {
    return this.http.get<IOrderListResponse>(`${this.apiUrl}/all`);
  }

  // Fetch detailed breakdown of a specific order (Mapped to router.get("/admin/:id"))
  getOrderById(id: string): Observable<ISingleOrderResponse> {
    return this.http.get<ISingleOrderResponse>(`${this.apiUrl}/admin/${id}`);
  }

  // Update shipping fulfillment or payment status (Mapped to router.put("/admin/:id"))
  updateOrderStatus(id: string, payload: { status: string; paymentStatus?: string }): Observable<ISingleOrderResponse> {
    return this.http.put<ISingleOrderResponse>(`${this.apiUrl}/admin/${id}`, payload);
  }
}
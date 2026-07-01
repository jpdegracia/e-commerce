import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order'; // Adjust path if needed
import { IOrderResponse } from '../../interface/order';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { faSolidBoxOpen, faSolidTruckFast, faSolidReceipt } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent],
  providers: [provideIcons({ faSolidBoxOpen, faSolidTruckFast, faSolidReceipt })],
  templateUrl: './order-history.html'
})
export class OrderHistoryComponent implements OnInit {
  private orderService = inject(OrderService);

  // Core State Signals
  orders = signal<IOrderResponse[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.loadOrderHistory();
  }

  loadOrderHistory() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.orderService.getUserOrderHistory().subscribe({
      next: (response) => {
        console.log("ORDER HISTORY DATA:", response.details);
        this.orders.set(response.details);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Failed to fetch user order history:", err);
        const errorMsg = err.error?.message || "Failed to load your order history.";
        this.errorMessage.set(errorMsg);
        this.isLoading.set(false);
      }
    });
  }
}
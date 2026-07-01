import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order';
import { IOrderResponse } from '../../interface/order';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
// 🚀 1. Import the new icons for the tracker!
import { faSolidArrowLeft, faSolidBoxOpen, faSolidTruckFast, faSolidClipboardList, faSolidBox, faSolidTruck, faSolidLocationDot, faSolidCheck, faSolidCircleXmark } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-view-order',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent],
  // 🚀 2. Add the icons to the providers array
  providers: [provideIcons({ faSolidArrowLeft, faSolidBoxOpen, faSolidTruckFast, faSolidClipboardList, faSolidBox, faSolidTruck, faSolidLocationDot, faSolidCheck, faSolidCircleXmark })],
  templateUrl: './view-order.html'
})
export class ViewOrderComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  order = signal<IOrderResponse | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const orderId = params.get('id');
      if (orderId) {
        this.fetchOrder(orderId);
      } else {
        this.errorMessage.set("Invalid Order ID.");
        this.isLoading.set(false);
      }
    });
  }

  fetchOrder(orderId: string) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.orderService.getUserOrderById(orderId).subscribe({
      next: (response) => {
        this.order.set(response.details);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Failed to fetch order:", err);
        const errorMsg = err.error?.message || "Failed to load order details.";
        this.errorMessage.set(errorMsg);
        this.isLoading.set(false);
      }
    });
  }

  // ==========================================
  // 🚀 TRACKER LOGIC METHODS
  // ==========================================

  // Calculates how far the orange line should stretch
  getTrackerWidth(status: string | undefined): string {
    const widths: Record<string, string> = {
      'Pending': '0%',
      'Processing': '25%',
      'Shipped': '50%',
      'On-Delivery': '75%',
      'Delivered': '100%'
    };
    return widths[status || 'Pending'] || '0%';
  }

  // Checks if a specific circle should light up orange/green
  isStepCompleted(currentStatus: string | undefined, stepIndex: number): boolean {
    const statuses = ['Pending', 'Processing', 'Shipped', 'On-Delivery', 'Delivered'];
    const currentIndex = statuses.indexOf(currentStatus || 'Pending');
    return currentIndex >= stepIndex;
  }
}
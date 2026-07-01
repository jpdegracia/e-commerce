import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order';
import { ToastService } from '../../services/toast'; // Adjust path if needed
import { IOrderResponse } from '../../interface/order';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { faSolidArrowLeft, faSolidUser, faSolidLocationDot, faSolidCreditCard, faSolidFloppyDisk } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-admin-view-order',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent, FormsModule],
  providers: [provideIcons({ faSolidArrowLeft, faSolidUser, faSolidLocationDot, faSolidCreditCard, faSolidFloppyDisk })],
  templateUrl: './view-order.html'
})
export class AdminViewOrderComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);

  order = signal<IOrderResponse | null>(null);
  isLoading = signal<boolean>(true);
  isUpdating = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  
  // Tracks the dropdown value
  selectedStatus = signal<"Pending" | "Processing" | "Shipped" | "On-Delivery" | "Delivered" | "Cancelled" | "">("");

  // The master list of statuses your backend accepts
  availableStatuses = ['Pending', 'Processing', 'Shipped', 'On-Delivery', 'Delivered', 'Cancelled'];

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const orderId = params.get('id');
      if (orderId) {
        this.fetchAdminOrder(orderId);
      } else {
        this.errorMessage.set("Invalid Order ID.");
        this.isLoading.set(false);
      }
    });
  }

  fetchAdminOrder(orderId: string) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.orderService.getOrderById(orderId).subscribe({
      next: (response) => {
        this.order.set(response.details);
        // Pre-fill the dropdown with the current status
        this.selectedStatus.set(response.details.status);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Failed to fetch admin order:", err);
        const errorMsg = err.error?.message || "Failed to load order details.";
        this.errorMessage.set(errorMsg);
        this.isLoading.set(false);
      }
    });
  }

  saveStatus() {
    const currentOrder = this.order();
    // Ensure we actually have a valid status selected before saving
    if (!currentOrder || !this.selectedStatus()) return;

    this.isUpdating.set(true);

    // 🚀 FIX 1: Wrap the status in an object to match your service's expected payload
    const updatePayload = { status: this.selectedStatus() };

    this.orderService.updateOrderStatus(currentOrder._id, updatePayload).subscribe({
      next: () => {
        this.toast.show("Order status updated successfully!", 'success');
        
        // 🚀 FIX 2: Explicitly cast the status so TS knows it perfectly matches the interface
        const updatedStatus = this.selectedStatus() as "Pending" | "Processing" | "Shipped" | "On-Delivery" | "Delivered" | "Cancelled";
        this.order.set({ ...currentOrder, status: updatedStatus });
        
        this.isUpdating.set(false);
      },
      error: (err) => {
        const errorMsg = err.error?.message || "Failed to update status.";
        this.toast.show(`Error: ${errorMsg}`, 'error');
        this.isUpdating.set(false);
      }
    });
  }
}
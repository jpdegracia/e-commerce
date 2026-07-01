import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order'; 
import { ToastService } from '../../services/toast';
import { IOrderResponse } from '../../interface/order'; // 🚀 Importing your strict interface
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  faSolidMagnifyingGlass, 
  faSolidEye 
} from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-admin-order',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgIconComponent],
  providers: [provideIcons({ faSolidMagnifyingGlass, faSolidEye })],
  templateUrl: './admin-orders.html'
})
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private toast = inject(ToastService);

  // Core State Signals
  orders = signal<IOrderResponse[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  // Pagination & Search Signals
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  itemsPerPage = 15;

  // 🚀 Computed: Filter orders by ID, Transaction ID, Customer Name, or Status
  filteredOrders = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allOrders = this.orders();

    if (!query) return allOrders;

    return allOrders.filter(order => 
      order._id.toLowerCase().includes(query) ||
      (order.transactionId && order.transactionId.toLowerCase().includes(query)) ||
      (order.user?.fullname && order.user.fullname.toLowerCase().includes(query)) ||
      order.status.toLowerCase().includes(query) ||
      order.paymentStatus.toLowerCase().includes(query)
    );
  });

  // 🚀 Computed: Total Pages
  totalPages = computed(() => {
    const total = this.filteredOrders().length;
    return Math.ceil(total / this.itemsPerPage) || 1;
  });

  // 🚀 Computed: Paginated Slice
  paginatedOrders = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredOrders().slice(startIndex, endIndex);
  });

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.orderService.getAllOrders().subscribe({
      // 🚀 TypeScript natively knows `response` is `IOrderListResponse` here!
      next: (response) => { 
        this.orders.set(response.details); // Clean, exact assignment
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Order ledger fetch crash:", err);
        this.errorMessage.set("Failed to load store transaction records.");
        this.isLoading.set(false);
      }
    });
  }

  onSearchUpdate(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }
}
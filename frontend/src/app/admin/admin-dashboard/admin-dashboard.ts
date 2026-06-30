import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { UserService } from '../../services/user';
import { ProductService } from '../../services/product';
import { CategoryService } from '../../services/category';
import { PermissionService } from '../../services/permission';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html'
})
export class AdminDashboardComponent implements OnInit {
  private userService = inject(UserService);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private permissionService = inject(PermissionService);

  // Core Metrics Signals
  totalUsers = signal<number>(0);
  totalProducts = signal<number>(0);
  totalCategories = signal<number>(0);
  totalPermissions = signal<number>(0);
  
  // Dashboard Performance States
  isLoading = signal<boolean>(true);
  lowStockItemsCount = signal<number>(0);

  ngOnInit() {
    this.loadAnalyticalSummary();
  }

  loadAnalyticalSummary() {
    this.isLoading.set(true);

    // 🚀 Parallel execution gathers ecosystem metrics instantly
    forkJoin({
      users: this.userService.getUsers(),
      products: this.productService.getAllProducts(),
      categories: this.categoryService.getAllCategories(),
      permissions: this.permissionService.getAllPermissions()
    }).subscribe({
      next: (results: any) => {
        // Safe extractions filtering standard API envelopes
        const userList = results.users?.details || results.users || [];
        const productList = results.products?.details || results.products || [];
        const categoryList = results.categories?.details || results.categories || [];
        const permissionList = results.permissions?.details || results.permissions || [];

        // Set counts
        this.totalUsers.set(userList.length);
        this.totalProducts.set(productList.length);
        this.totalCategories.set(categoryList.length);
        this.totalPermissions.set(permissionList.length);

        // Extract specialized actionable submetrics
        const lowStock = productList.filter((p: any) => p.stock > 0 && p.stock <= 10).length;
        this.lowStockItemsCount.set(lowStock);

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Dashboard systems analytics crash:", err);
        this.isLoading.set(false);
      }
    });
  }
}
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product'; 
import { CategoryService } from '../../services/category';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService); 
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  // Data states
  products: any[] = [];
  categories: any[] = []; // 🚀 3. Add category state
  
  // UI states
  isLoadingProducts = true;
  isLoadingCategories = true;
  errorMessage = '';

  ngOnInit() {
    // Since the homepage is public now, we just fetch everything!
    this.fetchCategories();
    this.fetchProducts();
  }

  fetchCategories() {
    this.isLoadingCategories = true;
    this.categoryService.getAllCategories().subscribe({
      next: (data: any) => {
        // Adjust 'data.details' based on how your category backend sends it!
        this.categories = data.details || data || []; 
        this.isLoadingCategories = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingCategories = false;
        // We won't crash the whole page if categories fail, just hide them or show a small error
        this.cdr.detectChanges();
      }
    });
  }

  fetchProducts() {
    this.isLoadingProducts = true;
    this.productService.getAllProducts().subscribe({
      next: (data: any) => {
        this.products = data.details || []; 
        this.isLoadingProducts = false;
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        this.isLoadingProducts = false;
        this.errorMessage = "Failed to load products. Please try again later.";
        this.cdr.detectChanges(); 

        setTimeout(() => {
          this.toast.show(this.errorMessage, 'error');
        });
      }
    });
  }
}
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product'

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule], // 👈 Required to use @for loops in your HTML
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  
  // Array to hold your database items
  products: any[] = [];

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (response: any) => {
        // Adapt this based on how your backend nests the data (e.g., response or response.details)
        this.products = response; 
        console.log('Products fetched:', this.products);
      },
      error: (err) => {
        console.error('Failed to load products:', err);
      }
    });
  }
}
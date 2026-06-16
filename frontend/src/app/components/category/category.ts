import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product';
import { CategoryService } from '../../services/category';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-category-view',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './category.html',
  styleUrl: './category.css'
})
export class CategoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  // Data states
  categoryDetails: any = null;
  products: any[] = [];

  // UI states
  isLoading = true;
  errorMessage = '';

  ngOnInit() {
    // 🚀 Grab the category ID parameter from the active route URL
    this.route.paramMap.subscribe(params => {
      const categoryId = params.get('id');
      if (categoryId) {
        this.fetchCategoryPageData(categoryId);
      } else {
        this.errorMessage = "Invalid Category Selected.";
        this.isLoading = false;
      }
    });
  }

  fetchCategoryPageData(categoryId: string) {
    this.isLoading = true;
    this.errorMessage = '';

    // 1. Fetch Category Details (For the Page Banner/Title)
    this.categoryService.getCategoryById(categoryId).subscribe({
      next: (data: any) => {
        // Adjust depending on whether your category controller uses a 'details' envelope
        this.categoryDetails = data.details || data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.show("Failed to load category information.", "error");
      }
    });

    // 2. Fetch the Products belonging to this Category
    this.productService.getProductsByCategory(categoryId).subscribe({
      next: (data: any) => {
        this.products = data.details || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = "Failed to load products for this category.";
        this.cdr.detectChanges();
      }
    });
  }
}
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ProductService } from '../../services/product';

// 🚀 Import ng-icons and your specific requested icons
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidArrowsToEye, faSolidPenToSquare } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-view-product',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink, NgIcon],
  providers: [provideIcons({ faSolidArrowsToEye, faSolidPenToSquare })],
  templateUrl: './view-product.html'
})
export class ViewProductComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);

  product = signal<any | null>(null);
  isLoading = signal<boolean>(true);
  
  // 🚀 Tracks which image is currently enlarged in the preview gallery
  selectedImageIndex = signal<number>(0); 

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchProductDetails(id);
    } else {
      this.router.navigate(['/admin/products']);
    }
  }

  fetchProductDetails(id: string) {
    this.isLoading.set(true);
    this.productService.getProductByID(id).subscribe({
      next: (response: any) => {
        const data = response.details || response;
        this.product.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Failed to fetch product for preview", err);
        this.router.navigate(['/admin/products']);
      }
    });
  }

  // Quick helper to switch main preview image
  setPreviewImage(index: number) {
    this.selectedImageIndex.set(index);
  }
}
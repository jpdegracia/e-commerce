import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product';
import { ToastService } from '../../services/toast';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCartShopping } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-product', // 🚀 Keeps your original selector
  standalone: true,
  imports: [RouterLink, NgIcon],
  providers: [provideIcons({faSolidCartShopping})],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class ProductComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  // Data state
  product: any = null;
  quantity: number = 1; // 🚀 New: Tracks selected quantity
  
  // UI states
  isLoading = true;
  errorMessage = '';
  selectedImage = ''; 
  

  ngOnInit() {
    // 🚀 Read the product ID parameter from the active route URL path
    this.route.paramMap.subscribe(params => {
      const productId = params.get('id');
      if (productId) {
        this.fetchProductDetails(productId);
      } else {
        this.errorMessage = "Product not found.";
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  fetchProductDetails(productId: string) {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProductByID(productId).subscribe({
      next: (data: any) => {
        // Safe check for the backend 'details' envelope wrapper
        this.product = data.details || data;
        
        // Default preview to the first string image in your database array
        if (this.product?.images?.length > 0) {
          this.selectedImage = this.product.images[0];
        }
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = "Unable to retrieve product information.";
        this.cdr.detectChanges();
        this.toast.show(this.errorMessage, 'error');
      }
    });
  }

  // Swaps main display frame image when clicking multiple catalog thumbnails
  changeMainImage(imgUrl: string) {
    this.selectedImage = imgUrl;
    this.cdr.detectChanges();
  }

  // 🚀 New: Increment quantity (prevents going over stock limit)
  incrementQuantity() {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    } else {
      this.toast.show(`Only ${this.product.stock} items available in stock.`, 'info');
    }
  }

  // 🚀 New: Decrement quantity (prevents going below 1)
  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // 🚀 New: Add to Cart Action
  addToCart() {
    if (!this.product || this.quantity < 1 || this.product.stock < 1) return;

    // For now, we will just log it and show a success toast!
    // Later, you will pass this to your CartService.
    const cartItem = {
      productId: this.product._id,
      productname: this.product.productname,
      price: this.product.price,
      quantity: this.quantity,
      image: this.selectedImage
    };

    console.log("🛒 Item added to cart:", cartItem);
    this.toast.show(`Added ${this.quantity} ${this.product.productname}(s) to your cart!`, 'success');
  }
}
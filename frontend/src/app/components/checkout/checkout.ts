import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CartService } from '../../services/cart';
import { OrderService } from '../../services/order';
import { ToastService } from '../../services/toast'; 

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DecimalPipe],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent {
  public cartService = inject(CartService);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // 🚀 Set up the Shipping Form with Validation
  checkoutForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    address: ['', [Validators.required]],
    city: ['', [Validators.required]],
    zipCode: ['', [Validators.required]],
    phone: ['', [Validators.required]]
  });

  isSubmitting = false;

  placeOrder() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.toast.show("Please fill out all required shipping details.");
      return;
    }

    this.isSubmitting = true;

    // 🚀 Send the form data to your Express backend!
    // Note: A secure backend usually pulls the cart items and prices directly from 
    // the DB using the user's token, so we only need to send the shipping info!
    const orderPayload = {
      shippingAddress: this.checkoutForm.value
    };

    this.orderService.createOrder(orderPayload).subscribe({
      next: (response) => {
        this.toast.show("Order placed successfully!");
        
        // 🚀 Tell the cart service to empty the cart UI (the backend should empty the DB cart)
        this.cartService.loadCart(); 
        
        this.isSubmitting = false;
        // Redirect to a success page or order history
        this.router.navigate(['/order-success']); 
      },
      error: (err) => {
        this.isSubmitting = false;
        const errorMsg = err.error?.message || "Failed to place order.";
        this.toast.show(`Checkout Failed: ${errorMsg}`);
      }
    });
  }
}
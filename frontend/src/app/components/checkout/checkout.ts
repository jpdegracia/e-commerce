import { Component, inject, OnInit } from '@angular/core'; // 🚀 Imported OnInit
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
  templateUrl: './checkout.html'
})
export class CheckoutComponent implements OnInit { // 🚀 Implemented OnInit
  public cartService = inject(CartService);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Set up the Shipping Form with Validation
  checkoutForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    address: ['', [Validators.required]],
    city: ['', [Validators.required]],
    zipCode: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    paymentMethod: ['Cash on Delivery / C.O.D.', [Validators.required]] // 🚀 ADD THIS LINE
  });

  isSubmitting = false;

  // 🚀 ADDED: Fire this immediately when the page loads!
  ngOnInit() {
    this.cartService.loadCart();
  }

  placeOrder() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      // 🚀 FIXED: Added 'error' as the second argument
      this.toast.show("Please fill out all required shipping details.", 'error');
      return;
    }

    this.isSubmitting = true;

    // 1. Extract the form values
    const formVals = this.checkoutForm.value;

    // 2. Combine the address parts
    const fullShippingAddress = `${formVals.fullName} - ${formVals.phone} | ${formVals.address}, ${formVals.city}, Zip: ${formVals.zipCode}`;

    // 3. Pass the payload
    const orderPayload = {
      shippingAddress: fullShippingAddress,
      paymentMethod: formVals.paymentMethod 
    };

    this.orderService.placeOrder(orderPayload).subscribe({
      next: (response) => {
        // 🚀 FIXED: Explicitly set to 'success'
        this.toast.show("Order placed successfully!", 'success');
        
        // Tell the cart service to empty the cart UI
        this.cartService.loadCart(); 
        
        this.isSubmitting = false;
        this.router.navigate(['/order-success']); 
      },
      error: (err) => {
        this.isSubmitting = false;
        
        // 🚀 FIXED: Now checks err.error.error first to get the detailed backend message
        const errorMsg = err.error?.error || err.error?.message || "Failed to place order.";
        
        // 🚀 FIXED: Added 'error' as the second argument so the box is red!
        this.toast.show(`Checkout Failed: ${errorMsg}`, 'error');
      }
    });
  }
}
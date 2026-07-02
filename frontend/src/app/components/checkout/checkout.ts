import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CartService } from '../../services/cart';
import { OrderService } from '../../services/order';
import { ToastService } from '../../services/toast'; 
import { PaymentService } from '../../services/payment'; 

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DecimalPipe],
  templateUrl: './checkout.html'
})
export class CheckoutComponent implements OnInit { 
  public cartService = inject(CartService);
  private orderService = inject(OrderService);
  private paymentService = inject(PaymentService); // 🚀 2. Inject it!
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
    paymentMethod: ['Cash on Delivery / C.O.D.', [Validators.required]] 
  });

  isSubmitting = false;

  ngOnInit() {
    this.cartService.loadCart();
  }

  placeOrder() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
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
        // Empty the cart UI
        this.cartService.loadCart(); 
        
        // 🚀 4. Grab the ID of the newly created order
        // (Make sure this matches exactly how your backend sends it!)
        const newOrderId = response.details._id;

        // 🚀 5. THE MAGIC UX BRANCH
        if (formVals.paymentMethod !== 'Cash on Delivery / C.O.D.') {
          
          this.toast.show("Order saved! Redirecting to secure payment...", 'info');
          
          // Instantly ask PayMongo for a link using the new Order ID
          this.paymentService.createCheckoutSession(newOrderId).subscribe({
            next: (payRes) => {
              window.location.href = payRes.checkoutUrl; // Auto-redirect!
            },
            error: (payErr) => {
              console.error("Auto-redirect failed:", payErr);
              this.isSubmitting = false;
              this.toast.show("Payment gateway error. You can pay from your order history.", 'error');
              // Fallback: Send them to the view order page to click the button manually
              this.router.navigate(['/orders', newOrderId]);
            }
          });

        } else {
          // 🚀 6. It is C.O.D. - normal flow!
          this.toast.show("Order placed successfully!", 'success');
          this.isSubmitting = false;
          
          // I changed this from '/order-success' to directly view the order.
          // This way, they instantly see their new beautiful Order Tracker!
          this.router.navigate(['/orders', newOrderId]); 
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        const errorMsg = err.error?.error || err.error?.message || "Failed to place order.";
        this.toast.show(`Checkout Failed: ${errorMsg}`, 'error');
      }
    });
  }
}
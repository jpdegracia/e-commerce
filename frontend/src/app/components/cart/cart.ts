import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';
import { DecimalPipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidTrashCan } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, DecimalPipe, NgIcon],
  providers: [provideIcons({faSolidTrashCan})],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class CartComponent {
  public cartService = inject(CartService);
  private router = inject(Router);

  // 🚀 Variables to control the delete modal
  showDeleteModal = false;
  itemToDelete: string | null = null;

  // 🚀 Custom method to handle quantity changes
  handleQuantityChange(productId: string, currentQuantity: number, change: number) {
    const newQuantity = currentQuantity + change;
    
    if (newQuantity === 0) {
      // If it drops to 0, open the modal instead of updating the cart immediately
      this.itemToDelete = productId;
      this.showDeleteModal = true;
    } else {
      // Otherwise, just update the quantity normally
      this.cartService.updateQuantity(productId, newQuantity);
    }
  }

  // 🚀 Confirm removal
  confirmDelete() {
    if (this.itemToDelete) {
      this.cartService.removeFromCart(this.itemToDelete);
    }
    this.closeModal();
  }

  // 🚀 Cancel removal
  closeModal() {
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }

  // 🚀 ADD THIS NEW METHOD
  proceedToCheckout() {
    const token = localStorage.getItem('token');

    if (!token) {
      // If they are a guest, send them to login first!
      // Once they log in, your syncGuestCartToDb() will run, and they can proceed.
      this.router.navigate(['/login']); 
    } else {
      // If they are logged in, send them straight to the checkout page
      this.router.navigate(['/checkout']);
    }
  }
}
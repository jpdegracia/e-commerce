import { computed, Injectable, signal } from '@angular/core';
import { CartItem } from '../interface/cart-items';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  
  // We use an Angular Signal to hold the cart data reactively
  private cartItems = signal<CartItem[]>(this.loadCartFromStorage());

  // Automatically calculate totals whenever the cart changes!
  public cart = this.cartItems.asReadonly();
  
  public totalItems = computed(() => {
    return this.cartItems().reduce((total, item) => total + item.quantity, 0);
  });

  public totalPrice = computed(() => {
    return this.cartItems().reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  constructor() {}

  // 🛒 Add an item to the cart
  addToCart(item: CartItem) {
    const currentItems = this.cartItems();
    const existingItem = currentItems.find(i => i.productId === item.productId);

    if (existingItem) {
      // If it's already in the cart, just increase the quantity (up to max stock)
      const newQuantity = existingItem.quantity + item.quantity;
      existingItem.quantity = newQuantity > item.stock ? item.stock : newQuantity;
      this.cartItems.set([...currentItems]);
    } else {
      // If it's new, add the whole item
      this.cartItems.set([...currentItems, item]);
    }
    
    this.saveCartToStorage();
  }

  // 🗑️ Remove a specific item entirely
  removeFromCart(productId: string) {
    this.cartItems.set(this.cartItems().filter(item => item.productId !== productId));
    this.saveCartToStorage();
  }

  // 🔄 Update quantity from the cart page
  updateQuantity(productId: string, quantity: number) {
    const currentItems = this.cartItems();
    const item = currentItems.find(i => i.productId === productId);
    
    if (item) {
      item.quantity = quantity;
      this.cartItems.set([...currentItems]);
      this.saveCartToStorage();
    }
  }

  // 🧹 Clear the whole cart (used after successful checkout)
  clearCart() {
    this.cartItems.set([]);
    this.saveCartToStorage();
  }

  // --- Local Storage Helpers ---
  private saveCartToStorage() {
    localStorage.setItem('myCart', JSON.stringify(this.cartItems()));
  }

  private loadCartFromStorage(): CartItem[] {
    const saved = localStorage.getItem('myCart');
    return saved ? JSON.stringify(JSON.parse(saved)) !== '[]' ? JSON.parse(saved) : [] : [];
  }
}
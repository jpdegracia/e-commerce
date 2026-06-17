import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CartItem } from '../interface/cart-items';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/carts'; 

  // The Signal that drives your HTML UI
  private cartItems = signal<CartItem[]>([]);

  public cart = this.cartItems.asReadonly();
  
  public totalItems = computed(() => {
    return this.cartItems().reduce((total, item) => total + item.quantity, 0);
  });

  public totalPrice = computed(() => {
    return this.cartItems().reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  constructor() {
    this.loadCart();
  }

  // 🔑 Helper to check if user is logged in
  private isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // 🔄 LOAD CART (Decides between LocalStorage or Database)
  loadCart() {
    if (this.isLoggedIn()) {
      this.loadFromDB();
    } else {
      this.loadFromLocal();
    }
  }

  // 🛒 ADD ITEM
  addToCart(item: CartItem) {
    if (this.isLoggedIn()) {
      this.http.post<any>(this.apiUrl, { productId: item.productId, quantity: item.quantity || 1 }).subscribe({
        next: () => this.loadFromDB(),
        error: (err) => console.error('Failed to add to DB', err)
      });
    } else {
      const currentItems = [...this.cartItems()];
      const existing = currentItems.find(i => i.productId === item.productId);
      
      if (existing) {
        existing.quantity += (item.quantity || 1);
      } else {
        currentItems.push({ ...item, quantity: item.quantity || 1 });
      }
      this.saveToLocal(currentItems);
    }
  }

  // 🗑️ REMOVE ITEM
  removeFromCart(productId: string) {
    if (this.isLoggedIn()) {
      this.http.delete<any>(`${this.apiUrl}/${productId}`).subscribe({
        next: () => this.loadFromDB(),
        error: (err) => console.error('Failed to remove from DB', err)
      });
    } else {
      const updatedItems = this.cartItems().filter(item => item.productId !== productId);
      this.saveToLocal(updatedItems);
    }
  }

  // 🔢 UPDATE QUANTITY
  updateQuantity(productId: string, quantity: number) {
    if (this.isLoggedIn()) {
      this.http.put<any>(this.apiUrl, { productId, quantity }).subscribe({
        next: () => this.loadFromDB(),
        error: (err) => console.error('Failed to update DB', err)
      });
    } else {
      const currentItems = [...this.cartItems()];
      const item = currentItems.find(i => i.productId === productId);
      if (item) {
        item.quantity = quantity;
        this.saveToLocal(currentItems);
      }
    }
  }

  // ==========================================
  // 💽 DATABASE SPECIFIC METHODS
  // ==========================================
  private loadFromDB() {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (response) => {
        if (!response.details || !response.details.items) {
          this.cartItems.set([]);
          return;
        }

        const mappedItems: CartItem[] = response.details.items.map((cartItem: any) => {
          const prod = cartItem.product; 
          return {
            productId: prod._id || prod.id, 
            productname: prod.name || prod.productname, 
            price: prod.price,
            image: prod.image,
            stock: prod.stock,
            quantity: cartItem.quantity
          };
        });

        this.cartItems.set(mappedItems);
      },
      error: (err) => console.error('Failed to load cart from DB', err)
    });
  }

  // ==========================================
  // 💻 LOCAL STORAGE SPECIFIC METHODS
  // ==========================================
  private loadFromLocal() {
    const localData = localStorage.getItem('guestCart');
    if (localData) {
      this.cartItems.set(JSON.parse(localData));
    } else {
      this.cartItems.set([]);
    }
  }

  private saveToLocal(items: CartItem[]) {
    this.cartItems.set(items);
    localStorage.setItem('guestCart', JSON.stringify(items));
  }

  // ==========================================
  // 🚀 SYNC: CALL THIS RIGHT AFTER LOGIN
  // ==========================================
  syncGuestCartToDb() {
    const localData = localStorage.getItem('guestCart');
    if (!localData) return; // Nothing to sync

    const guestItems: CartItem[] = JSON.parse(localData);
    
    // Loop through guest items and push to DB
    guestItems.forEach(item => {
      this.http.post<any>(this.apiUrl, { productId: item.productId, quantity: item.quantity }).subscribe({
        next: () => {
          // Once synced, clear the local cart so we don't double-sync later
          localStorage.removeItem('guestCart');
          // Reload the official DB cart
          this.loadFromDB(); 
        },
        error: (err) => console.error('Failed to sync item', err)
      });
    });
  }
}
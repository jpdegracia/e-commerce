import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CartItem } from '../interface/cart-items';
import { ToastService } from './toast'; // Ensure this path matches your project structure
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/carts`; 
  private GUEST_CART_EXPIRATION_HOURS = 24;
  private toast = inject(ToastService);

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
        console.log("BACKEND SENT THIS CART DATA:", response);
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
      const parsedData = JSON.parse(localData);
      
      // ⏳ Check if the current time has passed the expiration time
      if (Date.now() > parsedData.expiresAt) {
        console.warn("Guest cart expired! Clearing local storage.");
        localStorage.removeItem('guestCart');
        this.cartItems.set([]);
      } else {
        // Still valid! Load the items into the UI
        this.cartItems.set(parsedData.items);
      }
    } else {
      this.cartItems.set([]);
    }
  }

  private saveToLocal(items: CartItem[]) {
    this.cartItems.set(items); // Update UI immediately
    
    // ⏳ Calculate expiration time (Current time + X hours in milliseconds)
    const expirationMs = this.GUEST_CART_EXPIRATION_HOURS * 60 * 60 * 1000;
    const expiresAt = Date.now() + expirationMs;

    // Wrap the items and the timestamp together in a single object
    const payload = {
      items: items,
      expiresAt: expiresAt
    };

    localStorage.setItem('guestCart', JSON.stringify(payload));
  }

  // ==========================================
  // 🚀 SYNC: CALL THIS RIGHT AFTER LOGIN
  // ==========================================
  syncGuestCartToDb() {
    const localData = localStorage.getItem('guestCart');
    if (!localData) return; // Nothing to sync

    const parsedData = JSON.parse(localData);

    // ⏳ If they log in, but their guest cart is expired, don't sync it!
    if (Date.now() > parsedData.expiresAt) {
      localStorage.removeItem('guestCart');
      
      // Notify them their cart was cleared (adjust method name to match your ToastService)
      if (this.toast.show) {
        this.toast.show("Your guest cart expired and was cleared.");
      }
      return;
    }

    const guestItems: CartItem[] = parsedData.items;
    
    // Loop through guest items and push to DB
    guestItems.forEach(item => {
      this.http.post<any>(this.apiUrl, { productId: item.productId, quantity: item.quantity }).subscribe({
        next: () => {
          this.loadFromDB(); // Reload the official DB cart for each successful sync
        },
        error: (err) => {
          // 🚀 Grab the exact error message from your Express backend
          const errorMsg = err.error?.message || err.error?.error || "Failed to add an item to your cart.";
          
          // Show the toast to the user (adjust method name to match your ToastService)
          if (this.toast.show) {
            this.toast.show(`Oops! ${item.productname}: ${errorMsg}`);
          } else {
            console.error(`Oops! ${item.productname}: ${errorMsg}`);
          }
        }
      });
    });

    // Clean up local storage so we don't sync again later
    // We clear it here regardless of loop success/failure so they aren't stuck looping a dead cart
    localStorage.removeItem('guestCart'); 
  }
}
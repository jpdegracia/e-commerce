import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CartItem } from '../interface/cart-items';
import { ToastService } from './toast';
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
      // 🚀 Updated to item.product._id
      this.http.post<CartItem>(this.apiUrl, { productId: item.product._id, quantity: item.quantity || 1 }).subscribe({
        next: () => this.loadFromDB(),
        error: (err) => console.error('Failed to add to DB', err)
      });
    } else {
      const currentItems = [...this.cartItems()];
      // 🚀 Updated to item.product._id
      const existing = currentItems.find(i => i.product._id === item.product._id);
      
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
      this.http.delete<CartItem>(`${this.apiUrl}/${productId}`).subscribe({
        next: () => this.loadFromDB(),
        error: (err) => console.error('Failed to remove from DB', err)
      });
    } else {
      // 🚀 Updated to item.product._id
      const updatedItems = this.cartItems().filter(item => item.product._id !== productId);
      this.saveToLocal(updatedItems);
    }
  }

  // 🔢 UPDATE QUANTITY
  updateQuantity(productId: string, quantity: number) {
    if (this.isLoggedIn()) {
      this.http.put<CartItem>(this.apiUrl, { productId, quantity }).subscribe({
        next: () => this.loadFromDB(),
        error: (err) => console.error('Failed to update DB', err)
      });
    } else {
      const currentItems = [...this.cartItems()];
      // 🚀 Updated to item.product._id
      const item = currentItems.find(i => i.product._id === productId);
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

        // 🚀 Updated mapper to construct the exact nested structure your UI now expects
        const mappedItems: CartItem[] = response.details.items.map((cartItem: any) => {
          const prod = cartItem.product; 
          return {
            product: {
              _id: prod._id || prod.id,
              productname: prod.name || prod.productname,
              images: prod.images || (prod.image ? [prod.image] : []), // Safely handle both array and single string
              price: prod.price,
              stock: prod.stock
            },
            price: prod.price, // Cart snapshot price
            quantity: cartItem.quantity,
            _id: cartItem._id
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
      
      if (Date.now() > parsedData.expiresAt) {
        console.warn("Guest cart expired! Clearing local storage.");
        localStorage.removeItem('guestCart');
        this.cartItems.set([]);
      } else {
        this.cartItems.set(parsedData.items);
      }
    } else {
      this.cartItems.set([]);
    }
  }

  private saveToLocal(items: CartItem[]) {
    this.cartItems.set(items);
    
    const expirationMs = this.GUEST_CART_EXPIRATION_HOURS * 60 * 60 * 1000;
    const expiresAt = Date.now() + expirationMs;

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
    if (!localData) return;

    const parsedData = JSON.parse(localData);

    if (Date.now() > parsedData.expiresAt) {
      localStorage.removeItem('guestCart');
      if (this.toast.show) {
        this.toast.show("Your guest cart expired and was cleared.");
      }
      return;
    }

    const guestItems: CartItem[] = parsedData.items;
    
    guestItems.forEach(item => {
      // 🚀 Updated to item.product._id
      this.http.post<CartItem>(this.apiUrl, { productId: item.product._id, quantity: item.quantity }).subscribe({
        next: () => {
          this.loadFromDB(); 
        },
        error: (err) => {
          const errorMsg = err.error?.message || err.error?.error || "Failed to add an item to your cart.";
          
          // 🚀 Updated to item.product.productname
          if (this.toast.show) {
            this.toast.show(`Oops! ${item.product.productname}: ${errorMsg}`);
          } else {
            console.error(`Oops! ${item.product.productname}: ${errorMsg}`);
          }
        }
      });
    });

    localStorage.removeItem('guestCart'); 
  }
}
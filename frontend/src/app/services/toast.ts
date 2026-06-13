import { Injectable, signal } from '@angular/core';

// Define what a Toast looks like
export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Using Angular Signals for lightweight, reactive state tracking
  toasts = signal<Toast[]>([]);

  show(message: string, type: 'success' | 'error' | 'info' = 'success') {
    const id = Date.now();
    const newToast: Toast = { message, type, id };
    
    // Add new toast to our reactive array
    this.toasts.update(currentToasts => [...currentToasts, newToast]);

    // Automatically remove the toast after 3.5 seconds
    setTimeout(() => {
      this.clear(id);
    }, 3500);
  }

  clear(id: number) {
    this.toasts.update(currentToasts => currentToasts.filter(t => t.id !== id));
  }
}
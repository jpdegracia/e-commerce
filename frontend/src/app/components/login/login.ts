import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidEye, faSolidEyeSlash } from '@ng-icons/font-awesome/solid';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, NgIcon, CommonModule],
  providers: [provideIcons({ faSolidEye, faSolidEyeSlash})],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private toast = inject(ToastService);
  private router = inject(Router);


  loginCredentialsData = {
    email: '',
    password: ''
  };

  //visibility toggles
  showPassword = false;

  onSubmit() {
    
    if (!this.loginCredentialsData.email || !this.loginCredentialsData.password) {
      this.toast.show("Please enter both your email and password.", "error");
      return;
    }
    this.authService.login(this.loginCredentialsData).subscribe({
      next: (response: any) => {
        this.toast.show("Login successful! Welcome back.", "success");
        
        // Save the authentication token (JWT) returned from your Node backend
        if (response.token) {
          localStorage.setItem('token', response.token);
        }

        // 🚀 Tell the cart service to sync their guest items!
        this.cartService.syncGuestCartToDb();

        // Redirect user to the home page or dashboard shell view
        this.router.navigate(['/']); 
      },
      error: (err: any) => {
        // Intercept backend errors (e.g., "Invalid credentials", "Please verify email first")
        const errorMsg = err.error?.error || err.error?.message || 'Login failed. Please try again.';
        this.toast.show(errorMsg, "error");
      }
    });
  }

}

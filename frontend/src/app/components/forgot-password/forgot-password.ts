import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);


  forgotPasswordData = {
    email: ''
  }

  //UI loading tracker
  isLoading = false;


  onSubmit() {
    if (!this.forgotPasswordData.email || this.forgotPasswordData.email.trim() === '') {
      this.toast.show("Please enter your registered email address.", "error");
      return; 
    }

    this.isLoading = true;

    this.authService.forgotPassword(this.forgotPasswordData.email).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.toast.show("Password resent link sent! Please check your email", 'success');

        this.router.navigate(['/login'])
      },
      error:( error: any) => {
        this.isLoading = false;

        const errorMessage = error.error?.message || "Failed to send reset link. Please try again";
        this.toast.show(errorMessage, "error")
      }
    })
  }
}
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  imports: [RouterLink, FormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPasswordComponent {
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  resetPasswordData = {
    password: '',
    confirmPassword: ''
  };

  //UI default loading state
  isLoading = false;


  //password check criteria
  get isLengthValid(): boolean { return this.resetPasswordData.password.length >= 8; }
  get hasUppercase(): boolean { return /[A-Z]/.test(this.resetPasswordData.password); }
  get hasSpecialChar(): boolean { return /[!@#$%^&*(),.?":{}|<>]/.test(this.resetPasswordData.password); }

  onSubmit() {
    if (!this.resetPasswordData.password || this.resetPasswordData.password.trim() === '') {
      this.toast.show("Please enter a new password", "error");
      return
    }

    if (!this.isLengthValid || !this.hasUppercase || !this.hasSpecialChar ) {
      this.toast.show("Password does not meet the secure criteria.", "error");
      return
    }

    if(this.resetPasswordData.password !== this.resetPasswordData.confirmPassword) {
      this.toast.show("Passwords do not match!", 'error');
      return
    }

    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.toast.show("Invalid or missing reset token. Please request a new link.", "error");
      return;
    }

    this.isLoading = true;

    this.authService.resetPassword(token, this.resetPasswordData.password).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.toast.show("Password has been reset.", 'success')
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.isLoading = false;
        const errorMessage = err.error?.error || "Password reset failed";
        this.toast.show(errorMessage, 'error')
      }
    });
  }
}

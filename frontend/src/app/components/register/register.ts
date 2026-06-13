import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidEye, faSolidEyeSlash } from '@ng-icons/font-awesome/solid';


@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule, CommonModule, NgIcon],
  providers: [provideIcons({ faSolidEye, faSolidEyeSlash })],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  // This object will bind directly to our HTML inputs
  registerData = {
    fullname: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  // Visibility Toggles
  showPassword = false;
  showConfirmPassword = false;

  // Real-time password check criteria matching your backend schema
  get isLengthValid(): boolean { return this.registerData.password.length >= 8; }
  get hasUppercase(): boolean { return /[A-Z]/.test(this.registerData.password); }
  get hasSpecialChar(): boolean { return /[!@#$%^&*(),.?":{}|<>]/.test(this.registerData.password); }

  onSubmit() {
    // Client-side rule validation guard
    if (!this.isLengthValid || !this.hasUppercase || !this.hasSpecialChar) {
      this.toast.show("Password does not meet the secure criteria.", "error");
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.toast.show("Passwords do not match!", "error");
      return;
    }

    this.authService.register(this.registerData).subscribe({
      next: (response: any) => {
        this.toast.show("Verification email sent! Please check your inbox.", "success");
        this.router.navigate(['/login']); 
      },
      error: (err: any) => {
        const errorMsg = err.error?.error || 'Something went wrong during registration.';
        this.toast.show(errorMsg, "error"); 
      }
    });
  }
}

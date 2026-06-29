import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidEye, faSolidEyeSlash } from '@ng-icons/font-awesome/solid';


@Component({
  selector: 'app-setup-account',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgIcon],
  providers: [provideIcons({ faSolidEye, faSolidEyeSlash})],
  templateUrl: './setup-account.html',
})

export class SetupAccountComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService); 

  // Structural Tracking Signals
  token = signal<string>('');
  newPassword = signal<string>('');
  confirmPassword = signal<string>('');

  // 🚀 Signals to toggle input types dynamically
  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);
  
  isSubmitting = signal<boolean>(false);
  isSuccess = signal<boolean>(false);
  errorMessage = signal<string>('');

  ngOnInit() {
    // Automatically extract '?token=xyz' query parameter from email click anchor
    const extractedToken = this.route.snapshot.queryParamMap.get('token');
    if (extractedToken) {
      this.token.set(extractedToken);
    } else {
      this.errorMessage.set("No valid credential verification pointer discovered in URL.");
    }
  }

  onSubmitPasswordSetup() {
    if (this.newPassword() !== this.confirmPassword()) {
      this.errorMessage.set("Form parameters mismatch. Confirmation must match password entry.");
      return;
    }

    // 🚀 Defense Layer 1: Strict matching with your backend Mongoose criteria!
    const passwordValue = this.newPassword();
    const isLongEnough = passwordValue.length >= 8; // Allowing exactly 8 or more characters safely
    const hasUppercase = /[A-Z]/.test(passwordValue);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue);

    if (!isLongEnough || !hasUppercase || !hasSpecialChar) {
      this.errorMessage.set("Password must be at least 8 characters long, contain 1 uppercase letter, and 1 special character.");
      return;
    }

    this.errorMessage.set('');
    this.isSubmitting.set(true);

    // Fires the payload directly to your public auth handler pipeline
    this.authService.setupAccount(this.token(), this.newPassword()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.isSuccess.set(true);
      },
      error: (err) => {
        console.error("Account activation processing fail:", err);
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.error || "Account setup rejected. The validation link may be expired.");
      }
    });
  }
}

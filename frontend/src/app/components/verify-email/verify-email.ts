import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email.html'
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  // Status tracking signals
  isLoading = signal<boolean>(true);
  isSuccess = signal<boolean>(false);
  errorMessage = signal<string>('');

  ngOnInit() {
    // Grab the '?token=' query parameter from the URL
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      this.executeVerification(token);
    } else {
      this.isLoading.set(false);
      this.errorMessage.set("No verification token found in the URL. Please check your email link.");
    }
  }

  executeVerification(token: string) {
    this.authService.verifyEmail(token).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.isSuccess.set(true);
      },
      error: (err) => {
        console.error("Verification failed:", err);
        this.isLoading.set(false);
        // Display backend error message (e.g., "Invalid or expired token")
        this.errorMessage.set(err.error?.error || "Verification failed. The link may be expired.");
      }
    });
  }
}
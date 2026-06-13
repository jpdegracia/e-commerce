import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  template: `
    <div class="flex min-h-[60vh] flex-col items-center justify-center text-center p-6">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mb-4"></div>
      <h2 class="text-2xl font-bold text-slate-800">Verifying Your Account</h2>
      <p class="text-gray-600 mt-2">Please wait while we finalize your registration with Haven's Store...</p>
    </div>
  `
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private router = inject(Router);

  ngOnInit() {
    // Read the token parameter from the URL bar string
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.toast.show("Invalid or missing verification link.", "error");
      this.router.navigate(['/register']);
      return;
    }

    // Pass the token to your backend via a background POST request
    this.http.post('http://localhost:4000/auth/verify-email', { token }).subscribe({
      next: (res: any) => {
        this.toast.show("Account activated successfully! Welcome to Haven's Store.", "success");
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        const errorMsg = err.error?.message || "Verification failed.";
        this.toast.show(errorMsg, "error");
        this.router.navigate(['/register']);
      }
    });
  }
}
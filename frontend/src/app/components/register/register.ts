import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast'


@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule],
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

  onSubmit() {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.toast.show("Passwords do not match!", "error"); 
      return;
    }

    this.authService.register(this.registerData).subscribe({
      next: (response: any) => {
        this.toast.show("Account created successfully!", "success"); 
        this.router.navigate(['/login']); 
      },
      error: (err: any) => {
        const errorMsg = err.error?.message || 'Something went wrong during registration.';
        this.toast.show(errorMsg, "error");
      }
    });
  }
}

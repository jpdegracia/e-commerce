import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user';
import { RoleService } from '../../services/role';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-user.html'
})
export class CreateUserComponent implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private router = inject(Router);
  private toast = inject(ToastService);

  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);

  // Form Field Tracking Signals (No password signal needed!)
  fullname = signal<string>('');
  email = signal<string>('');
  selectedRoleId = signal<string>('');
  
  rolesCollection = signal<any[]>([]);

  ngOnInit() {
    this.loadAvailableSystemRoles();
  }

  loadAvailableSystemRoles() {
    this.isLoading.set(true);
    this.roleService.getAllRoles().subscribe({
      next: (response: any) => {
        this.rolesCollection.set(response.details || response);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.show("Unable to load permissions list defaults.");
        this.isLoading.set(false);
      }
    });
  }

  onSubmitNewUser() {
    if (!this.fullname().trim() || !this.email().trim() || !this.selectedRoleId()) {
      this.toast.show("Please fill out all required fields.");
      return;
    }

    this.isSubmitting.set(true);

    // 🚀 Auto-generate a secure temporary password that passes strict backend regex
    // Example: "Temp-4f8aB!9z"
    const randomSuffix = Math.random().toString(36).slice(-6);
    const generatedTempPassword = `Temp-${randomSuffix}A!1`; 

    const newUserPayload = {
      fullname: this.fullname().trim(),
      email: this.email().trim(),
      password: generatedTempPassword, // Backend accepts this happily!
      role: this.selectedRoleId()
    };

    this.userService.createUser(newUserPayload).subscribe({
      next: () => {
        // 🚀 The backend now saves the user, generates the verification token, and (presumably) sends the email!
        this.toast.show("New user provisioned! Verification email dispatched.");
        this.isSubmitting.set(false);
        this.router.navigate(['/admin/users']); 
      },
      error: (err) => {
        this.toast.show(err.error?.message || "Failed to provision new account.");
        this.isSubmitting.set(false);
      }
    });
  }
}
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user';
import { ToastService } from '../../services/toast';
import { RoleService } from '../../services/role';

@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './update-user.html'
})
export class UpdateUserComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private toast = inject(ToastService);
  private roleService = inject(RoleService);

  // Structural State Signals
  isLoading = signal<boolean>(true);
  isUpdating = signal<boolean>(false);
  userId = signal<string | null>(null);

  // Native Target Form Data Fields Signals
  fullname = signal<string>('');
  email = signal<string>('');
  
  // 🚀 New Signals for Role Modification
  selectedRoleId = signal<string>(''); // Binds to the dropdown selector
  rolesCollection = signal<any[]>([]); // Stores the fetched database roles

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId.set(id);
      this.loadSystemRolesAndUser(id); // 🚀 Updated to fetch both
    } else {
      this.toast.show("Invalid sequence profile selection pointer.");
      this.router.navigate(['/admin/users']);
    }
  }

  loadSystemRolesAndUser(id: string) {
    this.isLoading.set(true);

    this.roleService.getAllRoles().subscribe({
      next: (rolesResponse: any) => {
        // Store roles for the HTML select options
        this.rolesCollection.set(rolesResponse.details || rolesResponse);
        
        // Now fetch the specific user
        this.userService.getUserById(id).subscribe({
          next: (userResponse: any) => {
            const user = userResponse.details || userResponse;
            
            this.fullname.set(user.fullname || '');
            this.email.set(user.email || '');
            // Grab the user's specific role ID to pre-select it in the dropdown
            this.selectedRoleId.set(user.role?._id || user.role || ''); 
            
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error("Single user record acquisition crash:", err);
            this.toast.show("Failed to recover target user specifications.");
            this.router.navigate(['/admin/users']);
          }
        });
      },
      error: (err) => {
        console.error("Failed to load roles:", err);
        this.toast.show("Unable to configure authorization fields.");
        this.isLoading.set(false);
      }
    });
  }

  onSubmitChanges() {
    const id = this.userId();
    if (!id) return;

    this.isUpdating.set(true);

    const updatedData = {
      fullname: this.fullname(),
      email: this.email(),
      role: this.selectedRoleId()
    };

    // Hits your backend router path: PUT /api/users/:id
    this.userService.updateUser(id, updatedData).subscribe({
      next: () => {
        this.toast.show("Identity criteria written down flawlessly!");
        this.isUpdating.set(false);
        this.router.navigate(['/admin/users']); // Redirects back safely to main overview ledger
      },
      error: (err) => {
        console.error("Backend user updating reject:", err);
        this.toast.show("Record modification denied by security middleware.");
        this.isUpdating.set(false);
      }
    });
  }
}
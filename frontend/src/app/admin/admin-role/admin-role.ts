import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RoleService } from '../../services/role';
import { ToastService } from '../../services/toast';
import { IRole } from '../../interface/role'; // Adjust path as needed
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidPlus } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-admin-role',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon],
  providers:[provideIcons({ faSolidPlus })],
  templateUrl: './admin-role.html'
})
export class AdminRoleComponent implements OnInit {
  private roleService = inject(RoleService);
  private toast = inject(ToastService);

  // Structural State Signals
  roles = signal<IRole[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.fetchSystemRoles();
  }

  fetchSystemRoles() {
    this.isLoading.set(true);
    this.roleService.getAllRoles().subscribe({
      next: (response: any) => {
        // Unwraps safely whether the backend sends a raw array or { details: [...] }
        const data = response.details || response;
        this.roles.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Role list fetch crash:", err);
        this.toast.show("Failed to load authorization roles.");
        this.isLoading.set(false);
      }
    });
  }

  deleteRoleTrigger(id: string | undefined) {
    if (!id) return;
    
    // Safety prompt before wiping a core authorization profile
    if (confirm("Are you certain you wish to delete this clearance role? Users assigned to this role may lose access capabilities.")) {
      // Assuming your RoleService has a deleteRole(id) method
      this.roleService.deleteRole(id).subscribe({
        next: () => {
          this.toast.show("Clearance role securely wiped from the ledger.");
          this.fetchSystemRoles(); // Refresh the table automatically
        },
        error: (err) => {
          console.error("Role deletion rejected:", err);
          this.toast.show("Unable to delete role. It may be locked or currently in use.");
        }
      });
    }
  }
}
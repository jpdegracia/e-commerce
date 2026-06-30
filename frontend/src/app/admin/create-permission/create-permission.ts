import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PermissionService } from '../../services/permission';
import { ToastService } from '../../services/toast';
import { IPermission } from '../../interface/permission';

@Component({
  selector: 'app-create-permission',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-permission.html'
})
export class CreatePermissionComponent implements OnInit {
  private permissionService = inject(PermissionService);
  private router = inject(Router);
  private toast = inject(ToastService);

  // Status tracking
  isSubmitting = signal<boolean>(false);
  isLoadingGroups = signal<boolean>(true);

  // Form Field Signals
  permissionName = signal<string>('');
  description = signal<string>('');
  
  // Group selection signals
  existingGroups = signal<string[]>([]);
  selectedGroup = signal<string>(''); // Holds the dropdown value
  customGroupName = signal<string>(''); // Holds the value if they want to create a new one

  ngOnInit() {
    this.fetchExistingGroups();
  }

  fetchExistingGroups() {
    this.permissionService.getAllPermissions().subscribe({
      next: (response: any) => {
        const data: IPermission[] = response.details || response;
        const uniqueGroups = new Set<string>();

        data.forEach(perm => {
          // Use explicit group, or generate the implicit one from our smart logic
          let groupName = perm.group;
          if (!groupName && perm.permissionName) {
            const prefix = perm.permissionName.split('_')[0];
            groupName = prefix.charAt(0).toUpperCase() + prefix.slice(1) + ' Management';
          }
          if (groupName) {
            uniqueGroups.add(groupName);
          }
        });

        // Convert the Set to an array and sort it alphabetically
        this.existingGroups.set(Array.from(uniqueGroups).sort());
        this.isLoadingGroups.set(false);
      },
      error: (err) => {
        console.error("Failed to fetch groups:", err);
        // We don't need to block the UI, they can just use the custom input if it fails
        this.isLoadingGroups.set(false); 
      }
    });
  }

  onSubmitNewPermission() {
    if (!this.permissionName().trim() || !this.description().trim()) {
      this.toast.show("Please provide a valid rule identity and description.");
      return;
    }

    // Determine final group string based on dropdown vs custom input
    let finalGroup = this.selectedGroup();
    if (finalGroup === 'CUSTOM') {
      if (!this.customGroupName().trim()) {
        this.toast.show("Please provide a name for your custom group.");
        return;
      }
      finalGroup = this.customGroupName().trim();
    }

    this.isSubmitting.set(true);

    const formattedName = this.permissionName().trim().toLowerCase().replace(/\s+/g, '_');

    const newPermissionPayload = {
      permissionName: formattedName,
      description: this.description().trim(),
      group: finalGroup || undefined // If blank, backend/smart grouper handles it
    };

    this.permissionService.createPermission(newPermissionPayload).subscribe({
      next: () => {
        this.toast.show("New system access rule established successfully!");
        this.isSubmitting.set(false);
        this.router.navigate(['/admin/permissions']); 
      },
      error: (err) => {
        console.error("Permission creation failure:", err);
        this.toast.show(err.error?.message || "Failed to generate new access rule.");
        this.isSubmitting.set(false);
      }
    });
  }
}
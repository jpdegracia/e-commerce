import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PermissionService } from '../../services/permission';
import { ToastService } from '../../services/toast';
import { IPermission } from '../../interface/permission';

@Component({
  selector: 'app-update-permission',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './update-permission.html'
})
export class UpdatePermissionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private permissionService = inject(PermissionService);
  private toast = inject(ToastService);

  // Status tracking
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);

  // Form Field Signals
  permissionId = signal<string>('');
  permissionName = signal<string>('');
  description = signal<string>('');
  
  // Group selection signals
  existingGroups = signal<string[]>([]);
  selectedGroup = signal<string>(''); 
  customGroupName = signal<string>(''); 

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.permissionId.set(id);
      // Chain the fetches: Get the dropdown options first, then populate the form
      this.fetchExistingGroups(id);
    } else {
      this.toast.show("Invalid permission selection.");
      this.router.navigate(['/admin/permissions']);
    }
  }

  fetchExistingGroups(targetId: string) {
    this.permissionService.getAllPermissions().subscribe({
      next: (response: any) => {
        const data: IPermission[] = response.details || response;
        const uniqueGroups = new Set<string>();

        data.forEach(perm => {
          let groupName = perm.group;
          if (!groupName && perm.permissionName) {
            const prefix = perm.permissionName.split('_')[0];
            groupName = prefix.charAt(0).toUpperCase() + prefix.slice(1) + ' Management';
          }
          if (groupName) {
            uniqueGroups.add(groupName);
          }
        });

        this.existingGroups.set(Array.from(uniqueGroups).sort());
        
        // 🚀 Now that dropdown options are loaded, fetch the specific item to edit
        this.fetchPermissionDetails(targetId);
      },
      error: (err) => {
        console.error("Failed to fetch groups:", err);
        // Fallback to fetch details even if groups fail
        this.fetchPermissionDetails(targetId);
      }
    });
  }

  fetchPermissionDetails(id: string) {
    this.permissionService.getPermissionByID(id).subscribe({
      next: (response: any) => {
        const permData: IPermission = response.details || response;
        
        this.permissionName.set(permData.permissionName);
        this.description.set(permData.description);
        
        // If it has an explicit group, select it. Otherwise, leave as empty (Auto-generate)
        if (permData.group) {
          this.selectedGroup.set(permData.group);
        } else {
          this.selectedGroup.set('');
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Permission fetch failure:", err);
        this.toast.show("Failed to retrieve existing access rule data.");
        this.router.navigate(['/admin/permissions']);
      }
    });
  }

  onSubmitUpdatePermission() {
    if (!this.permissionName().trim() || !this.description().trim()) {
      this.toast.show("Please provide a valid rule identity and description.");
      return;
    }

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

    const updatePayload = {
      permissionName: formattedName,
      description: this.description().trim(),
      group: finalGroup || undefined 
    };

    this.permissionService.updatePermission(this.permissionId(), updatePayload).subscribe({
      next: () => {
        this.toast.show("System access rule modified successfully!");
        this.isSubmitting.set(false);
        this.router.navigate(['/admin/permissions']); 
      },
      error: (err) => {
        console.error("Permission update failure:", err);
        this.toast.show(err.error?.message || "Failed to modify access rule.");
        this.isSubmitting.set(false);
      }
    });
  }
}
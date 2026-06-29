import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../services/role';
import { PermissionService } from '../../services/permission'; 
import { ToastService } from '../../services/toast';
import { IPermission, PermissionGroup } from '../../interface/permission';

@Component({
  selector: 'app-create-role',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-role.html'
})
export class CreateRoleComponent implements OnInit {
  private roleService = inject(RoleService);
  private permissionService = inject(PermissionService); 
  private router = inject(Router);
  private toast = inject(ToastService);

  // Status tracking
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);

  // Form Field Signals
  rolename = signal<string>('');
  description = signal<string>('');
  
  // Array to hold the grouped accordion data
  permissionGroups = signal<PermissionGroup[]>([]);
  
  // Array to track which permission IDs the admin has checked off
  selectedPermissions = signal<string[]>([]); 

  ngOnInit() {
    this.fetchMasterPermissionsList();
  }

  fetchMasterPermissionsList() {
    this.isLoading.set(true);
    
    this.permissionService.getAllPermissions().subscribe({
      next: (response: any) => {
        const data: IPermission[] = response.details || response;
        const groupsMap = new Map<string, IPermission[]>();
        
        data.forEach((perm: IPermission) => {
          // Smart Auto-Grouping: use provided group, or generate from prefix
          let groupName = perm.group; 
          
          if (!groupName) {
            const prefix = perm.permissionName.split('_')[0]; 
            groupName = prefix.charAt(0).toUpperCase() + prefix.slice(1) + ' Management';
          }

          if (!groupsMap.has(groupName)) {
            groupsMap.set(groupName, []);
          }
          groupsMap.get(groupName)!.push(perm);
        });

        // Convert Map to array and default the first accordion to open
        const formattedGroups: PermissionGroup[] = Array.from(groupsMap, ([name, permissions], index) => ({ 
          groupName: name, 
          permissions,
          isOpen: index === 0 
        }));

        this.permissionGroups.set(formattedGroups);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Failed to load permission matrix:", err);
        this.toast.show("Unable to load the security permission list.");
        this.isLoading.set(false);
      }
    });
  }

  toggleAccordion(targetGroupName: string) {
    this.permissionGroups.update(groups => 
      groups.map(group => 
        group.groupName === targetGroupName 
          ? { ...group, isOpen: !group.isOpen } 
          : group 
      )
    );
  }

  togglePermissionSelection(permissionId: string | undefined) {
    if (!permissionId) return;

    const currentSelections = this.selectedPermissions();
    if (currentSelections.includes(permissionId)) {
      this.selectedPermissions.set(currentSelections.filter(id => id !== permissionId));
    } else {
      this.selectedPermissions.set([...currentSelections, permissionId]);
    }
  }

  onSubmitNewRole() {
    if (!this.rolename().trim() || !this.description().trim()) {
      this.toast.show("Please provide a valid name and description for this role.");
      return;
    }

    this.isSubmitting.set(true);

    const newRolePayload = {
      rolename: this.rolename().trim(),
      description: this.description().trim(),
      permissions: this.selectedPermissions() // Array of string IDs
    };

    this.roleService.createRole(newRolePayload).subscribe({
      next: () => {
        this.toast.show("New authorization clearance role provisioned successfully!");
        this.isSubmitting.set(false);
        this.router.navigate(['/admin/roles']); 
      },
      error: (err) => {
        console.error("Role creation failure:", err);
        this.toast.show(err.error?.message || "Failed to generate new clearance role.");
        this.isSubmitting.set(false);
      }
    });
  }
}
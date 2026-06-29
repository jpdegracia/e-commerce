import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../services/role';
import { PermissionService } from '../../services/permission'; 
import { ToastService } from '../../services/toast';
import { IPermission, PermissionGroup } from '../../interface/permission';
import { IRole } from '../../interface/role';

@Component({
  selector: 'app-update-role',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './update-role.html'
})
export class UpdateRoleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roleService = inject(RoleService);
  private permissionService = inject(PermissionService); 
  private toast = inject(ToastService);

  // Status tracking
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);

  // Form Field Signals
  roleId = signal<string>('');
  rolename = signal<string>('');
  description = signal<string>('');
  
  // Arrays for permissions
  permissionGroups = signal<PermissionGroup[]>([]);
  selectedPermissions = signal<string[]>([]); 

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.roleId.set(id);
      // Chain the fetches: First get the master list, then get the specific role details
      this.fetchMasterPermissionsList(id);
    } else {
      this.toast.show("Invalid role selection. Unable to modify.");
      this.router.navigate(['/admin/roles']);
    }
  }

  fetchMasterPermissionsList(roleId: string) {
    this.isLoading.set(true);
    
    this.permissionService.getAllPermissions().subscribe({
      next: (response: any) => {
        const data: IPermission[] = response.details || response;
        const groupsMap = new Map<string, IPermission[]>();
        
        data.forEach((perm: IPermission) => {
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

        const formattedGroups: PermissionGroup[] = Array.from(groupsMap, ([name, permissions], index) => ({ 
          groupName: name, 
          permissions,
          isOpen: index === 0 
        }));

        this.permissionGroups.set(formattedGroups);
        
        // 🚀 Now that the grid is ready, fetch the specific role to check the boxes!
        this.fetchRoleDetails(roleId);
      },
      error: (err) => {
        console.error("Failed to load permission matrix:", err);
        this.toast.show("Unable to load the security permission list.");
        this.isLoading.set(false);
      }
    });
  }

  fetchRoleDetails(id: string) {
    this.roleService.getRoleByID(id).subscribe({
      next: (response: any) => {
        const roleData: IRole = response.details || response;
        
        // Populate text fields
        this.rolename.set(roleData.rolename);
        this.description.set(roleData.description);

        // 🚀 Pre-fill the checkboxes by mapping the assigned permissions to an array of just their IDs
        if (roleData.permissions && roleData.permissions.length > 0) {
          const assignedIds = roleData.permissions.map((p: any) => p._id);
          this.selectedPermissions.set(assignedIds);
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Role fetch failure:", err);
        this.toast.show("Failed to retrieve existing role data.");
        this.router.navigate(['/admin/roles']);
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

  onSubmitUpdateRole() {
    if (!this.rolename().trim() || !this.description().trim()) {
      this.toast.show("Please provide a valid name and description for this role.");
      return;
    }

    this.isSubmitting.set(true);

    const updatePayload = {
      rolename: this.rolename().trim(),
      description: this.description().trim(),
      permissions: this.selectedPermissions() // Updated array of string IDs
    };

    this.roleService.updateRole(this.roleId(), updatePayload).subscribe({
      next: () => {
        this.toast.show("Authorization clearance role updated successfully!");
        this.isSubmitting.set(false);
        this.router.navigate(['/admin/roles']); 
      },
      error: (err) => {
        console.error("Role update failure:", err);
        this.toast.show(err.error?.message || "Failed to update clearance role.");
        this.isSubmitting.set(false);
      }
    });
  }
}
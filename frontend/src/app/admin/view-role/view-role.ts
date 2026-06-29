import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoleService } from '../../services/role';
import { ToastService } from '../../services/toast';
import { IRole } from '../../interface/role';
import { IPermission, PermissionGroup } from '../../interface/permission';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidPenToSquare } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-view-role',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon],
  providers:[provideIcons({ faSolidPenToSquare })],
  templateUrl: './view-role.html'
})
export class ViewRoleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roleService = inject(RoleService);
  private toast = inject(ToastService);

  // Structural State Signals
  role = signal<IRole | null>(null);
  permissionGroups = signal<PermissionGroup[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchRoleProfile(id);
    } else {
      this.toast.show("Invalid role selection target.");
      this.router.navigate(['/admin/roles']);
    }
  }

  fetchRoleProfile(id: string) {
    this.isLoading.set(true);
    
    this.roleService.getRoleByID(id).subscribe({
      next: (response: any) => {
        const roleData: IRole = response.details || response;
        this.role.set(roleData);

        // 🚀 Reuse our smart auto-grouping logic just for the assigned permissions!
        if (roleData.permissions && roleData.permissions.length > 0) {
          const groupsMap = new Map<string, IPermission[]>();
          
          roleData.permissions.forEach((perm: IPermission) => {
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

          // Convert to array and set ALL accordions to open by default for the read-only view
          const formattedGroups: PermissionGroup[] = Array.from(groupsMap, ([name, permissions]) => ({ 
            groupName: name, 
            permissions,
            isOpen: true 
          }));

          this.permissionGroups.set(formattedGroups);
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Role profile display crash:", err);
        this.toast.show("Failed to recover role details.");
        this.router.navigate(['/admin/roles']);
      }
    });
  }

  // Allow users to toggle the groupings in the view just like the edit page
  toggleAccordion(targetGroupName: string) {
    this.permissionGroups.update(groups => 
      groups.map(group => 
        group.groupName === targetGroupName 
          ? { ...group, isOpen: !group.isOpen } 
          : group 
      )
    );
  }
}
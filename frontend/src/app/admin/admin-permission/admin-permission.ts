import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 🚀 Added for the search input binding
import { PermissionService } from '../../services/permission';
import { ToastService } from '../../services/toast';
import { IPermission } from '../../interface/permission';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
// 🚀 Added faSolidMagnifyingGlass
import { faSolidPlus, faSolidUserPen, faSolidTrashCan, faSolidMagnifyingGlass, faSolidArrowsToEye } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-admin-permission',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent, FormsModule], // 🚀 Added FormsModule
  providers: [provideIcons({ faSolidPlus, faSolidUserPen, faSolidTrashCan, faSolidMagnifyingGlass, faSolidArrowsToEye })],
  templateUrl: './admin-permission.html'
})
export class AdminPermissionComponent implements OnInit {
  private permissionService = inject(PermissionService);
  private toast = inject(ToastService);

  // Core Data Signal
  permissions = signal<IPermission[]>([]);
  isLoading = signal<boolean>(true);

  // 🚀 Pagination & Search Signals
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  itemsPerPage = 15;

  // 🚀 Computed Signal 1: Filters the master list based on the search query
  filteredPermissions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allPerms = this.permissions();
    
    if (!query) return allPerms;

    return allPerms.filter(perm => 
      perm.permissionName.toLowerCase().includes(query) ||
      (perm.group && perm.group.toLowerCase().includes(query)) ||
      (perm.description && perm.description.toLowerCase().includes(query))
    );
  });

  // 🚀 Computed Signal 2: Calculates total pages dynamically
  totalPages = computed(() => {
    const total = this.filteredPermissions().length;
    return Math.ceil(total / this.itemsPerPage) || 1; // Always show at least 1 page
  });

  // 🚀 Computed Signal 3: Slices the filtered array for the current page
  paginatedPermissions = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredPermissions().slice(startIndex, endIndex);
  });

  ngOnInit() {
    this.fetchSystemPermissions();
  }

  fetchSystemPermissions() {
    this.isLoading.set(true);
    this.permissionService.getAllPermissions().subscribe({
      next: (response: any) => {
        const data: IPermission[] = response.details || response;

        // Smart Auto-Grouping logic
        const processedData = data.map(perm => {
          if (!perm.group && perm.permissionName) {
            const prefix = perm.permissionName.split('_')[0];
            perm.group = prefix.charAt(0).toUpperCase() + prefix.slice(1) + ' Management';
          }
          return perm;
        });

        this.permissions.set(processedData);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Permission list fetch crash:", err);
        this.toast.show("Failed to load system access parameters.");
        this.isLoading.set(false);
      }
    });
  }

  // 🚀 Method to handle user typing (Resets back to page 1)
  onSearchUpdate(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  // 🚀 Pagination Controls
  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  deletePermissionTrigger(id: string | undefined) {
    if (!id) return;
    if (confirm("CRITICAL WARNING: Are you sure you want to delete this permission? Any roles relying on this parameter will lose this access rule permanently.")) {
      this.permissionService.deletePermission(id).subscribe({
        next: () => {
          this.toast.show("Access permission securely wiped from the database.");
          this.fetchSystemPermissions();
        },
        error: (err) => {
          console.error("Permission deletion rejected:", err);
          this.toast.show("Unable to delete permission. It may be locked by the system.");
        }
      });
    }
  }
}
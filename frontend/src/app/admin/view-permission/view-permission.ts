import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PermissionService } from '../../services/permission';
import { ToastService } from '../../services/toast';
import { IPermission } from '../../interface/permission';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidShieldHalved } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-view-permission',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon],
  providers:[provideIcons({ faSolidShieldHalved })],
  templateUrl: './view-permission.html'
})
export class ViewPermissionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private permissionService = inject(PermissionService);
  private toast = inject(ToastService);

  // Structural State Signals
  permission = signal<IPermission | null>(null);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchPermissionProfile(id);
    } else {
      this.toast.show("Invalid permission selection target.");
      this.router.navigate(['/admin/permissions']);
    }
  }

  fetchPermissionProfile(id: string) {
    this.isLoading.set(true);
    
    this.permissionService.getPermissionByID(id).subscribe({
      next: (response: any) => {
        // Unwrap safely based on standard API response envelopes
        const permData: IPermission = response.details || response;
        this.permission.set(permData);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Permission profile display crash:", err);
        this.toast.show("Failed to recover access rule details.");
        this.router.navigate(['/admin/permissions']);
      }
    });
  }
}
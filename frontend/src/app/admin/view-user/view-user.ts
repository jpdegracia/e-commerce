import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user';
import { ToastService } from '../../services/toast';
import { IUser } from '../../interface/user';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidUserPen } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-view-user',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon],
  providers: [provideIcons({ faSolidUserPen })],
  templateUrl: './view-user.html',
  styleUrl: './view-user.css'
})
export class ViewUserComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private toast = inject(ToastService);

  // Structural State Signals fully bound to your core user model
  user = signal<IUser | null>(null);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    // Extracts the user parameter id cleanly from your active route state context
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchUserCardProfile(id);
    } else {
      this.toast.show("Invalid user selection target.");
      this.router.navigate(['/admin/users']);
    }
  }

  fetchUserCardProfile(id: string) {
    this.isLoading.set(true);
    
    this.userService.getUserById(id).subscribe({
      next: (response: any) => {
        // Handles data parsing wrapping safely whether it is a raw payload or data envelope wrapper
        const userData = response.details || response;
        this.user.set(userData);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Single account profile display parsing fallback crash:", err);
        this.toast.show("Failed to recover descriptive directory logs.");
        this.router.navigate(['/admin/users']);
      }
    });
  }
}
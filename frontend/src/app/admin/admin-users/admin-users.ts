import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user';
import { ToastService } from '../../services/toast';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { RouterLink } from '@angular/router';
import { 
  faSolidMagnifyingGlass, 
  faSolidPlus, 
  faSolidTrashCan, 
  faSolidUser, 
  faSolidUserCheck, 
  faSolidUserPen, 
  faSolidUserSlash,
  
} from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, RouterLink],
  providers: [provideIcons({ faSolidMagnifyingGlass, faSolidTrashCan, faSolidUserCheck, faSolidUserSlash, faSolidUserPen, faSolidPlus, faSolidUser })],
  templateUrl: './admin-users.html'
})
export class AdminUsersComponent implements OnInit {
  private userService = inject(UserService);
  private toast = inject(ToastService);

  users = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  searchQuery = signal<string>('');

  // ⚡ Computed search: Filter exclusively by full name or email address
  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allUsers = this.users();

    if (!query) return allUsers;

    return allUsers.filter(user => 
      user.fullname?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  // Modal Control Signals
  isDeleteModalOpen = signal<boolean>(false);
  userToDeleteId = signal<string | null>(null);
  isDeleting = signal<boolean>(false);

  ngOnInit() {
    this.loadAllUsers();
  }

  loadAllUsers() {
    this.isLoading.set(true);
    this.userService.getUsers().subscribe({
      next: (response: any) => {
        this.users.set(response.details || response);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("User list fetch error:", err);
        this.errorMessage.set("Could not load administrative user registry.");
        this.isLoading.set(false);
      }
    });
  }

  toggleUserActivation(user: any) {
    const nextStatus = !user.isActive;
    
    this.userService.updateUser(user._id, { isActive: nextStatus }).subscribe({
      next: () => {
        this.users.update(current => current.map(u => u._id === user._id ? { ...u, isActive: nextStatus } : u));
        this.toast.show(`Account status updated successfully!`);
      },
      error: (err) => {
        console.error("Status modification failure", err);
        this.toast.show("Unable to change account status parameters.");
      }
    });
  }

  openDeleteModal(id: string) {
    this.userToDeleteId.set(id);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.userToDeleteId.set(null);
  }

  confirmDelete() {
    const id = this.userToDeleteId();
    if (!id) return;

    this.isDeleting.set(true);
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.users.update(current => current.filter(u => u._id !== id));
        this.toast.show("Account permanently removed.");
        this.isDeleting.set(false);
        this.closeDeleteModal();
      },
      error: (err) => {
        this.toast.show("Account elimination request failed.");
        this.isDeleting.set(false);
      }
    });
  }
}
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category';
import { ToastService } from '../../services/toast';
import { ICategory } from '../../interface/category';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  faSolidMagnifyingGlass, 
  faSolidPlus, 
  faSolidTrashCan, 
  faSolidPenToSquare, 
  faSolidArrowsToEye
} from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-admin-category',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgIconComponent],
  providers: [provideIcons({ faSolidMagnifyingGlass, faSolidPlus, faSolidTrashCan, faSolidPenToSquare, faSolidArrowsToEye })],
  templateUrl: './admin-categories.html'
})
export class AdminCategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);

  // Core State Signals
  categories = signal<ICategory[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  // Pagination & Search Signals
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  itemsPerPage = 15;

  // 🚀 Computed: Filter categories by name or description
  filteredCategories = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allCategories = this.categories();

    if (!query) return allCategories;

    return allCategories.filter(cat => 
      // Assuming your interface has categoryname and description. Adjust if your DB uses 'name' instead!
      cat.categoryname?.toLowerCase().includes(query) ||
      cat.description?.toLowerCase().includes(query)
    );
  });

  // 🚀 Computed: Total Pages
  totalPages = computed(() => {
    const total = this.filteredCategories().length;
    return Math.ceil(total / this.itemsPerPage) || 1;
  });

  // 🚀 Computed: Paginated Slice
  paginatedCategories = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredCategories().slice(startIndex, endIndex);
  });

  // Modal Control Signals
  isDeleteModalOpen = signal<boolean>(false);
  categoryToDeleteId = signal<string | null>(null);
  isDeleting = signal<boolean>(false);

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.categoryService.getAllCategories().subscribe({
      next: (response: any) => {
        const data = response.details || response;
        this.categories.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Category list fetch crash:", err);
        this.errorMessage.set("Failed to load store categories.");
        this.isLoading.set(false);
      }
    });
  }

  // 🚀 Reset pagination when searching
  onSearchUpdate(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

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

  // Modal Actions
  openDeleteModal(id: string | undefined) {
    if (!id) return;
    this.categoryToDeleteId.set(id);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.categoryToDeleteId.set(null);
  }

  confirmDelete() {
    const id = this.categoryToDeleteId();
    if (!id) return;

    this.isDeleting.set(true);
    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.categories.update(current => current.filter(c => c._id !== id));
        this.toast.show("Category permanently removed.");
        this.isDeleting.set(false);
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error("Category deletion rejected:", err);
        this.toast.show("Unable to delete category. It may contain products.");
        this.isDeleting.set(false);
      }
    });
  }
}
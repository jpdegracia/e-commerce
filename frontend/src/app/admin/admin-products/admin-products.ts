import { ChangeDetectorRef, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe, NgClass } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../services/product';
import { CategoryService } from '../../services/category';
import { ToastService } from '../../services/toast';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidArrowsToEye, faSolidPenToSquare, faSolidPlus, faSolidTrashCan } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, DecimalPipe, ReactiveFormsModule, RouterLink, NgIcon],
  providers: [provideIcons({faSolidPenToSquare, faSolidArrowsToEye, faSolidTrashCan, faSolidPlus})], 
  templateUrl: './admin-products.html'
})
export class AdminProductsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder); 

  // State Management Signals
  products = signal<any[]>([]);
  categories = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  // 🚀 1. Filter Tracking Signals
  searchQuery = signal<string>('');
  selectedCategoryFilter = signal<string>('');
  
  // 🚀 2. Pagination Signals
  currentPage = signal<number>(1);
  itemsPerPage = 15;

  // 🚀 3. Reactive Computed Filter Logic
  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const catFilter = this.selectedCategoryFilter();
    const allProducts = this.products();

    return allProducts.filter(product => {
      const matchesSearch = !query || 
        product.productname?.toLowerCase().includes(query) || 
        product.description?.toLowerCase().includes(query);

      let matchesCategory = !catFilter;
      if (catFilter && product.category) {
        if (Array.isArray(product.category)) {
          matchesCategory = product.category.some((c: any) => (c._id || c) === catFilter);
        } else {
          matchesCategory = (product.category._id || product.category) === catFilter;
        }
      }

      return matchesSearch && matchesCategory;
    });
  });

  // 🚀 4. Computed: Calculates total pages dynamically based on filtered results
  totalPages = computed(() => {
    const total = this.filteredProducts().length;
    return Math.ceil(total / this.itemsPerPage) || 1;
  });

  // 🚀 5. Computed: Slices array for current page
  paginatedProducts = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredProducts().slice(startIndex, endIndex);
  });

  // Delete Modal Signal
  isDeleteModalOpen = signal<boolean>(false);
  productToDeleteId = signal<string | null>(null);
  isDeleting = signal<boolean>(false);

  // The Edit Form
  editForm: FormGroup = this.fb.group({
    productname: ['', [Validators.required, Validators.minLength(3)]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    category: [[], Validators.required] 
  });

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.productService.getAllProducts().subscribe({
      next: (response: any) => {
        const fetchedProducts = response.details || response;
        this.products.set(fetchedProducts);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Failed to load products", err);
        this.errorMessage.set("Could not load products. Please check your connection.");
        this.isLoading.set(false);
      }
    });
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (response: any) => {
        this.categories.set(response.details || response);
      },
      error: (err) => console.error("Filter categories error:", err)
    });
  }

  // ==========================================
  // 🚀 PAGINATION & FILTER HANDLERS
  // ==========================================

  onSearchUpdate(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(1); // Reset to page 1 on new search
  }

  onCategoryFilterUpdate(categoryId: string) {
    this.selectedCategoryFilter.set(categoryId);
    this.currentPage.set(1); // Reset to page 1 on new filter
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

  // ==========================================
  // 🛠️ UI HELPER METHODS
  // ==========================================

  getCategoryNames(categoryData: any): string[] {
    if (!categoryData || categoryData.length === 0) {
      return ['Uncategorized'];
    }

    if (Array.isArray(categoryData)) {
      return categoryData.map((cat: any) => cat.categoryname || 'Unknown');
    }

    if (typeof categoryData === 'object') {
      return [categoryData.categoryname || 'Unknown'];
    }

    return ['Uncategorized'];
  }

  // ==========================================
  // 🗑️ DELETE PRODUCT ACTIONS
  // ==========================================

  openDeleteModal(id: string) {
    this.productToDeleteId.set(id);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.productToDeleteId.set(null);
  }

  confirmDelete() {
    const id = this.productToDeleteId();
    if (!id) return;

    this.isDeleting.set(true);

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.products.update(current => current.filter(p => p._id !== id && p.id !== id));
        this.toast.show("Product deleted successfully! 🗑️");
        this.isDeleting.set(false);
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error("Delete failed", err);
        this.toast.show("Failed to delete product.");
        this.isDeleting.set(false);
      }
    });
  }
}
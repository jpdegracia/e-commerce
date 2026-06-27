import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe, NgClass } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // 🚀 Import Forms
import { ProductService } from '../../services/product';
import { CategoryService } from '../../services/category';
import { ToastService } from '../../services/toast'; // Optional: if you want to show success messages
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
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  // Delete Modal Signal
  isDeleteModalOpen = signal<boolean>(false);
  productToDeleteId = signal<string | null>(null);
  isDeleting = signal<boolean>(false);

  // 🚀 The Edit Form
  editForm: FormGroup = this.fb.group({
    productname: ['', [Validators.required, Validators.minLength(3)]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    // Note: If category is an object ID in your DB, this should hold the ID string
    category: [[], Validators.required] 
  });

  ngOnInit() {
    this.loadProducts();
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

  // ==========================================
  // 🛠️ UI HELPER METHODS
  // ==========================================

  getCategoryNames(categoryData: any): string[] {
    if (!categoryData || categoryData.length === 0) {
      return ['Uncategorized'];
    }

    // If it's an array of objects (Multiple Categories)
    if (Array.isArray(categoryData)) {
      return categoryData.map((cat: any) => cat.categoryname || 'Unknown');
    }

    // If it's a single populated object
    if (typeof categoryData === 'object') {
      return [categoryData.categoryname || 'Unknown'];
    }

    return ['Uncategorized'];
  }



  // ==========================================
  // 🗑️ DELETE PRODUCT ACTIONS
  // ==========================================

  // 1. Triggers when clicking the trash icon in the table
  openDeleteModal(id: string) {
    this.productToDeleteId.set(id);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.productToDeleteId.set(null);
  }

  // 2. Triggers when confirming inside the modal popup
  confirmDelete() {
    const id = this.productToDeleteId();
    if (!id) return;

    this.isDeleting.set(true);

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        // 🚀 Optimistic local update: Filter out the deleted item instantly
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
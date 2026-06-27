import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // 🚀 Import Forms
import { ProductService } from '../../services/product';
import { CategoryService } from '../../services/category';
import { ToastService } from '../../services/toast'; // Optional: if you want to show success messages

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, DecimalPipe, ReactiveFormsModule, RouterLink], // 🚀 Add ReactiveFormsModule
  templateUrl: './admin-products.html'
})
export class AdminProductsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder); // 🚀 Inject FormBuilder

  // State Management Signals
  products = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  // 🚀 Edit Modal Signals
  isEditModalOpen = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  selectedProductId = signal<string | null>(null);

  // 🚀 The Edit Form
  editForm: FormGroup = this.fb.group({
    productname: ['', [Validators.required, Validators.minLength(3)]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    // Note: If category is an object ID in your DB, this should hold the ID string
    category: ['', Validators.required] 
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
  // 🛠️ EDIT PRODUCT LOGIC
  // ==========================================

  editProduct(id: string) {
    // 1. Find the product in our local array
    const productToEdit = this.products().find(p => p._id === id);
    if (!productToEdit) return;

    // 2. Extract category value safely (whether it's an object from populate() or a string)
    const categoryValue = typeof productToEdit.category === 'object' 
                          ? productToEdit.category._id 
                          : productToEdit.category;

    // 3. Pre-fill the form with the product's current data
    this.editForm.patchValue({
      productname: productToEdit.productname,
      price: productToEdit.price,
      stock: productToEdit.stock,
      category: categoryValue
    });

    // 4. Open the modal
    this.selectedProductId.set(id);
    this.isEditModalOpen.set(true);
  }

  closeEditModal() {
    this.isEditModalOpen.set(false);
    this.selectedProductId.set(null);
    this.editForm.reset();
  }

  saveEdit() {
    if (this.editForm.invalid || !this.selectedProductId()) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const updatedData = this.editForm.value;
    const id = this.selectedProductId()!;

    // 🚀 Send the PUT request to your backend
    this.productService.updateProduct(id, updatedData).subscribe({
      next: () => {
        // Refresh the table data
        this.loadProducts(); 
        this.closeEditModal();
        this.isSubmitting.set(false);
        // this.toast.showSuccess("Product updated successfully!");
      },
      error: (err) => {
        console.error("Failed to update product", err);
        this.isSubmitting.set(false);
        // this.toast.showError("Failed to update product.");
      }
    });
  }

  // ==========================================
  // 🛠️ OTHER CRUD ACTIONS (Placeholders)
  // ==========================================

  openAddModal() {
    console.log("Open Add Product Modal");
  }

  deleteProduct(id: string) {
    console.log("Delete product:", id);
  }
}
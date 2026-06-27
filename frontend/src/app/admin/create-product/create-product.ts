import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../services/product';
import { CategoryService } from '../../services/category';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-product.html'
})
export class CreateProductComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);

  isSubmitting = signal<boolean>(false);
  categories = signal<any[]>([]);
  imageUrls = signal<string[]>([]);

  // Blank form!
  createForm: FormGroup = this.fb.group({
    productname: ['', [Validators.required]],
    description: ['', [Validators.required]],
    price: [null, [Validators.required, Validators.min(0)]],
    stock: [null, [Validators.required, Validators.min(0)]],
    category: [[], Validators.required]
  });

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (response: any) => {
        const fetchedCategories = response.details || response;
        this.categories.set(fetchedCategories);
      },
      error: (err) => console.error("Failed to load categories", err)
    });
  }

  // ==========================================
  // 🛠️ UI HELPER METHODS
  // ==========================================

  formatPrice() {
    const currentPrice = this.createForm.get('price')?.value;
    if (currentPrice !== null && currentPrice !== '') {
      this.createForm.patchValue({ price: Number(currentPrice).toFixed(2) });
    }
  }

  getSelectedCategories() {
    const selectedIds = this.createForm.get('category')?.value || [];
    return this.categories().filter(c => selectedIds.includes(c._id));
  }

  onCategorySelect(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedId = selectElement.value;
    if (selectedId) {
      const currentSelected = this.createForm.get('category')?.value || [];
      if (!currentSelected.includes(selectedId)) {
        this.createForm.patchValue({ category: [...currentSelected, selectedId] });
      }
      selectElement.value = '';
    }
  }

  removeCategory(idToRemove: string) {
    const currentSelected = this.createForm.get('category')?.value || [];
    this.createForm.patchValue({
      category: currentSelected.filter((id: string) => id !== idToRemove)
    });
  }

  addImageUrl(urlInput: HTMLInputElement) {
    const url = urlInput.value.trim();
    if (url) {
      this.imageUrls.update(current => [...current, url]);
      urlInput.value = ''; 
    }
  }

  removeImage(index: number) {
    this.imageUrls.update(current => current.filter((_, i) => i !== index));
  }

  // ==========================================
  // 🛠️ SUBMIT TO BACKEND
  // ==========================================

  saveProduct() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const newProductPayload = {
      ...this.createForm.value,
      images: this.imageUrls()
    };

    // 🚀 Ensure you have a 'createProduct' method in your Angular ProductService!
    this.productService.createProduct(newProductPayload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.show("Product created successfully!");
        this.router.navigate(['/admin/products']);
      },
      error: (err) => {
        console.error("Creation failed", err);
        this.isSubmitting.set(false);
        this.toast.show("Failed to create product. Please try again.");
      }
    });
  } 
}
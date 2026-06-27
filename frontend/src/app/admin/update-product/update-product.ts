import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../services/product';
import { CategoryService } from '../../services/category';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-update-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './update-product.html'
})
export class UpdateProductComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);

  productId = signal<string | null>(null);
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  categories = signal<any[]>([]);
  imageUrls = signal<string[]>([]);

  editForm: FormGroup = this.fb.group({
    productname: ['', [Validators.required]],
    description: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    category: [[], Validators.required]
  });

  ngOnInit() {
    this.loadCategories();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productId.set(id);
      this.fetchProductDetails(id);
    } else {
      this.router.navigate(['/admin/products']); // Bail out if no ID
    }
  }

  //ALL ABOUT CATEGORIES
  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (response: any) => {
        const fetchedCategories = response.details || response;
        this.categories.set(fetchedCategories);
      },
      error: (err) => console.error("Failed to load categories", err)
    });
  }

  // 🚀 1. Gets the full category objects for the UI so we can display their names
  getSelectedCategories() {
    const selectedIds = this.editForm.get('category')?.value || [];
    return this.categories().filter(c => selectedIds.includes(c._id));
  }

  // 🚀 2. Fires when the user picks an option from the dropdown
  onCategorySelect(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedId = selectElement.value;
    
    if (selectedId) {
      const currentSelected = this.editForm.get('category')?.value || [];
      
      // Prevent adding duplicates
      if (!currentSelected.includes(selectedId)) {
        this.editForm.patchValue({
          category: [...currentSelected, selectedId] // Add the new ID to the array
        });
      }
      // Reset the dropdown back to the default "+ Add a category" prompt
      selectElement.value = '';
    }
  }

  // 🚀 3. Fires when the user clicks the "X" on a category chip
  removeCategory(idToRemove: string) {
    const currentSelected = this.editForm.get('category')?.value || [];
    this.editForm.patchValue({
      category: currentSelected.filter((id: string) => id !== idToRemove)
    });
  }



  fetchProductDetails(id: string) {
    this.productService.getProductByID(id).subscribe({
      next: (response: any) => {
        const product = response.details || response;
        
        // 1. Safely extract category IDs into an Array
        let categoryArray: string[] = [];
        if (product.category) {
          if (Array.isArray(product.category)) {
            // Using categoryname (or categoryName) if populated, or just the ID
            categoryArray = product.category.map((c: any) => c._id || c);
          } else {
            categoryArray = [product.category._id || product.category];
          }
        }

        // 🚀 2. LOAD EXISTING IMAGES HERE!
        // We take the images from the database and put them in our signal.
        // If the product has no images yet, we default to an empty array [].
        this.imageUrls.set(product.images || []);

        // 3. Pre-fill the form fields
        this.editForm.patchValue({
          productname: product.productname,
          description: product.description,
          price: Number(product.price).toFixed(2), 
          stock: product.stock,
          category: categoryArray
        });
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Failed to load product", err);
        this.router.navigate(['/admin/products']);
      }
    });
  }

  // Image Selection & Preview Logic
  addImageUrl(urlInput: HTMLInputElement) {
    const url = urlInput.value.trim();
    if (url) {
      // Add the new string to the array
      this.imageUrls.update(current => [...current, url]);
      // Clear the input box for the next link
      urlInput.value = ''; 
    }
  }

  // Remove an existing database image
  removeImage(index: number) {
    this.imageUrls.update(current => current.filter((_, i) => i !== index));
  }




  // formatting proper price e.g ₱400.00
  formatPrice() {
    const currentPrice = this.editForm.get('price')?.value;
    if (currentPrice !== null && currentPrice !== '') {
      this.editForm.patchValue({ 
        price: Number(currentPrice).toFixed(2) 
      });
    }
  }


  // saving product
  saveProduct() {
    if (this.editForm.invalid) return;

    this.isSubmitting.set(true);
    const id = this.productId()!;

    // 🚀 THE FIX: Merge the form values with the imageUrls signal!
    const updatePayload = {
      ...this.editForm.value,
      images: this.imageUrls() 
    };

    // Send 'updatePayload' instead of 'this.editForm.value'
    this.productService.updateProduct(id, updatePayload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.show("Product updated successfully!");
        this.router.navigate(['/admin/products']);
      },
      error: (err) => {
        console.error("Update failed", err);
        this.isSubmitting.set(false);
        this.toast.show("Failed to update product. Please try again.")
      }
    });
  }
}
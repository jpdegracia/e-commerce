import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category';
import { ToastService } from '../../services/toast';
import { ICategory } from '../../interface/category';

@Component({
  selector: 'app-update-category',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './update-category.html',
})

export class UpdateCategoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);

  // Status flags
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);

  // Form Field Signals
  categoryId = signal<string>('');
  categoryname = signal<string>('');
  description = signal<string>('');
  image = signal<string>('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.categoryId.set(id);
      this.fetchCategoryProfile(id);
    } else {
      this.toast.show("Invalid category selection profile.");
      this.router.navigate(['/admin/categories']);
    }
  }

  fetchCategoryProfile(id: string) {
    this.isLoading.set(true);
    this.categoryService.getCategoryById(id).subscribe({
      next: (response: any) => {
        // Unwrap standard response envelopes safely
        const catData: ICategory = response.details || response;
        
        this.categoryname.set(catData.categoryname || '');
        this.description.set(catData.description || '');
        this.image.set(catData.image || '');
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Category data retrieval failure:", err);
        this.toast.show("Could not find the selected category catalog data.");
        this.router.navigate(['/admin/categories']);
      }
    });
  }

  onSubmitCategoryUpdate() {
    if (!this.categoryname().trim()) {
      this.toast.show("Category name parameter is strictly required.");
      return;
    }

    this.isSubmitting.set(true);

    // 🚀 FIX: Swapped type 'ICategory' with 'Partial<ICategory>' so '_id' isn't forced here
    const updatePayload: Partial<ICategory> = {
      categoryname: this.categoryname().trim(),
      description: this.description().trim(),
      image: this.image().trim() || undefined
    };

    this.categoryService.updateCategory(this.categoryId(), updatePayload as ICategory).subscribe({
      next: () => {
        this.toast.show("Category configuration metrics updated successfully! ✨");
        this.isSubmitting.set(false);
        this.router.navigate(['/admin/categories']);
      },
      error: (err) => {
        console.error("Category patch update crash:", err);
        this.toast.show("Failed to write updated parameters to the database.");
        this.isSubmitting.set(false);
      }
    });
  }
}
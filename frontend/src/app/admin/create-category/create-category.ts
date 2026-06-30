import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category';
import { ToastService } from '../../services/toast';
import { ICategory } from '../../interface/category';

@Component({
  selector: 'app-create-category',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-category.html'
})
export class CreateCategoryComponent {
  private router = inject(Router);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);

  // Status flags
  isSubmitting = signal<boolean>(false);

  // Form Field Signals
  categoryname = signal<string>('');
  description = signal<string>('');
  image = signal<string>('');

  onSubmitCategoryCreate() {
    if (!this.categoryname().trim()) {
      this.toast.show("Category name parameter is strictly required.");
      return;
    }

    this.isSubmitting.set(true);

    // Using Partial here as well since this is a new document and doesn't have an _id yet
    const newCategoryPayload: Partial<ICategory> = {
      categoryname: this.categoryname().trim(),
      description: this.description().trim(),
      image: this.image().trim() || undefined
    };

    this.categoryService.registerCategory(newCategoryPayload as ICategory).subscribe({
      next: () => {
        this.toast.show("New product classification cataloged successfully! ✨");
        this.isSubmitting.set(false);
        this.router.navigate(['/admin/category']);
      },
      error: (err) => {
        console.error("Category registration failure:", err);
        this.toast.show(err.error?.message || "Failed to create new store category.");
        this.isSubmitting.set(false);
      }
    });
  }
}
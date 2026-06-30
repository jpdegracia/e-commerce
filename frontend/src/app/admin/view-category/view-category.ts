import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category';
import { ToastService } from '../../services/toast';
import { ICategory } from '../../interface/category';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidPenToSquare } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-view-category',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon],
  providers:[provideIcons({ faSolidPenToSquare })],
  templateUrl: './view-category.html'
})
export class ViewCategoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);

  // Structural Data Signals
  category = signal<ICategory | null>(null);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
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
        const catData: ICategory = response.details || response;
        this.category.set(catData);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Category showcase pull crash:", err);
        this.toast.show("Failed to recover explicit category ledger metrics.");
        this.router.navigate(['/admin/categories']);
      }
    });
  }
}
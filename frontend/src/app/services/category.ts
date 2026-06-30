import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ICategory } from '../interface/category';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/categories`;

  //create category
  registerCategory(categoryData: ICategory): Observable<ICategory> {
    return this.http.post<ICategory>(this.apiUrl, categoryData)
  }

  //all categories
  getAllCategories(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(`${this.apiUrl}/`);
  }

  //get single category using ID
  getCategoryById(categoryId: string): Observable<ICategory> {
    return this.http.get<ICategory>(`${this.apiUrl}/${categoryId}`)
  }


  //update category
  updateCategory(id: string, updateData: ICategory): Observable<ICategory> {
    return this.http.put<ICategory>(`${this.apiUrl}/${id}`, updateData)
  }


  //delete category
  deleteCategory(id: string): Observable<ICategory> {
    return this.http.delete<ICategory>(`${this.apiUrl}/${id}`)
  }
}

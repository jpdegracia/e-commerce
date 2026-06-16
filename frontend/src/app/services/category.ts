import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/categories`;

  //create category


  //all categories
  getAllCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`);
  }

  //get single category using ID
  getCategoryById(categoryId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${categoryId}`)
  }


  //update category


  //delete category
}

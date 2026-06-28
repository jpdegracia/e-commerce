import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`; // Maps to your router mount path

  // 🚀 Fetch all users (Triggers your backend getAll)
  getUsers(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // 🚀 Fetch single user details
  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // 🚀 Unified update helper (Used for roles, updating properties, or activation state toggles)
  updateUser(id: string, updateData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, updateData);
  }

  // 🚀 Permanently delete an account from the system
  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
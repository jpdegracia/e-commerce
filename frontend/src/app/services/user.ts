import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IUser } from '../interface/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`; // Maps to your router mount path


  createUser(userData: IUser): Observable<IUser> {
    return this.http.post<IUser>(`${this.apiUrl}`, userData)
  }

  // 🚀 Fetch all users (Triggers your backend getAll)
  getUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.apiUrl);
  }

  // 🚀 Fetch single user details
  getUserById(id: string): Observable<IUser> {
    return this.http.get<IUser>(`${this.apiUrl}/${id}`);
  }

  // 🚀 Unified update helper (Used for roles, updating properties, or activation state toggles)
  updateUser(id: string, updateData: Partial<IUser>): Observable<IUser> {
    return this.http.put<IUser>(`${this.apiUrl}/${id}`, updateData);
  }

  // 🚀 Permanently delete an account from the system
  deleteUser(id: string): Observable<IUser> {
    return this.http.delete<IUser>(`${this.apiUrl}/${id}`);
  }

}
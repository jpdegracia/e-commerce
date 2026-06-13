import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Angular v14+ use of inject() instead of constructor injection
  private http = inject(HttpClient);
  
  // Replace this URL with your actual Node.js backend auth URL
  private apiUrl = 'http://localhost:4000/auth';

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }
}
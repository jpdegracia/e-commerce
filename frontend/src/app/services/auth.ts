import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ILogin } from '../interface/login';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Angular v14+ use of inject() instead of constructor injection
  private http = inject(HttpClient);
  
  // Replace this URL with your actual Node.js backend auth URL
  private apiUrl = 'http://localhost:4000/auth';

  //register
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }


  //login
  isLoggedIn = signal<boolean>(this.hasToken());

  private hasToken(): boolean {
    // Check if we are running in the browser environment safely
    return typeof window !== 'undefined' && !!localStorage.getItem('token');
  }

  login(credentials: ILogin): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.isLoggedIn.set(true); // 🔥 Alert the entire app that we logged in!
        }
      })
    );
  }

  //logout
  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn.set(false); // 🔥 Alert the entire app that we logged out!
  }

  //forgot-password
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email })
  }

  //reset-password
  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { 
      token: token, 
      newPassword: password })
  }

}
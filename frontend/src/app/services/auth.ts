import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ILogin } from '../interface/login';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  // State Signals
  isLoggedIn = signal<boolean>(this.hasToken());

  private hasToken(): boolean {
    return typeof window !== 'undefined' && !!localStorage.getItem('token');
  }

  // ==========================================
  // 1. CORE AUTHENTICATION
  // ==========================================

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: ILogin): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.isLoggedIn.set(true); // 🔥 Alert the app
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn.set(false); // 🔥 Alert the app
  }

  // ==========================================
  // 2. PASSWORD MANAGEMENT
  // ==========================================

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { 
      token: token, 
      newPassword: password 
    });
  }

  // ==========================================
  // 3. RBAC (ROLE-BASED ACCESS CONTROL)
  // ==========================================

  /**
   * Safely decodes the JWT token to read the user's data (roles, permissions, etc.)
   */
  private getDecodedToken(): any | null {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      
      // 🚀 THE MAGIC TRACKER: Let's see what is actually inside!
      // console.log("🔥 Permissions Array:", decoded.role.permissions); 
      
      return decoded;
    } catch (e) {
      console.error("Error decoding token", e);
      return null;
    }
  }

  /**
   * Checks if the user's decoded token contains a specific permission or role
   */
  hasPermission(requiredPermission: string): boolean {
    const decodedToken = this.getDecodedToken();
    if (!decodedToken) return false;

    // Super-Admin Override (Bypasses everything)
    if (decodedToken.role && decodedToken.role.rolename === 'Admin') {
      return true; 
    }

    // Safety check: ensure role and permissions exist and is an array
    if (decodedToken.role && Array.isArray(decodedToken.role.permissions)) {
      
      // If the array contains Objects (Deep Populate worked!):
      if (typeof decodedToken.role.permissions[0] === 'object') {
         // 🚀 THE FIX: Changed p.name to p.permissionName to match your database exactly!
         return decodedToken.role.permissions.some((p: any) => p.permissionName === requiredPermission);
      }
      
      // Fallback just in case it ever reverts to strings
      if (typeof decodedToken.role.permissions[0] === 'string') {
         return decodedToken.role.permissions.includes(requiredPermission);
      }
    }

    return false;
  }
}
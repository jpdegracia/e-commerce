import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { IRole } from '../interface/role';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private http = inject(HttpClient)
  private apiUrl = `${environment.apiUrl}/roles`;


  // create of role
    createRole(roleData: { rolename: string; permission?: string[] }): Observable<IRole> {
      return this.http.post<IRole>(this.apiUrl, roleData)
    }

  // get all roles
    getAllRoles(): Observable<IRole[]> {
      return this.http.get<IRole[]>(this.apiUrl)
    }

  // get roles by ID
    getRoleByID(id: string): Observable<IRole> {
      return this.http.get<IRole>(`${this.apiUrl}/${id}`)
    }

  // update role
    updateRole(id: string, updateData: Partial<IRole>): Observable<IRole> {
      return this.http.put<IRole>(`${this.apiUrl}/${id}`, updateData)
    }

  // delete role
    deleteRole(id: string): Observable<IRole> {
      return this.http.delete<IRole>(`${this.apiUrl}/${id}`)
    }

}

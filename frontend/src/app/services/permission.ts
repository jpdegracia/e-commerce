import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IPermission } from '../interface/permission';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/permissions`;

  //create permission
  createPermission(permissionData: IPermission): Observable<IPermission> {
    return this.http.post<IPermission>(this.apiUrl, permissionData)
  }

  //get all permission
  getAllPermissions(): Observable<IPermission[]> {
    return this.http.get<IPermission[]>(this.apiUrl)
  }

  //get permission by ID
  getPermissionByID(id: string): Observable<IPermission> {
    return this.http.get<IPermission>(`${this.apiUrl}/${id}`)
  }

  //update permission
  updatePermission(id: string, updateData: IPermission): Observable<IPermission> {
    return this.http.put<IPermission>(`${this.apiUrl}/${id}`, updateData)
  }

  //delete permission
  deletePermission(id: string): Observable<IPermission> {
    return this.http.delete<IPermission>(`${this.apiUrl}/${id}`)
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import BaseUrl from '../models/base-url';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(private http: HttpClient, private router: Router) {}

  public saveUser(data: any) {
    if (typeof window !== 'undefined') {
      const frozenData = Object.freeze(JSON.stringify(data));
      window.localStorage.setItem('user', frozenData);
      window.localStorage.setItem('userLocked', 'true');
    }
  }

  public getUser() {
    if (typeof window !== 'undefined') {
      let user = window.localStorage.getItem('user');
      if (user != null) {
        return JSON.parse(user);
      }
    }
    return null;
  }

  public getUserRole() {
    if (typeof window !== 'undefined') {
      const frozenUser = Object.freeze(this.getUser());
      return frozenUser.role.roleName;
    }
  }

  public getUserPermissions() {
    if (typeof window !== 'undefined') {
      const frozenUser = Object.freeze(this.getUser());
      return frozenUser.role.permissions;
    }
  }

  public getUserPermissionPrivileges() {
    if (typeof window !== 'undefined') {
      const frozenUser = Object.freeze(this.getUser());
      return frozenUser.role.permissions.flatMap((p: any) => p.privileges);
    }
  }

  public saveToken(token: any) {
    if (typeof window !== 'undefined') {
      const frozenToken = Object.freeze(token);
      window.localStorage.setItem('token', JSON.stringify(frozenToken));
      window.localStorage.setItem('tokenLocked', 'true');
    }
  }

  public getToken() {
    if (typeof window !== 'undefined') {
      let token = window.localStorage.getItem('token');
      if (token != null) {
        return JSON.parse(token);
      }
    }
    return null;
  }

  public getCurrentUser(): Observable<any> {
    return this.http.get(BaseUrl + '/api/user-management/current-user-details', {
      responseType: 'json'
    });
  }

  public isTokenExpired(token: any): Boolean {
    this.http
      .post(BaseUrl + '/api/service/is-token-expired', token, {
        responseType: 'json',
      })
      .subscribe(
        (response: any) => {
          return response;
        },
        (error: any) => {
          this.logout();
        }
      );
    return false;
  }

  public logout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('user');
      window.localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }
  }

  public clearLocalStorage(){
    if(typeof window !== 'undefined'){
      window.localStorage.clear();
      return true;
    }
    return false;
  }


  public saveNotification(notification: any) {
    if (typeof window !== 'undefined') {
      let notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      notifications.push(notification);
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }

}

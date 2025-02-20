import {inject, Injectable} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {StorageService} from '../storage/storage.service';
import {ApiService} from '../api/api.service';
import {catchError, map, Observable, of} from 'rxjs';
import master_menus from '../models/master-sidebar-menus';

@Injectable({providedIn: 'root'})
export class RoutePermission {

  myRole: any;

  constructor(private storage: StorageService, private router: Router, private apiService: ApiService) {
  }

  jwtResponse = {
    jwtToken: '',
  };

  public canActivate(): boolean | Observable<boolean> {
    this.jwtResponse.jwtToken = this.storage.getToken();
    this.myRole = this.storage.getUserRole();
    if (this.myRole === 'SUPER_ADMIN') {
      return true; // Allow all for super admin
    }

    return this.apiService.getAllRoles().pipe(
      map((allRoles: any[]) => {

        const roleNames = allRoles.map(role => role.roleName);
        const allPermissions = allRoles.flatMap(r => r.permissions);
        const userPermission = allPermissions.flatMap(p => p.userPermission);
        const userRole = this.storage.getUserRole();
        const roleExists = roleNames.includes(userRole);
        const menus = master_menus;
        const appPermissions = menus.flatMap(u => u.permission);

        const hasAccess = userPermission.some(userPerm =>
          appPermissions.some(appPerm => userPerm === appPerm)
        );

        // Validate User, Token, and Role Existence
        if (
          this.storage.getUser() !== null &&
          this.storage.getToken() !== null &&
          roleExists &&
          !this.storage.isTokenExpired(this.jwtResponse) &&
          hasAccess
        ) {
          return true;
        }

        if(!this.storage.isTokenExpired(this.jwtResponse)){
          this.router.navigate(['/login'])
          return false;
        }

        this.router.navigate(['/login']);
        return false;
      }),
      catchError((error) => {
        console.error('Error fetching roles:', error);
        this.router.navigate(['/login']);
        return of(false);
      })
    );



  }
}

export const authGuard: CanActivateFn = (route, state) => {
  return inject(RoutePermission).canActivate();
};

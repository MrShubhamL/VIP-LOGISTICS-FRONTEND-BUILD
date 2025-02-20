import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, NavigationStart} from '@angular/router';
import { StorageService } from '../storage/storage.service';
import { ApiService } from '../api/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {

  private myPermissions: any[] = [];
  private filteredPermissions: any[] = [];
  private myRole: string = '';

  constructor(
    private storage: StorageService,
    private apiService: ApiService,
    private router: Router
  ) {}

  jwtResponse = {
    jwtToken: '',
  };

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    if(this.storage.isTokenExpired(this.jwtResponse)){
      this.storage.logout();
      return false;
    }

    this.myRole = this.storage.getUserRole();
    this.jwtResponse.jwtToken = this.storage.getToken();
    if (this.myRole === 'SUPER_ADMIN') {
      return true; // Allow all for super admin
    }


    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // Store the previous URL
        sessionStorage.setItem('previousUrl', event.url);
      }
    });

    // Fetch permissions based on role
    return this.apiService.getAllRoles().toPromise().then(res => {
      this.myPermissions = res;
      this.myPermissions.forEach((role: any) => {
        if (this.myRole === role.roleName) {
          role.permissions.forEach((permission: any) => {
            this.filteredPermissions.push(permission.userPermission);
          });
        }
      });

      // Check if the user has permission to navigate to the requested route
      const requiredPermission = next.data['permission'];
      if (this.filteredPermissions.includes(requiredPermission)) {
        return true; // User has the required permission
      } else {
        const previousUrl = sessionStorage.getItem('previousUrl');
        this.router.navigate([previousUrl || '/']);
        return false; // Restrict navigation
      }
    }).catch(err => {
      console.error(err);
      this.router.navigate(['/']); // Redirect to home if an error occurs
      return false;
    });
  }
}

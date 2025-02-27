import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from './login/login.component';
import {MainComponent} from './main/main.component';
import {HomeComponent} from './home/home.component';
import {PartyComponent} from './party/party.component';
import {ItemComponent} from './item/item.component';
import {authGuard} from './services/guards/auth.guard';
import {RouteManagerComponent} from './route-manager/route-manager.component';
import {VehicleRegistrationComponent} from './vehicle-registration/vehicle-registration.component';
import {UserManagementComponent} from './user-management/user-management.component';
import {RolesPermissionsComponent} from './roles-permissions/roles-permissions.component';
import {PermissionGuard} from './services/guards/permission.guard';
import {BranchComponent} from './branch/branch.component';
import {LorryReceiptComponent} from './transactions/lorry-receipt/lorry-receipt.component';
import {LorryRequestComponent} from './transactions/memo-request/lorry-request.component';
import {AccountComponent} from './account/account.component';
import {MisComponent} from './transactions/mis/mis.component';
import {LorryHireMemoComponent} from './transactions/lorry-hire-memo/lorry-hire-memo.component';
import {SecurityBackupComponent} from './security-backup/security-backup.component';
import {BookingRegisterComponent} from './booking-register/booking-register.component';
import {EmpContactsComponent} from './emp-contacts/emp-contacts.component';
import {FrightBillComponent} from './transactions/fright-bill/fright-bill.component';
import {UserProfileComponent} from './user-profile/user-profile.component';
import {OtpVerificationComponent} from './otp-verification/otp-verification.component';
import {FreightGroupComponent} from './transactions/freight-group/freight-group.component';
import {BillApprovalComponent} from './transactions/bill-approval/bill-approval.component';
import {FreightRequestGroupComponent} from './transactions/freight-request-group/freight-request-group.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'email-verify',
    component: OtpVerificationComponent
  },
  {
    path: "dashboard",
    component: MainComponent,
    canActivate: [authGuard],
    children: [
      {
        path: "",
        component: HomeComponent,
      },
      {
        path: "create-account",
        component: AccountComponent,
        canActivate: [PermissionGuard],
        data: {permission: 'create-account'}
      },
      {
        path: "create-party",
        component: PartyComponent,
        canActivate: [PermissionGuard],
        data: {permission: 'create-party'}
      },
      {
        path: "item-records",
        component: ItemComponent,
        canActivate: [PermissionGuard],
        data: {permission: 'item-records'}
      },
      {
        path: "manage-route",
        component: RouteManagerComponent,
        canActivate: [PermissionGuard],
        data: {permission: 'manage-route'}
      },
      {
        path: "create-branch",
        component: BranchComponent,
        canActivate: [PermissionGuard],
        data: {permission: 'create-branch'}
      },
      {
        path: 'vehicle-registration',
        component: VehicleRegistrationComponent,
        canActivate: [PermissionGuard],
        data: {permission: 'vehicle-registration'}
      },
      {
        path: 'user-management',
        component: UserManagementComponent,
        canActivate: [PermissionGuard],
        data: {permission: 'user-management'}
      },
      {
        path: 'roles-permissions',
        component: RolesPermissionsComponent,
        canActivate: [PermissionGuard],
        data: {permission: 'roles-permissions'}
      },
      {
        path: 'security-backup',
        component: SecurityBackupComponent,
        canActivate: [PermissionGuard],
        data: {permission: 'security-backup'}
      },
      {
        path: 'employee-contacts',
        component: EmpContactsComponent,
        canActivate: [PermissionGuard],
        data: {permission: 'employee-contacts'}
      },
      {
        path: 'user-profile',
        component: UserProfileComponent,
        canActivate: [PermissionGuard],
        data: {permission: 'user-profile'}
      },
      // ------------ TRANSACTION -----------------
      {
        path: 'lorry-receipt',
        component: LorryReceiptComponent,
        canActivate: [PermissionGuard],
        data: {permission: 'lorry-receipt'}
      },
      {
        path: 'freight-group',
        component: FreightGroupComponent,
        canActivate: [PermissionGuard],
        data: {permission: 'freight-group'}
      },
      {
        path: 'freight-request-group',
        component: FreightRequestGroupComponent,
        canActivate: [PermissionGuard],
        data: {permission: 'freight-request-group'}
      },
      {
        path: 'mis',
        component: MisComponent,
        canActivate: [PermissionGuard],
        data: {permission: 'mis'}
      },
      {
        path: 'memo-requests',
        component: LorryRequestComponent,
        canActivate: [PermissionGuard],
        data: {permission: 'memo-requests'}
      },
      {
        path: 'lorry-hire-memo',
        component: LorryHireMemoComponent,
        canActivate: [PermissionGuard],
        data: {permission: 'lorry-hire-memo'}
      },
      // -------------- Reports ----------------
      {
        path: 'booking-register',
        component: BookingRegisterComponent,
        canActivate: [PermissionGuard],
        data: {permission: 'booking-register'}
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

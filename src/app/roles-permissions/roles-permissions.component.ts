import {Component, inject, OnInit} from '@angular/core';
import userPermissionsList from '../services/models/user-permissions-list';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ApiService} from '../services/api/api.service';
import {StorageService} from '../services/storage/storage.service';
import {WebSocketService} from '../services/api/web-socket.service';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-roles-permissions',
  standalone: false,
  templateUrl: './roles-permissions.component.html',
  styleUrls: ['./roles-permissions.component.scss']
})
export class RolesPermissionsComponent implements OnInit {
  permissions: { title: string; permission: string[] }[] = [];
  form!: FormGroup;
  private formBuilder = inject(FormBuilder);
  private apiService = inject(ApiService);
  private storageService = inject(StorageService);
  private webSocketService = inject(WebSocketService);
  isDataLoading: boolean = false;

  privileges = [
    'READ',
    'WRITE',
    'UPDATE',
    'DELETE'
  ]

  userRoles = [
    'Select User Role',
    'ADMIN',
    'MANAGER',
    'DRIVER',
    'WORKER01',
    'WORKER02',
    'WORKER03',
    'WORKER04',
    'WORKER05'
  ]
  isCreated: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.permissions = userPermissionsList;
    this.buildForm();
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      roleId: new FormControl(''),
      roleName: ['Select User Role', Validators.required],
      roleDescription: new FormControl('', Validators.required),
      permission: this.formBuilder.group({
        ...this.createPermissionControls(),
        privileges: new FormControl('')
      })
    });
  }


  private createPermissionControls() {
    let controls: { [key: string]: FormControl } = {};

    this.permissions.forEach(group => {
      group.permission.forEach(permission => {
        // Create main permission control
        controls[permission] = new FormControl(false);

        // Create privilege controls (initially disabled)
        controls[`${permission}_READ`] = new FormControl({value: false, disabled: true});
        controls[`${permission}_WRITE`] = new FormControl({value: false, disabled: true});
        controls[`${permission}_UPDATE`] = new FormControl({value: false, disabled: true});
        controls[`${permission}_DELETE`] = new FormControl({value: false, disabled: true});

        // Listen to changes in the main permission checkbox
        controls[permission].valueChanges.subscribe(checked => {
          this.toggleSubPermissions(controls, permission, checked);
        });

        // Listen to changes in WRITE permission
        controls[`${permission}_WRITE`].valueChanges.subscribe(checked => {
          if (checked) {
            controls[`${permission}_READ`].setValue(true, {emitEvent: false});
          }
        });

        // Listen to changes in UPDATE permission
        controls[`${permission}_UPDATE`].valueChanges.subscribe(checked => {
          if (checked) {
            controls[`${permission}_READ`].setValue(true, {emitEvent: false});
            controls[`${permission}_WRITE`].setValue(true, {emitEvent: false});
          }
        });

        // Listen to changes in UPDATE permission
        controls[`${permission}_DELETE`].valueChanges.subscribe(checked => {
          if (checked) {
            controls[`${permission}_READ`].setValue(true, {emitEvent: false});
          }
        });


      });
    });

    return controls;
  }


  private toggleSubPermissions(controls: { [key: string]: FormControl }, permission: string, enable: boolean) {
    ['_READ', '_WRITE', '_UPDATE', '_DELETE'].forEach(action => {
      if (enable) {
        controls[`${permission}${action}`].enable();
      } else {
        controls[`${permission}${action}`].disable();
        controls[`${permission}${action}`].setValue(false, {emitEvent: false});
      }
    });
  }


  clearFormData() {
    this.form.reset();
    this.ngOnInit();
    this.form.get('roleName')?.setValue('Select User Role');
  }

  formSubmit(): void {
    if (this.form.valid) {
      const selectedPermissions = this.getSelectedPermissions();
      const roleData = {
        roleId: this.form.value.roleId,
        roleName: this.form.value.roleName,
        roleDescription: this.form.value.roleDescription,
        permissions: selectedPermissions.map((permission: any) => ({
          userPermission: permission.userPermission,
          privileges: permission.privileges // Capture privileges for each permission
        }))
      };
      // console.log(roleData)
      this.apiService.createRole(roleData).subscribe(res => {
        this.clearFormData();
        $.toast({
          heading: 'New Role Added!',
          text: 'You have added new role',
          showHideTransition: 'fade',
          icon: 'success',
          position: 'bottom-right',
          bgColor: '#219a2b',
          loader: false,
        });
      }, err => {
        $.toast({
          heading: 'Invalid Information!',
          text: 'Please check your data or re-login!!',
          showHideTransition: 'fade',
          icon: 'error',
          position: 'bottom-right',
          bgColor: '#be2828',
          loader: false,
        });
        this.storageService.logout();
      });
    } else {
      console.log('Form is invalid');
    }
  }

  updateRole() {
    const selectedPermissions = this.getSelectedPermissions();
    const roleData = {
      roleId: this.form.value.roleId,
      roleName: this.form.value.roleName,
      roleDescription: this.form.value.roleDescription,
      permissions: selectedPermissions.map((permission: any) => ({
        userPermission: permission.userPermission,
        privileges: permission.privileges // Capture privileges for each permission
      }))
    };

    this.apiService.updateRole(roleData).subscribe(res => {
      this.clearFormData();
      let message = "Hello there!!,  Permissions has been updated! Please login again. Thank You!!";
      this.webSocketService.sendMessage('/app/sendMessage', message, 'ROLE-REQUEST');
      if (res) {
        $.toast({
          heading: 'Role Updated!',
          text: 'You have updated role.',
          showHideTransition: 'fade',
          icon: 'info',
          position: 'bottom-right',
          bgColor: '#2d90da',
          loader: false,
        });
      }
    }, err => {
      $.toast({
        heading: 'Invalid Information!',
        text: 'Please check your data or re-login!!',
        showHideTransition: 'fade',
        icon: 'error',
        position: 'bottom-right',
        bgColor: '#be2828',
        loader: false,
      });
      console.log(err)
      // this.storageService.logout();
    })
  }

  deleteRole() {
    const roleId = this.form.get("id")?.value;
    if (roleId) {
      this.apiService.deleteRole(roleId).subscribe(res => {
        this.clearFormData();
        $.toast({
          heading: 'Role Deleted!',
          text: 'You have deleted role',
          showHideTransition: 'fade',
          icon: 'success',
          position: 'bottom-right',
          bgColor: '#198d1a',
          loader: false,
        });
      }, err => {
        $.toast({
          heading: 'Invalid Information!',
          text: 'Please check your data or re-login!!',
          showHideTransition: 'fade',
          icon: 'error',
          position: 'bottom-right',
          bgColor: '#be2828',
          loader: false,
        });
        this.storageService.logout();
      })
    }
  }


  getSelectedPermissions(): any {
    let selectedPermissions: { userPermission: string, privileges: string[] }[] = [];
    const permissionGroup = this.form.get('permission') as FormGroup;

    if (permissionGroup) {
      // Iterate through each permission
      Object.keys(permissionGroup.controls).forEach(permission => {
        if (permission !== 'privileges' && permissionGroup.get(permission)?.value) {
          // For each selected permission, we need to also collect the associated privileges
          let permissionWithPrivileges = {
            userPermission: permission,
            privileges: [] as string[]
          };

          // Collect the selected privileges for each permission
          this.privileges.forEach(privilege => {
            if (permissionGroup.get(`${permission}_${privilege}`)?.value) {
              permissionWithPrivileges.privileges.push(privilege);
            }
          });

          if (permissionWithPrivileges.privileges.length > 0) {
            selectedPermissions.push(permissionWithPrivileges);
          }
        }
      });
    }
    return selectedPermissions;
  }




  // searchRoles(event: any) {
  //   this.apiService.getRoleByName(event.target.value).subscribe(res => {
  //     if (res) {
  //       this.form.reset();
  //       const selectedPermissions = res.permissions.map((p: any) => p.userPermission);
  //       let permissionData: { [key: string]: boolean } = {};
  //       this.permissions.forEach(group => {
  //         group.permission.forEach(permission => {
  //           permissionData[permission] = selectedPermissions.includes(permission);
  //         });
  //       });
  //
  //       this.form.patchValue({
  //         id: res.id,
  //         roleName: res.roleName,
  //         roleDescription: res.roleDescription,
  //         permission: permissionData
  //       });
  //     }
  //   });
  // }

  searchRoles(event: any) {
    this.isDataLoading = true;
    this.apiService.getRoleByName(event.target.value).subscribe(res => {
      if (res) {
        this.form.reset();

        // Extract the selected permissions and privileges from the response
        const selectedPermissions = res.permissions.map((p: any) => p.userPermission);
        const selectedPrivileges = res.permissions.reduce((acc: { [key: string]: string[] }, p: any) => {
          acc[p.userPermission] = p.privileges || [];
          return acc;
        }, {});

        // Initialize permission data with the selected permissions and privileges
        let permissionData: { [key: string]: boolean } = {};
        this.permissions.forEach(group => {
          group.permission.forEach(permission => {
            // Set the permission control based on whether the permission is selected
            permissionData[permission] = selectedPermissions.includes(permission);

            // For each selected permission, set the privilege controls
            this.privileges.forEach(privilege => {
              const privilegeControlName = `permission.${permission}_${privilege}`;
              const control = this.form.get(privilegeControlName);

              if (control) {
                // Set the privilege checkbox value
                control.setValue(selectedPrivileges[permission]?.includes(privilege) || false);
              }
            });
          });
        });
        // console.log(res)
        // Patch the form with the selected role data
        this.form.patchValue({
          roleId: res.roleId,
          roleName: res.roleName,
          roleDescription: res.roleDescription,
          permission: permissionData // This will set the permissions
        });
        this.isDataLoading = false;
      }else{
        this.isDataLoading = false;
      }
    });
  }

}

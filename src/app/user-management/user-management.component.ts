import {Component, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import userPermissionsList from '../services/models/user-permissions-list';
import {ApiService} from '../services/api/api.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {StorageService} from '../services/storage/storage.service';
import {DomElementSchemaRegistry} from '@angular/compiler';
import {WebSocketService} from '../services/api/web-socket.service';
declare var $: any;

@Component({
  selector: 'app-user-management',
  standalone: false,

  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  isModalOpen: boolean = false;
  userRoles: any[] = [];
  allUsers: any[] = [];
  form!: FormGroup;

  selectedFile!: File;
  imagePreview: string | ArrayBuffer | null = null;

  private formBuilder = inject(FormBuilder);
  private apiService = inject(ApiService);
  private storageService = inject(StorageService);
  private webSocketService = inject(WebSocketService);

  filteredUserData = [...this.allUsers];
  isUserModalOpen: boolean = false;
  selectedUser: any = null;
  isDataUploading: boolean = false;

  readEnabled: boolean = false;
  writeEnabled: boolean = false;
  updateEnabled: boolean = false;
  deleteEnabled: boolean = false;
  currentLoggedUser: any;

  constructor() {
    this.isModalOpen = false;
    this.form = this.formBuilder.group({
      "userSearchQuery": new FormControl(''),
      "id": new FormControl(''),
      "name": new FormControl('', Validators.required),
      "username": new FormControl('', Validators.required),
      "contact": new FormControl('', Validators.required),
      "birthDate": new FormControl(''),
      "pan": new FormControl(''),
      "aadhar": new FormControl(''),
      "address": new FormControl(''),
      "password": new FormControl(''),
      "role": new FormControl('Select User Role', Validators.required),
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  ngOnInit(): void {
    this.apiService.getAllUsers().subscribe(res=>{
      this.allUsers = res;
    }, err=>{
      console.log(err);
    })
    this.apiService.getAllRoles().subscribe(res=>{
      this.userRoles = res;
    }, err=>{
      console.log(err)
    });


    this.storageService.getCurrentUser().subscribe(res=>{
      this.currentLoggedUser = res;
      this.currentLoggedUser.roleDto.permissions.map((p: any) => {
        if(p.userPermission == 'ALL_PERMISSIONS'){
          this.readEnabled = true;
          this.writeEnabled = true;
          this.updateEnabled = true;
          this.deleteEnabled = true;
          return;
        }
        if(p.userPermission == 'user-management'){
          console.log(p);
          p.privileges.map((pr: any) => {
            if(pr !== null && pr == 'WRITE'){
              this.writeEnabled = true;
            }
            if(pr !== null && pr == 'UPDATE'){
              this.updateEnabled = true;
            }
            if(pr !== null && pr == 'DELETE'){
              this.deleteEnabled = true;
            }
            if(pr !== null && pr == 'READ'){
              this.readEnabled = true;
            }
          });
        }
      });
    }, err=>{
      $.toast({
        heading: 'Limited Access Alert!',
        text: 'You dont have modification access on this service! ' + err,
        showHideTransition: 'fade',
        icon: 'info',
        position: 'bottom-right',
        bgColor: '#3152be',
        loader: false,
      });
    });
  }


  closeUserModal() {
    this.isModalOpen = false;
  }

  openUserModal(){
    this.isModalOpen = true;
  }

  onUserSearch() {
    const query3 = (this.form.get('userSearchQuery')?.value || '')
      .toString()
      .trim()
      .toLowerCase();
    this.filteredUserData = this.allUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(query3) ||
        u.username.toLowerCase().includes(query3) ||
        u.contact.toLowerCase().includes(query3)
    );
    this.isUserModalOpen = query3.length > 0 && this.filteredUserData.length > 0;
  }

  closeUserWindowModal() {
    this.isUserModalOpen = false;
    this.selectedUser = null; // Clear the selected item when closing the modal
  }

  selectUserRow(item: any) {
    this.selectedUser = item;
    this.confirmUserSelection();
  }

  confirmUserSelection() {
    if (this.selectedUser) {
      if(this.selectedUser.username === 'viplogistics@yahoo.com'){
        this.form.get('password')?.reset();
        this.form.get('password')?.disable();
      }
      this.form.patchValue({
        "id": this.selectedUser.id,
        "name": this.selectedUser.name,
        "username": this.selectedUser.username,
        "contact": this.selectedUser.contact,
        "birthDate": this.selectedUser.birthDate,
        "pan": this.selectedUser.pan,
        "aadhar": this.selectedUser.aadhar,
        "address": this.selectedUser.address,
        "role": this.selectedUser.role.id,
      });
      this.imagePreview = this.selectedUser.imageUrl
      this.closeUserWindowModal();
      this.form.get('itemSearchQuery')?.reset();
    } else {
      alert('No item selected!');
    }
  }

  clearFormData(){
    this.isDataUploading = false;
    this.form.reset();
    this.ngOnInit();
    this.form.get('role')?.enable();
    this.form.get('password')?.enable();
    this.form.get('role')?.setValue("Select User Role");
    this.imagePreview = '';
  }

  formSubmit(){
    this.isDataUploading = true;
    const formData = new FormData();
    formData.append('name', this.form.get('name')?.value);
    formData.append('username', this.form.get('username')?.value);
    formData.append('contact', this.form.get('contact')?.value);
    formData.append('birthDate', this.form.get('birthDate')?.value);
    formData.append('pan', this.form.get('pan')?.value);
    formData.append('aadhar', this.form.get('aadhar')?.value);
    formData.append('address', this.form.get('address')?.value);
    formData.append('password', this.form.get('password')?.value);
    formData.append('roleId', this.form.get('role')?.value);

    if (this.selectedFile) {
      formData.append('file', this.selectedFile || null);
    } else {
      console.warn("No file selected!");
    }


    this.apiService.createUser(formData).subscribe(res=>{
      this.isDataUploading = false;
      this.clearFormData();
      $.toast({
        heading: 'New User Added!',
        text: 'You have added new user',
        showHideTransition: 'fade',
        icon: 'success',
        position: 'bottom-right',
        bgColor: '#219a2b',
        loader: false,
      });
    }, err=>{
      this.isDataUploading = false;
      $.toast({
        heading: 'Warning!',
        text: 'Please check your file size and try again!!',
        showHideTransition: 'fade',
        icon: 'error',
        position: 'bottom-right',
        bgColor: '#be2828',
        loader: false,
      });
    });
  }

  lockSelection(event: any) {
    if(event == 1){
      this.form.get('role')?.disable();
    }
  }

  updateUser() {
    this.isDataUploading = true;
    const formData = new FormData();
    formData.append('id', this.form.get('id')?.value);
    formData.append('name', this.form.get('name')?.value);
    formData.append('username', this.form.get('username')?.value);
    formData.append('contact', this.form.get('contact')?.value);
    formData.append('birthDate', this.form.get('birthDate')?.value);
    formData.append('pan', this.form.get('pan')?.value);
    formData.append('aadhar', this.form.get('aadhar')?.value);
    formData.append('address', this.form.get('address')?.value);
    formData.append('password', this.form.get('password')?.value || '');
    formData.append('roleId', this.form.get('role')?.value);

    if (this.selectedFile) {
      formData.append('file', this.selectedFile || null);
    } else {
      console.warn("No file selected!");
    }

    this.apiService.updateUser(formData).subscribe(res=>{
      this.isDataUploading = false;
      this.clearFormData();
      $.toast({
        heading: 'Update User Information!',
        text: 'You have updated user information',
        showHideTransition: 'fade',
        icon: 'info',
        position: 'bottom-right',
        bgColor: '#215e9a',
        loader: false,
      });
    }, err=>{
      $.toast({
        heading: 'Warning!',
        text: 'Please check your file size and try again!!',
        showHideTransition: 'fade',
        icon: 'error',
        position: 'bottom-right',
        bgColor: '#be2828',
        loader: false,
      });
    })
  }

  deleteUser(){
    const id = this.form.get('id')?.value;
    if(id){
      this.apiService.deleteUser(id).subscribe(res=>{
        if(res){
          this.clearFormData();
          $.toast({
            heading: 'User Information Deleted!',
            text: 'You have deleted user information',
            showHideTransition: 'fade',
            icon: 'info',
            position: 'bottom-right',
            bgColor: '#215e9a',
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
        this.storageService.logout();
      })
    }
  }
}

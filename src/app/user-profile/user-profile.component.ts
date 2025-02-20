import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ApiService} from '../services/api/api.service';
import {StorageService} from '../services/storage/storage.service';
import {error} from '@angular/compiler-cli/src/transformers/util';

declare var $: any;


@Component({
  selector: 'app-user-profile',
  standalone: false,

  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  form!: FormGroup;
  isDataUploading: boolean = false;
  user: any;
  username: any;

  private formBuilder = inject(FormBuilder);
  private apiService = inject(ApiService);
  private storageService = inject(StorageService);

  selectedFile!: File;
  imagePreview: string | ArrayBuffer | null = null;

  readEnabled: boolean = false;
  writeEnabled: boolean = false;
  updateEnabled: boolean = false;
  deleteEnabled: boolean = false;
  currentLoggedUser: any;

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

  constructor() {
    this.form = this.formBuilder.group({
      "userSearchQuery": new FormControl(''),
      "id": new FormControl(''),
      "name": new FormControl(''),
      "username": new FormControl(''),
      "contact": new FormControl(''),
      "birthDate": new FormControl(''),
      "pan": new FormControl(''),
      "aadhar": new FormControl(''),
      "address": new FormControl(''),
      "password": new FormControl(''),
      "role": new FormControl('Select User Role'),
    });
  }

  ngOnInit() {
    this.storageService.getCurrentUser().subscribe(res => {
      this.currentLoggedUser = res;
      this.username = this.currentLoggedUser.userName;
      this.apiService.getUserByUsername(this.username).subscribe(res => {
        if (res) {
          this.user = res;
          this.form.patchValue({
            id: this.user.id,
            name: this.user.name,
            username: this.user.username,
            contact: this.user.contact,
            birthDate: this.user.birthDate,
            pan: this.user.pan,
            aadhar: this.user.aadhar,
            address: this.user.address,
            role: this.user.role.id,
          });
          this.imagePreview = this.user.imageUrl;
        }
      }, error => {
        console.log(error);
      });
      this.currentLoggedUser.roleDto.permissions.map((p: any) => {
        if (p.userPermission == 'ALL_PERMISSIONS') {
          this.readEnabled = true;
          this.writeEnabled = true;
          this.updateEnabled = true;
          this.deleteEnabled = true;
          return;
        }
        if (p.userPermission == 'user-management') {
          console.log(p);
          p.privileges.map((pr: any) => {
            if (pr !== null && pr == 'WRITE') {
              this.writeEnabled = true;
            }
            if (pr !== null && pr == 'UPDATE') {
              this.updateEnabled = true;
            }
            if (pr !== null && pr == 'DELETE') {
              this.deleteEnabled = true;
            }
            if (pr !== null && pr == 'READ') {
              this.readEnabled = true;
            }
          });
        }
      });
    }, err => {
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

    this.apiService.updateUser(formData).subscribe(res => {
      this.isDataUploading = false;
      this.ngOnInit();
      $.toast({
        heading: 'Update User Information!',
        text: 'You have updated user information',
        showHideTransition: 'fade',
        icon: 'info',
        position: 'bottom-right',
        bgColor: '#215e9a',
        loader: false,
      });
    }, err => {
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

}

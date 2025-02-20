import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {StorageService} from '../services/storage/storage.service';
import {ApiService} from '../services/api/api.service';
declare var $: any;

@Component({
  selector: 'app-branch',
  standalone: false,

  templateUrl: './branch.component.html',
  styleUrl: './branch.component.scss'
})
export class BranchComponent {
  form!: FormGroup;
  branches: any[] = [];

  page: number = 1;
  itemsPerPage: number = 5;
  searchBranch: string = '';

  private formBuilder = inject(FormBuilder);
  private storage = inject(StorageService);
  private apiService = inject(ApiService);

  readEnabled: boolean = false;
  writeEnabled: boolean = false;
  updateEnabled: boolean = false;
  deleteEnabled: boolean = false;
  currentLoggedUser: any;
  private lastestBranchNo: any;

  constructor() {
    this.form = this.formBuilder.group({
      branchNo: new FormControl(''),
      branchName: new FormControl('', Validators.required),
    })
  }


  ngOnInit(){
    this.apiService.getLatestBranchNo().subscribe(res=>{
      this.lastestBranchNo = res.newBranchNo;
      this.form.patchValue({
        branchNo: this.lastestBranchNo
      });
    });

    this.apiService.getBranches().subscribe(res=>{
      this.branches = res;
    }, err=>{
      $.toast({
        heading: 'Information Invalid!',
        text: 'Please re-login and try again!' + err,
        showHideTransition: 'fade',
        icon: 'info',
        position: 'bottom-right',
        bgColor: '#2158ab',
        loader: false,
      });
    });

    this.storage.getCurrentUser().subscribe(res=>{
      this.currentLoggedUser = res;
      this.currentLoggedUser.roleDto.permissions.map((p: any) => {
        if(p.userPermission == 'ALL_PERMISSIONS'){
          this.readEnabled = true;
          this.writeEnabled = true;
          this.updateEnabled = true;
          this.deleteEnabled = true;
          return;
        }
        if(p.userPermission == 'create-branch'){
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

  get filteredBranches() {
    return this.branches.filter(
      (route) =>
        route.branchNo.toLowerCase().includes(this.searchBranch.toLowerCase()) ||
        route.branchName.toLowerCase().includes(this.searchBranch.toLowerCase())
    );
  }

  formSubmit(){
    if(!this.form.invalid){
      this.apiService.addBranch(this.form.value).subscribe(res=>{
        if(res){
          this.resetForm();
          $.toast({
            heading: 'New Branch Information Added!',
            text: 'You have added new branch details.',
            showHideTransition: 'fade',
            icon: 'success',
            position: 'bottom-right',
            bgColor: '#21ab49',
            loader: false,
          });
        }
      }, err=>{
        $.toast({
          heading: 'Information Invalid!',
          text: 'Please re-login and try again!',
          showHideTransition: 'fade',
          icon: 'info',
          position: 'bottom-right',
          bgColor: '#2158ab',
          loader: false,
        });
        this.storage.logout();
      })
    }
  }

  updateBranch(modal: any){
    if(!this.form.invalid){
      this.apiService.updateBranch(this.form.value).subscribe(res=>{
        if(res){
          this.resetForm();
          $.toast({
            heading: 'Branch Information Updated!',
            text: 'You have updated branch details.',
            showHideTransition: 'fade',
            icon: 'success',
            position: 'bottom-right',
            bgColor: '#21ab49',
            loader: false,
          });
        }
      }, err=>{
        $.toast({
          heading: 'Information Invalid!',
          text: 'Please re-login and try again!',
          showHideTransition: 'fade',
          icon: 'info',
          position: 'bottom-right',
          bgColor: '#2158ab',
          loader: false,
        });
        this.storage.logout();
      })
    }
    (modal as HTMLElement).classList.remove('show'); // Remove 'show' class
    document.body.classList.remove('modal-open'); // Remove modal-open class from body
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove(); // Remove the backdrop
    }
  }

  editBranch(b: any) {
    this.form.patchValue({
      branchNo: b.branchNo,
      branchName: b.branchName
    })
  }


  resetForm(){
    this.form.reset({
      branchName: ''
    });
    this.ngOnInit();
  }

  deleteBranch(modal: any, branchNo: any) {
    if(branchNo){
      this.apiService.deleteBranch(branchNo).subscribe(res=>{
        if(res){
          this.resetForm();
          $.toast({
            heading: 'Branch Information Deleted!',
            text: 'You have deleted branch details.',
            showHideTransition: 'fade',
            icon: 'success',
            position: 'bottom-right',
            bgColor: '#21ab49',
            loader: false,
          });
        }
      }, err=>{
        console.log(err)
        $.toast({
          heading: 'Information Invalid!',
          text: 'Please re-login and try again!',
          showHideTransition: 'fade',
          icon: 'info',
          position: 'bottom-right',
          bgColor: '#2158ab',
          loader: false,
        });
        this.storage.logout();
      });
    }


    (modal as HTMLElement).classList.remove('show'); // Remove 'show' class
    document.body.classList.remove('modal-open'); // Remove modal-open class from body
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove(); // Remove the backdrop
    }
  }
}

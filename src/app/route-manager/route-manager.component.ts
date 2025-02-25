import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api/api.service';
import { StorageService } from '../services/storage/storage.service';
declare var $: any;

@Component({
  selector: 'app-route-manager',
  standalone: false,

  templateUrl: './route-manager.component.html',
  styleUrl: './route-manager.component.scss',
})
export class RouteManagerComponent implements OnInit {
  @ViewChild('modalDefault', { static: false }) modalDefault!: ElementRef;

  form!: FormGroup;
  page: number = 1;
  itemsPerPage: number = 12;
  searchTerm: string = '';
  isDataLoding: boolean = false;
  allRoutes: any[] = [];
  latestRouteNo: any = '';

  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private apiService = inject(ApiService);
  private storageService = inject(StorageService);

  readEnabled: boolean = false;
  writeEnabled: boolean = false;
  updateEnabled: boolean = false;
  deleteEnabled: boolean = false;
  currentLoggedUser: any;

  constructor() {
    this.form = this.formBuilder.group({
      routeNo: new FormControl(''),
      routeName: new FormControl('', Validators.required),
      routeFrom: new FormControl('', Validators.required),
      routeTo: new FormControl('', Validators.required),
      isRoundUp: new FormControl(false),
      gstType: new FormControl('')
    });
  }
  ngOnInit(): void {
    this.apiService.getLatestRouteNo().subscribe((res) => {
      this.latestRouteNo = res.newRouteNo;
      this.form.get('routeNo')?.setValue(res.newRouteNo);
    });
    this.apiService.getAllRoutes().subscribe(
      (res) => {
        this.isDataLoding = true;
        this.allRoutes = res;
      },
      (err) => {
        $.toast({
          heading: 'Invalid Information!',
          text: 'Please check data and relogin before process! ' + err,
          showHideTransition: 'fade',
          icon: 'error',
          position: 'bottom-right',
          bgColor: '#7b0a0a',
          loader: false,
        });
        this.storageService.logout();
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
        if(p.userPermission == 'manage-route'){
          // console.log(p);
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

  // Filtered routes
  get filteredRoutes() {
    return this.allRoutes.filter(
      (route) =>
        route.routeNo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        route.routeName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        route.routeFrom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        route.routeTo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        route.gstType.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  formSubmit(modal: any) {
    // console.log(this.form.value);
    this.apiService.addRoute(this.form.value).subscribe(
      (res) => {
        $.toast({
          heading: 'Route Information Added',
          text: 'You have added route information.',
          showHideTransition: 'fade',
          icon: 'success',
          position: 'bottom-right',
          bgColor: '#1f592c',
          loader: false,
        });
        this.ngOnInit();
        this.form.reset();
      },
      (err) => {
        $.toast({
          heading: 'Invalid Information!',
          text: 'Please check data before process! ' + err,
          showHideTransition: 'fade',
          icon: 'error',
          position: 'bottom-right',
          bgColor: '#7b0a0a',
          loader: false,
        });
        this.storageService.logout();
      }
    );

    (modal as HTMLElement).classList.remove('show'); // Remove 'show' class
    document.body.classList.remove('modal-open'); // Remove modal-open class from body
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove(); // Remove the backdrop
    }
  }

  deleteRoute(id: any, modal: any) {
    this.apiService.deleteRoute(id).subscribe(
      (res) => {
        $.toast({
          heading: 'Route Information Deleted',
          text: 'You have deleted route information.',
          showHideTransition: 'fade',
          icon: 'success',
          position: 'bottom-right',
          bgColor: '#1f592c',
          loader: false,
        });
        (modal as HTMLElement).classList.remove('show'); // Remove 'show' class
        document.body.classList.remove('modal-open'); // Remove modal-open class from body
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove(); // Remove the backdrop
        }
        this.ngOnInit();
      },
      (err) => {
        $.toast({
          heading: 'Sorry! Route Linked!!',
          text: 'Please check route is linked with other data before process! ',
          showHideTransition: 'fade',
          icon: 'error',
          position: 'bottom-right',
          bgColor: '#7b0a0a',
          loader: false,
        });
        (modal as HTMLElement).classList.remove('show'); // Remove 'show' class
        document.body.classList.remove('modal-open'); // Remove modal-open class from body
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove(); // Remove the backdrop
        }
        this.ngOnInit();
      }
    );
  }

  editRoute(route: any): void {
    this.form.patchValue({
      routeNo: route.routeNo,
      routeName: route.routeName,
      routeFrom: route.routeFrom,
      routeTo: route.routeTo,
      isRoundUp: route.isRoundUp,
      gstType: route.gstType
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      // Or use any key combination
    }
  }

  resetForm() {
    this.form.patchValue({
      routeNo: this.latestRouteNo,
      routeName: '',
      routeFrom: '',
      routeTo: '',
      isRoundUp: false,
    });
  }
}

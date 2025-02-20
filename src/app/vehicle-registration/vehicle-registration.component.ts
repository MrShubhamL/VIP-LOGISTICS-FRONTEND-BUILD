import {Component, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ApiService} from '../services/api/api.service';
import {StorageService} from '../services/storage/storage.service';

declare var $: any;

@Component({
  selector: 'app-vehicle-registration',
  standalone: false,
  templateUrl: './vehicle-registration.component.html',
  styleUrl: './vehicle-registration.component.scss'
})
export class VehicleRegistrationComponent implements OnInit {
  @ViewChild('vehicleViewId') vehicleViewId!: ElementRef;

  vehicles_types = ["Hired", "Owner"]
  vehicles: any[] = [];
  latestVehicleId: any;
  page: number = 1;
  itemsPerPage: number = 5;
  ownerDetails: any = {};
  vehicleNo: string = "Loading...";
  vehicleId: any;
  form!: FormGroup;
  ownerForm!: FormGroup;
  isModalOpen: boolean = false;
  isModalOpen2: boolean = false;
  isNewOwnerDetails: boolean = false;
  selectedItem: any = null;
  filteredData = [...this.vehicles];
  isVehicleFound: boolean = false;
  private formBuilder = inject(FormBuilder);
  private apiService = inject(ApiService);
  private storageService = inject(StorageService);

  readEnabled: boolean = false;
  writeEnabled: boolean = false;
  updateEnabled: boolean = false;
  deleteEnabled: boolean = false;
  currentLoggedUser: any;


  constructor() {
    this.form = this.formBuilder.group({
      searchQuery: new FormControl(''),
      vehicleId: new FormControl(''),
      vehicleNumber: new FormControl('', Validators.required),
      ownerName: new FormControl('', Validators.required),
      driverName: new FormControl('', Validators.required),
      permitNo: new FormControl(''),
      licenceNo: new FormControl(''),
      vehicleType: new FormControl('', Validators.required),
      vehicleExpAcNo: new FormControl('')
    });

    this.ownerForm = this.formBuilder.group({
      ownerId: new FormControl(''),
      startReading: new FormControl('', Validators.required),
      oilServiceDate: new FormControl(''),
      oilServiceKm: new FormControl(''),
      oilServiceTargetKm: new FormControl(''),
      greasePackingDate: new FormControl(''),
      greasePackingKm: new FormControl(''),
      greasePackingTargetKm: new FormControl(''),
      insuranceDate: new FormControl(''),
      insuranceFrom: new FormControl(''),
      insuranceTo: new FormControl(''),
      insuranceNextDate: new FormControl(''),
      rtoTaxDate: new FormControl(''),
      rtoTaxFrom: new FormControl(''),
      rtoTaxTo: new FormControl(''),
      rtoTaxNextDate: new FormControl(''),
      fitnessDate: new FormControl(''),
      fitnessFrom: new FormControl(''),
      fitnessTo: new FormControl(''),
      fitnessNextDate: new FormControl(''),
      permitDate: new FormControl(''),
      permitFrom: new FormControl(''),
      permitTo: new FormControl(''),
      permitNextDate: new FormControl(''),
      vehicle: this.formBuilder.group({
        vehicleId: new FormControl('', Validators.required),
      })
    });
  }


  ngOnInit(): void {
    this.isVehicleFound = false;
    this.apiService.getAllVehicles().subscribe(res => {
      this.vehicles = res;
    }, err=>{
      $.toast({
        heading: 'Invalid Information!!',
        text: 'Please check your data or Re-Login to system. ' + err.error,
        showHideTransition: 'fade',
        icon: 'error',
        position: 'bottom-right',
        bgColor: '#a41515',
        loader: false,
      });
      this.storageService.logout();
    });

    this.apiService.getLatestVehicleId().subscribe(res => {
      this.latestVehicleId = res;
      this.form.get('vehicleId')?.setValue(this.latestVehicleId.newVehicleId || "Loading..");
      this.vehicleViewId.nativeElement.textContent = this.latestVehicleId.newVehicleId;
    }, err => {
      $.toast({
        heading: 'Invalid Information!!',
        text: 'Please check your data or Re-Login to system. ' + err.error,
        showHideTransition: 'fade',
        icon: 'error',
        position: 'bottom-right',
        bgColor: '#a41515',
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
        if(p.userPermission == 'vehicle-registration'){
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

  formSubmit() {
    if (!this.form.invalid) {
      this.apiService.addVehicle(this.form.value).subscribe(res => {
        if (res) {
          this.clearFields();
          $.toast({
            heading: 'New Vehicle Record Added!',
            text: 'You have added new vehicle information.',
            showHideTransition: 'fade',
            icon: 'success',
            position: 'bottom-right',
            bgColor: '#1f592c',
            loader: false,
          });
        }
      }, err => {
        $.toast({
          heading: 'Invalid Information!!',
          text: 'Please check your data or Re-Login to system. ' + err,
          showHideTransition: 'fade',
          icon: 'error',
          position: 'bottom-right',
          bgColor: '#a41515',
          loader: false,
        });
        this.storageService.logout();
      });
    }
  }

  updateVehicle() {
    if (this.form.get('vehicleId')?.value) {
      this.apiService.updateVehicle(this.form.value).subscribe(res => {
        if (res) {
          this.clearFields();
          $.toast({
            heading: 'Vehicle Record Updated!',
            text: 'You have updated vehicle information.',
            showHideTransition: 'fade',
            icon: 'success',
            position: 'bottom-right',
            bgColor: '#1f592c',
            loader: false,
          });
        }
      }, err => {
        $.toast({
          heading: 'Invalid Information!!',
          text: 'Please check your data or Re-Login to system. ' + err,
          showHideTransition: 'fade',
          icon: 'error',
          position: 'bottom-right',
          bgColor: '#a41515',
          loader: false,
        });
        console.log(err);
      });
    }
  }

  deleteVehicle() {
    let vehicleNo = this.form.get('vehicleId')?.value;
    if(vehicleNo){
      this.apiService.deleteVehicle(vehicleNo).subscribe(res=>{
        this.clearFields();
        $.toast({
          heading: 'Deleted Vehicle Record!',
          text: 'You have deleted the vehicle.',
          showHideTransition: 'fade',
          icon: 'success',
          position: 'bottom-right',
          bgColor: '#1f592c',
          loader: false,
        });
      }, err=>{
        $.toast({
          heading: 'Invalid Information!!',
          text: 'Please check your data or Re-Login to system. ' + err,
          showHideTransition: 'fade',
          icon: 'error',
          position: 'bottom-right',
          bgColor: '#a41515',
          loader: false,
        });
        this.storageService.logout();
      })
    } else {
      $.toast({
        heading: 'Invalid Vehicle Information!!',
        text: 'Please search vehicle before delete!!',
        showHideTransition: 'fade',
        icon: 'info',
        position: 'bottom-right',
        bgColor: '#224aad',
        loader: false,
      });
    }
  }

  // ---- Owner Operations ----------

  registerOwner(){
    if(!this.ownerForm.invalid){
      this.apiService.addVehicleOwner(this.ownerForm.value).subscribe(res=>{
        this.clearFields();
        this.closeOwnerModal();
        $.toast({
          heading: 'Owner Details Added',
          text: 'You have recently added new owner details!!',
          showHideTransition: 'fade',
          icon: 'success',
          position: 'bottom-right',
          bgColor: '#198d1a',
          loader: false,
        });
      }, err=>{
        console.log(err)
        $.toast({
          heading: 'Invalid Information!!',
          text: 'Please check your data or Re-Login to system. ' + err,
          showHideTransition: 'fade',
          icon: 'error',
          position: 'bottom-right',
          bgColor: '#a41515',
          loader: false,
        });
      })
    }
  }

  updateOwnerDetails(){
    if(!this.ownerForm.invalid){
      this.apiService.updateVehicleOwner(this.ownerForm.value).subscribe(res=>{
        this.clearFields();
        this.closeOwnerModal();
        $.toast({
          heading: 'Owner Details Updated',
          text: 'You have recently updated new owner details!!',
          showHideTransition: 'fade',
          icon: 'info',
          position: 'bottom-right',
          bgColor: '#3883d3',
          loader: false,
        });
      }, err=>{
        $.toast({
          heading: 'Invalid Information!!',
          text: 'Please check your data or Re-Login to system. ' + err.error,
          showHideTransition: 'fade',
          icon: 'error',
          position: 'bottom-right',
          bgColor: '#a41515',
          loader: false,
        });
      })
    }
  }

  deleteOwnerDetails(){
    if(this.vehicleId){
      this.apiService.deleteVehicleOwner(this.vehicleId).subscribe(res=>{
        this.clearFields();
        this.closeOwnerModal();
        $.toast({
          heading: 'Owner Details Deleted',
          text: 'You have recently deleted new owner details!!',
          showHideTransition: 'fade',
          icon: 'success',
          position: 'bottom-right',
          bgColor: '#198d1a',
          loader: false,
        });
      }, err=>{
        $.toast({
          heading: 'Invalid Information!!',
          text: 'Please check your data or Re-Login to system. ' + err.error,
          showHideTransition: 'fade',
          icon: 'error',
          position: 'bottom-right',
          bgColor: '#a41515',
          loader: false,
        });
      });
    }
  }

  // ---- Owner Operations ----------


  closeOwnerModal(){
    this.isModalOpen2 = false;
    this.form.reset();
    this.ownerForm.reset();
    this.ngOnInit();
  }

  openModal(){
    this.isModalOpen2 = true;
    this.apiService.getVehicleOwnerDetailsByVehicleId(this.vehicleId).subscribe(res=>{
      this.ownerDetails = res;
      if(this.ownerDetails){
        this.ownerForm.patchValue({
          ownerId: this.ownerDetails.ownerId || 0,
          startReading: this.ownerDetails.startReading,
          oilServiceDate: this.ownerDetails.oilServiceDate,
          oilServiceKm: this.ownerDetails.oilServiceKm,
          oilServiceTargetKm: this.ownerDetails.oilServiceTargetKm,
          greasePackingDate: this.ownerDetails.greasePackingDate,
          greasePackingKm: this.ownerDetails.greasePackingKm,
          greasePackingTargetKm: this.ownerDetails.greasePackingTargetKm,
          insuranceDate: this.ownerDetails.insuranceDate,
          insuranceFrom: this.ownerDetails.insuranceFrom,
          insuranceTo: this.ownerDetails.insuranceTo,
          insuranceNextDate: this.ownerDetails.insuranceNextDate,
          rtoTaxDate: this.ownerDetails.rtoTaxDate,
          rtoTaxFrom: this.ownerDetails.rtoTaxFrom,
          rtoTaxTo: this.ownerDetails.rtoTaxTo,
          rtoTaxNextDate: this.ownerDetails.rtoTaxNextDate,
          fitnessDate: this.ownerDetails.fitnessDate,
          fitnessFrom: this.ownerDetails.fitnessFrom,
          fitnessTo: this.ownerDetails.fitnessTo,
          fitnessNextDate: this.ownerDetails.fitnessNextDate,
          permitDate: this.ownerDetails.permitDate,
          permitFrom:this.ownerDetails.permitFrom,
          permitTo: this.ownerDetails.permitTo,
          permitNextDate: this.ownerDetails.permitNextDate,
        });
      }else{
        this.isNewOwnerDetails = true;
      }
    });
  }


  clearFields() {
    this.form.reset();
    this.ownerForm.reset();
    this.ngOnInit();
  }


  onVehicleSearch() {
    const searchQuery = (this.form.get('searchQuery')?.value || '')
      .toString()
      .trim()
      .toLowerCase();
    this.filteredData = this.vehicles.filter(
      (v) =>
        v.vehicleId.toLowerCase().includes(searchQuery) ||
        v.vehicleNumber.toLowerCase().includes(searchQuery) ||
        v.ownerName.toLowerCase().includes(searchQuery) ||
        v.driverName.toLowerCase().includes(searchQuery)
    );
    this.isModalOpen = searchQuery.length > 0 && this.filteredData.length > 0;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedItem = null; // Clear the selected item when closing the modal
  }

  selectRow(item: any) {
    this.selectedItem = item;
    this.confirmSelection();
  }

  confirmSelection() {
    if (this.selectedItem) {
      this.vehicleNo = this.selectedItem.vehicleNumber;
      this.vehicleId = this.selectedItem.vehicleId;
      this.ownerForm.patchValue({
        vehicle: {
          vehicleId: this.selectedItem.vehicleId,
        }
      })
      this.form.patchValue({
        vehicleId: this.selectedItem.vehicleId,
        vehicleNumber: this.selectedItem.vehicleNumber,
        ownerName: this.selectedItem.ownerName,
        driverName: this.selectedItem.driverName,
        permitNo: this.selectedItem.permitNo,
        licenceNo: this.selectedItem.licenceNo,
        vehicleType: this.selectedItem.vehicleType,
        vehicleExpAcNo: this.selectedItem.vehicleExpAcNo
      });
      this.closeModal();
      this.form.get('searchQuery')?.reset();
      this.isVehicleFound = true;
    } else {
      alert('No item selected!');
    }
  }
}

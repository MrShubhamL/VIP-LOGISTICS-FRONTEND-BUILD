import {Component, OnInit, inject, ViewChild, ElementRef} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ApiService} from '../services/api/api.service';
import {StorageService} from '../services/storage/storage.service';

declare var $: any;

@Component({
  selector: 'app-item',
  standalone: false,
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'], // Fixed to `styleUrls`
})
export class ItemComponent implements OnInit {
  @ViewChild('routeNameInput') routeNameInput!: ElementRef;
  @ViewChild('partyNameInput') partyNameInput!: ElementRef;
  @ViewChild('ItemNo') ItemNo!: ElementRef;

  form!: FormGroup;
  latestItemNo: any;
  private formBuilder = inject(FormBuilder);
  private apiService = inject(ApiService);
  private storageService = inject(StorageService);

  isModalOpen: boolean = false;
  selectedItem: any = null;

  isModalOpen2: boolean = false;
  selectedItem2: any = null;

  isModalOpen3: boolean = false;
  selectedItem3: any = null;

  // Sample data for the table
  data: any[] = [];
  partyData: any[] = [];
  itemData: any[] = [];

  filteredData = [...this.data];
  filteredPartyData = [...this.partyData];
  filteredItemData = [...this.itemData];

  readEnabled: boolean = false;
  writeEnabled: boolean = false;
  updateEnabled: boolean = false;
  deleteEnabled: boolean = false;
  currentLoggedUser: any;

  constructor() {
    this.form = this.formBuilder.group({
      itemSearchQuery: new FormControl(''),
      itemNo: new FormControl(''),
      route: this.formBuilder.group({
        routeNo: new FormControl('', Validators.required),
      }),
      party: this.formBuilder.group({
        partyNo: new FormControl('', Validators.required),
      }),
      itemName: new FormControl('', Validators.required),
      partNo: new FormControl(''),
      qtyInBox: new FormControl(''),
      weightPerBox: new FormControl(''),
      rateOnBox: new FormControl(''),
      rateOnWeight: new FormControl(''),
      pu: new FormControl('Engine'),
      vendorCode: new FormControl(''),
    });
  }

  ngOnInit() {
    this.apiService.getLatestItemNo().subscribe(res => {
      this.latestItemNo = res.newItemNo;
      this.ItemNo.nativeElement.textContent = res.newItemNo;

    }, err => {
      $.toast({
        heading: 'Invalid Latest Item No!',
        text: 'Please login again!' + err,
        showHideTransition: 'fade',
        icon: 'error',
        position: 'bottom-right',
        bgColor: '#9e1616',
        loader: false,
      });
    });

    this.apiService.getAllRoutes().subscribe(res => {
      this.data = res;
    }, err => {
      $.toast({
        heading: 'Invalid Information!',
        text: 'Please login again!',
        showHideTransition: 'fade',
        icon: 'error',
        position: 'bottom-right',
        bgColor: '#9e1616',
        loader: false,
      });
      this.storageService.logout();
    });

    this.apiService.getAllParties().subscribe(res => {
      this.partyData = res;
    }, err => {
      $.toast({
        heading: 'Invalid Information!',
        text: 'Please login again!',
        showHideTransition: 'fade',
        icon: 'error',
        position: 'bottom-right',
        bgColor: '#9e1616',
        loader: false,
      });
    });

    this.apiService.getAllItems().subscribe(res => {
      this.itemData = res;
    }, err => {
      console.log(err);
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
        if(p.userPermission == 'item-records'){
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

  onSearch() {
    const query = (this.form.get('route.routeNo')?.value || '').toString().trim().toLowerCase();
    this.filteredData = this.data.filter(
      (route) =>
        route.routeNo.toLowerCase().includes(query) ||
        route.routeName.toLowerCase().includes(query)
    );
    this.isModalOpen = query.length > 0 && this.filteredData.length > 0;
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
      // Set the value of Route Name via ViewChild
      this.routeNameInput.nativeElement.value = this.selectedItem.routeName;
      // Optionally, update the form control
      this.form.patchValue({
        route: {
          routeNo: this.selectedItem.routeNo,
        },
      });
      this.closeModal();
    } else {
      alert('No item selected!');
    }
  }


  onPartySearch() {
    const query2 = (this.form.get('party.partyNo')?.value || '').toString().trim().toLowerCase();
    this.filteredPartyData = this.partyData.filter(
      (p) =>
        p.partyNo.toLowerCase().includes(query2) ||
        p.partyName.toLowerCase().includes(query2)
    );
    this.isModalOpen2 = query2.length > 0 && this.filteredPartyData.length > 0;
  }

  closePartyModal() {
    this.isModalOpen2 = false;
    this.selectedItem2 = null; // Clear the selected item when closing the modal
  }

  selectRow2(item: any) {
    this.selectedItem2 = item;
    this.confirmSelection2();
  }

  confirmSelection2() {
    if (this.selectedItem2) {
      // Set the value of Route Name via ViewChild
      this.partyNameInput.nativeElement.value = this.selectedItem2.partyName;
      // Optionally, update the form control
      this.form.patchValue({
        party: {
          partyNo: this.selectedItem2.partyNo,
        }
      });
      this.closePartyModal();
    } else {
      alert('No item selected!');
    }
  }


  formSubmit() {
    if (this.form.valid) {
      this.apiService.addItem(this.form.value).subscribe(res => {
        $.toast({
          heading: 'Item Information Added',
          text: 'You have recently added new Item!',
          showHideTransition: 'fade',
          icon: 'success',
          position: 'bottom-right',
          bgColor: '#08651e',
          loader: false,
        });
        this.cancel();
      }, err => {
        $.toast({
          heading: 'Invalid Information!',
          text: 'Please check your data or re-login!!',
          showHideTransition: 'fade',
          icon: 'error',
          position: 'bottom-right',
          bgColor: '#9e1616',
          loader: false,
        });
        console.log(err)
        // this.storageService.logout();
      });
    } else {
      $.toast({
        heading: 'Invalid Information!',
        text: 'Please check your data! All fields are required!!',
        showHideTransition: 'fade',
        icon: 'info',
        position: 'bottom-right',
        bgColor: '#1a64a4',
        loader: false,
      });
    }
  }

  editItemData() {
    if(!this.form.invalid){
      this.apiService.updateItem(this.form.value).subscribe({
        next: (res) => {
          this.cancel();
          $.toast({
            heading: 'Item Information Updated',
            text: 'You have recently updated the Item!',
            showHideTransition: 'fade',
            icon: 'success',
            position: 'bottom-right',
            bgColor: '#08651e',
            loader: false,
          });
        },
        error: (err) => {
          $.toast({
            heading: 'Invalid Information!',
            text: 'Please check your data or re-login!! ' + err,
            showHideTransition: 'fade',
            icon: 'error',
            position: 'bottom-right',
            bgColor: '#9e1616',
            loader: false,
          });
          this.storageService.logout();
        }
      });
    }
  }

  deleteItem(){
    let itemID = this.form.get('itemNo')?.value;
    if(itemID){
      this.apiService.deleteItem(itemID).subscribe({
        next: (res) => {
          this.cancel();
          $.toast({
            heading: 'Item Information Deleted',
            text: 'You have recently deleted the Item!',
            showHideTransition: 'fade',
            icon: 'success',
            position: 'bottom-right',
            bgColor: '#08651e',
            loader: false,
          });
        },
        error: (err) => {
          $.toast({
            heading: 'Invalid Information!',
            text: 'Please check your data or re-login!! ' + err,
            showHideTransition: 'fade',
            icon: 'error',
            position: 'bottom-right',
            bgColor: '#9e1616',
            loader: false,
          });
          this.storageService.logout();
        }
      });
    }else {
      $.toast({
        heading: 'Invalid Information!',
        text: 'Please search item before delete!! ',
        showHideTransition: 'fade',
        icon: 'info',
        position: 'bottom-right',
        bgColor: '#2960a2',
        loader: false,
      });
    }
  }

  searchItem(event: KeyboardEvent) {
    console.log('Key pressed:', event.key);
    // Optionally handle the search input dynamically based on keyboard input
  }

  cancel() {
    this.ngOnInit();
    this.form.reset();
    this.form.get('pu')?.setValue("Engine");
    this.ItemNo.nativeElement.textContent = this.latestItemNo;
    this.routeNameInput.nativeElement.value = "";
    this.partyNameInput.nativeElement.value = "";
  }

  // ---------------------- Item Query Search ----------------------

  onItemSearch() {
    const query3 = (this.form.get('itemSearchQuery')?.value || '')
      .toString()
      .trim()
      .toLowerCase();
    this.filteredItemData = this.itemData.filter(
      (i) =>
        i.itemNo.toLowerCase().includes(query3) ||
        i.itemName.toLowerCase().includes(query3) ||
        i.partNo.toLowerCase().includes(query3)
    );
    this.isModalOpen3 = query3.length > 0 && this.filteredItemData.length > 0;
  }

  closeItemModal() {
    this.isModalOpen3 = false;
    this.selectedItem3 = null; // Clear the selected item when closing the modal
  }

  selectItemRow(item: any) {
    this.selectedItem3 = item;
    this.confirmItemSelection();
  }

  confirmItemSelection() {
    if (this.selectedItem3) {
      this.ItemNo.nativeElement.textContent = this.selectedItem3.itemNo;
      this.partyNameInput.nativeElement.value = this.selectedItem3.party.partyName;
      this.routeNameInput.nativeElement.value = this.selectedItem3.route.routeName;
      this.form.patchValue({
        route: {
          routeNo: this.selectedItem3.route.routeNo,
        },
        itemNo: this.selectedItem3.itemNo,
        party: {
          partyNo: this.selectedItem3.party.partyNo,
        },
        itemName: this.selectedItem3.itemName,
        partNo: this.selectedItem3.partNo,
        qtyInBox: this.selectedItem3.qtyInBox,
        weightPerBox: this.selectedItem3.weightPerBox,
        rateOnBox: this.selectedItem3.rateOnBox,
        rateOnWeight: this.selectedItem3.rateOnWeight,
        pu: this.selectedItem3.pu,
        vendorCode: this.selectedItem3.vendorCode,
      });
      this.closeItemModal();
      this.form.get('itemSearchQuery')?.reset();
    } else {
      alert('No item selected!');
    }
  }


}

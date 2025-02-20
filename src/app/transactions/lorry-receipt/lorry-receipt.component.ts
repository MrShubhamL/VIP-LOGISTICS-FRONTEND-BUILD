import {Component, ElementRef, inject, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ApiService} from '../../services/api/api.service';
import {StorageService} from '../../services/storage/storage.service';
import {WebSocketService} from '../../services/api/web-socket.service';
import * as Mammoth from 'mammoth';
import {MatTableDataSource} from '@angular/material/table';

declare var $: any;

@Component({
  selector: 'app-lorry-receipt',
  standalone: false,
  templateUrl: './lorry-receipt.component.html',
  styleUrls: ['./lorry-receipt.component.scss']
})
export class LorryReceiptComponent {
  @ViewChild('memoNo') memoNoInput!: ElementRef;
  @ViewChild('lrNo') lrNoInput!: ElementRef;
  @ViewChild('itemListSection') itemListSection!: ElementRef;
  @ViewChild('topViewSection') topViewSection!: ElementRef;

  form!: FormGroup;
  printForm!: FormGroup;
  latestLorryNo: any;
  printData: any;
  printLrData: any;
  lastMemoNo: any;
  formPatchObj: any;
  printFor: any;
  memoExistInfo: any;

  invoice_nos: any[] = [];
  total_pkg: number = 0;

  printTypes: string[] = [
    "Consignee Copy",
    "Consignor Copy",
  ]
  isMemoFound: boolean = false;
  isLrFound: boolean = false;
  isPrintButtonDisabled: boolean = true;
  itemSearchQuery: any = '';
  total_amount: number = 0;
  total_charges_amount: number = 0;
  st_charges: number = 0;
  currentRole: any = '';
  listItemData: any[] = [];
  listChargesData: any[] = [];
  listVehicleData: any[] = [];
  memoData: any[] = [];
  isMemoLocked: boolean = false;

  // ----- ITEM SEARCH -----
  filteredItemData: any[] = [];
  itemData: any[] = [];
  isModalOpen: boolean = false;
  selectedItem: any = null;


  // ------ BRANCH SEARCH -------
  filteredBranchData: any[] = [];
  branchData: any[] = [];
  isBranchModalOpen: boolean = false;
  selectedBranchItem: any = null;

  // ------ ROUTE SEARCH -------
  filteredRouteData: any[] = [];
  routeData: any[] = [];
  isRouteModalOpen: boolean = false;
  selectedRouteItem: any = null;

  // ------ PARTY SEARCH -------
  filteredPartyData: any[] = [];
  partyData: any[] = [];
  isPartyModalOpen: boolean = false;
  selectedPartyItem: any = null;

  // ------ PARTY SEARCH -------
  filteredPartyData2: any[] = [];
  partyData2: any[] = [];
  isPartyModalOpen2: boolean = false;
  selectedPartyItem2: any = null;

  // ------ VENDOR SEARCH -------
  filteredLrData: any[] = [];
  LrData: any[] = [];
  isLrModalOpen: boolean = false;
  selectedLrItem: any = null;

  // ------ VEHICLE SEARCH -------
  filteredVehicleData: any[] = [];
  vehicleData: any[] = [];
  isVehicleModalOpen: boolean = false;
  selectedVehicleItem: any = null;


  readEnabled: boolean = false;
  writeEnabled: boolean = false;
  updateEnabled: boolean = false;
  deleteEnabled: boolean = false;
  currentLoggedUser: any;


  formBuilder = inject(FormBuilder);
  apiService = inject(ApiService);
  storageService = inject(StorageService);
  webSocketService = inject(WebSocketService);

  placeholders = {
    latestLorryNo: '',
    latestMemoNo: ''
  }
  temp_amount: number = 0.00;


  constructor() {
    this.form = this.formBuilder.group({
      lrId: new FormControl(""),
      lrNo: new FormControl("", Validators.required),
      lrSearchQuery: new FormControl(""),
      branch: this.formBuilder.group({
        branchNo: new FormControl("", Validators.required),
        branchName: new FormControl(""),
      }),
      route: this.formBuilder.group({
        routeNo: new FormControl("", Validators.required),
        routeName: new FormControl(""),
        gstType: new FormControl(""),
      }),
      consignor: this.formBuilder.group({
        partyNo: new FormControl("", Validators.required),
        partyName: new FormControl(""),
      }),
      consignee: this.formBuilder.group({
        partyNo: new FormControl("", Validators.required),
        partyName: new FormControl(""),
      }),
      remark: new FormControl(""),
      whoItemList: new FormControl(""),
      octBill: new FormControl(""),
      lrDate: new FormControl(""),
      toPay: new FormControl(""),
      whoPay: new FormControl(""),
      octroiPay: new FormControl(""),
      refTruckNo: new FormControl(""),
      lorryReceiptItems: this.formBuilder.group({
        lorryReceiptItemId: new FormControl(''),
        chalanId: new FormControl(""),
        chalanNo: new FormControl(""),
        chalanDate: new FormControl(""),
        valueOnChalan: new FormControl(""),
        packType: new FormControl("select"),
        asnNo: new FormControl(""),
        valueRs: new FormControl(0.00),

        cgst: new FormControl(""),
        sgst: new FormControl(""),
        igst: new FormControl(""),
        totalFreight: new FormControl(""),

        item: this.formBuilder.group({
          itemNo: new FormControl(""),
          itemName: new FormControl(""),
          itemDate: new FormControl(""),
          partNo: new FormControl(""),
          qtyInBox: new FormControl(""),
          weightPerBox: new FormControl(""),
          rateOnBox: new FormControl(""),
          rateOnWeight: new FormControl(""),
          pu: new FormControl(""),
          vendorCode: new FormControl(""),
        }),
        quantity: new FormControl(""),
        lcvFtl: new FormControl(""),
        calcOn: new FormControl("WEIGHT"),
        totalWeight: new FormControl(""),
        amount: new FormControl(""),
      }),
      extraCharges: this.formBuilder.group({
        extraChargesId: new FormControl(""),
        chargesHeads: new FormControl("selected"),
        chargesAmount: new FormControl(""),
      }),
      memo: this.formBuilder.group({
        memoId: new FormControl(""),
        memoNo: new FormControl("", Validators.required),
        memoDate: new FormControl(""),
        memoStatus: true
      }),

      bill: this.formBuilder.group({
        billId: new FormControl(""),
        billNo: new FormControl(""),
        billDate: new FormControl(""),
        unloadDate: new FormControl(""),
      }),

      grandTotal: new FormControl(""),
      deliveryAt: new FormControl(""),
      lrNote: new FormControl(""),
      stCharges: new FormControl(0.00),
      lrStatus: true
    });


    this.printForm = this.formBuilder.group({
      lrNo: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      party: this.formBuilder.group({
        partyCode: new FormControl(''),
        partyName: new FormControl(''),
      }),
      printType: new FormControl(''),
      driverPrint: new FormControl(''),
    });
  }

  ngOnInit() {
    this.form.get('lrNo')?.disable();
    this.currentRole = this.storageService.getUserRole();

    // All Item Data
    this.apiService.getAllItems().subscribe(res => {
      this.itemData = res;
    }, err => {
      console.log(err);
    });

    // All Branch Data
    this.apiService.getBranches().subscribe(res => {
      if (res) {
        this.branchData = res;
      }
    }, error => {
      console.log(error)
    });

    // All Route Data
    this.apiService.getAllRoutes().subscribe(res => {
      if (res) {
        this.routeData = res;
      }
    }, error => {
      console.log(error)
    });

    // All Party Data
    this.apiService.getAllParties().subscribe(res => {
      if (res) {
        this.partyData = res;
        this.partyData2 = res;
      }
    }, error => {
      console.log(error)
    });

    this.apiService.getLatestLorryNo().subscribe(res => {
      if (res) {
        this.latestLorryNo = res;
        this.placeholders.latestLorryNo = this.latestLorryNo.newLrNo;
      }
    }, error => {
      console.log(error)
    });

    this.apiService.getLatestMemoNo().subscribe(res => {
      if (res) {
        this.lastMemoNo = res;
        this.placeholders.latestMemoNo = this.lastMemoNo.lastMemoNo;
      }
    }, error => {
      console.log(error)
    });

    this.apiService.getAllVehicles().subscribe(res => {
      if (res) {
        this.listVehicleData = res;
      }
    }, err => {
      console.log(err)
    });

    this.apiService.getAllLorries().subscribe(res => {
      if (res) {
        this.LrData = res;
      }
    }, err => {
      console.log(err)
    });

    this.storageService.getCurrentUser().subscribe(res => {
      this.currentLoggedUser = res;
      this.currentLoggedUser.roleDto.permissions.map((p: any) => {
        if (p.userPermission == 'ALL_PERMISSIONS') {
          this.readEnabled = true;
          this.writeEnabled = true;
          this.updateEnabled = true;
          this.deleteEnabled = true;
          return;
        }
        if (p.userPermission == 'lorry-receipt') {
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
      this.storageService.logout();
    });

  }

  ngAfterViewInit() {
    this.memoNoInput.nativeElement.focus();
  }

  addCharges() {
    const totalChargesAmount = this.form.get('extraCharges.chargesAmount')?.value;
    this.total_charges_amount += totalChargesAmount;
    const extraCharges = {
      extraChargesId: this.form.get('extraCharges.extraChargesId')?.value,
      chargesHeads: this.form.get('extraCharges.chargesHeads')?.value,
      chargesAmount: this.form.get('extraCharges.chargesAmount')?.value,
    };
    this.listChargesData.push(extraCharges);
    this.resetChargesArray();
    this.calculateGST();
  }

  removeListCharges(index: number) {
    if (index > -1 && index < this.listChargesData.length) {
      const removedAmount = this.listChargesData[index].chargesAmount;
      this.total_charges_amount -= removedAmount;
      this.listChargesData.splice(index, 1);
      this.calculateGST();
    }
  }

  resetForm() {
    this.topViewSection.nativeElement.scrollIntoView({behavior: 'smooth', block: 'start'});
    this.form.reset();
    this.ngOnInit();
    this.form.get('item.itemNo')?.enable()
    this.form.get('branch.branchNo')?.enable()
    this.form.get('route.routeNo')?.enable()
    this.form.get('party.partyNo')?.enable()
    this.form.get("memo.memoNo")?.enable();
    this.form.get('lrNo')?.enable();
    this.form.get('branch')?.enable();
    this.form.get('route')?.enable();
    this.form.get('consignor')?.enable();
    this.form.get('consignee')?.enable();
    this.form.get('refTruckNo')?.enable();
    this.form.get('lorryReceiptItems.calcOn')?.setValue('WEIGHT');
    this.form.get('lorryReceiptItems.packType')?.setValue('select');
    this.form.get('extraCharges.chargesHeads')?.setValue('selected');
    this.form.get('lorryReceiptItems.valueRs')?.setValue(0.00);
    this.form.get('stCharges')?.setValue(0.00);
    this.listItemData = [];
    this.listChargesData = [];
    this.total_amount = 0.0;
    this.total_charges_amount = 0.0;
    this.isMemoFound = false;
    this.isLrFound = false;
    this.isMemoLocked = false;
    this.form.enable();
  }

  addItems() {
    let route = this.form.get('route.routeNo')?.value;
    if (route) {
      let itemNo = this.form.get('lorryReceiptItems.item.itemNo')?.value;
      let chalanNo = this.form.get('lorryReceiptItems.chalanNo')?.value;

      // Check if the item already exists in the list
      let isDuplicate = this.listItemData.some(item => item.item.itemNo === itemNo && item.chalanNo === chalanNo);

      if (isDuplicate) {
        $.toast({
          heading: 'Duplicate Item!',
          text: 'This item is already added to the list!',
          showHideTransition: 'fade',
          icon: 'warning',
          position: 'bottom-right',
          bgColor: '#ff9800',
          loader: false,
        });
        return;
      }

      let totalCalWeight = (this.form.get('lorryReceiptItems.quantity')?.value) * (this.form.get('lorryReceiptItems.item.weightPerBox')?.value);
      let totalCalAmount = totalCalWeight * (this.form.get('lorryReceiptItems.item.rateOnWeight')?.value);
      let calOn = this.form.get('lorryReceiptItems.calcOn')?.value;

      if (calOn !== 'WEIGHT') {
        totalCalAmount = 0.00;
      }

      this.total_amount += totalCalAmount;
      this.temp_amount = totalCalAmount;

      this.tempCalculateGST();

      // Create new item object
      const items = {
        lorryReceiptItemId: this.form.get('lorryReceiptItems.lorryReceiptItemId')?.value,
        chalanNo: chalanNo,
        chalanDate: this.form.get('lorryReceiptItems.chalanDate')?.value,
        valueOnChalan: this.form.get('lorryReceiptItems.valueOnChalan')?.value,
        asnNo: this.form.get('lorryReceiptItems.asnNo')?.value,
        packType: this.form.get('lorryReceiptItems.packType')?.value,
        valueRs: this.form.get('lorryReceiptItems.valueRs')?.value,

        cgst: this.form.get('lorryReceiptItems.cgst')?.value,
        sgst: this.form.get('lorryReceiptItems.sgst')?.value,
        igst: this.form.get('lorryReceiptItems.igst')?.value,
        totalFreight: this.form.get('lorryReceiptItems.totalFreight')?.value,

        item: {
          itemNo: itemNo,
          itemName: this.form.get('lorryReceiptItems.item.itemName')?.value,
          weightPerBox: this.form.get('lorryReceiptItems.item.weightPerBox')?.value,
          qtyInBox: this.form.get('lorryReceiptItems.item.qtyInBox')?.value,
          rateOnWeight: this.form.get('lorryReceiptItems.item.rateOnWeight')?.value,
          rateOnBox: this.form.get('lorryReceiptItems.item.rateOnBox')?.value
        },
        quantity: this.form.get('lorryReceiptItems.quantity')?.value,
        lcvFtl: this.form.get('lorryReceiptItems.lcvFtl')?.value,
        calcOn: calOn,
        totalWeight: totalCalWeight,
        amount: totalCalAmount
      };

      this.listItemData.push(items);
      this.resetItemArray(); // Reset form fields

      // Calculate GST only if the item is newly added
      this.calculateGST();

    } else {
      $.toast({
        heading: 'Invalid Route Details!',
        text: 'Please select a route before adding items!',
        showHideTransition: 'fade',
        icon: 'info',
        position: 'bottom-right',
        bgColor: '#3152be',
        loader: false,
      });
    }
  }


  transformToUppercase(event: any) {
    event.target.value = event.target.value.toUpperCase();
  }

  recalculateGST(event: any) {
    this.total_amount = Number(event.target.value);
    this.calculateGST();
  }

  stChargeCalculation(event: any) {
    this.st_charges = Number(event);
    this.calculateGST();
  }

  tempCalculateGST() {
    const totalCalculatedAmount = Number(this.temp_amount).toFixed(2);

    let gstType = this.form.get("route.gstType")?.value;
    const cgst = 6; // 6%
    const sgst = 6; // 6%
    const igst = 12; // 12%

    let gstAmount = 0;
    let netAmount = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;

    if (gstType === 'in-state') {
      gstAmount = (Number(totalCalculatedAmount) * (cgst + sgst)) / 100;
      cgstAmount = Number(gstAmount) / 2;
      sgstAmount = Number(gstAmount) / 2;

      if (this.total_charges_amount == 0) {
        this.form.get('lorryReceiptItems.totalFreight')?.setValue(this.temp_amount.toFixed(2));
      } else {
        this.form.get('lorryReceiptItems.totalFreight')?.setValue(Number(totalCalculatedAmount).toFixed(2));
      }
      this.form.get('lorryReceiptItems.cgst')?.setValue(cgstAmount.toFixed(2));
      this.form.get('lorryReceiptItems.sgst')?.setValue(sgstAmount.toFixed(2));
      this.form.get('lorryReceiptItems.igst')?.setValue(0.00);
    } else if (gstType === 'out-state') {
      gstAmount = (Number(totalCalculatedAmount) * igst) / 100;

      if (this.total_charges_amount == 0) {
        this.form.get('lorryReceiptItems.totalFreight')?.setValue(this.temp_amount.toFixed(2));
      } else {
        this.form.get('lorryReceiptItems.totalFreight')?.setValue(Number(totalCalculatedAmount).toFixed(2));
      }
      this.form.get('lorryReceiptItems.cgst')?.setValue(0.00);
      this.form.get('lorryReceiptItems.sgst')?.setValue(0.00);
      this.form.get('lorryReceiptItems.igst')?.setValue(gstAmount.toFixed(2));
    }
  }

  calculateGST() {
    const totalCalculatedAmount = Number(this.total_amount + this.total_charges_amount + this.st_charges).toFixed(2);

    let gstType = this.form.get("route.gstType")?.value;
    const cgst = 6; // 6%
    const sgst = 6; // 6%
    const igst = 12; // 12%

    let gstAmount = 0;
    let netAmount = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;

    if (gstType === 'in-state') {
      gstAmount = (Number(totalCalculatedAmount) * (cgst + sgst)) / 100;
      cgstAmount = Number(gstAmount) / 2;
      sgstAmount = Number(gstAmount) / 2;
      netAmount = Number(totalCalculatedAmount) + gstAmount;

      // if (this.total_charges_amount == 0) {
      //   this.form.get('lorryReceiptItems.totalFreight')?.setValue(this.total_amount.toFixed(2));
      // } else {
      //   this.form.get('lorryReceiptItems.totalFreight')?.setValue(Number(totalCalculatedAmount).toFixed(2));
      // }
      // this.form.get('lorryReceiptItems.cgst')?.setValue(cgstAmount.toFixed(2));
      // this.form.get('lorryReceiptItems.sgst')?.setValue(sgstAmount.toFixed(2));
      // this.form.get('lorryReceiptItems.igst')?.setValue(0.00);
      this.form.get('grandTotal')?.setValue(netAmount.toFixed(2));
    } else if (gstType === 'out-state') {
      gstAmount = (Number(totalCalculatedAmount) * igst) / 100;
      netAmount = Number(totalCalculatedAmount) + gstAmount;

      // if (this.total_charges_amount == 0) {
      //   this.form.get('lorryReceiptItems.totalFreight')?.setValue(this.total_amount.toFixed(2));
      // } else {
      //   this.form.get('lorryReceiptItems.totalFreight')?.setValue(Number(totalCalculatedAmount).toFixed(2));
      // }
      // this.form.get('lorryReceiptItems.cgst')?.setValue(0.00);
      // this.form.get('lorryReceiptItems.sgst')?.setValue(0.00);
      // this.form.get('lorryReceiptItems.igst')?.setValue(gstAmount.toFixed(2));
      this.form.get('grandTotal')?.setValue(netAmount.toFixed(2));
    }

    // this.listItemData.push(items);
  }

  removeListItem(index: number) {
    if (index > -1 && index < this.listItemData.length) {
      const removedAmount = this.listItemData[index].amount;
      this.total_amount -= removedAmount;
      this.listItemData.splice(index, 1);
      this.calculateGST();
    }
  }

  resetItemArray() {
    this.form.get('lorryReceiptItems.chalanNo')?.reset();
    this.form.get('lorryReceiptItems.chalanDate')?.reset();
    this.form.get('lorryReceiptItems.item')?.reset();
    this.form.get('lorryReceiptItems.quantity')?.reset();
    this.form.get('lorryReceiptItems.lcvFtl')?.reset();
    this.form.get('lorryReceiptItems.calcOn')?.setValue('WEIGHT');
    this.form.get('lorryReceiptItems.asnNo')?.reset();
    this.form.get('lorryReceiptItems.packType')?.setValue('select');
    this.form.get('lorryReceiptItems.valueOnChalan')?.reset();
    this.form.get('lorryReceiptItems.valueRs')?.reset();
  }

  resetChargesArray() {
    this.form.get('extraCharges')?.reset();
  }

  searchItemByChalanNo(item: any) {

    this.form.patchValue({
      lorryReceiptItems: {
        chalanNo: item.chalanNo,
        chalanDate: item.chalanDate,
        valueOnChalan: item.valueOnChalan,
        packType: item.packType,
        asnNo: item.asnNo,
        valueRs: item.valueRs,
        item: {...this.form.get('lorryReceiptItems.item')?.value, ...item.item},
        quantity: item.quantity,
        calcOn: item.calcOn,
        lcvFtl: item.lcvFtl,
        cgst: item.cgst,
        sgst: item.sgst,
        igst: item.igst,
        totalFreight: item.totalFreight,
      }
    })

  }

  saveLr() {
    const formObj = {
      lrNo: this.form.get('lrNo')?.value,
      branch: {
        branchNo: this.form.get('branch.branchNo')?.value
      },
      route: {
        routeNo: this.form.get('route.routeNo')?.value,
      },
      consignor: {
        partyNo: this.form.get('consignor.partyNo')?.value
      },
      consignee: {
        partyNo: this.form.get('consignee.partyNo')?.value
      },
      remark: this.form.get('remark')?.value,
      whoItemList: this.form.get('whoItemList')?.value,
      octBill: this.form.get('octBill')?.value,
      lrDate: this.form.get('lrDate')?.value,
      whoPay: this.form.get('whoPay')?.value,
      octroiPay: this.form.get('octroiPay')?.value,
      refTruckNo: this.form.get('refTruckNo')?.value,
      lorryReceiptItems: this.listItemData,
      extraCharges: this.listChargesData,
      memo: {
        memoDate: this.form.get('memo.memoDate')?.value,
        memoNo: this.form.get('memo.memoNo')?.value,
      },
      bill: {
        billNo: this.form.get('bills.billNo')?.value,
        billDate: this.form.get('bills.billDate')?.value,
        unloadDate: this.form.get('unloadDate')?.value,
      },
      lrNote: this.form.get('lrNote')?.value,
      stCharges: this.form.get('stCharges')?.value,
      deliveryAt: this.form.get('deliveryAt')?.value,
      grandTotal: this.form.get('grandTotal')?.value,
      lrStatus: false
    }

    this.apiService.addLorryReceipt(formObj).subscribe(res => {
      if (res) {
        this.webSocketService.sendMessage('/app/sendMessage', "NEW LR REQUEST", "LR-CREATE-REQUEST");
        this.resetForm();
        $.toast({
          heading: 'Lorry Receipt Saved!!',
          text: 'You have successfully saved the LR.',
          showHideTransition: 'fade',
          icon: 'success',
          position: 'bottom-right',
          bgColor: '#41a918',
          loader: false,
        });
      }
    }, err => {
      console.log(err);
      $.toast({
        heading: 'Invalid Information!',
        text: 'Please re-login and try again!!' + err,
        showHideTransition: 'fade',
        icon: 'info',
        position: 'bottom-right',
        bgColor: '#1898a9',
        loader: false,
      });
    });
  }

  updateLr() {
    if (!this.form.invalid && this.form.get('lrId')?.value) {

      const formObj = {
        lrId: this.form.get('lrId')?.value,
        lrNo: this.form.get('lrNo')?.value,
        branch: {
          branchNo: this.form.get('branch.branchNo')?.value
        },
        route: {
          routeNo: this.form.get('route.routeNo')?.value,
        },
        consignor: {
          partyNo: this.form.get('consignor.partyNo')?.value
        },
        consignee: {
          partyNo: this.form.get('consignee.partyNo')?.value
        },
        remark: this.form.get('remark')?.value,
        whoItemList: this.form.get('whoItemList')?.value,
        octBill: this.form.get('octBill')?.value,
        lrDate: this.form.get('lrDate')?.value,
        whoPay: this.form.get('whoPay')?.value,
        octroiPay: this.form.get('octroiPay')?.value,
        refTruckNo: this.form.get('refTruckNo')?.value,
        lorryReceiptItems: this.listItemData,
        extraCharges: this.listChargesData,
        memo: {
          memoId: this.form.get('memo.memoId')?.value,
          memoNo: this.form.get('memo.memoNo')?.value,
          memoDate: this.form.get('memo.memoDate')?.value,
        },
        bill: {
          billNo: this.form.get('bills.billNo')?.value,
          billDate: this.form.get('bills.billDate')?.value,
          unloadDate: this.form.get('unloadDate')?.value,
        },
        lrNote: this.form.get('lrNote')?.value,
        stCharges: this.form.get('stCharges')?.value,
        deliveryAt: this.form.get('deliveryAt')?.value,
        grandTotal: this.form.get('grandTotal')?.value,
        lrStatus: false
      }

      this.apiService.updateLorryReceipt(formObj).subscribe(res => {
        if (res) {
          this.resetForm();
          $.toast({
            heading: 'Lorry Receipt Updated!!',
            text: 'You have successfully updated the LR.',
            showHideTransition: 'fade',
            icon: 'success',
            position: 'bottom-right',
            bgColor: '#41a918',
            loader: false,
          });
        }
      }, err => {
        console.log(err);
        $.toast({
          heading: 'Invalid Information!',
          text: 'Please re-login and try again!!' + err,
          showHideTransition: 'fade',
          icon: 'info',
          position: 'bottom-right',
          bgColor: '#1898a9',
          loader: false,
        });
      });
    }
  }


  deleteLr() {
    const lrId = this.form.get('lrId')?.value;
    if (lrId) {
      this.apiService.deleteLrReceipt(lrId).subscribe(res => {
        if (res) {
          this.resetForm();
          if (this.currentRole != 'SUPER_ADMIN') {
            let message = "LR Deleted!!,  Lorry Receipt is Deleted.";
            this.webSocketService.sendMessage('/app/sendMessage', message, 'LR-DELETED');
          }
          $.toast({
            heading: 'Lorry Receipt Deleted!',
            text: 'You have successfully deleted the LR.',
            showHideTransition: 'fade',
            icon: 'success',
            position: 'bottom-right',
            bgColor: '#41a918',
            loader: false,
          });
        }
      }, err => {
        $.toast({
          heading: 'Invalid Information!',
          text: 'Please re-login and try again!!' + err,
          showHideTransition: 'fade',
          icon: 'info',
          position: 'bottom-right',
          bgColor: '#1898a9',
          loader: false,
        });
      });
    }

  }

  isMemoExisted(event: any) {
    this.form.get('lrNo')?.enable();
    if (!event) {
      this.form.get('lrNo')?.disable();
    }
    const memoNo = event.target.value;
    this.apiService.isMemoExisted(memoNo).subscribe(res => {
      if (res) {
        this.memoExistInfo = res;
        this.isMemoFound = true;
        this.form.get("memo.memoNo")?.disable();
        this.lrNoInput.nativeElement.focus();

        this.form.patchValue({
          remark: this.memoExistInfo.remark,
          whoItemList: this.memoExistInfo.whoItemList,
          whoPay: this.memoExistInfo.whoPay,
          refTruckNo: this.memoExistInfo.refTruckNo,
        });

        this.form.get('remark')?.disable();
        this.form.get('whoItemList')?.disable();
        this.form.get('whoPay')?.disable();
        this.form.get('refTruckNo')?.disable();

        let _memoStatus: boolean = false;

        this.apiService.getLorryByMemoNo(this.form.get("memo.memoNo")?.value).subscribe(res => {
          this.memoData = res;
          this.memoData.map((m: any) => {
            _memoStatus = m.memo.memoStatus
          });
          if (_memoStatus) {
            this.isMemoLocked = true;
            this.form.disable();
            $.toast({
              heading: 'Memo Record is Locked!!',
              text: 'This memo is locked now! Please contact to admin!',
              showHideTransition: 'fade',
              icon: 'info',
              position: 'bottom-right',
              bgColor: '#a91824',
              loader: false,
            });
          } else {
            $.toast({
              heading: 'Memo Record Found!!',
              text: 'This memo is found in our record!!',
              showHideTransition: 'fade',
              icon: 'info',
              position: 'bottom-right',
              bgColor: '#1898a9',
              loader: false,
            });
          }
        }, err => {
          console.log(err);
        })
      }
    }, err => {
      console.log(err)
    })
  }

  isLrExist() {
    const lrNo = this.form.get('lrNo')?.value;
    const memoNo = this.form.get('memo.memoNo')?.value;
    this.apiService.getLorryByMemoAndLr(lrNo, memoNo).subscribe(res => {
      if (res) {
        this.itemListSection.nativeElement.scrollIntoView({behavior: 'smooth', block: 'start'});
        this.formPatchObj = res;
        this.form.patchValue({
          lrDate: this.formPatchObj.lrDate,
          // remark: this.formPatchObj.remark,
          // whoItemList: this.formPatchObj.whoItemList,
          branch: {
            branchNo: this.formPatchObj.branch.branchNo,
            branchName: this.formPatchObj.branch.branchName,
          },
          route: {
            routeNo: this.formPatchObj.route.routeNo,
            routeName: this.formPatchObj.route.routeName,
            gstType: this.formPatchObj.route.gstType,
          },
          consignor: {
            partyNo: this.formPatchObj.consignor.partyNo,
            partyName: this.formPatchObj.consignor.partyName,
          },
          consignee: {
            partyNo: this.formPatchObj.consignee.partyNo,
            partyName: this.formPatchObj.consignee.partyName,
          },
          memo: {
            memoDate: this.formPatchObj.memo.memoDate
          },
          refTruckNo: this.formPatchObj.refTruckNo
        });
        this.isLrFound = true;
        this.form.get('lrNo')?.disable();
        this.form.get('lrDate')?.disable();
        this.form.get('branch')?.disable();
        this.form.get('route')?.disable();
        this.form.get('consignor')?.disable();
        this.form.get('consignee')?.disable();
        this.form.get('refTruckNo')?.disable();
        this.form.get('memo.memoDate')?.disable();
      }
    }, err => {
      console.log(err)
    })
  }

  // ---------------------- Item Query Search ----------------------

  onItemSearch() {
    const query = (this.form.get('lorryReceiptItems.item.itemName')?.value || '')
      .toString()
      .trim()
      .toLowerCase();
    this.filteredItemData = this.itemData.filter(
      (i) =>
        i.itemNo.toLowerCase().includes(query) ||
        i.itemName.toLowerCase().includes(query) ||
        i.partNo.toLowerCase().includes(query)
    );
    this.isModalOpen = query.length > 0 && this.filteredItemData.length > 0;
  }

  closeItemModal() {
    this.isModalOpen = false;
    this.selectedItem = null; // Clear the selected item when closing the modal
  }

  selectItemRow(item: any) {
    this.selectedItem = item;
    this.confirmItemSelection();
  }

  confirmItemSelection() {
    if (this.selectedItem) {
      this.form.patchValue({
        lorryReceiptItems: {
          item: {
            itemNo: this.selectedItem.itemNo,
            itemName: this.selectedItem.itemName,
            itemDate: this.selectedItem.itemDate,
            partNo: this.selectedItem.partNo,
            qtyInBox: this.selectedItem.qtyInBox,
            weightPerBox: this.selectedItem.weightPerBox,
            rateOnBox: this.selectedItem.rateOnBox,
            rateOnWeight: this.selectedItem.rateOnWeight,
            pu: this.selectedItem.pu,
          }
        }
      })
      this.closeItemModal();
    } else {
      alert('No item selected!');
    }
  }


  // ---------------------- Branch Query Search ----------------------

  onBranchSearch() {
    const query = (this.form.get('branch.branchNo')?.value || '')
      .toString()
      .trim()
      .toLowerCase();
    this.filteredBranchData = this.branchData.filter(
      (b) =>
        b.branchNo.toLowerCase().includes(query) ||
        b.branchName.toLowerCase().includes(query)
    );
    this.isBranchModalOpen = query.length > 0 && this.filteredBranchData.length > 0;
  }


  closeBranchModal() {
    this.isBranchModalOpen = false;
    this.selectedBranchItem = null; // Clear the selected item when closing the modal
  }

  selectBranchRow(item: any, index: any) {
    this.selectedBranchItem = item;
    this.confirmBranchSelection();
  }

  confirmBranchSelection() {
    if (this.selectedBranchItem) {
      this.form.patchValue({
        branch: {
          branchNo: this.selectedBranchItem.branchNo,
          branchName: this.selectedBranchItem.branchName
        }
      });
      this.closeBranchModal();
    } else {
      alert('No item selected!');
    }
  }

  // ---------------------- Route Query Search ----------------------

  onRouteSearch() {
    const query = (this.form.get('route.routeNo')?.value || '').toString().trim().toLowerCase();
    this.filteredRouteData = this.routeData.filter(
      (route) =>
        route.routeNo.toLowerCase().includes(query) ||
        route.routeName.toLowerCase().includes(query)
    );
    this.isRouteModalOpen = query.length > 0 && this.filteredRouteData.length > 0;
  }

  closeRouteModal() {
    this.isRouteModalOpen = false;
    this.selectedRouteItem = null; // Clear the selected item when closing the modal
  }

  selectRouteRow(item: any) {
    this.selectedRouteItem = item;
    this.confirmRouteSelection();
  }

  confirmRouteSelection() {
    if (this.selectedRouteItem) {
      this.form.patchValue({
        route: {
          routeNo: this.selectedRouteItem.routeNo,
          routeName: this.selectedRouteItem.routeName,
          gstType: this.selectedRouteItem.gstType
        }
      });
      this.closeRouteModal();
    } else {
      alert('No item selected!');
    }
  }


  // ------------------- Party Search Query ----------------------

  onPartySearch() {
    const query2 = (this.form.get('consignee.partyNo')?.value || '').toString().trim().toLowerCase();
    this.filteredPartyData = this.partyData.filter(
      (p) =>
        p.partyNo.toLowerCase().includes(query2) ||
        p.partyName.toLowerCase().includes(query2)
    );
    this.isPartyModalOpen = query2.length > 0 && this.filteredPartyData.length > 0;
  }

  closePartyModal() {
    this.isPartyModalOpen = false;
    this.selectedPartyItem = null; // Clear the selected item when closing the modal
  }

  selectPartyRow(item: any) {
    this.selectedPartyItem = item;
    this.confirmPartySelection();
  }

  confirmPartySelection() {
    if (this.selectedPartyItem) {
      this.form.patchValue({
        consignee: {
          partyNo: this.selectedPartyItem.partyNo,
          partyName: this.selectedPartyItem.partyName
        }
      });
      this.closePartyModal();
    } else {
      alert('No item selected!');
    }
  }

  // ------------------- Party 2 Search Query ----------------------


  onPartySearch2() {
    const query2 = (this.form.get('consignor.partyNo')?.value || '').toString().trim().toLowerCase();
    this.filteredPartyData2 = this.partyData2.filter(
      (p) =>
        p.partyNo.toLowerCase().includes(query2) ||
        p.partyName.toLowerCase().includes(query2)
    );
    this.isPartyModalOpen2 = query2.length > 0 && this.filteredPartyData2.length > 0;
  }

  closePartyModal2() {
    this.isPartyModalOpen2 = false;
    this.selectedPartyItem2 = null; // Clear the selected item when closing the modal
  }

  selectPartyRow2(item: any) {
    this.selectedPartyItem2 = item;
    this.confirmPartySelection2();
  }

  confirmPartySelection2() {
    if (this.selectedPartyItem2) {
      console.log(this.selectedPartyItem2)
      this.form.patchValue({
        consignor: {
          partyNo: this.selectedPartyItem2.partyNo,
          partyName: this.selectedPartyItem2.partyName
        }
      });
      this.closePartyModal2();
    } else {
      alert('No item selected!');
    }
  }

  // ------------ LR Search Query ------------------

  onLrSearch() {
    const query3 = (this.form.get('lrSearchQuery')?.value || '')
      .toString()
      .trim()
      .toLowerCase();
    this.filteredLrData = this.LrData.filter(
      (l) =>
        l.lrNo.toLowerCase().includes(query3) ||
        l.memo.memoNo.toLowerCase().includes(query3) ||
        l.consignor.partyName.toLowerCase().includes(query3) ||
        l.consignee.partyName.toLowerCase().includes(query3)
    );
    this.isLrModalOpen = query3.length > 0 && this.filteredLrData.length > 0;
  }

  closeLrModal() {
    this.isLrModalOpen = false;
    this.selectedLrItem = null; // Clear the selected item when closing the modal
  }

  selectLrRow(item: any) {
    this.selectedLrItem = item;
    this.confirmLrSelection();
  }

  confirmLrSelection() {
    if (this.selectedLrItem) {
      console.log(this.selectedLrItem);
      this.listItemData = this.selectedLrItem.lorryReceiptItems;
      this.listChargesData = this.selectedLrItem.extraCharges;
      this.listItemData.map((p: any) => {
        this.total_amount += p.amount;
      });
      this.listChargesData.map((c: any) => {
        this.total_charges_amount += c.chargesAmount;
      });
      this.form.patchValue({
        lrId: this.selectedLrItem.lrId,
        lrNo: this.selectedLrItem.lrNo,
        branch: {...this.form.get('branch')?.value, ...this.selectedLrItem.branch},
        route: {...this.form.get('route')?.value, ...this.selectedLrItem.route},
        consignee: {...this.form.get('consignee')?.value, ...this.selectedLrItem.consignee},
        consignor: {...this.form.get('consignor')?.value, ...this.selectedLrItem.consignor},
        remark: this.selectedLrItem.remark,
        whoItemList: this.selectedLrItem.whoItemList,
        memo: {...this.form.get('memo')?.value, ...this.selectedLrItem.memo},
        octBill: this.selectedLrItem.octBill,
        bills: {...this.form.get('bills')?.value, ...this.selectedLrItem.bills},
        unloadDate: this.selectedLrItem.unloadDate,
        lrDate: this.selectedLrItem.lrDate,
        refTruckNo: this.selectedLrItem.refTruckNo,
        lorryReceiptItems: {...this.form.get('lorryReceiptItems')?.value, ...this.selectedLrItem.lorryReceiptItems},
        lrNote: this.selectedLrItem.lrNote,
        stCharges: this.selectedLrItem.stCharges,
        extraCharges: this.selectedLrItem.extraCharges,
        deliveryAt: this.selectedLrItem.deliveryAt,
        valueRs: this.selectedLrItem.valueRs,
        whoPay: this.selectedLrItem.whoPay,
        octroiPay: this.selectedLrItem.octroiPay,
        // totalFreight: Number(this.total_amount + this.total_charges_amount).toFixed(2),
        // cgst: this.selectedLrItem.cgst,
        // sgst: this.selectedLrItem.sgst,
        // igst: this.selectedLrItem.igst,
        grandTotal: this.selectedLrItem.grandTotal,
      });
      this.closeLrModal();
      this.form.get('lrNo')?.disable();
      this.form.get('memo.memoNo')?.disable();
    } else {
      alert('No item selected!');
    }
  }


  // ------------ Vehicle Search Query ------------------

  onVehicleSearch() {
    const query3 = (this.form.get('refTruckNo')?.value || '')
      .toString()
      .trim()
      .toLowerCase();
    this.filteredVehicleData = this.listVehicleData.filter(
      (v) =>
        v.vehicleNumber.toLowerCase().includes(query3) ||
        v.driverName.toLowerCase().includes(query3)
    );
    this.isVehicleModalOpen = query3.length > 0 && this.filteredVehicleData.length > 0;
  }

  closeVehicleModal() {
    this.isVehicleModalOpen = false;
    this.selectedVehicleItem = null;
  }

  selectVehicleRow(item: any) {
    this.selectedVehicleItem = item;
    this.confirmVehicleSelection();
  }

  confirmVehicleSelection() {
    if (this.selectedVehicleItem) {
      this.form.patchValue({
        refTruckNo: this.selectedVehicleItem.vehicleNumber
      });
      this.closeVehicleModal();
    } else {
      alert('No item selected!');
    }
  }


  // ------------- PRINT INVOICE ---------------
  setPrint() {
    this.printForm.patchValue({
      lrNo: this.form.get('lrNo')?.value,
      startDate: this.form.get('lrDate')?.value,
      endDate: this.form.get('lrDate')?.value,
    })
  }


  setParty(event: any) {
    if (event == 'Consignee Copy') {
      this.printFor = "Consignee Copy";
      this.isPrintButtonDisabled = false;
      this.printForm.patchValue({
        party: {
          partyCode: this.form.get('consignee.partyNo')?.value,
          partyName: this.form.get('consignee.partyName')?.value,
        }
      })
    } else if (event == 'Consignor Copy') {
      this.printFor = "Consignor Copy";
      this.isPrintButtonDisabled = false;
      this.printForm.patchValue({
        party: {
          partyCode: this.form.get('consignor.partyNo')?.value,
          partyName: this.form.get('consignor.partyName')?.value,
        }
      })
    }

    if(event == 'driver-copy'){
      this.printFor = "Driver Copy";
    }

    const lrNo = this.printForm.get('lrNo')?.value;
    const startDate = this.printForm.get('startDate')?.value;
    const endDate = this.printForm.get('endDate')?.value;


    this.apiService.getLorryByLrNoAndLrDate(lrNo, startDate, endDate).subscribe(res => {
      if (res) {
        const invoices: any[] = [];
        let _consignor: any;
        let _consignee: any;
        let _route: any;
        let _vehicleNo: any;
        let _lrNo: any;
        let _date: any;
        this.printLrData = res;
        // console.log(this.printLrData);
        this.printLrData.flatMap((l: any) => {
          _route = l.route;
          _vehicleNo = l.refTruckNo;
          _lrNo = l.lrNo;
          _date = l.lrDate
          _consignor = l.consignor;
          _consignee = l.consignee;
          l.lorryReceiptItems.map((f: any) => {
            let _list = {
              invoice_no: f.chalanNo,
              invoice_value: f.amount,
              asnNo: f.asnNo,
              quantity: f.quantity,
              itemName: f.item.itemName,
              weight: f.totalWeight
            }
            invoices.push(_list);
          });
        });

        this.printData = {
          route: _route,
          vehicleNo: _vehicleNo,
          lrNo: _lrNo,
          date: _date,
          consignee: _consignee,
          consignor: _consignor,
          behalfOf: this.printForm.get('party.partyName')?.value,
          invoice_list: invoices
        }
      }

    }, err => {
      console.log(err);
    })
  }

  formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  }

  printDocument() {
    let printWindow = window.open('', '');


    if (printWindow) {
      let totalQuantity = this.printData.invoice_list.reduce((sum: number, p: any) => sum + (p.quantity || 0), 0);

      this.printData.invoice_list.map((p: any) => {
        this.invoice_nos.push(p.invoice_no);
      });

      printWindow.document.write(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>VIP Logistics (Lorry Receipt)</title>
              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
              <style>
                  @page {
                      size: A4 portrait;
                      padding: 10px;
                  }
                  * { font-size: 10.8px; }
                  .invoice-box { border: 1px solid black; padding: 5px; margin: 5px; }
                  .header { text-align: center; font-weight: bold; }
                  .logo { width: 120px; }
                  .sign { width: 90px; }
                  .table th, .table td { border: 0.5px solid black; text-align: center; padding: 2px; margin: 0;}
                  .td-height { min-height: 80px !important; max-height: fit-content; !important; height: 80px }
                  .custom-table th, .custom-table td { border: 1px solid black; text-align: start; padding: 3px; margin: 0;}
                  .note { font-size: 12.8px; }
                  p {
                        margin: 2px 0;
                        padding: 0;
                        line-height: 1.5;
                        font-size: 12.8px;
                    }
                    .dark-color.thin-line {
                      width: 100%;
                      height: 0.5px;
                      background-color: black; /* Dark color */
                      margin: 10px 0; /* Adjust spacing above and below the line */
                    }
              </style>
          </head>
          <body>
              <div class="invoice-box">
                  <div class="d-flex align-items-center">
                      <img src="../../../vpi-logo.png" alt="VIP Logistics Logo" class="logo me-3">
                      <div class="text-center flex-grow-1">
                          <h2 class="header">VIP LOGISTICS</h2>
                          <p>PLOT NO 133, AMBEDKAR NAGAR, NAGAON PHATA, TAL. HATAKANGALE, DIST. KOLHAPUR - 416122.<br>
                             E-mail - viplogistics@yahoo.com</p>
                      </div>
                  </div>

                  <div class="row d-flex mb-0 pb-0">
                      <div class="col-md-4">
                          <table class="table custom-table">
                              <thead>
                                  <th width="60">GST No: </th>
                                  <td>27AKJPP0760D1Z9</td>
                              </thead>
                              <thead>
                                  <th width="60">PAN No: </th>
                                  <td>AKJPP0760D</td>
                              </thead>
                          </table>
                      </div>
                      <div class="col-md-4 text-center">
                          <table class="table custom-table">
                              <thead>
                                  <th width="50">FROM: </th>
                                  <td>${this.printData.route.routeFrom}</td>
                              </thead>
                              <thead>
                                  <th width="50">TO: </th>
                                  <td>${this.printData.route.routeTo}</td>
                              </thead>
                          </table>
                      </div>
                      <div class="col-md-4 text-end">
                          <table class="table custom-table">
                                <thead>
                                    <th width="80">VEHICLE No: </th>
                                    <td>${this.printData.vehicleNo}</td>
                                </thead>
                                <thead>
                                    <th width="80">L.R. No: </th>
                                    <td>${this.printData.lrNo}</td>
                                </thead>
                                <thead>
                                    <th width="80">DATE: </th>
                                    <td>${this.formatDate((this.printData.date).toString())}</td>
                                </thead>
                            </table>
                      </div>
                  </div>
                  <div class="row">
                      <div class="col-md-6">
                          <p><strong>CONSIGNOR M/S:</strong> ${(this.printData.consignor.partyName).replace(/\-\(.*?\)/g, '')}</p>
                          <p class="pt-1 pb-1"><strong>CONSIGNEE M/S:</strong> ${(this.printData.consignee.partyName).replace(/\-\(.*?\)/g, '')}</p>
                          <p><small>This L/R is made on behalf of ${(this.printData.behalfOf).replace(/\-\(.*?\)/g, '')}</small></p>
                      </div>
                  </div>

                  <table class="table table-bordered">
                      <thead class="text-sm">
                          <tr>
                              <th width="80">Invoice No</th>
                              <th width="300">Particulars of Goods (set to contain)</th>
                              <th width="80">No of Pkg</th>
                              <th width="250">Remark</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr>
                            <td class="td-height" width="300">${this.invoice_nos.join(',  ')}</td>
                            <td class="td-height" width="300"></td>
                            <td class="td-height" width="80">${totalQuantity} Units</td>
                            <td class="td-height" width="250"></td>
                          </tr>
                      </tbody>
                  </table>

                  <p class="note">1. Transit insurance necessary on the owner of the goods.</p>
                  <p class="note">2. If there is any complaint related to the goods then intimate us within 1 day, we will not be responsible for any complaint.</p>
                  <h5 class="text-center mt-2">${this.printFor}</h5>
                  <p class="text-end">
                      <img class="sign" src="../../../images/vip-sign.png" alt="Loading..." >
                  </p>
                  <p class="text-end">For VIP LOGISTICS</p>
                  <p class="text-center">Daily Services: Mumbai/Nashik/Pune/Belgaum/Nagpur</p>
              </div>
          </body>
          </html>
      `);

      printWindow.document.close();
      printWindow.print();
    }
  }


}

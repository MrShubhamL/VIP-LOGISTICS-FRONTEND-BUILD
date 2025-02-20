import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {StorageService} from '../../services/storage/storage.service';
import {ApiService} from '../../services/api/api.service';

declare var $: any;

@Component({
  selector: 'app-fright-bill',
  standalone: false,
  templateUrl: './fright-bill.component.html',
  styleUrl: './fright-bill.component.scss'
})
export class FrightBillComponent {
  form!: FormGroup;
  billingData: any[] = [];
  lrRowSpanMap: { [key: string]: number } = {};

  billingCommonData: any;

  private formBuilder = inject(FormBuilder);
  private storageService = inject(StorageService);
  private apiService = inject(ApiService);

  readEnabled: boolean = false;
  writeEnabled: boolean = false;
  updateEnabled: boolean = false;
  deleteEnabled: boolean = false;
  currentLoggedUser: any;

  constructor() {
    this.form = this.formBuilder.group({
      billNo: new FormControl(''),
      billDate: new FormControl(''),
      partyName: new FormControl(''),
      partyAddress: new FormControl(''),
      partyDist: new FormControl(''),
      partyStateCode: new FormControl(''),
      GSTNo: new FormControl(''),
      sacNo: new FormControl('996511'),
      mlCode: new FormControl('ML485'),
      vCode: new FormControl('30008227'),

      quantity: new FormControl(''),
      freight: new FormControl(''),
      loadingCharges: new FormControl(''),
      unloadCharges: new FormControl(''),
      plywoodCharges: new FormControl(''),
      detentionCharges: new FormControl(''),
      stCharges: new FormControl(''),
      subTotal: new FormControl(''),
      cgst: new FormControl(''),
      sgst: new FormControl(''),
      grandTotal: new FormControl(''),
    })
  }

  ngOnInit() {
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
        if (p.userPermission == 'freight-group') {
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

  findFreightByBill() {
    let billNo = this.form.get('billNo')?.value;
    if (billNo) {
      this.apiService.getFreightByBillNo(billNo).subscribe(res => {
        if (res !== 0) {
          this.billingData = res.mumbaiFreightBillDtos;
          this.billingCommonData = res.commonFreightBillDataDto;
          this.calculateLrRowSpan();
          let qty = this.getTotalQuantity();
          let freight = this.getTotalFreight();
          let loadingCharges = this.getLoadingCharges();
          let unloadCharges = this.getUnloadingCharges();
          let plywoodCharges = this.getPlyWoodCharges();
          let detentionCharges = this.getDetentionCharges();
          let stCharges = this.getStCharges();
          let subTotal = this.getSubTotal();
          let cgst = this.getCGST();
          let sgst = this.getSGST();


          this.form.patchValue({
            billDate: this.billingCommonData.billDate,

            partyName: this.billingCommonData.partyName,
            partyAddress: this.billingCommonData.address,
            partyDist: this.billingCommonData.district,
            partyStateCode: this.billingCommonData.stateCode,
            GSTNo: this.billingCommonData.gstNo,

            quantity: qty,
            freight: freight.toFixed(2),
            loadingCharges: loadingCharges.toFixed(2),
            unloadCharges: unloadCharges.toFixed(2),
            plywoodCharges: plywoodCharges.toFixed(2),
            detentionCharges: detentionCharges.toFixed(2),
            stCharges: stCharges.toFixed(2),
            subTotal: subTotal.toFixed(2),
            cgst: cgst.toFixed(2),
            sgst: sgst.toFixed(2),
            grandTotal: (subTotal + cgst + sgst).toFixed(2)
          });
          this.form.get('billNo')?.disable();
        }
      }, err => {
        console.log(err)
      })
    }
  }

  formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  }

  getTotalQuantity() {
    let total_quantity = 0;
    this.billingData.map((d: any) => {
      total_quantity += d.quantity
    });
    return total_quantity;
  }

  getTotalFreight() {
    let total_freight = 0;
    this.billingData.map((d: any) => {
      total_freight += d.totalFreight
    });
    return total_freight;
  }

  getDisplayTotalFreight(lrNo: string): number {
    return this.billingData
      .filter((item) => item.lrNo === lrNo) // Filter records with the same lrNo
      .reduce((sum, item) => sum + (item.totalFreight || 0), 0); // Sum only totalFreight values
  }

  getLoadingCharges() {
    let loadingCharges = 0;
    this.billingData.map((d: any) => {
      loadingCharges += d.loadingCharges
    });
    return loadingCharges;
  }

  getUnloadingCharges() {
    let unLoadingCharges = 0;
    this.billingData.map((d: any) => {
      unLoadingCharges += d.unloadingCharges
    });
    return unLoadingCharges;
  }

  getPlyWoodCharges() {
    let plyWoodCharges = 0;
    this.billingData.map((d: any) => {
      plyWoodCharges += d.plyWoodCharges
    });
    return plyWoodCharges;
  }

  getDetentionCharges() {
    let detentionCharges = 0;
    this.billingData.map((d: any) => {
      detentionCharges += d.detentionCharges
    });
    return detentionCharges;
  }

  getStCharges() {
    let stCharges = 0;
    this.billingData.map((d: any) => {
      stCharges += d.stCharges
    });
    return stCharges;
  }

  getDisplaySTCharges(lrNo: string): number {
    return this.billingData
      .filter((item) => item.lrNo === lrNo) // Filter records with the same lrNo
      .reduce((sum, item) => sum + (item.stCharges || 0), 0); // Sum only totalFreight values
  }

  getSubTotal() {
    let subTotal = 0;
    this.billingData.map((d: any) => {
      subTotal += d.subTotal
    });
    return subTotal;
  }

  getDisplaySubTotal(lrNo: string): number {
    return this.billingData
      .filter((item) => item.lrNo === lrNo) // Filter records with the same lrNo
      .reduce((sum, item) => sum + (item.subTotal || 0), 0); // Sum only totalFreight values
  }

  getSGST() {
    let sgst = 0;
    this.billingData.map((d: any) => {
      sgst += d.sgst
    });
    return sgst;
  }

  getDisplaySGST(lrNo: string): number {
    return this.billingData
      .filter((item) => item.lrNo === lrNo) // Filter records with the same lrNo
      .reduce((sum, item) => sum + (item.sgst || 0), 0); // Sum only totalFreight values
  }

  getCGST() {
    let cgst = 0;
    this.billingData.map((d: any) => {
      cgst += d.cgst
    });
    return cgst;
  }

  getDisplayCGST(lrNo: string): number {
    return this.billingData
      .filter((item) => item.lrNo === lrNo) // Filter records with the same lrNo
      .reduce((sum, item) => sum + (item.cgst || 0), 0); // Sum only totalFreight values
  }

  getTotalBillValue(lrNo: string): number {
    let subTotal = this.getDisplaySubTotal(lrNo) || 0;
    let cgst = this.getDisplayCGST(lrNo) || 0;
    let sgst = this.getDisplaySGST(lrNo) || 0;
    return (subTotal + cgst + sgst);
  }


  saveMumbaiFreight() {
    console.log(this.form.value)
  }

  clearField() {
    this.form.reset();
    this.billingData = [];
    this.form.get('sacNo')?.setValue('996511');
    this.form.get('mlCode')?.setValue('ML485');
    this.form.get('vCode')?.setValue('30008227');
    this.form.get('billNo')?.enable();
  }

  // Calculate ROW Span for LR
  calculateLrRowSpan() {
    this.lrRowSpanMap = {};
    this.billingData.forEach((item) => {
      if (this.lrRowSpanMap[item.lrNo]) {
        this.lrRowSpanMap[item.lrNo]++;
      } else {
        this.lrRowSpanMap[item.lrNo] = 1;
      }
    });
  }

  getLrRowSpan(lrNo: string): number {
    return this.lrRowSpanMap[lrNo] || 1;
  }

  shouldShowLrNo(lrNo: string, index: number): boolean {
    return index === this.billingData.findIndex((item) => item.lrNo === lrNo);
  }


}

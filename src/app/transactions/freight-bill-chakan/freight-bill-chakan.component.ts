import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {StorageService} from '../../services/storage/storage.service';
import {ApiService} from '../../services/api/api.service';

declare var $: any;

@Component({
  selector: 'app-freight-bill-chakan',
  standalone: false,
  templateUrl: './freight-bill-chakan.component.html',
  styleUrl: './freight-bill-chakan.component.scss'
})
export class FreightBillChakanComponent {
  form!: FormGroup;
  billingData: any[] = [];
  lrRowSpanMap: { [key: string]: number } = {};
  routeData: any[] = [];
  billingCommonData: any;

  billingCharges: any[] = [];
  totalUnloadingCharges: number = 0;
  totalLoadingCharges: number = 0;
  totalPlywoodCharges: number = 0;
  totalCollectionCharges: number = 0;
  totalDetentionCharges: number = 0;
  totalStCharges: number = 0;

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
      billNo: new FormControl('', Validators.required),
      billDate: new FormControl(''),
      partyName: new FormControl(''),
      partyAddress: new FormControl(''),
      partyDist: new FormControl(''),
      partyStateCode: new FormControl(''),
      GSTNo: new FormControl(''),
      sacNo: new FormControl('996511'),
      mlCode: new FormControl('ML485'),
      vCode: new FormControl('30008227'),
      route: this.formBuilder.group({
        routeNo: new FormControl(''),
        routeName: new FormControl(''),
        routeFrom: new FormControl(''),
        routeTo: new FormControl(''),
      }),
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
    this.apiService.getAllRoutes().subscribe(res => {
      if (res) {
        this.routeData = res;
      }
    }, error => {
      console.log(error)
    });
    this.form.get('route.routeName')?.disable();
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

  changeEvent(event: any) {
    if (event && event !== '') {
      this.form.get('route.routeName')?.enable();
    } else {
      this.form.get('route.routeName')?.disable();
    }
  }

  findFreightByBill(event: any) {
    let billNo = this.form.get('billNo')?.value;
    if (billNo) {
      this.apiService.getChakanFreightByBillNo(billNo, event).subscribe(res => {
        console.log(res);
        if (res !== 0) {

          this.billingData = res.chakanFreightBillDtos;
          this.billingCommonData = res.commonFreightBillDataDto;


          this.billingCharges = res.chakanExtraCharges;

          this.billingCharges.map((b: any) => {
            this.totalLoadingCharges += b.loadingCharges;
            this.totalUnloadingCharges += b.unloadingCharges;
            this.totalPlywoodCharges += b.plyWoodCharges;
            this.totalDetentionCharges += b.detentionCharges;
            this.totalStCharges += b.stCharges;
          });

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
          this.form.get('route.routeName')?.disable();
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
    return this.totalLoadingCharges;
  }

  getDisplayLoadingCharges(lrNo: string): number {
    return this.billingCharges
      .filter((item) => item.lrNo === lrNo) // Filter records with the same lrNo
      .reduce((sum, item) => sum + (item.loadingCharges || 0), 0); // Sum only totalFreight values
  }

  getUnloadingCharges() {
    return this.totalUnloadingCharges;
  }

  getDisplayUnloadingCharges(lrNo: string): number {
    return this.billingCharges
      .filter((item) => item.lrNo === lrNo) // Filter records with the same lrNo
      .reduce((sum, item) => sum + (item.unloadingCharges || 0), 0); // Sum only totalFreight values
  }

  getPlyWoodCharges() {
    return this.totalPlywoodCharges;
  }

  getDisplayPlywoodCharges(lrNo: string): number {
    return this.billingCharges
      .filter((item) => item.lrNo === lrNo) // Filter records with the same lrNo
      .reduce((sum, item) => sum + (item.plyWoodCharges || 0), 0); // Sum only totalFreight values
  }

  getDetentionCharges() {
    return this.totalDetentionCharges;
  }

  getDisplayDetentionCharges(lrNo: string): number {
    return this.billingCharges
      .filter((item) => item.lrNo === lrNo) // Filter records with the same lrNo
      .reduce((sum, item) => sum + (item.detentionCharges || 0), 0); // Sum only totalFreight values
  }

  getStCharges() {
    return this.totalStCharges;
  }

  getDisplaySTCharges(lrNo: string): number {
    return this.billingCharges
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
      .filter((item) => item.lrNo === lrNo)
      .reduce((sum, item) => sum + (item.subTotal || 0), 0);
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
    const formObj = {
      "billNo": this.form.get('billNo')?.value,
      "partyName": this.form.get('partyName')?.value,
      "address": this.form.get('partyAddress')?.value,
      "district": this.form.get('partyDist')?.value,
      "stateCode": this.form.get('partyStateCode')?.value,
      "gstNo": this.form.get('GSTNo')?.value,
      "routeName": this.form.get('route.routeName')?.value,
      "codeNo": this.form.get('vCode')?.value,
      "ml": this.form.get('mlCode')?.value,
      "sac": this.form.get('sacNo')?.value,
      "isVerified": false
    }
    if (this.currentLoggedUser.roleDto.roleName === 'SUPER_ADMIN' || this.currentLoggedUser.roleDto.roleName === 'ADMIN') {
      formObj.isVerified = true;
    }

    this.apiService.saveMumbaiFreight(formObj).subscribe(res => {
      if (res) {
        this.clearField();
        $.toast({
          heading: 'Mumbai freight bill has been submitted!',
          text: 'You have submitted the mumbai freight bill. Please contact to respective authority member for approval.',
          showHideTransition: 'fade',
          icon: 'info',
          position: 'top-center',
          bgColor: '#31be33',
          loader: false,
        });
      }
    }, error => {
      $.toast({
        heading: 'Limited Access Alert!',
        text: 'You dont have modification access on this service! Contact to administrator.',
        showHideTransition: 'fade',
        icon: 'info',
        position: 'bottom-center',
        bgColor: '#3152be',
        loader: false,
      });
    });

  }

  clearField() {
    this.form.reset();
    this.billingData = [];
    this.form.get('sacNo')?.setValue('996511');
    this.form.get('mlCode')?.setValue('ML485');
    this.form.get('vCode')?.setValue('30008227');
    this.form.get('billNo')?.enable();
    this.form.get('route.routeName')?.disable();
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

  convertNumberToWords(value: number): string {
    let ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
      'Eighteen', 'Nineteen'];
    let tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function convertNumber(num: number): string {
      if (num === 0) return '';
      if (num < 20) return ones[num];
      if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
      if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + convertNumber(num % 100) : '');
      if (num < 100000) return convertNumber(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convertNumber(num % 1000) : '');
      if (num < 10000000) return convertNumber(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + convertNumber(num % 100000) : '');
      return convertNumber(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + convertNumber(num % 10000000) : '');
    }

    if (isNaN(value)) return 'Invalid Number';
    let numParts = value.toFixed(2).split('.');
    let integerPart = parseInt(numParts[0], 10);
    let decimalPart = parseInt(numParts[1], 10);
    let words = convertNumber(integerPart).toUpperCase();
    if (words) words += '';
    if (decimalPart > 0) {
      words += ` & ${convertNumber(decimalPart).toUpperCase()} ONLY`;
    }
    return words;
  }


  printFreight() {
    let printWindow = window.open('', '');
    if (printWindow) {
      let processedLrNos = new Set();

      let invoiceRows = this.billingData.map((l, i) => {
        let shouldShowLrNo = !processedLrNos.has(l.lrNo);
        if (shouldShowLrNo) {
          processedLrNos.add(l.lrNo);
        }

        let rowSpan = shouldShowLrNo ? this.getLrRowSpan(l.lrNo) : 1;

        return `
        <tr>
            ${shouldShowLrNo ? `<td rowspan="${rowSpan}" class="text-center align-middle text-bold">${l.lrNo}</td>` : ""}
            <td>${this.formatDate(l.lrDate)}</td>
            <td>${this.formatDate(l.unloadingDate)}</td>
            <td>${l.from}</td>
            <td>${l.to}</td>
            <td>${l.invoiceNo}</td>
            <td>${l.vendorName}</td>
            <td>${l.quantity}</td>
            <td>${l.vehicleNo}</td>
            <td>${l.lcvFtl || '-'}</td>
            ${shouldShowLrNo ? `<td rowspan="${rowSpan}" class="text-center align-middle">${this.getDisplayTotalFreight(l.lrNo)}</td>` : ""}
            ${l.loadingCharges && l.loadingCharges !== 0 ? `<td>${l.loadingCharges}</td>` : ""}
            ${l.unloadingCharges && l.unloadingCharges !== 0 ? `<td>${l.unloadingCharges}</td>` : ""}
            ${l.plyWoodCharges && l.plyWoodCharges !== 0 ? `<td>${l.plyWoodCharges}</td>` : ""}
            ${l.detentionCharges && l.detentionCharges !== 0 ? `<td>${l.detentionCharges}</td>` : ""}
            ${shouldShowLrNo ? `<td rowspan="${rowSpan}" class="text-center align-middle">${this.getDisplaySTCharges(l.lrNo) || 0}</td>` : ""}
            ${shouldShowLrNo ? `<td rowspan="${rowSpan}" class="text-center align-middle">${this.getDisplaySubTotal(l.lrNo).toFixed(2)}</td>` : ""}
            ${shouldShowLrNo ? `<td rowspan="${rowSpan}" class="text-center align-middle">${this.getDisplaySGST(l.lrNo).toFixed(2)}</td>` : ""}
            ${shouldShowLrNo ? `<td rowspan="${rowSpan}" class="text-center align-middle">${this.getDisplayCGST(l.lrNo).toFixed(2)}</td>` : ""}
            ${shouldShowLrNo ? `<td rowspan="${rowSpan}" class="text-center align-middle">${this.getTotalBillValue(l.lrNo).toFixed(2)}</td>` : ""}
        </tr>
        `;
      }).join('');

      let showLoadingCharges = this.billingData.some(l => l.loadingCharges && l.loadingCharges !== 0);
      let showUnloadingCharges = this.billingData.some(l => l.unloadingCharges && l.unloadingCharges !== 0);
      let showPlyWoodCharges = this.billingData.some(l => l.plyWoodCharges && l.plyWoodCharges !== 0);
      let showDetentionCharges = this.billingData.some(l => l.detentionCharges && l.detentionCharges !== 0);

      let invoiceTableHeader = `
            <thead>
              <tr>
                  <th>LR No.</th>
                  <th>Loory Rept. Date</th>
                  <th>Unloading Date</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Invoice No.</th>
                  <th>Vendor Name</th>
                  <th>Qty</th>
                  <th>Vehicle No</th>
                  <th>Rate</th>
                  <th>Freight</th>
                  ${showLoadingCharges ? '<th>Loading Charges</th>' : ''}
                  ${showUnloadingCharges ? '<th>Unloading Charges</th>' : ''}
                  ${showPlyWoodCharges ? '<th>Plywood Charges</th>' : ''}
                  ${showDetentionCharges ? '<th>Detention Charges</th>' : ''}
                  <th>ST Charges</th>
                  <th>Sub Total</th>
                  <th>SGST 6%</th>
                  <th>CGST 6%</th>
                  <th>Total Bill</th>
              </tr>
            </thead>
        `;

      let invoiceFooterTable = `
          <tr class="text-center">
              <th colspan="10">Grand Totals - </th>
              <th>₹${this.getTotalFreight().toFixed(2)}</th>
              ${showLoadingCharges ? `<th>₹${this.getLoadingCharges().toFixed(2)}</th>` : ''}
              ${showUnloadingCharges ? `<th>₹${this.getUnloadingCharges().toFixed(2)}</th>` : ''}
              ${showPlyWoodCharges ? `<th>₹${this.getPlyWoodCharges().toFixed(2)}</th>` : ''}
              ${showDetentionCharges ? `<th>₹${this.getDetentionCharges().toFixed(2)}</th>` : ''}
              <th>₹${this.getStCharges().toFixed(2)}</th>
              <th>₹${this.getSubTotal().toFixed(2)}</th>
              <th>₹${this.getSGST().toFixed(2)}</th>
              <th>₹${this.getCGST().toFixed(2)}</th>
              <th>₹${(this.getSubTotal() + this.getSGST() + this.getCGST()).toFixed(2)}</th>
          </tr>
      `;


      printWindow.document.write(`
      <!doctype html>
      <html lang="en">

      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Mumbai Freight Bill (${this.billingCommonData.billNo})</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
              integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
          <style>
              @media print {
                  th,
                  td {
                      font-size: 8px;
                      font-weight: 500;
                  }
              }

              @page {
                  size: A4 landscape !important;
              }

              body {
                  padding: 10px;
                  font-size: 10.8px;
              }

              .border-none {
                  border: none;
              }

              .custom-border {
                  border: none;
                  /* Darker border for the table */
              }

              .custom-border th,
              .custom-border td {
                  border: 1px solid black !important;
                  /* Darker borders for table cells */
              }

              th {
                  padding: 0;
                  margin: 0;
                  vertical-align: middle;
                  font-weight: 700;
                  min-height: 1px;  /* Ensures a minimum cell height */
                  line-height: 0.5;  /* Adjust line height for better readability */
              }

              td {
                  padding: 0;
                  margin: 0;
                  vertical-align: middle;
                  font-weight: 500;
                  min-height: 1px;  /* Ensures a minimum cell height */
                  line-height: 0.5;  /* Adjust line height for better readability */
              }

              .invoice {
                  border: 1px solid black;
              }

              .d-block-start {
                  display: block;
                  justify-items: start;
                  align-items: start;
                  justify-content: start;
              }

              .d-block-end {
                  display: block;
                  justify-items: end;
                  align-items: start;
                  justify-content: start;
              }

              .d-block-center {
                  display: block;
                  justify-items: center;
                  align-items: start;
                  justify-content: start;
              }

              .card-border-bottom {
                  border-bottom: 1px solid black;
              }

              .bottom-text-size {
                  font-size: 9.8px;
              }
              .sign {
                  width: 50px;
                  display: block;
                  margin: 0 auto;
              }
          </style>
      </head>

      <body>

          <div class="container-fluid invoice">
              <div class="row">
                  <div class="col-12 p-0">
                      <div class="card border-none">
                          <div class="card-header card-border-bottom text-center p-1 m-0">
                              <h3 class="card-title">VIP LOGISTICS</h3>
                              <p class="card-subtitle">
                                  PLOT NO 133, AMBEDKAR NAGAR, NAGAON PHATA, TAL. HATAKANGALE, DIST. KOLHAPUR - 416122.<br>
                                  Contact - +91 7591919191, +91 9767919191 <br>
                                  E-mail - viplogistics@yahoo.com
                              </p>
                          </div>

                          <div class="card-body">
                              <div class="row">
                                  <!-- Left Section -->
                                  <div class="col-4 px-2 text-start">
                                      <table class="table table-bordered custom-border">
                                          <tbody class="d-block-start">
                                              <tr>
                                                  <th>DETAILS OF CUSTOMER</th>
                                              </tr>
                                              <tr>
                                                  <th>NAME: <span class="text-muted">${(this.billingCommonData.partyName).replace(/\-\(.*?\)/g, '')}</span></th>
                                              </tr>
                                              <tr>
                                                  <th>ADDRESS: <span class="text-muted">${this.billingCommonData.address}</span></th>
                                              </tr>
                                              <tr>
                                                  <th>STATE CODE: <span class="text-muted">${this.billingCommonData.stateCode}</span></th>
                                              </tr>
                                              <tr>
                                                  <th>GSTIN: <span class="text-muted">27AAFCM2530H1ZO</span></th>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </div>

                                  <!-- Center Section -->
                                  <div class="col-4 px-2 text-start">
                                      <table class="table table-bordered custom-border text-center">
                                          <tbody>
                                              <tr>
                                                  <th>Description of Service: Transportation of goods by Road</th>
                                              </tr>
                                          </tbody>
                                      </table>
                                      <table class="table table-bordered custom-border">
                                          <tbody class="d-block-center">
                                              <tr>
                                                  <th>SAC:</th>
                                                  <td>345345345</td>
                                              </tr>
                                              <tr>
                                                  <th>ML CODE:</th>
                                                  <td>ML345</td>
                                              </tr>
                                              <tr>
                                                  <th>V CODE:</th>
                                                  <td>3000012</td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </div>

                                  <!-- Right Section -->
                                  <div class="col-4 px-2 text-start">
                                      <table class="table table-bordered custom-border">
                                          <tbody class="d-block-end">
                                              <tr>
                                                  <th>Bill No</th>
                                                  <td>10001</td>
                                                  <th>Bill Date</th>
                                                  <td>02-10-2025</td>
                                              </tr>
                                              <tr>
                                                  <th>BA Code</th>
                                                  <td>30008227</td>
                                                  <th>GSTIN</th>
                                                  <td>27AKJPP0760D1Z9</td>
                                              </tr>
                                              <tr>
                                                  <th>PAN No</th>
                                                  <td>AKJPP0760D</td>
                                                  <th>SAC No</th>
                                                  <td>996511</td>
                                              </tr>
                                              <tr>
                                                  <th>Place of Supply</th>
                                                  <td>Maharashtra</td>
                                                  <th>State Code</th>
                                                  <td>27</td>
                                              </tr>
                                              <tr>
                                                  <th>Nature of Service</th>
                                                  <td colspan="3">Transport Goods By Road</td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </div>
                              </div>

                              <div class="row mb-0">
                                  <div class="col-12 px-2 pb-0 mb-0">
                                      <table class="table table-bordered custom-border">
                                          <thead class="text-center">
                                              ${invoiceTableHeader}
                                          </thead>
                                          <tbody>
                                              ${invoiceRows}
                                          </tbody>
                                          <tfoot>
                                              ${invoiceFooterTable}
                                          </tfoot>
                                      </table>
                                  </div>
                              </div>

                              <div class="row pt-0 mt-0">
                                  <div class="col-12 mb-0 mt-0 pt-0">
                                      <h3 class="bottom-text-size">Amount In Words :- <strong>${this.convertNumberToWords(Number((this.getSubTotal() + this.getSGST() + this.getCGST()).toFixed(2)))}</strong></h3>
                                      <h3 class="bottom-text-size"><strong>Remarks :- </strong> Customer is not liable to pay GST under Reverse Charge since M/s. Mahindra Logistics Ltd being GTA supplier has opted to pay GST under Forward Charge.</h3>
                                      <p class="mb-0">"We hereby declare that though our aggregate turnover in any preceding financial year from 2017-18 onwards is more than the aggregate turnover notified under sub-rule (4) of rule 48, we are not required to prepare an invoice in terms of the provisions of the said sub-rule."</p>
                                      <p class="mb-2">"I/we have taken registration under the CGST Act 2017 and have exercised the option to pay tax on services of Goods Transport Agency in relation to transport of goods supplied by us during the Financial year 2022-2023 under forward charge."</p>
                                  </div>
                                  <div class="col-12 mb-0 mt-0 pt-0">
                                      <div class="row">
                                          <div class="col-8">
                                              <h4 class="bottom-text-size">1. All Payments by cheques/drafts in favor of "VIP LOGISTICS" should be crossed to payee's account.</h4>
                                      <h4 class="bottom-text-size">2. No Claims and/or discrepancies, if any, shall be considered unless brought to the notice of the company in writing within 3 days of the receipt of the bill.</h4>
                                      <h4 class="bottom-text-size">3. <strong>Dispute if any shall be subjected to the jurisdiction of Mumbai Courts only.</strong></h4>
                                          </div>
                                          <div class="col-4 d-block-end">
                                              <div class="d-block-center">
                                                  <p class="p-0 m-0">For <strong>VIP LOGISTICS</strong></p>
                                              <img class="sign p-0 m-0" src="../../../images/vip-sign.png" alt="Loading...">
                                              <p class="text-bold"><strong>AUTHORIZED SIGNATORY</strong></p>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                  </div>
              </div>
          </div>



          <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
              integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
              crossorigin="anonymous"></script>
      </body>

      </html>
      `);

      printWindow.document.close();
      // ✅ Print after content is loaded
      setTimeout(() => {
        printWindow.print();
        printWindow.close(); // Close print window after printing
      }, 500);
    }
  }
}

import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {StorageService} from '../../services/storage/storage.service';
import {ApiService} from '../../services/api/api.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import {WebSocketService} from '../../services/api/web-socket.service';
import {MatButtonToggleChange} from '@angular/material/button-toggle';
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
  totalLRCharges: number = 0;
  totalLoadingCharges: number = 0;
  totalPlywoodCharges: number = 0;
  totalCollectionCharges: number = 0;
  totalDetentionCharges: number = 0;
  totalStCharges: number = 0;

  private formBuilder = inject(FormBuilder);
  private storageService = inject(StorageService);
  private apiService = inject(ApiService);
  private webSocketService = inject(WebSocketService);

  readEnabled: boolean = false;
  writeEnabled: boolean = false;
  updateEnabled: boolean = false;
  deleteEnabled: boolean = false;
  currentLoggedUser: any;
  private savedBillData: any;
  customPrintLrStatus: Boolean = true;

  constructor() {
    this.form = this.formBuilder.group({
      customLrStatus: new FormControl('system-lr'),
      freightBillReportId: new FormControl(''),
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

  customLrData: { [key: number]: string } = {};
  updateCustomLr(index: number, value: string): void {
    this.customLrData[index] = value;
  }

  findFreightByBill(event: any) {
    let billNo = this.form.get('billNo')?.value;
    if (billNo) {
      this.checkFreightBillExist(billNo);
      this.apiService.getChakanFreightByBillNo(billNo, event).subscribe(res => {
        if (res !== 0) {
          this.billingData = res.chakanFreightBillDtos;
          this.billingCommonData = res.commonFreightBillDataDto;

          console.log(this.billingCommonData);

          this.billingCharges = res.chakanExtraCharges;

          this.billingCharges.map((b: any) => {
            this.totalLoadingCharges += b.loadingCharges;
            this.totalUnloadingCharges += b.unloadingCharges;
            this.totalPlywoodCharges += b.plyWoodCharges;
            this.totalDetentionCharges += b.detentionCharges;
            this.totalLRCharges += b.lrCharges;
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
            grandTotal: this.getGrandTotal()
          });
          this.form.get('billNo')?.disable();
          this.form.get('route.routeName')?.disable();
        }
      }, err => {
        console.log(err)
      })
    }
  }

  checkFreightBillExist(billNo: any) {
    this.apiService.getChakanSavedFreightByBillNo(billNo).subscribe(res => {
      if (res) {
        this.savedBillData = res;
        this.writeEnabled = false;
        this.readEnabled = this.savedBillData.isVerified;
        if (this.currentLoggedUser.roleDto.roleName === 'SUPER_ADMIN' || this.currentLoggedUser.roleDto.roleName === 'ADMIN') {
          this.deleteEnabled = true;
          this.readEnabled = true;
        }
        this.form.patchValue({
          freightBillReportId: this.savedBillData.freightBillReportId
        });
      } else {
        this.writeEnabled = true;
        this.readEnabled = false;
        this.deleteEnabled = false;
        // if (this.currentLoggedUser.roleDto.roleName === 'SUPER_ADMIN' || this.currentLoggedUser.roleDto.roleName === 'ADMIN') {
        //   this.readEnabled = true;
        //   this.deleteEnabled = true;
        // }
      }
    }, error => {
      console.log(error);
    });
  }

  deleteChakanFreightBill() {
    let freightId = this.form.get('freightBillReportId')?.value;
    if (freightId) {
      this.apiService.deleteChakanFreightBill(freightId).subscribe(res => {
        if (res) {
          this.clearField();
          $.toast({
            heading: 'Bill Removed!',
            text: 'You have deleted the rajkot bill information!!',
            showHideTransition: 'fade',
            icon: 'info',
            position: 'top-center',
            bgColor: '#1e6421',
            loader: false,
          });
        }
      }, err => {
        console.log(err);
      })
    } else {
      $.toast({
        heading: 'Invalid Bill Information!',
        text: 'Please select bill before delete!!',
        showHideTransition: 'fade',
        icon: 'info',
        position: 'bottom-center',
        bgColor: '#3152be',
        loader: false,
      });
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

  getLRCharges() {
    return this.totalLRCharges;
  }
  getDisplayLRCharges(lrNo: string): number {
    return this.billingCharges
      .filter((item) => item.lrNo === lrNo) // Filter records with the same lrNo
      .reduce((sum, item) => sum + (item.lrCharges || 0), 0); // Sum only totalFreight values
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
    let totalFreight = this.getDisplayTotalFreight(lrNo) || 0;
    let unloadingCharge = this.getDisplayUnloadingCharges(lrNo) || 0;
    let stCharge = this.getDisplaySTCharges(lrNo) || 0;
    let cgst = this.getDisplayCGST(lrNo) || 0;
    let sgst = this.getDisplaySGST(lrNo) || 0;
    return (totalFreight + unloadingCharge + stCharge + cgst + sgst);
  }

  getGrandTotal(): number{
    return Number((this.getTotalFreight() + this.totalUnloadingCharges + this.totalLRCharges + this.getCGST() + this.getSGST()).toFixed(2));
  }


  saveChakanFreight() {
    const formObj = {
      "billNo": this.form.get('billNo')?.value,
      "billDate": this.form.get('billDate')?.value,
      "partyName": this.form.get('partyName')?.value,
      "address": this.form.get('partyAddress')?.value,
      "district": this.form.get('partyDist')?.value,
      "stateCode": this.form.get('partyStateCode')?.value,
      "gstNo": this.form.get('GSTNo')?.value,
      "routeName": this.form.get('route.routeName')?.value,
      "codeNo": this.form.get('vCode')?.value,
      "ml": this.form.get('mlCode')?.value,
      "sac": this.form.get('sacNo')?.value,
      "isVerified": false,
      "requestedBy": this.currentLoggedUser.userName
    }
    if (this.currentLoggedUser.roleDto.roleName === 'SUPER_ADMIN' || this.currentLoggedUser.roleDto.roleName === 'ADMIN') {
      formObj.isVerified = true;
    }

    this.apiService.saveChakanFreight(formObj).subscribe(res => {
      if (res) {
        this.clearField();
        let message = "Hello there!!,  Freight Bill Approval Submitted!!";
        this.webSocketService.sendMessage('/app/sendMessage', message, 'FREIGHT-APPROVAL');
        $.toast({
          heading: 'Chakan freight bill has been submitted!',
          text: 'You have submitted the Chakan freight bill. Please contact to respective authority member for approval.',
          showHideTransition: 'fade',
          icon: 'info',
          position: 'top-center',
          bgColor: '#257b26',
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
    this.form.get('customLrStatus')?.setValue('system-lr');
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
            ${shouldShowLrNo && !this.customPrintLrStatus ? `<td rowspan="${rowSpan}" class="text-center align-middle text-bold">${l.customLrNo}</td>` : ""}
            ${shouldShowLrNo && this.customPrintLrStatus ? `<td rowspan="${rowSpan}" class="text-center align-middle text-bold">${l.lrNo}</td>` : ""}

            <td>${this.formatDate(l.lrDate)}</td>
            <td>${this.formatDate(l.unloadingDate)}</td>
            <td>${l.from}</td>
            <td>${l.to}</td>
            <td>${(l.consignor).replace(/\-\(.*?\)/g, '')}</td>
            <td>${(l.consignee).replace(/\-\(.*?\)/g, '')}</td>
            <td>${l.invoiceNo}</td>
            <td>${l.vehicleNo}</td>
            <td>${l.vehicleType || '-'}</td>
            <td>TRIP NO</td>
            ${shouldShowLrNo ? `<td rowspan="${rowSpan}" class="text-center align-middle">${this.getDisplayTotalFreight(l.lrNo)}</td>` : ""}
            ${shouldShowLrNo ? `<td rowspan="${rowSpan}" class="text-center align-middle">${this.getDisplayUnloadingCharges(l.lrNo) || 0}</td>` : ""}
            ${shouldShowLrNo ? `<td rowspan="${rowSpan}" class="text-center align-middle">${this.getDisplayCGST(l.lrNo).toFixed(2)}</td>` : ""}
            ${shouldShowLrNo ? `<td rowspan="${rowSpan}" class="text-center align-middle">${this.getDisplaySGST(l.lrNo).toFixed(2)}</td>` : ""}
            ${shouldShowLrNo ? `<td rowspan="${rowSpan}" class="text-center align-middle">${this.getDisplayLRCharges(l.lrNo).toFixed(2)}</td>` : ""}
            ${shouldShowLrNo ? `<td rowspan="${rowSpan}" class="text-center align-middle">${this.getTotalBillValue(l.lrNo).toFixed(2)}</td>` : ""}
        </tr>
        `;
      }).join('');

      let invoiceTableHeader = `
            <thead>
              <tr>
                  <th>LR No.</th>
                  <th>LR Date</th>
                  <th>Unl. Date</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Consignor</th>
                  <th>Consignee</th>
                  <th>Invoice No.</th>
                  <th>Vehicle No</th>
                  <th>Vehicle Type</th>
                  <th>TRIP NO</th>
                  <th>Freight</th>
                  <th>Unloading Charges</th>
                  <th>CGST 6%</th>
                  <th>SGST 6%</th>
                  <th>LR Charges</th>
                  <th>Invoice Amount</th>
              </tr>
            </thead>
        `;

      let invoiceFooterTable = `
          <tr class="text-center">
              <th colspan="11">Grand Totals - </th>
              <th>₹${this.getTotalFreight().toFixed(2)}</th>
              <th>₹${this.getUnloadingCharges().toFixed(2)}</th>
              <th>₹${this.getCGST().toFixed(2)}</th>
              <th>₹${this.getSGST().toFixed(2)}</th>
              <th>₹${this.getLRCharges().toFixed(2)}</th>
              <th>₹${(this.getGrandTotal().toFixed(2))}</th>
          </tr>
      `;


      printWindow.document.write(`
      <!doctype html>
      <html lang="en">

      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Chakan Freight Bill (${this.billingCommonData.billNo})</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
              integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
          <style>
              @media print {
                  th,
                  td {
                      font-size: 8px;
                      font-weight: 500;
                  }
                  .printButton{display: none;}
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
                  min-height: 2px;  /* Ensures a minimum cell height */
                  line-height: 1.5;  /* Adjust line height for better readability */
              }

              td {
                  padding: 0;
                  margin: 0;
                  vertical-align: middle;
                  font-weight: 500;
                  min-height: 1px;  /* Ensures a minimum cell height */
                  line-height: 0.5;  /* Adjust line height for better readability */
                    overflow: hidden;  /* Hides overflow text */
                    white-space: nowrap;  /* Prevents text from wrapping */
                    text-overflow: ellipsis;  /* Adds '...' when text overflows */
                    max-width: 100px;  /* Set a maximum width for truncation */
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
              .stamp {
                  width: 100px;
                  display: block;
                  margin: 0 auto;
              }
          </style>
      </head>

      <body>
<div class="row">
                    <div class="col d-flex justify-content-center p-2">
                        <button class="btn printButton btn-block btn-lg btn-primary px-4 pt-2 pb-2 mx-2" onclick="window.print()">Print</button>
                        <button class="btn printButton btn-block btn-lg btn-danger px-4 pt-2 pb-2 mx-2" onclick="window.close()">Cancel</button>
                    </div>
                </div>
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
                                                  <th>BA PAN No: <span class="text-muted">AKJPP0760D</span></th>
                                              </tr>
                                              <tr>
                                                  <th>Place of Supply: <span class="text-muted">MAHARASHTRA</span></th>
                                              </tr>
                                              <tr>
                                                  <th>BA GSTIN: <span class="text-muted">27AAFCM2530H1ZO</span></th>
                                              </tr>
                                              <tr>
                                                  <th>BA CIN No: <span class="text-muted">NO</span></th>
                                              </tr>
                                              <tr>
                                                  <th><span class="text-muted">GST payable under reverse charge:</span></th>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </div>

                                  <!-- Center Section -->
                                  <div class="col-4 px-2 text-start">
                                      <table class="table table-bordered custom-border">
                                          <tbody class="d-block-center">
                                              <tr>
                                                  <th>TO</th>
                                              </tr>
                                              <tr>
                                                  <th>${(this.billingCommonData.partyName).replace(/\-\(.*?\)/g, '')}</th>
                                              </tr>
                                              <tr>
                                                  <th>${(this.billingCommonData.address)}</th>
                                              </tr>
                                              <tr>
                                                  <th>STATE: MAHARASHTRA. STATE CODE 27</th>
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
                                                  <td>${this.billingCommonData.billNo}</td>
                                                  <th>Bill Date</th>
                                                  <td>${this.formatDate(this.billingCommonData.billDate)}</td>
                                              </tr>
                                              <tr>
                                                  <th>MLL Ref No</th>
                                                  <td colspan="3">F25CIVP00000091</td>
                                              </tr>
                                              <tr>
                                                  <th>Nature of Service</th>
                                                  <td colspan="3">Vehicle Hiring Service</td>
                                              </tr>
                                              <tr>
                                                  <th>HSN / SAC</th>
                                                  <td colspan="3">996511</td>
                                              </tr>
                                              <tr>
                                                  <th>MLL PAN No</th>
                                                  <td colspan="3">AAFCM2530H</td>
                                              </tr>
                                              <tr>
                                                  <th>MLL GSTIN</th>
                                                  <td colspan="3">${this.billingCommonData.gstNo}</td>
                                              </tr>
                                              <tr>
                                                  <th>MLL CIN No</th>
                                                  <td colspan="3">L63000MH2007PLC17346</td>
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
                                      <h3 class="bottom-text-size">Amount In Words :- <strong>${this.convertNumberToWords(Number((this.getGrandTotal()).toFixed(2)))}</strong></h3>
                                      <h3 class="bottom-text-size"><strong>Remarks :- </strong>Exemted vide Sr no 22 of Notifacation no 12/2017-Central Tax dated 28 June 2017 and as notified By State Under GST LAW</h3>
                                  </div>
                                  <div class="col-12 mb-0 mt-0 pt-0">
                                      <div class="row">
                                          <div class="col-6">
                                          <h4 class="bottom-text-size">Terms and Conditions:</h4>
                                          <h4 class="bottom-text-size">Classifaction of supply- Exempted</h4>
                                          <h4 class="bottom-text-size">1. All Payments by cheques / drafts in favor of " (Transporter Name) " should be crossed to payees account.</strong></h4>
                                          </div>
                                          <div class="col-2">
                                              <div class="d-block-center">
                                                <img class="stamp p-0 m-0" src="../../../images/VIP-STAMP.png" alt="Loading...">
                                              </div>
                                          </div>
                                          <div class="col-4">
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
    }
  }

  generatePDF() {
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
            ${shouldShowLrNo && !this.customPrintLrStatus ? `<td rowspan="${rowSpan}" class="text-center align-middle text-bold">${l.customLrNo}</td>` : ""}
            ${shouldShowLrNo && this.customPrintLrStatus ? `<td rowspan="${rowSpan}" class="text-center align-middle text-bold">${l.lrNo}</td>` : ""}

            <td>${this.formatDate(l.lrDate)}</td>
            <td>${this.formatDate(l.unloadingDate)}</td>
            <td>${l.from}</td>
            <td>${l.to}</td>
            <td>${(l.consignor).replace(/\-\(.*?\)/g, '')}</td>
            <td>${(l.consignee).replace(/\-\(.*?\)/g, '')}</td>
            <td>${l.invoiceNo}</td>
            <td>${l.vehicleNo}</td>
            <td>${l.vehicleType || '-'}</td>
            <td>TRIP NO</td>
            ${shouldShowLrNo ? `<td rowspan="${rowSpan}" class="text-center align-middle">${this.getDisplayTotalFreight(l.lrNo)}</td>` : ""}
            ${shouldShowLrNo ? `<td rowspan="${rowSpan}" class="text-center align-middle">${this.getDisplayUnloadingCharges(l.lrNo) || 0}</td>` : ""}
            ${shouldShowLrNo ? `<td rowspan="${rowSpan}" class="text-center align-middle">${this.getDisplayCGST(l.lrNo).toFixed(2)}</td>` : ""}
            ${shouldShowLrNo ? `<td rowspan="${rowSpan}" class="text-center align-middle">${this.getDisplaySGST(l.lrNo).toFixed(2)}</td>` : ""}
            ${shouldShowLrNo ? `<td rowspan="${rowSpan}" class="text-center align-middle">${this.getDisplayLRCharges(l.lrNo).toFixed(2)}</td>` : ""}
            ${shouldShowLrNo ? `<td rowspan="${rowSpan}" class="text-center align-middle">${this.getTotalBillValue(l.lrNo).toFixed(2)}</td>` : ""}
        </tr>
        `;
      }).join('');

      let invoiceTableHeader = `
            <thead>
              <tr>
                  <th>LR No.</th>
                  <th>LR Date</th>
                  <th>Unl. Date</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Consignor</th>
                  <th>Consignee</th>
                  <th>Invoice No.</th>
                  <th>Vehicle No</th>
                  <th>Vehicle Type</th>
                  <th>TRIP NO</th>
                  <th>Freight</th>
                  <th>Unloading Charges</th>
                  <th>CGST 6%</th>
                  <th>SGST 6%</th>
                  <th>LR Charges</th>
                  <th>Invoice Amount</th>
              </tr>
            </thead>
        `;

      let invoiceFooterTable = `
          <tr class="text-center">
              <th colspan="11">Grand Totals - </th>
              <th>₹${this.getTotalFreight().toFixed(2)}</th>
              <th>₹${this.getUnloadingCharges().toFixed(2)}</th>
              <th>₹${this.getCGST().toFixed(2)}</th>
              <th>₹${this.getSGST().toFixed(2)}</th>
              <th>₹${this.getLRCharges().toFixed(2)}</th>
              <th>₹${(this.getGrandTotal().toFixed(2))}</th>
          </tr>
      `;


      let htmlContent = `
      <!doctype html>
      <html lang="en">

      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Chakan Freight Bill (${this.billingCommonData.billNo})</title>
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
                  min-height: 2px;  /* Ensures a minimum cell height */
                  line-height: 1.5;  /* Adjust line height for better readability */
              }

              td {
                  padding: 0;
                  margin: 0;
                  vertical-align: middle;
                  font-weight: 500;
                  min-height: 1px;  /* Ensures a minimum cell height */
                  line-height: 0.5;  /* Adjust line height for better readability */
                    overflow: hidden;  /* Hides overflow text */
                    white-space: nowrap;  /* Prevents text from wrapping */
                    text-overflow: ellipsis;  /* Adds '...' when text overflows */
                    max-width: 100px;  /* Set a maximum width for truncation */
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
              .stamp {
                  width: 100px;
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
                                                  <th>BA PAN No: <span class="text-muted">AKJPP0760D</span></th>
                                              </tr>
                                              <tr>
                                                  <th>Place of Supply: <span class="text-muted">MAHARASHTRA</span></th>
                                              </tr>
                                              <tr>
                                                  <th>BA GSTIN: <span class="text-muted">27AAFCM2530H1ZO</span></th>
                                              </tr>
                                              <tr>
                                                  <th>BA CIN No: <span class="text-muted">NO</span></th>
                                              </tr>
                                              <tr>
                                                  <th><span class="text-muted">GST payable under reverse charge:</span></th>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </div>

                                  <!-- Center Section -->
                                  <div class="col-4 px-2 text-start">
                                      <table class="table table-bordered custom-border">
                                          <tbody class="d-block-center">
                                              <tr>
                                                  <th>TO</th>
                                              </tr>
                                              <tr>
                                                  <th>${(this.billingCommonData.partyName).replace(/\-\(.*?\)/g, '')}</th>
                                              </tr>
                                              <tr>
                                                  <th>${(this.billingCommonData.address)}</th>
                                              </tr>
                                              <tr>
                                                  <th>STATE: MAHARASHTRA. STATE CODE 27</th>
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
                                                  <td>${this.billingCommonData.billNo}</td>
                                                  <th>Bill Date</th>
                                                  <td>${this.formatDate(this.billingCommonData.billDate)}</td>
                                              </tr>
                                              <tr>
                                                  <th>MLL Ref No</th>
                                                  <td colspan="3">F25CIVP00000091</td>
                                              </tr>
                                              <tr>
                                                  <th>Nature of Service</th>
                                                  <td colspan="3">Vehicle Hiring Service</td>
                                              </tr>
                                              <tr>
                                                  <th>HSN / SAC</th>
                                                  <td colspan="3">996511</td>
                                              </tr>
                                              <tr>
                                                  <th>MLL PAN No</th>
                                                  <td colspan="3">AAFCM2530H</td>
                                              </tr>
                                              <tr>
                                                  <th>MLL GSTIN</th>
                                                  <td colspan="3">${this.billingCommonData.gstNo}</td>
                                              </tr>
                                              <tr>
                                                  <th>MLL CIN No</th>
                                                  <td colspan="3">L63000MH2007PLC17346</td>
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
                                      <h3 class="bottom-text-size">Amount In Words :- <strong>${this.convertNumberToWords(Number((this.getGrandTotal()).toFixed(2)))}</strong></h3>
                                      <h3 class="bottom-text-size"><strong>Remarks :- </strong>Exemted vide Sr no 22 of Notifacation no 12/2017-Central Tax dated 28 June 2017 and as notified By State Under GST LAW</h3>
                                  </div>
                                  <div class="col-12 mb-0 mt-0 pt-0">
                                      <div class="row">
                                          <div class="col-6">
                                          <h4 class="bottom-text-size">Terms and Conditions:</h4>
                                          <h4 class="bottom-text-size">Classifaction of supply- Exempted</h4>
                                          <h4 class="bottom-text-size">1. All Payments by cheques / drafts in favor of " (Transporter Name) " should be crossed to payees account.</strong></h4>
                                          </div>
                                          <div class="col-2">
                                              <div class="d-block-center">
                                                <img class="stamp p-0 m-0" src="../../../images/VIP-STAMP.png" alt="Loading...">
                                              </div>
                                          </div>
                                          <div class="col-4">
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
      `
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      setTimeout(() => {
        html2canvas(printWindow.document.body, {scale: 2}).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' for landscape
          const pageWidth = 297; // A4 width in landscape
          const pageHeight = 210; // A4 height in landscape

          const imgWidth = pageWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

          if (imgHeight > pageHeight) {
            // If content is larger than one page, split into multiple pages
            let position = 0;
            while (position < imgHeight) {
              pdf.addImage(imgData, 'PNG', 0, position * -1, imgWidth, imgHeight);
              position += pageHeight; // Move to the next page height
              if (position < imgHeight) pdf.addPage();
            }
          } else {
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
          }

          pdf.save('chakan-freight-bill-' + this.billingCommonData.billNo + '.pdf');
          printWindow.close();
        });
      }, 300);
    }
  }

  exportToExcel() {
    let wb = XLSX.utils.book_new(); // Create a new workbook
    let wsData = [];

    // Table headers
    let headers = [
      "LR No.", "LR Date", "Unl. Date", "From", "To",
      "Consignor", "Consignee", "Invoice No.", "Vehicle No",
      "Vehicle Type", "TRIP NO", "Freight", "Unloading Charges",
      "CGST 6%", "SGST 6%", "LR Charges", "Invoice Amount"
    ];
    wsData.push(headers);

    // Table body
    let processedLrNos = new Set();
    this.billingData.forEach(l => {
      let shouldShowLrNo = !processedLrNos.has(l.lrNo);
      if (shouldShowLrNo) {
        processedLrNos.add(l.lrNo);
      }

      let row = [
        shouldShowLrNo && !this.customPrintLrStatus ? l.customLrNo : "",
        shouldShowLrNo && this.customPrintLrStatus ? l.lrNo : "",
        this.formatDate(l.lrDate),
        this.formatDate(l.unloadingDate),
        l.from,
        l.to,
        (l.consignor).replace(/\-\(.*?\)/g, ''),
        (l.consignee).replace(/\-\(.*?\)/g, ''),
        l.invoiceNo,
        l.vehicleNo,
        l.vehicleType || '-',
        "TRIP NO",
        shouldShowLrNo ? this.getDisplayTotalFreight(l.lrNo) : "",
        shouldShowLrNo ? this.getDisplayUnloadingCharges(l.lrNo) || 0 : "",
        shouldShowLrNo ? this.getDisplayCGST(l.lrNo).toFixed(2) : "",
        shouldShowLrNo ? this.getDisplaySGST(l.lrNo).toFixed(2) : "",
        shouldShowLrNo ? this.getDisplayLRCharges(l.lrNo).toFixed(2) : "",
        shouldShowLrNo ? this.getTotalBillValue(l.lrNo).toFixed(2) : ""
      ];
      wsData.push(row);
    });

    // Table Footer (Grand Totals)
    let footer = [
      "Grand Totals -", "", "", "", "", "", "", "", "", "", "",
      this.getTotalFreight().toFixed(2),
      this.getUnloadingCharges().toFixed(2),
      this.getCGST().toFixed(2),
      this.getSGST().toFixed(2),
      this.getLRCharges().toFixed(2),
      this.getGrandTotal().toFixed(2)
    ];
    wsData.push(footer);

    // Convert data to a worksheet
    let ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Invoice Data");

    // Save the file
    XLSX.writeFile(wb, "chakan-freight-bill-" + this.billingCommonData.billNo + ".xlsx");
  }

  changeLrStatus(status: MatButtonToggleChange) {
    if(status){
      let lrStatus = status.value;
      if(lrStatus === "custom-lr"){
        this.customPrintLrStatus = false;
      } if(lrStatus === "system-lr"){
        this.customPrintLrStatus = true;
      }
    }
  }
}

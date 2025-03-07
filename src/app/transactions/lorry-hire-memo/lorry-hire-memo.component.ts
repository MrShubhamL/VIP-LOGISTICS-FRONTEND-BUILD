import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ApiService} from '../../services/api/api.service';
import {StorageService} from '../../services/storage/storage.service';

declare var $: any;

@Component({
  selector: 'app-lorry-hire-memo',
  standalone: false,
  templateUrl: './lorry-hire-memo.component.html',
  styleUrl: './lorry-hire-memo.component.scss'
})
export class LorryHireMemoComponent {
  form!: FormGroup;
  lorryForm!: FormGroup;
  memoDate: any;
  paymentMode: string[] = ["Cash", "Bank"];
  memoData: any[] = [];
  routeInfo: any;
  listInvoiceData: any[] = [];
  isDataLoading: boolean = true;
  isMemoNoEmpty: boolean = true;

  filteredHireData: any[] = [];
  hireData: any[] = [];
  isHireModalOpen: boolean = false;
  selectedHireItem: any = null;
  isEditModeOn: boolean = false;

  private formBuilder = inject(FormBuilder);
  private apiService = inject(ApiService);
  private storageService = inject(StorageService);

  readEnabled: boolean = false;
  writeEnabled: boolean = false;
  updateEnabled: boolean = false;
  deleteEnabled: boolean = false;
  currentLoggedUser: any;

  filteredVehicleData: any;
  listVehicleData: any[] = [];

  constructor() {
    this.form = this.formBuilder.group({
      searchMemoQuery: new FormControl(''),
      lorryHireMemoId: new FormControl(''),
      branch: this.formBuilder.group({
        branchNo: new FormControl('', Validators.required),
        branchName: new FormControl('', Validators.required)
      }),
      vehicle: this.formBuilder.group({
        vehicleId: new FormControl(''),
        vehicleNumber: new FormControl('', Validators.required),
        permitNo: new FormControl(''),
        licenceNo: new FormControl(''),
        ownerName: new FormControl(''),
        driverName: new FormControl(''),
      }),
      memo: this.formBuilder.group({
        memoNo: new FormControl('', Validators.required),
        memoDate: new FormControl('', Validators.required)
      }),
      totalHire: new FormControl(0.00),
      advance: new FormControl(0.00),
      extraCollection: new FormControl(0.00),
      commission: new FormControl(0.00),
      hamali: new FormControl(0.00),
      misc: new FormControl(0.00),
      total: new FormControl(0.00),
      balance: new FormControl(0.00),
      advancePaymentType: new FormControl(''),
      advanceCashBankAcNo: new FormControl(''),
      advanceCheDdNo: new FormControl(''),
      advanceCheDdDate: new FormControl(''),
      finalPaymentType: new FormControl(''),
      finalCashBankAcNo: new FormControl(''),
      finalCheNo: new FormControl(''),
      finalCheDate: new FormControl(''),
    });
    this.lorryForm = this.formBuilder.group({
      lrNo: new FormControl(''),
      lrDate: new FormControl(''),
      memoNo: new FormControl(''),
      memoDate: new FormControl(''),
    });
  }

  ngOnInit() {
    this.apiService.getAllVehicles().subscribe(res => {
      if (res) {
        this.listVehicleData = res;
      }
    }, err => {
      console.log(err)
    });

    this.apiService.getAllHireMemos().subscribe(res => {
      if (res) {
        this.hireData = res;
        console.log(res);
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
        if (p.userPermission == 'item-records') {
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

  editData(lr: any) {
    this.lorryForm.patchValue({
      lrNo: lr.lrNo,
      lrDate: lr.lrDate,
      memoNo: this.form.get('memo.memoNo')?.value,
      memoDate: this.form.get('memo.memoDate')?.value,
    })
  }

  formSubmit() {
    if (!this.form.invalid) {
      this.apiService.addHireMemo(this.form.value).subscribe(res => {
        if (res) {
          this.cancel();
          $.toast({
            heading: 'Hire Memo Created!',
            text: 'You have created a new hire memo.',
            showHideTransition: 'fade',
            icon: 'success',
            position: 'bottom-right',
            bgColor: '#31be3d',
            loader: false,
          });
        }
      }, err => {
        console.log(err);
      })
    }
  }

  updateLorryHire() {
    this.apiService.updateHireMemo(this.form.value).subscribe(res => {
      if (res) {
        this.cancel();
        $.toast({
          heading: 'Lorry Hire Memo Updated!',
          text: 'You have updated lorry hire memo.',
          showHideTransition: 'fade',
          icon: 'success',
          position: 'bottom-right',
          bgColor: '#3abe31',
          loader: false,
        });
      }
    }, error => {
      console.log(error)
    })
  }

  deleteHireMemo() {
    const hireMemoId = this.form.get('lorryHireMemoId')?.value;
    if (hireMemoId) {
      this.apiService.deleteHireMemo(hireMemoId).subscribe(res => {
        if (res) {
          this.cancel();
          $.toast({
            heading: 'Lorry Hire Memo Deleted!',
            text: 'You have deleted lorry hire memo.',
            showHideTransition: 'fade',
            icon: 'success',
            position: 'bottom-right',
            bgColor: '#3abe31',
            loader: false,
          });
        }
      }, error => {
        console.log(error)
      })
    }
  }

  lorryFormSubmit(modal: any) {
    let lrNo = this.lorryForm.get('lrNo')?.value;
    let lrDate = this.lorryForm.get('lrDate')?.value;
    let memoNo = this.lorryForm.get('memoNo')?.value;
    let memoDate = this.lorryForm.get('memoDate')?.value;

    this.apiService.updateLrByLrNoAndMemoNo(lrNo, memoNo, lrDate, memoDate).subscribe(res => {
      if (res) {
        this.cancel();
        $.toast({
          heading: 'Lorry Receipt Details Updated!',
          text: 'You have updated lr details.',
          showHideTransition: 'fade',
          icon: 'success',
          position: 'bottom-right',
          bgColor: '#316ebe',
          loader: false,
        });
      }
    }, err => {
      console.log(err);
    });

    (modal as HTMLElement).classList.remove('show'); // Remove 'show' class
    document.body.classList.remove('modal-open'); // Remove modal-open class from body
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove(); // Remove the backdrop
    }
  }

  cancel() {
    this.ngOnInit();
    this.form.reset();
    this.form.get('totalHire')?.setValue(0.00);
    this.form.get('advance')?.setValue(0.00);
    this.form.get('extraCollection')?.setValue(0.00);
    this.form.get('commission')?.setValue(0.00);
    this.form.get('hamali')?.setValue(0.00);
    this.form.get('misc')?.setValue(0.00);
    this.form.get('total')?.setValue(0.00);
    this.form.get('balance')?.setValue(0.00);
    this.form.get('memo.memoNo')?.enable();
    this.isDataLoading = true;
    this.isMemoNoEmpty = true;
    this.isEditModeOn = false;
    this.listInvoiceData = [];
  }

  getRecordsByMemoNo(event: any) {
    if (event) {
      this.apiService.getLorriesByMemoNo(event).subscribe(res => {
        if (res) {
          this.memoData = res;

          const lrList: any[] = [];
          let _branch: any;
          let _vehicle: any;
          let _memo: any;
          let _memoStatus: boolean = false;
          let vehicleDetails: any;
          this.memoData.map((m: any) => {
            _branch = m.branch;
            _vehicle = m.refTruckNo;
            _memo = m.memo;
            _memoStatus = m.memo.memoStatus;
            this.memoDate = m.memo;
            this.routeInfo = m.route;
            m.lorryReceiptItems.map((it: any) => {
              let _list = {
                lrNo: m.lrNo,
                lrDate: m.lrDate,
                consignor: m.consignor.partyName,
                consignee: m.consignee.partyName,
                quantity: it.quantity,
                partNo: it.item.partNo,
                invoice_no: it.chalanNo,
                asn_no: it.asnNo
              }
              lrList.push(_list);
            })
          });

          if (_memoStatus) {
            this.isEditModeOn = true;
            this.form.get('memo.memoNo')?.disable();
          }

          if (_vehicle) {
            const vehicleNo = _vehicle.toString().trim().toLowerCase();
            if (vehicleNo) {
              this.filteredVehicleData = this.listVehicleData.filter(
                (v) =>
                  v.vehicleNumber.toLowerCase().includes(vehicleNo)
              );
              this.filteredVehicleData.map((v: any) => {
                vehicleDetails = v
              })
            }
          }
          if (_branch && _vehicle && _memo != 'undefined') {
            this.form.patchValue({
              branch: _branch,
              vehicle: vehicleDetails,
              memo: {
                memoDate: _memo.memoDate
              }
            });
            this.isDataLoading = false;
            this.isMemoNoEmpty = false;
            this.listInvoiceData = lrList;
          }
        }
      }, err => {
        console.log(err);
      })
    }
  }


  onMemoSearch() {
    const query = (this.form.get('searchMemoQuery')?.value || '')
      .toString()
      .trim()
      .toLowerCase();
    console.log(query);
    this.filteredHireData = this.hireData.filter(
      (h) =>
        h.memo.memoNo.toLowerCase().includes(query)
    );
    this.isHireModalOpen = query.length > 0 && this.filteredHireData.length > 0;
  }

  closeHireModal() {
    this.isHireModalOpen = false;
    this.selectedHireItem = null; // Clear the selected item when closing the modal
  }

  selectHireRow(item: any) {
    this.selectedHireItem = item;
    this.confirmHireSelection();
  }

  confirmHireSelection() {
    if (this.selectedHireItem) {
      this.isEditModeOn = true;
      this.form.get('searchMemoQuery')?.reset();
      this.form.patchValue({
        lorryHireMemoId: this.selectedHireItem.lorryHireMemoId,
        memo: {
          memoNo: this.selectedHireItem.memo.memoNo,
          memoDate: this.selectedHireItem.memo.memoDate
        },
        totalHire: this.selectedHireItem.totalHire,
        advance: this.selectedHireItem.advance,
        extraCollection: this.selectedHireItem.extraCollection,
        commission: this.selectedHireItem.commission,
        hamali: this.selectedHireItem.hamali,
        misc: this.selectedHireItem.misc,
        total: this.selectedHireItem.total,
        balance: this.selectedHireItem.balance,

        advancePaymentType: this.selectedHireItem.advancePaymentType,
        advanceCashBankAcNo: this.selectedHireItem.advanceCashBankAcNo,
        advanceCheDdNo: this.selectedHireItem.advanceCheDdNo,
        advanceCheDdDate: this.selectedHireItem.advanceCheDdDate,
        finalPaymentType: this.selectedHireItem.finalPaymentType,
        finalCashBankAcNo: this.selectedHireItem.finalCashBankAcNo,
        finalCheNo: this.selectedHireItem.finalCheNo,
        finalCheDate: this.selectedHireItem.finalCheDate,
      });
      if (this.isEditModeOn) {
        this.form.get('memo.memoNo')?.disable();
      }
      this.closeHireModal();
    } else {
      alert('No item selected!');
    }
  }


  formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  }

  printDocument() {
    let printWindow = window.open('', '');

    if (printWindow) {

      let invoiceRows = this.listInvoiceData.map((p: any) => `
            <tr>
                <td class="text-xs">${p.lrNo || ''}</td>
                <td class="text-xs">${(p.consignor || '').replace(/\-\(.*?\)/g, '')}</td>
                <td class="text-xs">${(p.consignee || '').replace(/\-\(.*?\)/g, '')}</td>
                <td class="text-xs">${p.quantity || ''}</td>
                <td class="text-xs">${p.partNo || ''}</td>
                <td class="text-xs">${p.invoice_no || ''}</td>
                <td class="text-xs">${p.asn_no || ''}</td>
            </tr>
        `).join('');

      printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">

            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>VIP Logistics (Lorry Hire Memo)</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    @media print {
                      th,
                      td {
                            font-size: 8px;
                            font-weight: 500;
                        }
                      p {
                        font-size: 8px;
                        font-weight: 700;
                      }
                      .custom-text-size {
                          font-size: 9px;
                      }
                      .printButton {
                        display: none;
                    }
                    }
                    @page {
                        size: A4 portrait !important;
                        padding: 10px;
                    }
                    * { font-size: 10.8px; }
                    .invoice-box {border: 1px solid black; padding: 5px; margin: 5px;}
                    .table th, .table td { border: 1px solid black; text-align: center; padding: 2px; margin: 0;}
                    .custom-table th, .custom-table td { border: 1px solid black; text-align: start; padding: 3px; margin: 0;}
                    .table-bordered th,
                    .table-bordered td {
                        border: 1px solid black !important;
                        text-align: center;
                    }

                    .header {
                        text-align: center;
                        font-weight: bold;
                    }

                    .signature {
                        margin-top: 50px;
                        text-align: right;
                    }
                    .logo { width: 120px; }
                    .sign { width: 90px; }
                    p {
                        margin: 2px 0;
                        padding: 0;
                        line-height: 1.5;
                        font-size: 10.8px;
                        font-weight: normal;
                    }
                    .dark-color.thin-line {
                      width: 100%;
                      height: 0.5px;
                      background-color: black; /* Dark color */
                      margin: 10px 0; /* Adjust spacing above and below the line */
                    }
                    .custom-text-size {
                        font-size: 9px;
                    }
                </style>
            </head>
            <body>
            <div class="row">
                    <div class="col d-flex justify-content-center p-2">
                        <button class="printButton btn btn-block btn-lg btn-primary p-4 mx-2" onclick="window.print()">Print</button>
                        <button class="printButton btn btn-block btn-lg btn-danger p-4 mx-2" onclick="window.close()">Cancel</button>
                    </div>
                </div>
                <div class="invoice-box">
                    <div class="d-flex align-items-center mb-1">
                      <img src="../../../vpi-logo.png" alt="VIP Logistics Logo" class="logo me-3">
                      <div class="text-center flex-grow-1">
                          <h2 class="header">VIP LOGISTICS</h2>
                          <p>PLOT NO 133, AMBEDKAR NAGAR, NAGAON PHATA, TAL. HATAKANGALE, DIST. KOLHAPUR - 416122.<br>
                             E-mail - viplogistics@yahoo.com</p>
                      </div>
                  </div>

                    <div class="row d-flex">
                        <div class="col-4">
                            <table class="table custom-table">
                                <thead>
                                    <th>Memo No: </th>
                                    <td>${this.memoDate.memoNo}</td>
                                </thead>
                                <thead>
                                    <th>Driver Name: </th>
                                    <td> ${this.form.get('vehicle.driverName')?.value}</td>
                                </thead>
                                <thead>
                                    <th>Owner Name: </th>
                                    <td> ${this.form.get('vehicle.ownerName')?.value}</td>
                                </thead>
                            </table>
                        </div>
                        <div class="col-4 text-center"></div>
                        <div class="col-4 text-end">
                            <table class="table custom-table">
                                <thead>
                                    <th>Date: </th>
                                    <td>${this.formatDate((this.memoDate.memoDate).toString())}</td>
                                </thead>
                                <thead>
                                    <th>Vehicle No: </th>
                                    <td>${this.form.get('vehicle.vehicleNumber')?.value}</td>
                                </thead>
                                <thead>
                                    <th>To: </th>
                                    <td>${this.routeInfo.routeTo}</td>
                                </thead>
                            </table>
                        </div>
                    </div>
                    <div class="dark-color thin-line"></div>
                    <table class="table table-bordered">
                        <thead class="text-sm">
                            <tr>
                                <th>LR No</th>
                                <th>Consignor</th>
                                <th>Consignee</th>
                                <th>QTY.</th>
                                <th>Part No</th>
                                <th>Invoice No</th>
                                <th>ASN No</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoiceRows}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th class="custom-text-size" colspan="2">
                                    <div class="row">
                                        <div class="col text-start custom-text-size">
                                            Total Frt.
                                        </div>
                                        <div class="col text-end custom-text-size">
                                            ₹${this.form.get('totalHire')?.value}
                                        </div>
                                    </div>
                                </th>
                                <td rowspan="5" colspan="3">
                                    <div class="row">
                                        <div class="col-12 text-start">
                                            <p class="middle-info text-center">Received the above goods in good condition.</p>
                                        </div>
                                        <div class="col-12 text-start">
                                            <p class="middle-info text-center">I have read the overieaf Terms and Conditions.</p>
                                        </div>
                                    </div>
                                    <div class="col-12 text-start">
                                        <p class="middle-info text-center">Shall abide the same.</p>
                                    </div>
                                </td>
                                <th class="custom-text-size" colspan="2">
                                    <div class="row">
                                        <div class="col text-start custom-text-size">
                                            Ext. Coll.
                                        </div>
                                        <div class="col text-end custom-text-size">
                                            ₹${this.form.get('extraCollection')?.value}
                                        </div>
                                    </div>
                                </th>
                            </tr>

                            <tr>
                                <th class="custom-text-size" colspan="2">
                                    <div class="row">
                                        <div class="col text-start custom-text-size">
                                            Adv.
                                        </div>
                                        <div class="col text-end custom-text-size">
                                            ₹${this.form.get('advance')?.value}
                                        </div>
                                    </div>
                                </th>
                                <th class="custom-text-size" colspan="2">
                                    <div class="row">
                                        <div class="col text-start custom-text-size">
                                            Commission
                                        </div>
                                        <div class="col text-end custom-text-size">
                                            ₹${this.form.get('commission')?.value}
                                        </div>
                                    </div>
                                </th>
                            </tr>

                            <tr>
                                <th class="custom-text-size" colspan="2">
                                    <div class="row">
                                        <div class="col text-start custom-text-size">
                                            Balance
                                        </div>
                                        <div class="col text-end custom-text-size">
                                            ₹${this.form.get('balance')?.value}
                                        </div>
                                    </div>
                                </th>
                                <th class="custom-text-size" colspan="2">
                                    <div class="row">
                                        <div class="col text-start custom-text-size">
                                            Hamali
                                        </div>
                                        <div class="col text-end custom-text-size">
                                            ₹${this.form.get('hamali')?.value}
                                        </div>
                                    </div>
                                </th>
                            </tr>

                            <tr>
                                <th class="custom-text-size" colspan="2">
                                    <div class="row">
                                        <div class="col text-start custom-text-size">
                                            To Pay
                                        </div>
                                        <div class="col text-end custom-text-size">

                                        </div>
                                    </div>
                                </th>
                                <th class="custom-text-size" colspan="2">
                                    <div class="row">
                                        <div class="col text-start custom-text-size">
                                            Misc.
                                        </div>
                                        <div class="col text-end custom-text-size">
                                            ₹${this.form.get('misc')?.value}
                                        </div>
                                    </div>
                                </th>
                            </tr>

                            <tr>
                                <th colspan="2"></th>
                                <th class="custom-text-size" colspan="2">
                                    <div class="row">
                                        <div class="col text-start custom-text-size">
                                            TOTAL
                                        </div>
                                        <div class="col text-end custom-text-size">
                                            ₹${this.form.get('total')?.value}
                                        </div>
                                    </div>
                                </th>
                            </tr>

                        </tfoot>
                    </table>
                    <div class="row pt-3">
                        <div class="col-3">
                            <p>Subject to Kolhapur Jurisdiction</p>
                        </div>
                        <div class="col-6"></div>
                        <div class="col-3">
                            For <strong>VIP LOGISTICS</strong>
                        </div>
                    </div>

                    <div class="row pt-4">
                        <div class="col-4"></div>
                        <div class="col-4"></div>
                        <div class="col-4 text-center">
                            <img class="sign" src="./../../images/vip-sign.png" alt="Loading...">
                        </div>
                    </div>

                    <div class="row pt-2">
                        <div class="col-4">
                            <p>Signature of Owner/Driver in charge</p>
                        </div>
                        <div class="col-5"></div>
                        <div class="col-3">
                            <p>Partner/Authorised Signatory</p>
                        </div>
                    </div>
                </div>
            </body>

            </html>
        `);

      printWindow.document.write();
      printWindow.document.close();
    }
  }

}

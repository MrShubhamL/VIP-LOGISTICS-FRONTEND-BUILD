import {Component, inject} from '@angular/core';
import {ApiService} from '../../services/api/api.service';
import {StorageService} from '../../services/storage/storage.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

declare var $: any;
import * as XLSX from 'xlsx';
import {saveAs} from 'file-saver';

@Component({
  selector: 'app-mis',
  standalone: false,
  templateUrl: './mis.component.html',
  styleUrl: './mis.component.scss'
})
export class MisComponent {

  form!: FormGroup;
  filterForm!: FormGroup;

  lorryListData: any[] = [];
  filteredLorryListData: any[] = [];
  searchLorry: string = '';

  fileName!: string;
  currentRole: any = '';
  page: number = 1;
  itemsPerPage: number = 15;
  isDataLoading: boolean = true;
  isGranted: boolean = false;

  private apiService = inject(ApiService);
  private storageService = inject(StorageService);
  private formBuilder = inject(FormBuilder);


  constructor() {
    this.form = this.formBuilder.group({
      lrNo: new FormControl(''),
      lrDate: new FormControl(''),
      billNo: new FormControl(''),
      billDate: new FormControl(''),
      unloadDate: new FormControl(''),
      billRNo: new FormControl(''),
    });

    this.filterForm = this.formBuilder.group({
      filterOption: new FormControl('selected'),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required),
    })
  }


  ngOnInit() {
    this.isDataLoading = true;
    this.currentRole = this.storageService.getUserRole();
    if (this.currentRole === 'SUPER_ADMIN' || this.currentRole === 'ADMIN') {
      this.isGranted = true;
    }
  }

  clearFilter() {
    this.filterForm.reset();
    this.filterForm.get('filterOption')?.setValue('selected');
    this.filteredLorryListData = []
  }

  filterData() {
    if (!this.form.invalid) {
      this.apiService.filterByDates(this.filterForm.get('startDate')?.value, this.filterForm.get('endDate')?.value).subscribe(res => {
        if (res) {
          this.filteredLorryListData = res;
        }
      }, error => {
        console.log(error);
      })
    }
  }

  get totalQuantity(): number {
    return this.filteredLorryListData.reduce((sum, lr) => sum + (lr.quantity || 0), 0);
  }

  get totalWeight(): number {
    return this.filteredLorryListData.reduce((sum, lr) => sum + (lr.totalWight || 0), 0);
  }


  formReset() {
    this.form.reset();
    this.clearFilter();
    this.ngOnInit();
  }

  editData(lr: any) {
    console.log(lr);
    this.form.get('lrNo')?.setValue(lr.lrNo);
    this.form.get('lrDate')?.setValue(lr.lrDate);
    this.form.get('billNo')?.setValue(lr.billNo || 10001);
    this.form.get('billDate')?.setValue(lr.billDate || null);
    this.form.get('unloadDate')?.setValue(lr.unloadDate || null);
  }

  formSubmit(modal: any) {
    const lrNo = this.form.get('lrNo')?.value;
    const lrDate = this.form.get('lrDate')?.value;
    const formObj = {
      billNo: this.form.get('billNo')?.value,
      billDate: this.form.get('billDate')?.value,
      unloadDate: this.form.get('unloadDate')?.value,
      billRNo: this.form.get('billRNo')?.value,
    }

    this.apiService.updateLorryReceiptBillDetails(lrNo, lrDate, formObj).subscribe(res => {
      if (res) {
        this.formReset();
        $.toast({
          heading: 'MIS Bill Information Updated',
          text: 'You have updated mis bill information.',
          showHideTransition: 'fade',
          icon: 'success',
          position: 'bottom-right',
          bgColor: '#1f592c',
          loader: false,
        });
      }
    }, err => {
      $.toast({
        heading: 'Bill Number Invalid!!',
        text: 'You have given assigned bill number! Please give another bill no.',
        showHideTransition: 'fade',
        icon: 'success',
        position: 'bottom-center',
        bgColor: '#3266c7',
        loader: false,
      });
    });

    (modal as HTMLElement).classList.remove('show'); // Remove 'show' class
    document.body.classList.remove('modal-open'); // Remove modal-open class from body
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove(); // Remove the backdrop
    }

  }

  formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  }


  exportToExcel(): void {
    let totalQuantity = this.filteredLorryListData.reduce((sum, lr) => sum + lr.quantity, 0);
    let totalWeight = this.filteredLorryListData.reduce((sum, lr) => sum + lr.totalWight, 0);

    let exportData1 = this.filteredLorryListData.map((lr, index) => {
      return {
        "Sr.No": (this.page - 1) * this.itemsPerPage + index + 1,
        "Vendor Code": lr.vendorCode,
        "Vendor Name": lr.vendorName,
        "Part No.": lr.partNo,
        "Part Name": lr.partName,
        "Invoice No.": lr.chalanNo || '',
        "Invoice Date": lr.chalanDate ? this.formatDate(lr.chalanDate) : '',
        "Quantity": lr.quantity,
        "FTL/LCV": lr.lcvFtl,
        "Pack Type": lr.packType,
        "LR No.": lr.lrNo,
        "LR Date": lr.lrDate ? this.formatDate(lr.lrDate) : '',
        "Vehicle No": lr.vehicleNo,
        "Invoice": lr.valueOnChalan || '',
        "Bill No": lr.bill?.billNo || 'N/A',
        "Bill Date": lr.bill?.billDate ? this.formatDate(lr.bill.billDate) : 'N/A',
        "Unload Date": lr.bill?.unloadDate ? this.formatDate(lr.bill.unloadDate) : 'N/A',
        "Total Weight": lr.totalWight,
        "Total Freight": lr.totalFreight,
        "Memo No": lr.memoNo,
        "PU": lr.pu,
        "ASN No": lr.asnNo
      };
    });

    let exportData2 = this.filteredLorryListData.map((lr, index) => {
      return {
        "Sr.No": (this.page - 1) * this.itemsPerPage + index + 1,
        "Vendor Code": lr.vendorCode,
        "Vendor Name": lr.vendorName,
        "Part No.": lr.partNo,
        "Part Name": lr.partName,
        "Invoice No.": lr.chalanNo || '',
        "Invoice Date": lr.chalanDate ? this.formatDate(lr.chalanDate) : '',
        "Quantity": lr.quantity,
        "FTL/LCV": lr.lcvFtl,
        "Pack Type": lr.packType,
        "LR No.": lr.lrNo,
        "LR Date": lr.lrDate ? this.formatDate(lr.lrDate) : '',
        "Vehicle No": lr.vehicleNo,
        "Invoice": lr.valueOnChalan || '',
        "Total Weight": lr.totalWight,
        "Total Freight": lr.totalFreight,
        "Memo No": lr.memoNo,
        "PU": lr.pu,
        "ASN No": lr.asnNo
      };
    });

    const totalRow = {
      "Sr.No": 0, // or 0
      "Vendor Code": "TOTAL",
      "Vendor Name": "",
      "Part No.": "",
      "Part Name": "",
      "Invoice No.": "",
      "Invoice Date": "",
      "Quantity": totalQuantity,
      "FTL/LCV": "",
      "Pack Type": "",
      "LR No.": "",
      "LR Date": "",
      "Vehicle No": "",
      "Invoice": "",
      "Bill No": "",
      "Bill Date": "",
      "Unload Date": "",
      "Total Weight": totalWeight.toFixed(2),
      "Total Freight": "",
      "Memo No": "",
      "PU": "",
      "ASN No": ""
    };


    exportData1.push(totalRow);
    exportData2.push(totalRow);

    if (this.fileName && (this.currentRole === 'SUPER_ADMIN' || this.currentRole === 'ADMIN')) {
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData1);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'MIS REPORT');
      const excelBuffer: any = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});
      const data: Blob = new Blob([excelBuffer], {type: 'application/octet-stream'});
      saveAs(data, `${this.fileName}.xlsx`);
      this.fileName = '';
    } else if (this.fileName) {
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData2);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'MIS REPORT');
      const excelBuffer: any = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});
      const data: Blob = new Blob([excelBuffer], {type: 'application/octet-stream'});
      saveAs(data, `${this.fileName}.xlsx`);
      this.fileName = '';
    }
  }


}

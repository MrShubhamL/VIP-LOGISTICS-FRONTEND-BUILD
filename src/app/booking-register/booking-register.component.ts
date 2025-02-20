import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ApiService} from '../services/api/api.service';
import * as XLSX from 'xlsx';
import {saveAs} from 'file-saver';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-booking-register',
  standalone: false,

  templateUrl: './booking-register.component.html',
  styleUrl: './booking-register.component.scss'
})
export class BookingRegisterComponent {
  isModalOpen: boolean = true;
  isRecordFound: boolean = false;
  searchForm!: FormGroup;
  fileName: string = "booking-register-report";
  searchRecordData: any[] = [];

  // ------ BRANCH SEARCH -------
  filteredBranchData: any[] = [];
  branchData: any[] = [];
  isBranchModalOpen: boolean = false;
  selectedBranchItem: any = null;

  private formBuilder = inject(FormBuilder);
  private apiService = inject(ApiService);

  constructor() {
    this.searchForm = this.formBuilder.group({
      branch: this.formBuilder.group({
        branchNo: new FormControl('', Validators.required),
        branchName: new FormControl(''),
      }),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required)
    })
  }

  ngOnInit(){
    this.apiService.getBranches().subscribe(res => {
      if (res) {
        this.branchData = res;
      }
    }, error => {
      console.log(error)
    });
  }

  formSubmit(modal: any) {
    if (!this.searchForm.invalid) {
      this.apiService.getLorryByBranchNoAndDates(
        this.searchForm.get('branch.branchNo')?.value,
        this.searchForm.get('startDate')?.value,
        this.searchForm.get('endDate')?.value
      ).subscribe(res => {
        if (res) {
          this.searchRecordData = res;
          console.log(res);
          if(this.searchRecordData.length !== 0){
            this.isModalOpen = false;
            this.isRecordFound = true;
            this.modalClose(modal);
          }
        }
      }, error => {
        console.log(error);
      });
    }
  }

  clear() {
    this.searchForm.reset();
  }

  openModal(){
    this.isModalOpen = true;
  }


  onBranchSearch() {
    const query = (this.searchForm.get('branch.branchNo')?.value || '')
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

  closeBranchModal(modal: any) {
    this.isBranchModalOpen = false;
    this.selectedBranchItem = null; // Clear the selected item when closing the modal

    (modal as HTMLElement).classList.remove('show'); // Remove 'show' class
    document.body.classList.remove('modal-open'); // Remove modal-open class from body
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove(); // Remove the backdrop
    }
  }

  selectBranchRow(item: any, modal: any) {
    this.selectedBranchItem = item;
    this.confirmBranchSelection(modal);
  }

  confirmBranchSelection(modal: any) {
    if (this.selectedBranchItem) {
      this.searchForm.patchValue({
        branch: {
          branchNo: this.selectedBranchItem.branchNo,
          branchName: this.selectedBranchItem.branchName
        }
      });
      this.closeBranchModal(modal);
    } else {
      alert('No item selected!');
    }
  }


  modalClose(modal: any){
    this.clear();
    this.isModalOpen = false;
    (modal as HTMLElement).classList.remove('show'); // Remove 'show' class
    document.body.classList.remove('modal-open'); // Remove modal-open class from body
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove(); // Remove the backdrop
    }
  }

  exportToExcel(): void {
    if (this.fileName) {
      let exportData: any[] = [];
      let totalToPay = 0;
      let prevMemoNo = null;

      this.searchRecordData.forEach((lr, index) => {
        const currentMemoNo = lr.memoNo;
        const toPay = lr.toPay || 0;

        // Add the main record
        exportData.push([
          index + 1,
          lr.memoDate,
          lr.lcvFtl || 'Regular',
          currentMemoNo,
          lr.refTruckNo,
          lr.lrNo,
          lr.consignor.replace(/\-\(.*?\)/g, ''),
          lr.consignee.replace(/\-\(.*?\)/g, ''),
          lr.quantity,
          lr.weight.toFixed(2),
          lr.chalanNo,
          lr.paid,
          toPay,
          lr.billed,
          lr.billNo,
        ]);

        // Accumulate total "To Pay"
        totalToPay += toPay;

        // If memoNo changes in the next record or it's the last row, insert total row
        if (index === this.searchRecordData.length - 1 || currentMemoNo !== this.searchRecordData[index + 1].memoNo) {
          exportData.push([
            "", "", "", "", "", "", "", "Total of To Pay", "", "", "", "", totalToPay, "", "",
          ]);

          totalToPay = 0; // Reset total
        }
      });

      // Column headers with styling
      const headers = [
        "Sr.No", "Memo Date", "Vehicle Type", "Memo No", "Truck No", "LR No",
        "Consignor", "Consignee", "Quantity", "Weight", "Chalan No", "Paid",
        "To Pay", "Billed", "Bill No"
      ];

      // Convert JSON data to a worksheet
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headers, ...exportData]);

      // Apply styles
      const range = XLSX.utils.decode_range(ws['!ref'] || "A1");
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cell_address = XLSX.utils.encode_cell({r: row, c: col});
          if (!ws[cell_address]) continue;

          if (row === 0) {
            // Header styling
            ws[cell_address].s = {
              font: {bold: true, color: {rgb: "FFFFFF"}},
              fill: {fgColor: {rgb: "4F81BD"}}, // Dark Blue
              alignment: {horizontal: "center"}
            };
          } else if (exportData[row - 1][7] === "Total of To Pay") {
            // Total row styling
            ws[cell_address].s = {
              font: {bold: true, color: {rgb: "000000"}},
              fill: {fgColor: {rgb: "FFD700"}}, // Gold
              alignment: {horizontal: "center"}
            };
          } else if (row % 2 === 0) {
            // Alternate row colors
            ws[cell_address].s = {
              fill: {fgColor: {rgb: "E7E6E6"}} // Light Gray
            };
          }
        }
      }

      // Create a new workbook and append the worksheet
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Booking Register');

      // Write the file and trigger download
      const excelBuffer: any = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});
      const data: Blob = new Blob([excelBuffer], {type: 'application/octet-stream'});
      saveAs(data, `${this.fileName}.xlsx`);
    }
  }

  exportToPDF(): void {
    if (this.fileName) {
      const doc = new jsPDF({orientation: 'landscape'}); // 🔹 Set landscape mode
      let exportData: any[] = [];
      let totalToPay = 0;

      // Define column headers
      const headers = [
        "Sr.No", "Memo Date", "Vehicle Type", "Memo No", "Truck No", "LR No",
        "Consignor", "Consignee", "Quantity", "Weight", "Chalan No", "Paid",
        "To Pay", "Billed", "Bill No"
      ];

      // Process Data
      this.searchRecordData.forEach((lr, index) => {
        const currentMemoNo = lr.memoNo;
        const toPay = lr.toPay || 0;

        // Add main record
        exportData.push([
          index + 1,
          lr.memoDate,
          lr.lcvFtl || 'Regular',
          currentMemoNo,
          lr.refTruckNo,
          lr.lrNo,
          lr.consignor.replace(/\-\(.*?\)/g, ''),
          lr.consignee.replace(/\-\(.*?\)/g, ''),
          lr.quantity,
          lr.weight.toFixed(2),
          lr.chalanNo,
          lr.paid,
          toPay,
          lr.billed,
          lr.billNo,
        ]);

        totalToPay += toPay; // Accumulate total

        // Insert total row if memo changes or last row
        if (index === this.searchRecordData.length - 1 || currentMemoNo !== this.searchRecordData[index + 1].memoNo) {
          exportData.push([
            "", "", "", "", "", "", "", "", "", "", "", "", totalToPay, "", "",
          ]);
          totalToPay = 0; // Reset total
        }
      });

      // Add title
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text("Booking Register Report", 14, 15);

      // Generate Table
      autoTable(doc, {
        startY: 25,
        head: [headers],
        body: exportData,
        styles: {fontSize: 9, cellPadding: 1},
        headStyles: {fillColor: [79, 129, 189], textColor: 255, fontStyle: "normal"}, // Dark Blue Headers
        alternateRowStyles: {fillColor: [230, 230, 230]}, // Light Gray Rows
        columnStyles: {
          7: {fontStyle: "normal", halign: "right"}, // "Total of To Pay" styling
          12: {fontStyle: "bold", halign: "right"} // "To Pay" column alignment
        }
      });

      // Save PDF
      doc.save(`${this.fileName}.pdf`);
    }
  }


  getTotalToPay(index: number): number {
    let total = 0;
    const memoNo = this.searchRecordData[index].memoNo;
    this.searchRecordData.forEach(record => {
      if (record.memoNo === memoNo) {
        total += record.toPay || 0
      }
    });
    return total;
  }


}

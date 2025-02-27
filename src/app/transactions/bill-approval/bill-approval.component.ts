import {Component, inject} from '@angular/core';
import {ApiService} from '../../services/api/api.service';
import {WebSocketService} from '../../services/api/web-socket.service';
import {StorageService} from '../../services/storage/storage.service';

declare var $: any;

@Component({
  selector: 'app-bill-approval',
  standalone: false,
  templateUrl: './bill-approval.component.html',
  styleUrl: './bill-approval.component.scss'
})
export class BillApprovalComponent {
  searchLorry: string = '';
  currentRole: any = '';
  page: number = 1;
  itemsPerPage: number = 12;
  isDataLoading: boolean = false;

  private apiService = inject(ApiService);
  private webSocketService = inject(WebSocketService);
  private storageService = inject(StorageService);
  requestedFreightBills: any[] = [];


  ngOnInit() {
    this.currentRole = this.storageService.getUserRole();
    this.isDataLoading = true;
    this.apiService.getAllRequestedMumbaiFreightBills().subscribe(res => {
      if (res) {
        this.requestedFreightBills = res;
        this.isDataLoading = false;
      }
    }, err => {
      console.log(err);
    });

  }

  get filteredLorries() {
    return this.requestedFreightBills.filter(
      (l) =>
        l.billNo.toLowerCase().includes(this.searchLorry.toLowerCase()) ||
        l.billDate.toLowerCase().includes(this.searchLorry.toLowerCase()) ||
        l.routeName.toLowerCase().includes(this.searchLorry.toLowerCase()) ||
        l.partyName.toLowerCase().includes(this.searchLorry.toLowerCase())
    )
  }

  approveRequest(freight: any) {
    freight.isVerified = true;
    if(freight.isVerified){
      this.apiService.updateMumbaiFreightBill(freight).subscribe(res=>{
        if(res){
          this.ngOnInit();
          console.log(res);
        }
      }, err=>{
        console.log(err);
      })
    }
  }


}

import {Component, inject} from '@angular/core';
import {ApiService} from '../../services/api/api.service';
import {WebSocketService} from '../../services/api/web-socket.service';
import {StorageService} from '../../services/storage/storage.service';
declare var $: any;

@Component({
  selector: 'app-memo-request',
  standalone: false,

  templateUrl: './lorry-request.component.html',
  styleUrl: './memo-request.component.scss'
})
export class LorryRequestComponent {
  lorryListData: any[] = [];
  searchLorry: string = '';
  selectedButtonStatus: string = 'rejected';
  currentRole: any = '';
  page: number = 1;
  itemsPerPage: number = 15;
  isDataLoading: boolean = false;

  private apiService = inject(ApiService);
  private webSocketService = inject(WebSocketService);
  private storageService = inject(StorageService);


  ngOnInit() {
    this.currentRole = this.storageService.getUserRole();
    this.isDataLoading = true;
    this.apiService.getAllLorries().subscribe(res => {
      if (res) {
        this.lorryListData = res;
        this.isDataLoading = false;
      }
    }, err => {
      console.log(err);
    });

  }

  get filteredLorries() {
    return this.lorryListData.filter(
      (l) =>
        l.lrNo.toLowerCase().includes(this.searchLorry.toLowerCase()) ||
        l.branch.branchName.toLowerCase().includes(this.searchLorry.toLowerCase()) ||
        l.route.routeName.toLowerCase().includes(this.searchLorry.toLowerCase()) ||
        l.consignee.partyName.toLowerCase().includes(this.searchLorry.toLowerCase()) ||
        l.consignor.partyName.toLowerCase().includes(this.searchLorry.toLowerCase()) ||
        l.memo.memoNo.toLowerCase().includes(this.searchLorry.toLowerCase()),
    )
  }



  processRequest(event: any, lrNo: any, status: any) {

    const updateStatusObj = {
      lrNo: lrNo,
      status: false
    }
    if (status === 'approved') {
      updateStatusObj.status = true
      this.apiService.updateLorryReceiptStatus(updateStatusObj.lrNo, updateStatusObj.status).subscribe(res => {
        if(res){
          this.ngOnInit();
            let message = "LR Request Approved!!,  Lorry Receipt Request is Approved.";
            this.webSocketService.sendMessage('/app/sendMessage', message, 'LR-APPROVED-REQUEST');
          $.toast({
            heading: 'Lorry Receipt Approved!!',
            text: 'You have successfully approved the LR.',
            showHideTransition: 'fade',
            icon: 'success',
            position: 'bottom-right',
            bgColor: '#41a918',
            loader: false,
          });
        }
      }, err => {
        console.log(err);
      });
    } else if (status === 'rejected') {
      updateStatusObj.status = false
      this.apiService.updateLorryReceiptStatus(updateStatusObj.lrNo, updateStatusObj.status).subscribe(res => {
        if(res){
          this.ngOnInit();
            let message = "LR Request Rejected!!,  Lorry Receipt Request is Rejected.";
            this.webSocketService.sendMessage('/app/sendMessage', message, 'LR-REJECTED-REQUEST');
          $.toast({
            heading: 'Lorry Receipt Rejected!!',
            text: 'You have successfully Rejected the LR.',
            showHideTransition: 'fade',
            icon: 'success',
            position: 'bottom-right',
            bgColor: '#41a918',
            loader: false,
          });
        }
      }, err => {
        console.log(err);
      });
    }
  }

}

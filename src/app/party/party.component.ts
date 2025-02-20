import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ApiService } from '../services/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { PleaseWaitModalComponent } from '../please-wait-modal/please-wait-modal.component';
import {StorageService} from '../services/storage/storage.service';
declare var $: any;

@Component({
  selector: 'app-party',
  standalone: false,
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.scss'],
})
export class PartyComponent implements OnInit {
  @ViewChild('partyNo') partyNo!: ElementRef;
  @ViewChild('pleaseWait') pleaseWait!: PleaseWaitModalComponent;
  party: any[] = [];
  page: number = 1;
  itemsPerPage: number = 5;
  searchTerm: string = '';

  isModalOpen: boolean = false;
  selectedItem: any = null;
  today: Date = new Date();
  form!: FormGroup;
  filteredData = [...this.party];
  currentLoggedUser: any;
  readEnabled: boolean = false;
  writeEnabled: boolean = false;
  updateEnabled: boolean = false;
  deleteEnabled: boolean = false;

  account_types: string[] = [
    'cash',
    'bank',
    'party',
    'creditor',
    'debtor',
    'journal',
  ];
  balanceMarks: string[] = ['credit', 'debit'];
  private formBuilder = inject(FormBuilder);
  private apiService = inject(ApiService);
  private toastr = inject(ToastrService);
  private storage = inject(StorageService);

  constructor() {
    this.form = this.formBuilder.group({
      searchQuery: new FormControl(''),
      partyNo: new FormControl(''),
      partyName: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      accountType: new FormControl('', Validators.required),
      balanceMarkType: new FormControl('', Validators.required),
      openingBalance: new FormControl('', Validators.required),
      balanceMarkAmount: new FormControl('', Validators.required),
      district: new FormControl('', Validators.required),
      codeNo: new FormControl('', Validators.required),
      division: new FormControl('', Validators.required),
      gstNumber: new FormControl('', Validators.required),
      stateCode: new FormControl('', Validators.required),
    });
  }

  get filteredRoutes() {
    return this.party.filter(
      (p) =>
        p.partyNo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.partyName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.address.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.gstNumber.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  ngOnInit(): void {
    this.apiService.getLatestPartyNo().subscribe(
      (res) => {
        this.partyNo.nativeElement.textContent = res.newPartyNo;
      },
      (err) => {
        console.log(err);
        this.toastr.info(
          'Last party number not found!',
          'Please contact administrator!'
        );
      }
    );

    this.apiService.getAllParties().subscribe(
      (res) => {
        if (res) {
          this.party = res;
        }
      },
      (err) => {
        this.toastr.info(
          'Party records not found!',
          'Please contact administrator! (' + err + ')'
        );
      }
    );

    this.storage.getCurrentUser().subscribe(res=>{
      this.currentLoggedUser = res;
      this.currentLoggedUser.roleDto.permissions.map((p: any) => {
        if(p.userPermission == 'ALL_PERMISSIONS'){
          this.readEnabled = true;
          this.writeEnabled = true;
          this.updateEnabled = true;
          this.deleteEnabled = true;
          return;
        }
        if(p.userPermission == 'create-party'){
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

  formSubmit() {
    this.pleaseWait.show();
    this.apiService.addParty(this.form.value).subscribe(
      (res) => {
        this.pleaseWait.hide();
        this.ngOnInit();
        this.form.reset();
        $.toast({
          heading: 'New Record Added!',
          text: 'You have added new party information.',
          showHideTransition: 'fade',
          icon: 'success',
          position: 'bottom-right',
          bgColor: '#1f592c',
          loader: false,
        });
      },
      (err) => {
        $.toast({
          heading: 'Invalid Information!',
          text: 'Please check data before process! ' + err,
          showHideTransition: 'fade',
          icon: 'error',
          position: 'bottom-right',
          bgColor: '#7b0a0a',
          loader: false,
        });
        this.storage.logout();
      }
    );
  }

  updatePartyDetails() {
    this.pleaseWait.show();
    if (!this.form.invalid) {
      this.apiService.updateParty(this.form.value).subscribe(
        (res) => {
          this.pleaseWait.hide();
          this.ngOnInit();
          this.form.reset();
          $.toast({
            heading: 'Party Information Updated',
            text: 'You have updated party information.',
            showHideTransition: 'fade',
            icon: 'success',
            position: 'bottom-right',
            bgColor: '#1f592c',
            loader: false,
          });
        },
        (err) => {
          $.toast({
            heading: 'Invalid Information!',
            text: 'Please check data before process! ' + err,
            showHideTransition: 'fade',
            icon: 'error',
            position: 'bottom-right',
            bgColor: '#7b0a0a',
            loader: false,
          });
        }
      );
    }
  }

  deleteParty() {
    let partyNo = this.form.get('partyNo')?.value;
    if (partyNo !== '') {
      this.apiService.deleteParty(partyNo).subscribe(
        (res) => {
          $.toast({
            heading: 'Party Information Deleted',
            text: 'You have deleted party information.',
            showHideTransition: 'fade',
            icon: 'success',
            position: 'bottom-right',
            bgColor: '#1f592c',
            loader: false,
          });
          this.ngOnInit();
        },
        (err) => {
          $.toast({
            heading: 'Invalid Information!',
            text: 'Please check data before process! ' + err,
            showHideTransition: 'fade',
            icon: 'error',
            position: 'bottom-right',
            bgColor: '#7b0a0a',
            loader: false,
          });
        }
      );
    } else {
      $.toast({
        heading: 'Please select party details!',
        text: 'Search party information from search box! ',
        showHideTransition: 'fade',
        icon: 'error',
        position: 'bottom-right',
        bgColor: '#7b0a0a',
        loader: false,
      });
    }
  }

  cancel() {
    this.form.reset();
  }

  onPartySearch() {
    const query = (this.form.get('searchQuery')?.value || '')
      .toString()
      .trim()
      .toLowerCase();
    this.filteredData = this.party.filter(
      (p) =>
        p.partyNo.toLowerCase().includes(query) ||
        p.partyName.toLowerCase().includes(query) ||
        p.address.toLowerCase().includes(query)
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
      this.form.patchValue({
        partyNo: this.selectedItem.partyNo,
        partyName: this.selectedItem.partyName,
        address: this.selectedItem.address,
        accountType: this.selectedItem.accountType,
        balanceMarkType: this.selectedItem.balanceMarkType,
        openingBalance: this.selectedItem.openingBalance,
        balanceMarkAmount: this.selectedItem.balanceMarkAmount,
        district: this.selectedItem.district,
        codeNo: this.selectedItem.codeNo,
        division: this.selectedItem.division,
        gstNumber: this.selectedItem.gstNumber,
        stateCode: this.selectedItem.stateCode,
      });
      this.closeModal();
      this.form.get('searchQuery')?.reset();
    } else {
      alert('No item selected!');
    }
  }
}

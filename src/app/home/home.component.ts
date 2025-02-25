import {AfterContentInit, AfterViewInit, Component, inject, OnDestroy, OnInit} from '@angular/core';
import Chart from 'chart.js/auto';
import {ApiService} from '../services/api/api.service';
import {StorageService} from '../services/storage/storage.service';
import {read} from 'xlsx';

declare var $: any;

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  pieChart: any = [];
  vehicles: any[] = [];
  parties: any[] = [];
  items: any[] = [];
  users: any[] = [];

  userCount: any;
  vehicleCount: any;
  itemCount: any;
  partyCount: any;
  branchCount: any;
  routeCount: any;
  accountCount: any;
  lrCount: any;

  page: number = 1;
  itemsPerPage: number = 12;
  isDashboardLoading = true;
  isDatadLoading = true;

  readEnabled: boolean = false;
  writeEnabled: boolean = false;
  updateEnabled: boolean = false;
  deleteEnabled: boolean = false;

  isCardViewEnabled: boolean = false;
  isSummaryViewEnabled: boolean = false;
  isEmployeeViewEnabled: boolean = false;

  currentLoggedUser: any;

  private apiService = inject(ApiService);
  private storageService = inject(StorageService);

  constructor() {
  }

  ngOnInit() {
    this.isDashboardLoading = true;
    this.storageService.getCurrentUser().subscribe(res => {
      if(res){
        this.isDashboardLoading = false;
        res.roleDto.permissions.forEach((p: any) => {
          if (p.userPermission === "ALL_PERMISSIONS") {
            this.isCardViewEnabled = true;
            this.isEmployeeViewEnabled = true;
            this.isSummaryViewEnabled = true;

            this.readEnabled = true;
            this.writeEnabled = true;
            this.updateEnabled = true;
            this.deleteEnabled = true;
          }

          if (p.userPermission === "graph-view") {
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


          if (p.userPermission === "card-list") {
            this.isCardViewEnabled = true;
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

          if (p.userPermission === "employee-contacts") {
            this.isEmployeeViewEnabled = true;
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

          if (p.userPermission === "summary-view") {
            this.isSummaryViewEnabled = true;
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

      }
    }, err => {
      $.toast({
        heading: 'Limited Access Alert!',
        text: 'You don’t have modification access on this service! ' + err,
        showHideTransition: 'fade',
        icon: 'info',
        position: 'bottom-right',
        bgColor: '#3152be',
        loader: false,
      });
    });

    this.apiService.getAllUsers().subscribe(res=>{
      if(res){
        this.users = res;
      }
    }, error => {
      console.log(error);
    });

    this.apiService.totalUserCount().subscribe(res=>{
      if(res){
        this.userCount = res;
      }
    }, error => {
      console.log(error);
    });
    this.apiService.totalVehicleCount().subscribe(res=>{
      if(res){
        this.vehicleCount = res;
      }
    }, error => {
      console.log(error);
    });
    this.apiService.totalPartyCount().subscribe(res=>{
      if(res){
        this.partyCount = res;
      }
    }, error => {
      console.log(error);
    });
    this.apiService.totalItemCount().subscribe(res=>{
      if(res){
        this.itemCount = res;
      }
    }, error => {
      console.log(error);
    });
    this.apiService.totalBranchCount().subscribe(res=>{
      if(res){
        this.branchCount = res;
      }
    }, error => {
      console.log(error);
    });

    this.apiService.totalRouteCount().subscribe(res=>{
      if(res){
        this.routeCount = res;
      }
    }, error => {
      console.log(error);
    });

    this.apiService.totalAccountCount().subscribe(res=>{
      if(res){
        this.accountCount = res;
      }
    }, error => {
      console.log(error);
    });

    this.apiService.totalLrCount().subscribe(res=>{
      if(res){
        this.lrCount = res;
      }
    }, error => {
      console.log(error);
    });

  }

  initializeChart() {
    this.pieChart = new Chart('canvas', {
      type: 'pie',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [
          {
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Chart.js Pie Chart'
          }
        }
      },
    });
  }

  getAllVehicles() {
    this.isDatadLoading = true;
    this.apiService.getAllVehicles().subscribe(res => {
      this.isDatadLoading = false;
      this.vehicles = res;
    }, err => {
      this.isDashboardLoading = false;
      $.toast({
        heading: 'Session Timeout!!',
        text: 'Please Re-Login to the system.',
        showHideTransition: 'fade',
        icon: 'error',
        position: 'bottom-right',
        bgColor: '#a41515',
        loader: false,
      });
      this.storageService.logout();
    });
  }

  getAllParties() {
    this.apiService.getAllParties().subscribe(res => {
      if (res) {
        this.parties = res;
      }
    }, err => {
      $.toast({
        heading: 'Session Timeout!!',
        text: 'Please Re-Login to the system.',
        showHideTransition: 'fade',
        icon: 'error',
        position: 'bottom-right',
        bgColor: '#a41515',
        loader: false,
      });
      this.storageService.logout();
    });
  }

  getAllItems() {
    this.isDatadLoading = true;
    this.apiService.getAllItems().subscribe(res => {
      this.isDatadLoading = false;
      this.items = res;
    }, err => {
      console.log(err);
    });
  }
}

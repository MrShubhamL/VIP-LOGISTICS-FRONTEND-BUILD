import {Component, inject} from '@angular/core';
import {ApiService} from '../services/api/api.service';
import {StorageService} from '../services/storage/storage.service';
declare var $: any;

@Component({
  selector: 'app-security-backup',
  standalone: false,

  templateUrl: './security-backup.component.html',
  styleUrl: './security-backup.component.scss'
})
export class SecurityBackupComponent {
  private apiService = inject(ApiService);
  private storageService = inject(StorageService);

  readEnabled: boolean = false;
  writeEnabled: boolean = false;
  updateEnabled: boolean = false;
  deleteEnabled: boolean = false;
  currentLoggedUser: any;


  ngOnInit(){
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
        if (p.userPermission == 'security-backup') {
          console.log(p);
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


  resetData(){
    this.apiService.resetFactory().subscribe(res=>{
      if(res){
        $.toast({
          heading: 'Application Reset!!',
          text: 'Your application has been rested successfully. Please login to start new session.',
          showHideTransition: 'fade',
          icon: 'info',
          position: 'bottom-right',
          bgColor: '#166e9e',
          loader: false,
        });
        this.storageService.logout();
      }
    })
  }

}

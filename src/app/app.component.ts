import {Component, inject} from '@angular/core';
import {WebSocketService} from './services/api/web-socket.service';
import {StorageService} from './services/storage/storage.service';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'vip-logistics';
  private webSocketService = inject(WebSocketService);
  private storageService = inject(StorageService);
  receivedMessages: any[] = [];
  notification: any;

  constructor(private toastr: ToastrService, private router: Router) {
  }

  ngOnInit(): void {
    this.webSocketService.getMessages().subscribe((response) => {
      this.handelMessages(response);
    });
  }

  handelMessages(message: string) {
    let userRole = this.storageService.getUserRole();
    this.notification = message;
    const messageFor = this.notification.messageFor;

    if (userRole !== 'SUPER_ADMIN') {
      if (messageFor === 'ROLE-REQUEST') {
        const toastRef = this.toastr.info(
          'Role has been updated. Please login again!! Note: Please ignore this message if it is not for you.',
          'Security & Access',
          {
            enableHtml: true,
            closeButton: true,
            positionClass: 'toast-bottom-right',
            timeOut: 0,
            tapToDismiss: false,
          }
        );
        toastRef.onTap.subscribe(() => {
          this.storageService.logout();
        });
      }
    }

    if (messageFor === 'LR-APPROVED-REQUEST') {
      const toastRef = this.toastr.success(
        'LR Request is Approved!!,  Lorry Receipt Request is Approved.',
        'LR Approved',
        {
          enableHtml: true,
          closeButton: true,
          positionClass: 'toast-bottom-right',
          timeOut: 0,
          tapToDismiss: false,
        }
      );
    }

    if (messageFor === 'LR-REJECTED-REQUEST') {
      const toastRef = this.toastr.error(
        'LR Request Rejected!!,  Lorry Receipt Request is Rejected.',
        'LR Rejected',
        {
          enableHtml: true,
          closeButton: true,
          positionClass: 'toast-bottom-right',
          timeOut: 0,
          tapToDismiss: false,
        }
      );
    }

    if (messageFor === 'LR-DELETED') {
      const toastRef = this.toastr.info(
        'Someone is deleted the LR.',
        'LR Deleted',
        {
          enableHtml: true,
          closeButton: true,
          positionClass: 'toast-bottom-right',
          timeOut: 0,
          tapToDismiss: false,
        }
      );
    }


    if (userRole === 'MANAGER') {
      if (messageFor === 'LR-CREATE-REQUEST') {
        const toastRef = this.toastr.info(
          'New memo request is generated. Please check.',
          'New Memo Request Generated',
          {
            enableHtml: true,
            closeButton: true,
            positionClass: 'toast-bottom-right',
            timeOut: 0,
            tapToDismiss: false,
          }
        );
        toastRef.onTap.subscribe(() => {
          this.router.navigate(['/dashboard/memo-requests'])
        });
      }
    }


  }

  // ngOnDestroy(): void {
  //   this.webSocketService.disconnect();
  // }

}

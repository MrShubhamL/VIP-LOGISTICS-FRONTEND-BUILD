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
  private audio = new Audio();
  private webSocketService = inject(WebSocketService);
  private storageService = inject(StorageService);
  receivedMessages: any[] = [];
  notification: any;

  constructor(private toastr: ToastrService, private router: Router) {
    this.audio.src = 'notification-tone.mp3'; // Ensure the correct path
    this.audio.load();
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

    if (userRole !== 'SUPER_ADMIN' || 'ADMIN') {
      if (messageFor === 'ROLE-REQUEST') {
        this.audio.currentTime = 0; // Reset to start
        this.audio.play();
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

      if (messageFor === 'FREIGHT-APPROVAL') {
        this.audio.currentTime = 0; // Reset to start
        this.audio.play();
        const toastRef = this.toastr.info(
          'You have received new freight bill approval!!',
          'Freight Bill Approval',
          {
            enableHtml: true,
            closeButton: true,
            positionClass: 'toast-top-center',
            timeOut: 0,
            tapToDismiss: false,
          }
        );
      }
    }

    if (messageFor === 'LR-APPROVED-REQUEST') {
      this.audio.currentTime = 0; // Reset to start
      this.audio.play();
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
      this.audio.currentTime = 0; // Reset to start
      this.audio.play();
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
      this.audio.currentTime = 0; // Reset to start
      this.audio.play();
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
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect();
  }

}

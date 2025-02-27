import {Component, inject} from '@angular/core';
import {ApiService} from '../../services/api/api.service';
import {WebSocketService} from '../../services/api/web-socket.service';
import {StorageService} from '../../services/storage/storage.service';


@Component({
  selector: 'app-memo-request',
  standalone: false,

  templateUrl: './lorry-request.component.html',
  styleUrl: './memo-request.component.scss'
})
export class LorryRequestComponent {
}

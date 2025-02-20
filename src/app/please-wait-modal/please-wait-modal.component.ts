import { Component } from '@angular/core';

@Component({
  selector: 'app-please-wait-modal',
  standalone: false,
  templateUrl: './please-wait-modal.component.html',
  styleUrl: './please-wait-modal.component.scss'
})
export class PleaseWaitModalComponent {
  visible: boolean = false;

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
}

import {Component, inject} from '@angular/core';
import {ApiService} from '../services/api/api.service';

@Component({
  selector: 'app-emp-contacts',
  standalone: false,

  templateUrl: './emp-contacts.component.html',
  styleUrl: './emp-contacts.component.scss'
})
export class EmpContactsComponent {

  users: any[] = [];

  private apiService = inject(ApiService);

  ngOnInit(){
    this.apiService.getAllUsers().subscribe(res => {
      if (res) {
        this.users = res;
      }
    }, error => {
      console.log(error);
    });
  }
}

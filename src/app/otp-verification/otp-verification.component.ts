import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ApiService} from '../services/api/api.service';

@Component({
  selector: 'app-otp-verification',
  standalone: false,

  templateUrl: './otp-verification.component.html',
  styleUrl: './otp-verification.component.scss'
})
export class OtpVerificationComponent {
  form!: FormGroup;
  private formBuilder = inject(FormBuilder);
  private apiService = inject(ApiService);


  constructor() {
    this.form = this.formBuilder.group({
      email: new FormControl('', Validators.required)
    });
  }

  formSubmit(){
    if(!this.form.invalid){
      console.log("Hi...")
      this.apiService.forgotPassword(this.form.get('email')?.value).subscribe(res => {
        if(res){
          console.log(res);
        }
      }, err =>{
        console.log(err)
      })
    }
  }
}

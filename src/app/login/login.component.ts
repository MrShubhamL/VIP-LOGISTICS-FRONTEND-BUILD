import {Component, ElementRef, inject, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validator, Validators} from '@angular/forms';
import {ApiService} from '../services/api/api.service';
import {StorageService} from '../services/storage/storage.service';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  isLoggedIn: boolean = false;
  form!: FormGroup;
  private formBuilder = inject(FormBuilder);
  private apiService = inject(ApiService);
  private storageService = inject(StorageService);
  private router = inject(Router);
  private toastr = inject(ToastrService)

  private audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  private buffer: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;

  constructor() {
    this.form = this.formBuilder.group({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    })
  }

  ngOnInit(){
    // this.loadAudio();
  }

  formSubmit(){
    // this.buttonPlaySound();
    this.isLoggedIn = true;
    let response = this.storageService.clearLocalStorage();
    if(response){
      this.apiService.loginUser(this.form.value).subscribe(res => {
        this.storageService.saveUser(res);
        this.storageService.saveToken(res.jwtToken);
        if (this.storageService.getUser() !== null && this.storageService.getUserRole() !== null) {
          this.router.navigate(['/dashboard']);
          this.isLoggedIn = false;
        } else {
          this.router.navigate(['/login'])
        }
      }, err => {
        this.storageService.logout();
        if (typeof window !== 'undefined') {
          window.location.reload();
          this.router.navigate(['/login']);
          this.toastr.info('Invalid Credentials!', err);
        }
      });
    }
  }


  async loadAudio() {
    const response = await fetch('audio/truck-starting.mp3');
    const arrayBuffer = await response.arrayBuffer();
    this.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
  }

  buttonPlaySound() {
      if (!this.buffer) return;
      this.source = this.audioContext.createBufferSource();
      this.source.buffer = this.buffer;
      this.source.connect(this.audioContext.destination);
      this.source.start();
  }

}

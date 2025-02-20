import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { StorageService } from '../services/storage/storage.service';
import { Router } from '@angular/router';
import { ChatMessageDto } from '../services/models/chat-msg-dto';
declare var $: any;
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {WebSocketService} from '../services/api/web-socket.service';
import {ApiService} from '../services/api/api.service';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: false,
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  today: Date = new Date();
  currentUser: any;
  loggedUserName: any;
  userProfile: any;

  private storageService = inject(StorageService);
  private formBuilder = inject(FormBuilder);
  private apiService = inject(ApiService);
  private webSocketService = inject(WebSocketService);
  receiver: string = 'User1'; // Receiver's username
  message: string = 'Hello.'; // The message to send
  chatForm!: FormGroup;

  chat_list: any[] = [
    {
      name: 'Shubham Lohar',
      img: 'dist/img/user1-128x128.jpg',
      msg: 'This is last message conversion',
      timestamp: '2 Hours Ago',
    }
  ];
  receivedMessages: string[] = [];

  isChatListHidden = false; // Initial state of the left column (chat list)

  constructor() {
    this.chatForm = this.formBuilder.group({
      message: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {

    let user = this.storageService.getUser();
    this.userProfile = user.imageUrl;

    this.storageService.getCurrentUser().subscribe(res=>{
      if(res){
        this.currentUser = res;
        this.loggedUserName = this.currentUser.userName;
      }
    }, err=>{
      console.log(err);
    });

    this.apiService.getAllUsers().subscribe(res=>{
      this.chat_list = res;
    }, err=>{
      console.log(err)
    });
  }

  logout() {
    this.storageService.logout();
  }

  sendMessage() {
    let message = this.chatForm.get('message')?.value
    if(message){
      this.webSocketService.sendMessage('/app/sendMessage', message, 'CHAT-MESSAGE');
      this.chatForm.controls['message'].reset();
    }
  }

}

import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Client, IMessage} from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private stompClient!: Client;
  private messagesSubject: Subject<any> = new Subject<any>();
  private isConnected: boolean = false; // Track connection status

  constructor() {
    this.initializeWebSocketConnection();
  }

  private initializeWebSocketConnection(): void {
    const socketUrl = 'https://viplogistics.org/notify-app/ws'; // Ensure this matches the backend

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(socketUrl), // Ensure SockJS instance is created properly
      reconnectDelay: 5000, // Auto-reconnect every 5 seconds
      debug: (str) => console.log(str),
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connected: ', frame);
      this.isConnected = true;
      this.stompClient.subscribe('/topic/notifications', (message: IMessage) => {
        this.handleMessage(message);
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP Error: ', frame);
      this.isConnected = false;
    };

    this.stompClient.onDisconnect = () => {
      console.warn('STOMP Disconnected. Attempting to reconnect...');
      this.isConnected = false;
    };

    this.stompClient.activate();
  }

  public getMessages(): Observable<any> {
    return this.messagesSubject.asObservable();
  }

  private handleMessage(message: IMessage): void {
    this.messagesSubject.next(JSON.parse(message.body));
  }

  public sendMessage(destination: string, message: any, messageFor: string): void {
    if (this.stompClient && this.stompClient.connected) {
      const payload = {
        ...message,
        messageFor, // Add recipient or target of the message
      };
      this.stompClient.publish({
        destination: destination,
        body: JSON.stringify(payload),
      });
    } else {
      console.error('WebSocket is not connected. Retrying...');
      this.initializeWebSocketConnection(); // Try to reconnect
    }
  }

  public disconnect(): void {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
      this.isConnected = false;
      console.log('Disconnected');
    }
  }
}

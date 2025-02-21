import {NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { MainComponent } from './main/main.component';
import { HomeComponent } from './home/home.component';
import { PartyComponent } from './party/party.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {Material} from './material';
import { ItemComponent } from './item/item.component';
import { ToastrModule } from 'ngx-toastr';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AuthInterceptor} from './services/models/auth.interceptor';
import { PleaseWaitModalComponent } from './please-wait-modal/please-wait-modal.component';
import {CommonModule, HashLocationStrategy, LocationStrategy} from '@angular/common';
import { RouteManagerComponent } from './route-manager/route-manager.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import { VehicleRegistrationComponent } from './vehicle-registration/vehicle-registration.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { RolesPermissionsComponent } from './roles-permissions/roles-permissions.component';
import { BranchComponent } from './branch/branch.component';
import { LorryReceiptComponent } from './transactions/lorry-receipt/lorry-receipt.component';
import { LorryRequestComponent } from './transactions/memo-request/lorry-request.component';
import { AccountComponent } from './account/account.component';
import { MisComponent } from './transactions/mis/mis.component';
import { LorryHireMemoComponent } from './transactions/lorry-hire-memo/lorry-hire-memo.component';
import { SecurityBackupComponent } from './security-backup/security-backup.component';
import { EmpContactsComponent } from './emp-contacts/emp-contacts.component';
import { BookingRegisterComponent } from './booking-register/booking-register.component';
import { FrightBillComponent } from './transactions/fright-bill/fright-bill.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { OtpVerificationComponent } from './otp-verification/otp-verification.component';
import { FreightGroupComponent } from './transactions/freight-group/freight-group.component';
import { FreightBillNagpurComponent } from './transactions/freight-bill-nagpur/freight-bill-nagpur.component';
import { FreightBillNagpurPickupComponent } from './transactions/freight-bill-nagpur-pickup/freight-bill-nagpur-pickup.component';
import { FreightBillRajkotComponent } from './transactions/freight-bill-rajkot/freight-bill-rajkot.component';
import { FreightBillChakanComponent } from './transactions/freight-bill-chakan/freight-bill-chakan.component';
import { FreightBillRudrapurComponent } from './transactions/freight-bill-rudrapur/freight-bill-rudrapur.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    MainComponent,
    HomeComponent,
    PartyComponent,
    ItemComponent,
    PleaseWaitModalComponent,
    RouteManagerComponent,
    ChatBoxComponent,
    VehicleRegistrationComponent,
    UserManagementComponent,
    RolesPermissionsComponent,
    BranchComponent,
    LorryReceiptComponent,
    LorryRequestComponent,
    AccountComponent,
    MisComponent,
    LorryHireMemoComponent,
    SecurityBackupComponent,
    EmpContactsComponent,
    BookingRegisterComponent,
    FrightBillComponent,
    UserProfileComponent,
    OtpVerificationComponent,
    FreightGroupComponent,
    FreightBillNagpurComponent,
    FreightBillNagpurPickupComponent,
    FreightBillRajkotComponent,
    FreightBillChakanComponent,
    FreightBillRudrapurComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    Material,
    HttpClientModule,
    ToastrModule.forRoot(),
    NgxPaginationModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true,
    },
    {provide: LocationStrategy, useClass: HashLocationStrategy}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

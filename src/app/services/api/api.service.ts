import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import BaseUrl from '../models/base-url';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(public http: HttpClient) {
  }

  public loginUser(user: any): Observable<any> {
    return this.http.post(BaseUrl + '/api/service/login', user, {
      responseType: 'json',
    });
  }

  public getLatestPartyNo(): Observable<any> {
    return this.http.get(BaseUrl + '/api/party/get-latest-party-no', {
      responseType: 'json',
    });
  }

  public getAllParties(): Observable<any> {
    return this.http.get(BaseUrl + '/api/party/get-parties', {
      responseType: 'json',
    });
  }

  public testAPI(): Observable<string> {
    return this.http.get(BaseUrl + '/test', {responseType: 'text'});
  }

  public addParty(party: any): Observable<any> {
    return this.http.post(BaseUrl + '/api/party/add-party', party, {
      responseType: 'json',
    });
  }

  public updateParty(party: any): Observable<any> {
    return this.http.put(BaseUrl + '/api/party/update-party', party, {
      responseType: 'json',
    });
  }

  public deleteParty(id: any): Observable<any> {
    return this.http.delete(BaseUrl + '/api/party/delete-party', {
      params: {partyNo: id},
    });
  }

  // ------------------- ALL Route Operation -----------------------------

  public addRoute(route: any): Observable<any> {
    return this.http.post(BaseUrl + '/api/route/add-route', route, {
      responseType: 'json',
    });
  }

  public deleteRoute(id: any): Observable<any> {
    return this.http.delete(BaseUrl + '/api/route/delete-route', {
      params: {routeNo: id},
    });
  }

  public getAllRoutes(): Observable<any> {
    return this.http.get(BaseUrl + '/api/route/get-routes', {
      responseType: 'json',
    });
  }

  public getLatestRouteNo(): Observable<any> {
    return this.http.get(BaseUrl + '/api/route/get-latest-route-no', {
      responseType: 'json',
    });
  }


  // ------------------------------ Item Operation API --------------------------------------

  public getLatestItemNo(): Observable<any> {
    return this.http.get(BaseUrl + "/api/item/get-latest-item-no", {
      responseType: 'json'
    })
  }

  public addItem(item: any): Observable<any> {
    return this.http.post(BaseUrl + "/api/item/add-item", item, {
      responseType: 'json'
    });
  }

  public updateItem(item: any): Observable<any> {
    return this.http.put(BaseUrl + "/api/item/update-item", item, {
      responseType: 'json'
    });
  }

  public deleteItem(itemNo: any): Observable<any> {
    return this.http.delete(BaseUrl + "/api/item/delete-item", {
      params: {itemNo: itemNo}
    });
  }

  public getAllItems(): Observable<any> {
    return this.http.get(BaseUrl + "/api/item/get-items", {
      responseType: 'json'
    });
  }


  // ---------------------- ALL VEHICLE OPERATIONS ------------------------

  public getLatestVehicleId(): Observable<any> {
    return this.http.get(BaseUrl + "/api/vehicle/get-latest-vehicle-id", {
      responseType: 'json'
    });
  }

  public addVehicle(vehicle: any): Observable<any> {
    return this.http.post(BaseUrl + "/api/vehicle/add-vehicle", vehicle, {
      responseType: 'json'
    });
  }

  public updateVehicle(vehicle: any): Observable<any> {
    return this.http.put(BaseUrl + "/api/vehicle/update-vehicle", vehicle, {
      responseType: 'json'
    });
  }

  public getAllVehicles(): Observable<any> {
    return this.http.get(BaseUrl + "/api/vehicle/get-vehicles", {
      responseType: 'json'
    });
  }

  public deleteVehicle(vehicleNumber: any): Observable<any> {
    return this.http.delete(BaseUrl + "/api/vehicle/delete-vehicle", {
      responseType: 'json',
      params: {vehicleId: vehicleNumber}
    });
  }

  public addVehicleOwner(owner: any): Observable<any> {
    return this.http.post(BaseUrl + "/api/owner/add-owner", owner, {
      responseType: 'json'
    });
  }

  public updateVehicleOwner(owner: any): Observable<any> {
    return this.http.put(BaseUrl + "/api/owner/update-owner", owner, {
      responseType: 'json'
    });
  }

  public deleteVehicleOwner(ownerId: any): Observable<any> {
    return this.http.delete(BaseUrl + "/api/owner/delete-owner", {
      responseType: 'json',
      params: {ownerId: ownerId}
    });
  }

  public getVehicleOwnerDetailsByVehicleId(vehicleId: any): Observable<any> {
    return this.http.get(BaseUrl + "/api/owner/get-owner-by-vehicle-id", {
      responseType: 'json',
      params: {vehicleId: vehicleId}
    });
  }


  // ----------------------- User Management ------------------
  public getUserByUsername(username: any): Observable<any> {
    return this.http.get(BaseUrl + "/api/user-management/get-user-by-username", {
      params: {userName: username},
      responseType: 'json'
    });
  }

  public createUser(formData: any): Observable<any> {
    return this.http.post(BaseUrl + "/api/user-management/register-user", formData, {
      responseType: 'json'
    });
  }

  public updateUser(formData: any): Observable<any> {
    return this.http.put(BaseUrl + "/api/user-management/update-user", formData , {
      responseType: 'json'
    });
  }

  public createRole(role: any): Observable<any> {
    return this.http.post(BaseUrl + "/api/user-management/create-role", role, {
      responseType: 'json'
    });
  }

  public updateRole(role: any): Observable<any> {
    return this.http.put(BaseUrl + "/api/user-management/update-role", role, {
      responseType: 'json'
    });
  }

  public getRoleByName(roleName: any): Observable<any> {
    return this.http.get(BaseUrl + "/api/user-management/get-role-by-role-name", {
      params: {roleName: roleName},
      responseType: 'json'
    });
  }

  public getAllRoles(): Observable<any> {
    return this.http.get(BaseUrl + "/api/user-management/get-all-roles", {
      responseType: 'json'
    });
  }

  public deleteRole(roleId: any): Observable<any> {
    return this.http.delete(BaseUrl + "/api/user-management/delete-role", {
      params: {roleId: roleId},
      responseType: 'json'
    })
  }

  public getAllUsers(): Observable<any> {
    return this.http.get(BaseUrl + "/api/user-management/get-all-users", {
      responseType: 'json'
    });
  }

  public deleteUser(id: any): Observable<any> {
    return this.http.delete(BaseUrl + "/api/user-management/delete-user", {
      params: {id: id},
      responseType: 'json'
    });
  }

  // --------------------- BRANCH API'S -------------------

  public addBranch(branch: any): Observable<any> {
    return this.http.post(BaseUrl + "/api/branch/add-branch", branch, {
      responseType: 'json'
    });
  }

  public updateBranch(branch: any): Observable<any> {
    return this.http.put(BaseUrl + "/api/branch/update-branch", branch, {
      responseType: 'json'
    });
  }

  public deleteBranch(id: any): Observable<any> {
    return this.http.delete(BaseUrl + "/api/branch/delete-branch", {
      params: {branchNo: id},
      responseType: 'json'
    });
  }

  public getBranches(): Observable<any> {
    return this.http.get(BaseUrl + "/api/branch/get-branches", {
      responseType: 'json'
    });
  }

  public getLatestBranchNo(): Observable<any> {
    return this.http.get(BaseUrl + "/api/branch/get-latest-branch-no", {
      responseType: 'json'
    });
  }

  // ------------- LORRY RECEIPT RESET API -----------

  public getLatestLorryNo(): Observable<any> {
    return this.http.get(BaseUrl + "/api/lorry-receipt/get-latest-lr-no", {
      responseType: 'json'
    });
  }

  public getLorryByLrNoAndLrDate(lrNo: any, lrStartDate: any, lrEndDate: any): Observable<any> {
    return this.http.get(BaseUrl + "/api/lorry-receipt/get-lrs-by-lrNo-lrDate", {
      params: {
        lrNo: lrNo,
        lrStartDate: lrStartDate,
        lrEndDate: lrEndDate
      },
      responseType: 'json'
    });
  }

  public getLorryByBranchNoAndDates(branchNo: any, startDate: any, endDate: any): Observable<any> {
    return this.http.get(BaseUrl + "/api/lorry-receipt/get-lrs-by-branch-start-date-end-date", {
      params: {
        branchNo: branchNo,
        startDate: startDate,
        endDate: endDate
      },
      responseType: 'json'
    });
  }

  public getLorryByMemoAndLr(lr: any, memo: any): Observable<any> {
    return this.http.get(BaseUrl + "/api/lorry-receipt/get-lr-by-memoNo-lrNo", {
      params: {
        lrNo: lr,
        memoNo: memo
      },
      responseType: 'json'
    });
  }

  public getLorryByMemoNo(memo: any): Observable<any> {
    return this.http.get(BaseUrl + "/api/lorry-receipt/get-lrs-by-memo-no", {
      params: {
        memoNo: memo
      },
      responseType: 'json'
    });
  }

  public getLorriesByMemoNo(memoNo: any): Observable<any> {
    return this.http.get(BaseUrl + "/api/lorry-receipt/get-lrs-by-memo-no", {
      params: {
        memoNo: memoNo
      },
      responseType: 'json'
    });
  }

  public getLatestMemoNo(): Observable<any> {
    return this.http.get(BaseUrl + "/api/lorry-receipt/get-last-memo-no", {
      responseType: 'json'
    });
  }


  public addLorryReceipt(lr: any): Observable<any> {
    return this.http.post(BaseUrl + "/api/lorry-receipt/add-lorry-receipt", lr, {
      responseType: 'json'
    });
  }

  public updateLorryReceipt(lr: any): Observable<any> {
    return this.http.put(BaseUrl + "/api/lorry-receipt/update-lorry-receipt", lr, {
      responseType: 'json'
    });
  }

  public updateLrByLrNoAndMemoNo(lrNo: any, memoNo: any, lrDate: any, memoDate: any): Observable<any> {
    return this.http.put(BaseUrl + "/api/lorry-receipt/update-memo-date-lr-date",
      {}, {
        params: {
          lrNo: lrNo,
          memoNo: memoNo,
          lrDate: lrDate,
          memoDate: memoDate,
        },
        responseType: 'json'
      });
  }

  public updateLorryReceiptBillDetails(lrNo: any, lrDate: any, bill: any): Observable<any> {
    return this.http.put(BaseUrl + "/api/lorry-receipt/update-bill-details", bill, {
      params: {
        lrNo: lrNo,
        lrDate: lrDate
      },
      responseType: 'json'
    });
  }

  public updateLorryReceiptStatus(lrNo: any, status: any): Observable<any> {
    return this.http.put(BaseUrl + "/api/lorry-receipt/update-lorry-status", {responseType: 'json'}, {
      params: {
        lrNo: lrNo,
        status: status
      }
    });
  }

  public deleteLrReceipt(lrId: any): Observable<any> {
    return this.http.delete(BaseUrl + "/api/lorry-receipt/delete-lorry-receipt", {
      params: {lrId: lrId},
      responseType: 'json'
    });
  }

  public getAllLorries(): Observable<any> {
    return this.http.get(BaseUrl + "/api/lorry-receipt/get-lorry-receipts", {
      responseType: 'json'
    });
  }

  public isMemoExisted(memoNo: any): Observable<any> {
    return this.http.get(BaseUrl + "/api/lorry-receipt/check-memo-exists", {
      params: {memoNo: memoNo},
      responseType: 'json'
    });
  }

  public getItemByChalanNo(chalanNo: any): Observable<any> {
    return this.http.get(BaseUrl + "", {
      params: {chalanNo: chalanNo},
      responseType: 'json'
    })
  }

  // --------------------- ALL VENDOR REST APIS ------------------

  public getAllVendors(): Observable<any> {
    return this.http.get(BaseUrl + "/api/vendor/get-vendors", {
      responseType: 'json'
    });
  }

  public addVendor(vendor: any): Observable<any> {
    return this.http.post(BaseUrl + "/api/vendor/add-vendor", vendor, {
      responseType: 'json'
    });
  }


  // --------------------- ACCOUNT REST API -----------------------------

  public createAccount(account: any): Observable<any> {
    return this.http.post(BaseUrl + '/api/account/create-account', account, {
      responseType: 'json'
    });
  }

  public updateAccount(account: any): Observable<any> {
    return this.http.put(BaseUrl + '/api/account/update-account', account, {
      responseType: 'json'
    });
  }

  public deleteAccount(accountId: any): Observable<any> {
    return this.http.delete(BaseUrl + '/api/account/delete-account', {
      params: {accountId: accountId},
      responseType: 'json'
    });
  }

  public getAccounts(): Observable<any> {
    return this.http.get(BaseUrl + '/api/account/get-accounts', {
      responseType: 'json'
    });
  }

  // -------------- LORRY HIRE MEMO -------------------

  public addHireMemo(memo: any): Observable<any> {
    return this.http.post(BaseUrl + "/api/lorry-hire-memo/add-lorry-hire-memo", memo, {
      responseType: 'json'
    });
  }

  public updateHireMemo(memo: any): Observable<any> {
    return this.http.put(BaseUrl + "/api/lorry-hire-memo/update-lorry-hire-memo", memo, {
      responseType: 'json'
    });
  }

  public getAllHireMemos(): Observable<any> {
    return this.http.get(BaseUrl + "/api/lorry-hire-memo/get-lorry-hire-memos", {
      responseType: 'json'
    });
  }

  public deleteHireMemo(hireMemoId: any): Observable<any> {
    return this.http.delete(BaseUrl + "/api/lorry-hire-memo/delete-lorry-hire", {
      params: {
        hireMemoId: hireMemoId
      },
      responseType: 'json'
    });
  }


  // ---------- MIS FILTERS ----------------

  public filterByDates(startDate: any, endDate: any): Observable<any> {
    return this.http.get(BaseUrl + "/api/lorry-receipt/get-lr-summary", {
      params: {
        startDate: startDate,
        endDate: endDate
      },
      responseType: 'json'
    });
  }


  // ----------- DASHBOARD ---------------

  public totalUserCount(): Observable<any> {
    return this.http.get(BaseUrl + "/api/user-management/get-employee-count", {
      responseType: 'json'
    });
  }

  public totalBranchCount(): Observable<any> {
    return this.http.get(BaseUrl + "/api/branch/get-branch-count", {
      responseType: 'json'
    });
  }

  public totalRouteCount(): Observable<any> {
    return this.http.get(BaseUrl + "/api/route/get-route-count", {
      responseType: 'json'
    });
  }

  public totalAccountCount(): Observable<any> {
    return this.http.get(BaseUrl + "/api/account/get-account-count", {
      responseType: 'json'
    });
  }

  public totalLrCount(): Observable<any> {
    return this.http.get(BaseUrl + "/api/lorry-receipt/get-lr-count", {
      responseType: 'json'
    });
  }

  public totalVehicleCount(): Observable<any> {
    return this.http.get(BaseUrl + "/api/vehicle/get-vehicle-count", {
      responseType: 'json'
    });
  }

  public totalPartyCount(): Observable<any> {
    return this.http.get(BaseUrl + "/api/party/get-party-count", {
      responseType: 'json'
    });
  }

  public totalItemCount(): Observable<any> {
    return this.http.get(BaseUrl + "/api/item/get-item-count", {
      responseType: 'json'
    });
  }


  // ----------------------- SECURITY ENDPOINTS --------------------

  public resetFactory(): Observable<any>{
    return  this.http.delete(BaseUrl + "/api/database/data-reset", {
      responseType: 'json'
    });
  }

  public forgotPassword(email: any): Observable<any> {
    return this.http.post(BaseUrl + "/auth/forgot-password", {}, {
      params: {email: email},
      responseType: 'text'
    })
  }

  // ------------------- FREIGHT BILL ENDPOINTS -------------------------

  public saveMumbaiFreight(freight: any): Observable<any> {
    return this.http.post(BaseUrl + "/api/mumbai-freight/save-mumbai-freight-bill", {
      responseType: 'json'
    });
  }

  public getMumbaiFreightByBillNo(billNo: any, routeName: any): Observable<any> {
    return this.http.get(BaseUrl + "/api/mumbai-freight/mumbai-freight", {
      params: {
        billNo: billNo,
        routeName: routeName
      },
      responseType: 'json'
    });
  }

  public getNagpurFreightByBillNo(billNo: any, routeName: any): Observable<any> {
    return this.http.get(BaseUrl + "/api/nagpur-freight/nagpur-freight", {
      params: {
        billNo: billNo,
        routeName: routeName
      },
      responseType: 'json'
    });
  }

  public getNagpurPickupFreightByBillNo(billNo: any, routeName: any): Observable<any> {
    return this.http.get(BaseUrl + "/api/nagpur-pickup-freight/nagpur-pickup-freight", {
      params: {
        billNo: billNo,
        routeName: routeName
      },
      responseType: 'json'
    });
  }


  public getRajkotFreightByBillNo(billNo: any, routeName: any): Observable<any> {
    return this.http.get(BaseUrl + "/api/rajkot-freight/rajkot-freight", {
      params: {
        billNo: billNo,
        routeName: routeName
      },
      responseType: 'json'
    });
  }


  public getChakanFreightByBillNo(billNo: any, routeName: any): Observable<any> {
    return this.http.get(BaseUrl + "/api/chakan-freight/chakan-freight", {
      params: {
        billNo: billNo,
        routeName: routeName
      },
      responseType: 'json'
    });
  }


}

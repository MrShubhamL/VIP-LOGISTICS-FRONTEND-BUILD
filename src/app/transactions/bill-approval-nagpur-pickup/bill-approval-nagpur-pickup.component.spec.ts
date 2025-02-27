import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillApprovalNagpurPickupComponent } from './bill-approval-nagpur-pickup.component';

describe('BillApprovalNagpurPickupComponent', () => {
  let component: BillApprovalNagpurPickupComponent;
  let fixture: ComponentFixture<BillApprovalNagpurPickupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillApprovalNagpurPickupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillApprovalNagpurPickupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

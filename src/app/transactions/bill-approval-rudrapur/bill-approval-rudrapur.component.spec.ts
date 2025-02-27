import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillApprovalRudrapurComponent } from './bill-approval-rudrapur.component';

describe('BillApprovalRudrapurComponent', () => {
  let component: BillApprovalRudrapurComponent;
  let fixture: ComponentFixture<BillApprovalRudrapurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillApprovalRudrapurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillApprovalRudrapurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

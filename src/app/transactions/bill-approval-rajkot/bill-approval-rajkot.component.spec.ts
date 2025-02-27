import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillApprovalRajkotComponent } from './bill-approval-rajkot.component';

describe('BillApprovalRajkotComponent', () => {
  let component: BillApprovalRajkotComponent;
  let fixture: ComponentFixture<BillApprovalRajkotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillApprovalRajkotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillApprovalRajkotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

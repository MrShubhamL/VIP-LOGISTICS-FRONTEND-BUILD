import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillApprovalChakanComponent } from './bill-approval-chakan.component';

describe('BillApprovalChakanComponent', () => {
  let component: BillApprovalChakanComponent;
  let fixture: ComponentFixture<BillApprovalChakanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillApprovalChakanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillApprovalChakanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

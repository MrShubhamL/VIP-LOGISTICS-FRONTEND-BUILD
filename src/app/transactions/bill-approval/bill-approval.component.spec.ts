import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillApprovalComponent } from './bill-approval.component';

describe('BillApprovalComponent', () => {
  let component: BillApprovalComponent;
  let fixture: ComponentFixture<BillApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

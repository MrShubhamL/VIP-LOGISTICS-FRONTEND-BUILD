import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillApprovalNagpurComponent } from './bill-approval-nagpur.component';

describe('BillApprovalNagpurComponent', () => {
  let component: BillApprovalNagpurComponent;
  let fixture: ComponentFixture<BillApprovalNagpurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillApprovalNagpurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillApprovalNagpurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

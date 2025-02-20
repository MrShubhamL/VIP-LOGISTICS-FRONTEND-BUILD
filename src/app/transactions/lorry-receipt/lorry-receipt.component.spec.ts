import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LorryReceiptComponent } from './lorry-receipt.component';

describe('LorryReceiptComponent', () => {
  let component: LorryReceiptComponent;
  let fixture: ComponentFixture<LorryReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LorryReceiptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LorryReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

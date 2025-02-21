import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreightBillRudrapurComponent } from './freight-bill-rudrapur.component';

describe('FreightBillRudrapurComponent', () => {
  let component: FreightBillRudrapurComponent;
  let fixture: ComponentFixture<FreightBillRudrapurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FreightBillRudrapurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreightBillRudrapurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

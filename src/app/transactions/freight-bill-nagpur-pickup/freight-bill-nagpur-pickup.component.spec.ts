import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreightBillNagpurPickupComponent } from './freight-bill-nagpur-pickup.component';

describe('FreightBillNagpurPickupComponent', () => {
  let component: FreightBillNagpurPickupComponent;
  let fixture: ComponentFixture<FreightBillNagpurPickupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FreightBillNagpurPickupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreightBillNagpurPickupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

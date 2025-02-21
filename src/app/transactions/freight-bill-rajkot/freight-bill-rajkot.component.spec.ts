import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreightBillRajkotComponent } from './freight-bill-rajkot.component';

describe('FreightBillRajkotComponent', () => {
  let component: FreightBillRajkotComponent;
  let fixture: ComponentFixture<FreightBillRajkotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FreightBillRajkotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreightBillRajkotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

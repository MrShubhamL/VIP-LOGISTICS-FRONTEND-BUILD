import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreightBillChakanComponent } from './freight-bill-chakan.component';

describe('FreightBillChakanComponent', () => {
  let component: FreightBillChakanComponent;
  let fixture: ComponentFixture<FreightBillChakanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FreightBillChakanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreightBillChakanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

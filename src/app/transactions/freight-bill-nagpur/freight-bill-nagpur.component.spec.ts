import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreightBillNagpurComponent } from './freight-bill-nagpur.component';

describe('FreightBillNagpurComponent', () => {
  let component: FreightBillNagpurComponent;
  let fixture: ComponentFixture<FreightBillNagpurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FreightBillNagpurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreightBillNagpurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrightBillComponent } from './fright-bill.component';

describe('FrightBillComponent', () => {
  let component: FrightBillComponent;
  let fixture: ComponentFixture<FrightBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FrightBillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrightBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

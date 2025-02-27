import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreightRequestGroupComponent } from './freight-request-group.component';

describe('FreightRequestGroupComponent', () => {
  let component: FreightRequestGroupComponent;
  let fixture: ComponentFixture<FreightRequestGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FreightRequestGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreightRequestGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

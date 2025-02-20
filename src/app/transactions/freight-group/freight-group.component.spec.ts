import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreightGroupComponent } from './freight-group.component';

describe('FreightGroupComponent', () => {
  let component: FreightGroupComponent;
  let fixture: ComponentFixture<FreightGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FreightGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreightGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

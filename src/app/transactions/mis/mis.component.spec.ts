import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisComponent } from './mis.component';

describe('MisComponent', () => {
  let component: MisComponent;
  let fixture: ComponentFixture<MisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

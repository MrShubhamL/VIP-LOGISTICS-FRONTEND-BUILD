import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpContactsComponent } from './emp-contacts.component';

describe('EmpContactsComponent', () => {
  let component: EmpContactsComponent;
  let fixture: ComponentFixture<EmpContactsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmpContactsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

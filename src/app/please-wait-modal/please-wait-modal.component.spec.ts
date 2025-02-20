import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PleaseWaitModalComponent } from './please-wait-modal.component';

describe('PleaseWaitModalComponent', () => {
  let component: PleaseWaitModalComponent;
  let fixture: ComponentFixture<PleaseWaitModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PleaseWaitModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PleaseWaitModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

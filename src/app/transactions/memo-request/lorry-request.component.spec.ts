import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LorryRequestComponent } from './lorry-request.component';

describe('LorryRequestComponent', () => {
  let component: LorryRequestComponent;
  let fixture: ComponentFixture<LorryRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LorryRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LorryRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

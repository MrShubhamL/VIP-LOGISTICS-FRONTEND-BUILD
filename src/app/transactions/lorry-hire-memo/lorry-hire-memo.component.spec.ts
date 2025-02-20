import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LorryHireMemoComponent } from './lorry-hire-memo.component';

describe('LorryHireMemoComponent', () => {
  let component: LorryHireMemoComponent;
  let fixture: ComponentFixture<LorryHireMemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LorryHireMemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LorryHireMemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

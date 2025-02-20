import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityBackupComponent } from './security-backup.component';

describe('SecurityBackupComponent', () => {
  let component: SecurityBackupComponent;
  let fixture: ComponentFixture<SecurityBackupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SecurityBackupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityBackupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRole } from './admin-role';

describe('AdminRole', () => {
  let component: AdminRole;
  let fixture: ComponentFixture<AdminRole>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRole],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminRole);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

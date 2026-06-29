import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPermission } from './admin-permission';

describe('AdminPermission', () => {
  let component: AdminPermission;
  let fixture: ComponentFixture<AdminPermission>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPermission],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPermission);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePermission } from './update-permission';

describe('UpdatePermission', () => {
  let component: UpdatePermission;
  let fixture: ComponentFixture<UpdatePermission>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatePermission],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdatePermission);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

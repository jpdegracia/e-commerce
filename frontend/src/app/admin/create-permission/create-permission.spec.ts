import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePermission } from './create-permission';

describe('CreatePermission', () => {
  let component: CreatePermission;
  let fixture: ComponentFixture<CreatePermission>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePermission],
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePermission);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

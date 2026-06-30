import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPermission } from './view-permission';

describe('ViewPermission', () => {
  let component: ViewPermission;
  let fixture: ComponentFixture<ViewPermission>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPermission],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewPermission);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

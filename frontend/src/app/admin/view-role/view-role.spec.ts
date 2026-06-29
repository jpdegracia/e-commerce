import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRole } from './view-role';

describe('ViewRole', () => {
  let component: ViewRole;
  let fixture: ComponentFixture<ViewRole>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRole],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewRole);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

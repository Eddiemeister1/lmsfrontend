import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandedAMComponent } from './expanded-a-m.component';

describe('ExpandedAMComponent', () => {
  let component: ExpandedAMComponent;
  let fixture: ComponentFixture<ExpandedAMComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpandedAMComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpandedAMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

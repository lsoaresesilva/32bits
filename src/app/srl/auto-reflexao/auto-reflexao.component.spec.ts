import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoReflexaoComponent } from './auto-reflexao.component';

describe('AutoReflexaoComponent', () => {
  let component: AutoReflexaoComponent;
  let fixture: ComponentFixture<AutoReflexaoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutoReflexaoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoReflexaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

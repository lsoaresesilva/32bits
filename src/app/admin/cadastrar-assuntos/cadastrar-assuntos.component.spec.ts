import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CadastrarAssuntosComponent } from './cadastrar-assuntos.component';

describe('CadastrarAssuntosComponent', () => {
  let component: CadastrarAssuntosComponent;
  let fixture: ComponentFixture<CadastrarAssuntosComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CadastrarAssuntosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastrarAssuntosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

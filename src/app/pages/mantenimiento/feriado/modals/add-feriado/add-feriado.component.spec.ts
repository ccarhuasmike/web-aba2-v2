import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFeriadoComponent } from './add-feriado.component';

describe('AddFeriadoComponent', () => {
  let component: AddFeriadoComponent;
  let fixture: ComponentFixture<AddFeriadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddFeriadoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFeriadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

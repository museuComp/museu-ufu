import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NormsComponent } from './norms.component';

describe('NormsComponent', () => {
  let component: NormsComponent;
  let fixture: ComponentFixture<NormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NormsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

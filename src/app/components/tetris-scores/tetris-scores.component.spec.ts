import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TetrisScoresComponent } from './tetris-scores.component';

describe('TetrisScoresComponent', () => {
  let component: TetrisScoresComponent;
  let fixture: ComponentFixture<TetrisScoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TetrisScoresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TetrisScoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

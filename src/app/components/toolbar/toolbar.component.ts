import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  @Output() yearSelected = new EventEmitter<number>();
  selectedYear: number = new Date().getFullYear();
  years: number[] = [2021, 2022, 2023, 2024, 2025, 2026, 2027];

  onYearSelect(year: number) {
    this.selectedYear = year;
    this.yearSelected.emit(year);
  }
}

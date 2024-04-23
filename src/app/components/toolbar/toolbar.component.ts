import { Component, Output, EventEmitter, Input } from '@angular/core';
import Thing from '../../interfaces/Thing';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  @Output() yearSelected = new EventEmitter<number | null>();
  @Output() searchChanged = new EventEmitter<string | null>();
  @Input() selectedYear: number | string = 'All';
  @Input() things: Thing[] = [];
  years: (number | 'All')[] = [];
  @Output() sortByNameAsc = new EventEmitter<void>();
  @Output() sortByNameDesc = new EventEmitter<void>();
  @Output() sortByDateAsc = new EventEmitter<void>();
  @Output() sortByDateDesc = new EventEmitter<void>();

  constructor() {
    this.years = ['All', ...this.getUniqueYears(this.things)];
  }

  ngOnChanges() {
    this.years = ['All', ...this.getUniqueYears(this.things)];
  }

  onYearSelect(year: number | 'All') {
    this.selectedYear = year;
    this.yearSelected.emit(year === 'All' ? null : year);
  }

  private getUniqueYears(things: Thing[]): number[] {
    const yearsSet = new Set<number>();
    things.forEach((thing) => {
      yearsSet.add(new Date(thing.date).getFullYear());
    });
    return Array.from(yearsSet);
  }

  applySearchFilter(searchTerm: string | null): void {
    this.searchChanged.emit(searchTerm);
  }

  sortByNameAscClicked(): void {
    this.sortByNameAsc.emit();
  }

  sortByNameDescClicked(): void {
    this.sortByNameDesc.emit();
  }

  sortByDateAscClicked(): void {
    this.sortByDateAsc.emit();
  }

  sortByDateDescClicked(): void {
    this.sortByDateDesc.emit();
  }
}

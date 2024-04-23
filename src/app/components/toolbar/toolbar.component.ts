import { Component, Output, EventEmitter, Input } from '@angular/core';
import Thing from '../../interfaces/Thing';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  @Input() selectedYear: number | string = 'All';
  @Input() things: Thing[] = [];

  @Output() yearSelected = new EventEmitter<number | null>();
  @Output() searchChanged = new EventEmitter<string | null>();
  @Output() sortByNameAsc = new EventEmitter<void>();
  @Output() sortByNameDesc = new EventEmitter<void>();
  @Output() sortByDateAsc = new EventEmitter<void>();
  @Output() sortByDateDesc = new EventEmitter<void>();

  years: (number | 'All')[] = [];
  currentSortType: 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc' | null = null;

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
    this.currentSortType = 'nameAsc';
    this.sortByNameAsc.emit();
  }

  sortByNameDescClicked(): void {
    this.currentSortType = 'nameDesc';
    this.sortByNameDesc.emit();
  }

  sortByDateAscClicked(): void {
    this.currentSortType = 'dateAsc';
    this.sortByDateAsc.emit();
  }

  sortByDateDescClicked(): void {
    this.currentSortType = 'dateDesc';
    this.sortByDateDesc.emit();
  }

  isFilterSelected(
    filterType: 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc'
  ): boolean {
    return this.currentSortType === filterType;
  }
}

import { Component, Output, EventEmitter, Input } from '@angular/core';
import Thing from '../../interfaces/Thing';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  @Input() selectedYear: number | string = 'All';
  @Input() things: Thing[] = [];
  @Input() filteredThings: Thing[] = [];
  @Input() userName: string | null = null;

  @Output() yearSelected = new EventEmitter<number | null>();
  @Output() searchChanged = new EventEmitter<string | null>();
  @Output() sortByNameAsc = new EventEmitter<void>();
  @Output() sortByNameDesc = new EventEmitter<void>();
  @Output() sortByDateAsc = new EventEmitter<void>();
  @Output() sortByDateDesc = new EventEmitter<void>();

  years: (number | 'All')[] = [];
  currentSortType: 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc' | null =
    null;

  constructor(private authService: AuthService, private router: Router) {
    this.years = ['All', ...this.getUniqueYears(this.things)];
    this.authService.verifyToken().subscribe((user: any) => {
      this.userName = user.name;
    });
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

  exportToJSON(): void {
    const json = JSON.stringify(this.filteredThings);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'things.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  exportToCSV(): void {
    const csvHeader = [
      '_id',
      'Type',
      'Name',
      'Date',
      'Review',
      'Place',
      'Rating',
      'User',
      'Created at',
      'Updated at',
    ].join(',');
    const csvContent = `data:text/csv;charset=utf-8,${csvHeader}\n`;
    const csvData = this.filteredThings
      .map((thing) => Object.values(thing).join(','))
      .join('\n');
    const encodedURI = encodeURI(csvContent + csvData);
    const link = document.createElement('a');
    link.setAttribute('href', encodedURI);
    link.setAttribute('download', 'things.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  logout(): void {
    this.authService.removeToken();
    this.router.navigateByUrl('/login');
  }
}

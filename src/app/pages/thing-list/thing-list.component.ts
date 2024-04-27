import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import Thing from '../../interfaces/Thing';
import { ThingService } from '../../services/thing.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { AddThingComponent } from '../../components/add-thing/add-thing.component';
import { EditThingComponent } from '../../components/edit-thing/edit-thing.component';

@Component({
  selector: 'app-thing-list',
  templateUrl: './thing-list.component.html',
  styleUrls: ['./thing-list.component.scss'],
})
export class ThingListComponent implements OnInit {
  things: Thing[] = [];
  filteredThings: Thing[] = [];
  selectedYear: number | null = null;
  searchTerm: string = '';
  loading: boolean = false;
  currentSortType: 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc' | null =
    null;
  typeIconMapping: { [key in Thing['type']]: string } = {
    Book: 'menu_book',
    Theater: 'theater_comedy',
    Concert: 'music_note',
    Film: 'local_movies',
    Trip: 'luggage',
    Food: 'restaurant',
    Activity: 'rocket_launch',
    Celebration: 'cake',
  };

  constructor(
    private thingService: ThingService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadThings();
  }

  async loadThings(): Promise<void> {
    try {
      this.loading = true;
      this.things = await this.thingService.getThingsByUserId('userId');
      if (this.currentSortType === 'nameAsc') {
        this.sortByNameAsc();
      } else if (this.currentSortType === 'nameDesc') {
        this.sortByNameDesc();
      } else if (this.currentSortType === 'dateAsc') {
        this.sortByDateAsc();
      } else {
        this.sortByDateDesc();
      }
    } catch (error) {
      console.error('Error loading Things:', error);
      this.snackBar.open('Error loading Things', 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    } finally {
      this.loading = false;
    }
  }

  async onYearSelected(year: number | null): Promise<void> {
    this.selectedYear = year;
    this.applyYearFilter();
  }

  applyYearFilter(): void {
    if (this.selectedYear === null) {
      this.filteredThings = [...this.things];
      this.applySearchFilter(this.searchTerm);
    } else {
      // Si hay un término de búsqueda, aplicar el filtro de búsqueda y luego filtrar por año
      if (this.searchTerm && this.searchTerm.trim()) {
        this.filteredThings = this.things.filter(
          (thing) =>
            this.matchesSearchCriteria(thing, this.searchTerm) &&
            new Date(thing.date).getFullYear() === this.selectedYear
        );
      } else {
        this.filteredThings = this.things.filter(
          (thing) => new Date(thing.date).getFullYear() === this.selectedYear
        );
      }
    }
  }

  async applySearchFilter(searchTerm: string | null): Promise<void> {
    this.searchTerm = searchTerm || '';

    this.filteredThings = this.things.filter(
      (thing) =>
        this.matchesSearchCriteria(thing, this.searchTerm) &&
        this.matchesYearFilter(thing)
    );
  }

  matchesYearFilter(thing: Thing): boolean {
    if (this.selectedYear === null) {
      return true;
    } else {
      return new Date(thing.date).getFullYear() === this.selectedYear;
    }
  }

  matchesSearchCriteria(thing: Thing, searchTerm: string): boolean {
    const lowerSearchTerm = searchTerm.toLowerCase();

    const matches = [
      thing.name.toLowerCase().includes(lowerSearchTerm),
      thing.type.toLowerCase().includes(lowerSearchTerm),
      (thing.place ?? '').toLowerCase().includes(lowerSearchTerm),
      (thing.review ?? '').toLowerCase().includes(lowerSearchTerm),
      new Date(thing.date).toLocaleDateString().includes(lowerSearchTerm),
      (thing.rating ? thing.rating.toString() : '').includes(lowerSearchTerm),
    ];

    return matches.some((match) => match);
  }

  sortByNameAsc(): void {
    this.currentSortType = 'nameAsc';
    this.things.sort((a, b) => a.name.localeCompare(b.name));
    this.applyYearFilter();
  }

  sortByNameDesc(): void {
    this.currentSortType = 'nameDesc';
    this.things.sort((a, b) => b.name.localeCompare(a.name));
    this.applyYearFilter();
  }

  sortByDateAsc(): void {
    this.currentSortType = 'dateAsc';
    this.things.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    this.applyYearFilter();
  }

  sortByDateDesc(): void {
    this.currentSortType = 'dateDesc';
    this.things.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    this.applyYearFilter();
  }

  generateGoogleMapsURL(place: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      place
    )}`;
  }

  // CRUD METHODS

  async openAddThingModal(): Promise<void> {
    const dialogRef = this.dialog.open(AddThingComponent, {
      width: '500px',
      data: {},
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          this.snackBar.open('Thing added succesfully', 'Close', {
            duration: 2000,
          });
          await this.loadThings();
        } catch (error) {
          console.error('Error adding Thing:', error);
        }
      }
    });
  }

  async openEditThingModal(thingId: string): Promise<void> {
    const dialogRef = this.dialog.open(EditThingComponent, {
      width: '500px',
      data: { thingId: thingId },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          this.snackBar.open('Thing updated successfully', 'Close', {
            duration: 2000,
          });
          await this.loadThings();
        } catch (error) {
          console.error('Error updating Thing:', error);
        }
      }
    });
  }

  async confirmDeleteThing(thingId: string): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: 'Are you sure you want to delete this Thing?',
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.deleteThing(thingId);
        } catch (error) {
          console.error('Error deleting Thing:', error);
        }
      }
    });
  }

  async deleteThing(thingId: string): Promise<void> {
    try {
      await this.thingService.deleteThing(thingId);
      this.things = this.things.filter((thing) => thing._id !== thingId);
      this.applyYearFilter();
      this.snackBar.open('Thing deleted successfully', 'Close', {
        duration: 2000,
      });
    } catch (error: any) {
      console.error('Error deleting Thing:', error);
      this.snackBar.open(
        error.error.message || 'Error deleting Thing',
        'Close',
        {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        }
      );
    }
  }
}

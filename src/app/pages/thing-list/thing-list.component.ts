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
      this.things = await this.thingService.getThingsByUserId('userId');
      this.things.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      this.applyYearFilter();
    } catch (error) {
      console.error('Error loading Things:', error);
      this.snackBar.open('Error loading Things', 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    }
  }

  async onYearSelected(year: number | null): Promise<void> {
    this.selectedYear = year;
    this.applyYearFilter();
  }

  applyYearFilter(): void {
    if (this.selectedYear === null) {
      this.filteredThings = [...this.things];
    } else {
      this.filteredThings = this.things.filter(
        (thing) => new Date(thing.date).getFullYear() === this.selectedYear
      );
    }
  }

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
          // await this.loadThings();
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

  async applySearchFilter(searchTerm: string | null): Promise<void> {
    if (!searchTerm || !searchTerm.trim()) {
      this.applyYearFilter();
      return;
    }

    this.filteredThings = this.filteredThings.filter((thing) =>
      this.matchesSearchCriteria(thing, searchTerm)
    );
  }

  matchesSearchCriteria(thing: Thing, searchTerm: string): boolean {
    const nameMatch = thing.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const typeMatch = thing.type
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const placeMatch =
      thing.place?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const reviewMatch =
      thing.review?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;

    const dateString = new Date(thing.date).toLocaleDateString();
    const dateMatch = dateString.includes(searchTerm);

    const ratingMatch = thing.rating
      ? thing.rating.toString().includes(searchTerm)
      : false;

    return (
      nameMatch ||
      typeMatch ||
      placeMatch ||
      reviewMatch ||
      dateMatch ||
      ratingMatch
    );
  }

  sortByNameAsc(): void {
    this.things.sort((a, b) => a.name.localeCompare(b.name));
    this.applyYearFilter();
  }

  sortByNameDesc(): void {
    this.things.sort((a, b) => b.name.localeCompare(a.name));
    this.applyYearFilter();
  }

  sortByDateAsc(): void {
    this.things.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    this.applyYearFilter();
  }

  sortByDateDesc(): void {
    this.things.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    this.applyYearFilter();
  }
}

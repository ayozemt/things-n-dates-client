import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import Thing from '../../interfaces/Thing';
import { ThingService } from '../../services/thing.service';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import 'moment/locale/es';

@Component({
  selector: 'app-edit-thing',
  templateUrl: './edit-thing.component.html',
  styleUrls: ['./edit-thing.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    provideMomentDateAdapter(),
  ],
})
export class EditThingComponent implements OnInit {
  editedThing: Thing = {
    _id: '',
    type: 'Book',
    name: '',
    date: new Date(),
    review: '',
    place: '',
    rating: null,
    user: '',
  };
  stars: number[] = [1, 2, 3, 4, 5];
  selectedRating: number | null = null;

  constructor(
    public dialogRef: MatDialogRef<EditThingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { thingId: string },
    private thingService: ThingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadThing();
  }

  async loadThing(): Promise<void> {
    try {
      this.editedThing = await this.thingService.getThingById(
        this.data.thingId
      );
      this.selectedRating = this.editedThing.rating ?? null;
    } catch (error) {
      console.error('Error loading thing:', error);
    }
  }

  async editThing(): Promise<void> {
    try {
      this.editedThing.rating = this.selectedRating;
      const updatedThing = await this.thingService.updateThing(
        this.editedThing._id,
        this.editedThing
      );
      this.dialogRef.close(updatedThing);
    } catch (error: any) {
      console.error('Error updating thing:', error);
      this.snackBar.open(
        error.error.message || 'Error editing Thing',
        'Close',
        {
          duration: 2000,
        }
      );
    }
  }

  clearRating(): void {
    this.selectedRating = null;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ThingService } from '../../services/thing.service';
import Thing from '../../interfaces/Thing';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import 'moment/locale/es';

@Component({
  selector: 'app-add-thing',
  templateUrl: './add-thing.component.html',
  styleUrls: ['./add-thing.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    provideMomentDateAdapter(),
  ],
})
export class AddThingComponent implements OnInit {
  newThing: Thing = {
    _id: '',
    type: 'Book',
    name: '',
    date: new Date(),
    review: '',
    place: '',
    user: '',
  };

  constructor(
    public dialogRef: MatDialogRef<AddThingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private thingService: ThingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  async addThing(): Promise<void> {
    try {
      const createdThing = await this.thingService.createThing(this.newThing);
      this.dialogRef.close(createdThing);
    } catch (error: any) {
      console.error('Error adding thing:', error);
      this.snackBar.open(error.error.message || 'Error adding Thing', 'Close', {
        duration: 2000,
      });
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

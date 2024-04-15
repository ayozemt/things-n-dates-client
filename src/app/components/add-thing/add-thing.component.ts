import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ThingService } from '../../services/thing.service';
import Thing from '../../interfaces/Thing';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-add-thing',
  templateUrl: './add-thing.component.html',
  styleUrls: ['./add-thing.component.scss'],
  providers: [provideNativeDateAdapter()],
})
export class AddThingComponent implements OnInit {
  newThing: Thing = {
    _id: '',
    type: 'Book',
    name: '',
    date: new Date(),
    review: '',
    place: '',
    rating: 1,
    user: '', // El ID de usuario debe ser proporcionado desde el componente padre
  };

  constructor(
    public dialogRef: MatDialogRef<AddThingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private thingService: ThingService
  ) {}

  ngOnInit(): void {}

  async addThing(): Promise<void> {
    try {
      const createdThing = await this.thingService.createThing(this.newThing);
      this.dialogRef.close(createdThing);
    } catch (error) {
      console.error('Error adding thing:', error);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

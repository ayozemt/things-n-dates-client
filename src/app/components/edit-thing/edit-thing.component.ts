import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Thing from '../../interfaces/Thing';
import { ThingService } from '../../services/thing.service';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-edit-thing',
  templateUrl: './edit-thing.component.html',
  styleUrls: ['./edit-thing.component.scss'],
  providers: [provideNativeDateAdapter()],
})
export class EditThingComponent implements OnInit {
  editedThing: Thing = {
    _id: '',
    type: 'Book',
    name: '',
    date: new Date(),
    review: '',
    place: '',
    user: '',
  };

  constructor(
    public dialogRef: MatDialogRef<EditThingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { thingId: string },
    private thingService: ThingService
  ) {}

  ngOnInit(): void {
    this.loadThing();
  }

  async loadThing(): Promise<void> {
    try {
      this.editedThing = await this.thingService.getThingById(
        this.data.thingId
      );
    } catch (error) {
      console.error('Error loading thing:', error);
    }
  }

  async editThing(): Promise<void> {
    try {
      const updatedThing = await this.thingService.updateThing(
        this.editedThing._id,
        this.editedThing
      );
      this.dialogRef.close(updatedThing);
    } catch (error) {
      console.error('Error updating thing:', error);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

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
      this.things = await this.thingService.getThingsByUserId('userId'); // Reemplazar 'userId' con el ID de usuario real
    } catch (error) {
      console.error('Error loading Things:', error);
    }
  }

  async openAddThingModal(): Promise<void> {
    const dialogRef = this.dialog.open(AddThingComponent, {
      width: '300px',
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
      width: '300px',
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
      width: '250px',
      data: 'Are you sure you want to delete this Thing?',
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.deleteThing(thingId);
          this.snackBar.open('Thing deleted successfully', 'Close', {
            duration: 2000,
          });
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
    } catch (error) {
      console.error('Error deleting Thing:', error);
    }
  }
}

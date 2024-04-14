import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import Thing from '../../interfaces/Thing';
import { ThingService } from '../../services/thing.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

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
      console.error('Error loading things:', error);
    }
  }

  async confirmDeleteThing(thingId: string): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: 'Are you sure you want to delete this thing?',
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.deleteThing(thingId);
          this.snackBar.open('Thing deleted successfully', 'Close', {
            duration: 2000,
          });
        } catch (error) {
          console.error('Error deleting thing:', error);
        }
      }
    });
  }

  async deleteThing(thingId: string): Promise<void> {
    try {
      await this.thingService.deleteThing(thingId);
      this.things = this.things.filter((thing) => thing._id !== thingId);
    } catch (error) {
      console.error('Error deleting thing:', error);
    }
  }
}
import { Component, OnInit } from '@angular/core';
import Thing from '../../interfaces/Thing';
import { ThingService } from '../../services/thing.service';

@Component({
  selector: 'app-thing-list',
  templateUrl: './thing-list.component.html',
  styleUrls: ['./thing-list.component.scss'],
})
export class ThingListComponent implements OnInit {
  things: Thing[] = [];

  constructor(private thingService: ThingService) {}

  ngOnInit(): void {
    this.loadThings();
  }

  async loadThings(): Promise<void> {
    try {
      // Obtener la lista de cosas del usuario autenticado
      this.things = await this.thingService.getThingsByUserId('userId'); // Reemplazar 'userId' con el ID de usuario real
    } catch (error) {
      console.error('Error loading things:', error);
    }
  }
}

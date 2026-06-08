import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MikrotikService } from './services/mikrotik.service';
import { ConnectionFormComponent } from './components/connection-form/connection-form.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ConnectionFormComponent, DashboardComponent],
  template: `
    <app-connection-form *ngIf="!(mikrotik.connected$ | async)"></app-connection-form>
    <app-dashboard *ngIf="mikrotik.connected$ | async"></app-dashboard>
  `
})
export class AppComponent {
  constructor(public mikrotik: MikrotikService) {}
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Route } from '../../models/netprobe.models';

@Component({
  selector: 'app-routes-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './routes-table.component.html'
})
export class RoutesTableComponent {
  @Input() routes: Route[] = [];
  filter = 'all';

  get filtered(): Route[] {
    if (this.filter === 'all') return this.routes;
    return this.routes.filter(r => r.routeType?.toLowerCase() === this.filter);
  }

  get types(): string[] {
    const t = new Set(this.routes.map(r => r.routeType?.toLowerCase()).filter(Boolean));
    return ['all', ...Array.from(t)];
  }
}

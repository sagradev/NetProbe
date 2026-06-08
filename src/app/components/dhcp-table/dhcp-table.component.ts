import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DhcpLease } from '../../models/netprobe.models';

@Component({
  selector: 'app-dhcp-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dhcp-table.component.html'
})
export class DhcpTableComponent {
  @Input() leases: DhcpLease[] = [];

  statusClass(status: string): string {
    if (status === 'bound') return 'bg-green-900 text-green-300';
    if (status === 'waiting') return 'bg-yellow-900 text-yellow-300';
    return 'bg-red-900 text-red-300';
  }
}

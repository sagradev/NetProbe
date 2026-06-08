import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArpEntry } from '../../models/netprobe.models';

@Component({
  selector: 'app-arp-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './arp-table.component.html'
})
export class ArpTableComponent {
  @Input() entries: ArpEntry[] = [];
}

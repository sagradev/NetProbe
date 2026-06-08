import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkInterface } from '../../models/netprobe.models';

@Component({
  selector: 'app-interfaces-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interfaces-table.component.html'
})
export class InterfacesTableComponent {
  @Input() interfaces: NetworkInterface[] = [];

  formatBytes(bytes: number): string {
    if (bytes >= 1_073_741_824) return (bytes / 1_073_741_824).toFixed(2) + ' GB';
    if (bytes >= 1_048_576) return (bytes / 1_048_576).toFixed(2) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return bytes + ' B';
  }
}

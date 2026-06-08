import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogEntry } from '../../models/netprobe.models';

@Component({
  selector: 'app-logs-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './logs-viewer.component.html'
})
export class LogsViewerComponent {
  @Input() logs: LogEntry[] = [];
  topicFilter = 'all';

  get topics(): string[] {
    const t = new Set(this.logs.map(l => l.topics).filter(Boolean));
    return ['all', ...Array.from(t)];
  }

  get filtered(): LogEntry[] {
    if (this.topicFilter === 'all') return this.logs;
    return this.logs.filter(l => l.topics === this.topicFilter);
  }
}

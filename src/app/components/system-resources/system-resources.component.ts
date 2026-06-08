import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { SystemResource, ChartPoint } from '../../models/netprobe.models';

@Component({
  selector: 'app-system-resources',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './system-resources.component.html'
})
export class SystemResourcesComponent implements OnChanges {
  @Input() resource!: SystemResource;
  @Input() cpuHistory: ChartPoint[] = [];
  @Input() ramHistory: ChartPoint[] = [];

  cpuChartData: ChartData<'line'> = { labels: [], datasets: [] };
  ramChartData: ChartData<'line'> = { labels: [], datasets: [] };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#9ca3af', maxTicksLimit: 6 }, grid: { color: '#374151' } },
      y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
    },
    elements: { point: { radius: 2 }, line: { tension: 0.3 } }
  };

  get usedMemMB(): number { return Math.round(this.resource.totalMemory - this.resource.freeMemory); }
  get usedDiskMB(): number { return Math.round(this.resource.totalDisk - this.resource.freeDisk); }
  get ramPercent(): number { return Math.round((this.usedMemMB / this.resource.totalMemory) * 100); }

  ngOnChanges(): void {
    this.cpuChartData = {
      labels: this.cpuHistory.map(p => p.timestamp),
      datasets: [{ data: this.cpuHistory.map(p => p.value), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.15)', fill: true, label: 'CPU %' }]
    };
    this.ramChartData = {
      labels: this.ramHistory.map(p => p.timestamp),
      datasets: [{ data: this.ramHistory.map(p => p.value), borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.15)', fill: true, label: 'RAM MB' }]
    };
  }
}

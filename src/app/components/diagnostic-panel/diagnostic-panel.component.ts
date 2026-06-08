import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MikrotikService } from '../../services/mikrotik.service';
import { ConnectionRequest, PingResult, TracerouteResult, BandwidthTestResult } from '../../models/netprobe.models';

@Component({
  selector: 'app-diagnostic-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './diagnostic-panel.component.html'
})
export class DiagnosticPanelComponent {
  @Input() credentials!: ConnectionRequest;

  pingTarget = '';
  pingCount = 4;
  pingLoading = false;
  pingResult: PingResult | null = null;
  pingError: string | null = null;

  traceTarget = '';
  traceLoading = false;
  traceResult: TracerouteResult | null = null;
  traceError: string | null = null;

  bwTarget = '';
  bwDirection = 'both';
  bwDuration = 10;
  bwLoading = false;
  bwResult: BandwidthTestResult | null = null;
  bwError: string | null = null;

  constructor(private mikrotik: MikrotikService) {}

  runPing(): void {
    if (!this.pingTarget) return;
    this.pingLoading = true; this.pingResult = null; this.pingError = null;
    this.mikrotik.ping({ ...this.credentials, target: this.pingTarget, count: this.pingCount }).subscribe({
      next: r => { this.pingResult = r; this.pingLoading = false; },
      error: e => { this.pingError = e.error?.error ?? 'Erro ao executar ping'; this.pingLoading = false; }
    });
  }

  runTrace(): void {
    if (!this.traceTarget) return;
    this.traceLoading = true; this.traceResult = null; this.traceError = null;
    this.mikrotik.traceroute({ ...this.credentials, target: this.traceTarget }).subscribe({
      next: r => { this.traceResult = r; this.traceLoading = false; },
      error: e => { this.traceError = e.error?.error ?? 'Erro ao executar traceroute'; this.traceLoading = false; }
    });
  }

  runBwTest(): void {
    if (!this.bwTarget) return;
    this.bwLoading = true; this.bwResult = null; this.bwError = null;
    this.mikrotik.bandwidthTest({ ...this.credentials, target: this.bwTarget, direction: this.bwDirection, duration: this.bwDuration }).subscribe({
      next: r => { this.bwResult = r; this.bwLoading = false; },
      error: e => { this.bwError = e.error?.error ?? 'Erro ao executar bandwidth test'; this.bwLoading = false; }
    });
  }
}

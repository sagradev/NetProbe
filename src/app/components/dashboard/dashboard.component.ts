import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MikrotikService } from '../../services/mikrotik.service';
import { MikrotikData, ConnectionRequest, ChartPoint } from '../../models/netprobe.models';
import { SystemResourcesComponent } from '../system-resources/system-resources.component';
import { InterfacesTableComponent } from '../interfaces-table/interfaces-table.component';
import { RoutesTableComponent } from '../routes-table/routes-table.component';
import { ArpTableComponent } from '../arp-table/arp-table.component';
import { DhcpTableComponent } from '../dhcp-table/dhcp-table.component';
import { LogsViewerComponent } from '../logs-viewer/logs-viewer.component';
import { DiagnosticPanelComponent } from '../diagnostic-panel/diagnostic-panel.component';

type Tab = 'overview' | 'interfaces' | 'routes' | 'arp' | 'dhcp' | 'logs' | 'diagnostic';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SystemResourcesComponent,
    InterfacesTableComponent,
    RoutesTableComponent,
    ArpTableComponent,
    DhcpTableComponent,
    LogsViewerComponent,
    DiagnosticPanelComponent
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  activeTab: Tab = 'overview';
  data: MikrotikData | null = null;
  loading = false;
  lastUpdate: Date | null = null;
  countdown = 60;
  cpuHistory: ChartPoint[] = [];
  ramHistory: ChartPoint[] = [];
  credentials: ConnectionRequest | null = null;

  private subs = new Subscription();

  readonly tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'interfaces', label: 'Interfaces' },
    { id: 'routes', label: 'Rotas' },
    { id: 'arp', label: 'ARP' },
    { id: 'dhcp', label: 'DHCP' },
    { id: 'logs', label: 'Logs' },
    { id: 'diagnostic', label: 'Diagnóstico' }
  ];

  constructor(public mikrotik: MikrotikService) {}

  ngOnInit(): void {
    this.subs.add(this.mikrotik.data$.subscribe(d => this.data = d));
    this.subs.add(this.mikrotik.loading$.subscribe(l => this.loading = l));
    this.subs.add(this.mikrotik.lastUpdate$.subscribe(t => this.lastUpdate = t));
    this.subs.add(this.mikrotik.countdown$.subscribe(c => this.countdown = c));
    this.subs.add(this.mikrotik.cpuHistory$.subscribe(h => this.cpuHistory = h));
    this.subs.add(this.mikrotik.ramHistory$.subscribe(h => this.ramHistory = h));
    // snapshot credentials via service (we stored them there)
    this.subs.add(this.mikrotik.connected$.subscribe(() => {
      // credentials are accessible through service internals exposed below
    }));
  }

  get creds(): ConnectionRequest {
    return (this.mikrotik as any).credentials ?? { ip: '', username: '', password: '' };
  }

  disconnect(): void { this.mikrotik.disconnect(); }
  refresh(): void { this.mikrotik.refresh(); }

  formatTime(d: Date): string {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  get countdownWidth(): string {
    return Math.round((this.countdown / 60) * 100) + '%';
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }
}

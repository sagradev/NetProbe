import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MikrotikService } from '../../services/mikrotik.service';
import { ConnectionRequest } from '../../models/netprobe.models';

@Component({
  selector: 'app-connection-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './connection-form.component.html'
})
export class ConnectionFormComponent {
  ip = '';
  username = 'admin';
  password = '';
  loading = false;
  error: string | null = null;

  constructor(private mikrotik: MikrotikService) {}

  connect(): void {
    if (!this.ip || !this.username) return;
    this.loading = true;
    this.error = null;
    const req: ConnectionRequest = { ip: this.ip, username: this.username, password: this.password };
    this.mikrotik.connect(req).subscribe({
      next: data => { this.loading = false; this.mikrotik.onConnected(data, req); },
      error: err => { this.loading = false; this.error = err.error?.error ?? 'Falha ao conectar'; }
    });
  }
}

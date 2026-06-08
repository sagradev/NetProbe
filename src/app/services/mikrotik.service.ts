import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Subject, Observable, throwError } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  ConnectionRequest, MikrotikData, SystemResource, NetworkInterface,
  Route, ArpEntry, DhcpLease, LogEntry, PingRequest, PingResult,
  TracerouteRequest, TracerouteResult, BandwidthTestRequest, BandwidthTestResult,
  ChartPoint
} from '../models/netprobe.models';

@Injectable({ providedIn: 'root' })
export class MikrotikService implements OnDestroy {
  private readonly base = environment.apiUrl;
  private readonly POLL_INTERVAL = 60_000;

  private destroy$ = new Subject<void>();
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private credentials: ConnectionRequest | null = null;

  connected$ = new BehaviorSubject<boolean>(false);
  loading$ = new BehaviorSubject<boolean>(false);
  data$ = new BehaviorSubject<MikrotikData | null>(null);
  lastUpdate$ = new BehaviorSubject<Date | null>(null);
  countdown$ = new BehaviorSubject<number>(this.POLL_INTERVAL / 1000);
  errorMessage$ = new BehaviorSubject<string | null>(null);

  cpuHistory$ = new BehaviorSubject<ChartPoint[]>([]);
  ramHistory$ = new BehaviorSubject<ChartPoint[]>([]);

  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private http: HttpClient) {}

  connect(req: ConnectionRequest): Observable<MikrotikData> {
    this.loading$.next(true);
    this.errorMessage$.next(null);
    return this.http.post<MikrotikData>(`${this.base}/mikrotik/connect`, req, { headers: { timeout: '60000' } }).pipe(
      catchError(e => this.handleError(e))
    );
  }

  onConnected(data: MikrotikData, credentials: ConnectionRequest): void {
    this.credentials = credentials;
    this.data$.next(data);
    this.lastUpdate$.next(new Date());
    this.loading$.next(false);
    this.connected$.next(true);
    this.addHistoryPoint(data.systemResource);
    this.startPolling();
  }

  private addHistoryPoint(res: SystemResource): void {
    const ts = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const cpu = [...this.cpuHistory$.value, { timestamp: ts, value: res.cpuLoad }].slice(-30);
    const usedMem = res.totalMemory - res.freeMemory;
    const ram = [...this.ramHistory$.value, { timestamp: ts, value: Math.round(usedMem) }].slice(-30);
    this.cpuHistory$.next(cpu);
    this.ramHistory$.next(ram);
  }

  private startPolling(): void {
    this.stopPolling();
    this.countdown$.next(this.POLL_INTERVAL / 1000);
    this.countdownTimer = setInterval(() => {
      const cur = this.countdown$.value - 1;
      this.countdown$.next(cur <= 0 ? this.POLL_INTERVAL / 1000 : cur);
    }, 1000);
    this.pollTimer = setInterval(() => this.refresh(), this.POLL_INTERVAL);
  }

  refresh(): void {
    if (!this.credentials) return;
    this.loading$.next(true);
    this.http.post<MikrotikData>(`${this.base}/mikrotik/connect`, this.credentials).pipe(
      takeUntil(this.destroy$),
      catchError(e => { this.loading$.next(false); return throwError(() => e); })
    ).subscribe(data => {
      this.data$.next(data);
      this.lastUpdate$.next(new Date());
      this.loading$.next(false);
      this.countdown$.next(this.POLL_INTERVAL / 1000);
      this.addHistoryPoint(data.systemResource);
    });
  }

  disconnect(): void {
    this.stopPolling();
    this.credentials = null;
    this.connected$.next(false);
    this.data$.next(null);
    this.lastUpdate$.next(null);
    this.errorMessage$.next(null);
    this.cpuHistory$.next([]);
    this.ramHistory$.next([]);
  }

  private stopPolling(): void {
    if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null; }
    if (this.countdownTimer) { clearInterval(this.countdownTimer); this.countdownTimer = null; }
  }

  ping(req: PingRequest): Observable<PingResult> {
    return this.http.post<PingResult>(`${this.base}/diagnostic/ping`, req).pipe(catchError(e => this.handleError(e)));
  }

  traceroute(req: TracerouteRequest): Observable<TracerouteResult> {
    return this.http.post<TracerouteResult>(`${this.base}/diagnostic/traceroute`, req).pipe(catchError(e => this.handleError(e)));
  }

  bandwidthTest(req: BandwidthTestRequest): Observable<BandwidthTestResult> {
    return this.http.post<BandwidthTestResult>(`${this.base}/diagnostic/bandwidth-test`, req).pipe(catchError(e => this.handleError(e)));
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    this.loading$.next(false);
    const msg = err.error?.error ?? err.message ?? 'Erro desconhecido';
    this.errorMessage$.next(msg);
    return throwError(() => err);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopPolling();
  }
}

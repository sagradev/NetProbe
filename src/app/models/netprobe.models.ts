export interface ConnectionRequest {
  ip: string;
  port: number;
  username: string;
  password: string;
}

export interface SystemResource {
  routerOsVersion: string;
  uptime: string;
  cpuLoad: number;
  totalMemory: number;
  freeMemory: number;
  totalDisk: number;
  freeDisk: number;
  identity: string;
  platform: string;
}

export interface NetworkInterface {
  name: string;
  type: string;
  running: boolean;
  macAddress: string;
  mtu: number;
  rxBytes: number;
  txBytes: number;
  rxErrors: number;
  txErrors: number;
}

export interface Route {
  dstAddress: string;
  gateway: string;
  interface: string;
  active: boolean;
  distance: number;
  routeType: string;
}

export interface ArpEntry {
  address: string;
  macAddress: string;
  interface: string;
  status: string;
}

export interface DhcpLease {
  address: string;
  macAddress: string;
  hostname: string;
  status: string;
  expiresAfter: string;
}

export interface LogEntry {
  time: string;
  topics: string;
  message: string;
}

export interface MikrotikData {
  systemResource: SystemResource;
  interfaces: NetworkInterface[];
  routes: Route[];
  arpEntries: ArpEntry[];
  dhcpLeases: DhcpLease[];
  logs: LogEntry[];
}

export interface ApiError {
  error: string;
  code: string;
}

export interface PingRequest extends ConnectionRequest {
  target: string;
  count: number;
}

export interface PingResult {
  lines: string[];
  sent: number;
  received: number;
  lost: number;
  avgRtt: number;
}

export interface TracerouteRequest extends ConnectionRequest {
  target: string;
}

export interface TracerouteHop {
  hopNumber: number;
  address: string;
  hostname: string;
  latency: string;
}

export interface TracerouteResult {
  hops: TracerouteHop[];
}

export interface BandwidthTestRequest extends ConnectionRequest {
  target: string;
  direction: string;
  duration: number;
}

export interface BandwidthTestResult {
  txMbps: number;
  rxMbps: number;
  direction: string;
  duration: number;
}

export interface ChartPoint {
  timestamp: string;
  value: number;
}

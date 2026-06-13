export interface ConnectionRequest {
  ip: string
  port: number
  username: string
  password: string
}

export interface SystemResource {
  routerOsVersion: string
  uptime: string
  cpuLoad: number
  totalMemory: number
  freeMemory: number
  totalDisk: number
  freeDisk: number
  identity: string
  platform: string
}

export interface NetworkInterface {
  name: string
  type: string
  running: boolean
  macAddress: string
  mtu: number
  rxBytes: number
  txBytes: number
  rxErrors: number
  txErrors: number
}

export interface Route {
  dstAddress: string
  gateway: string
  interface: string
  active: boolean
  distance: number
  routeType: string
}

export interface ArpEntry {
  address: string
  macAddress: string
  interface: string
  status: string
}

export interface DhcpLease {
  address: string
  macAddress: string
  hostname: string
  status: string
  expiresAfter: string
}

export interface LogEntry {
  time: string
  topics: string
  message: string
}

export interface MikrotikData {
  systemResource: SystemResource
  interfaces: NetworkInterface[]
  routes: Route[]
  arpEntries: ArpEntry[]
  dhcpLeases: DhcpLease[]
  logs: LogEntry[]
}

export interface ChartPoint {
  timestamp: string
  value: number
}

export interface PingRequest extends ConnectionRequest {
  target: string
  count: number
}

export interface PingResult {
  lines: string[]
  sent: number
  received: number
  lost: number
  avgRtt: number
}

export interface TracerouteRequest extends ConnectionRequest {
  target: string
}

export interface TracerouteHop {
  hopNumber: number
  address: string
  hostname: string
  latency: string
}

export interface TracerouteResult {
  hops: TracerouteHop[]
}

export interface BandwidthTestRequest extends ConnectionRequest {
  target: string
  direction: string
  duration: number
}

export interface BandwidthTestResult {
  txMbps: number
  rxMbps: number
  direction: string
  duration: number
}

// ── WiFi ─────────────────────────────────────────────────────────────────────

export interface WifiInterface {
  id: string
  name: string
  ssid: string
  band: string
  channel: string
  disabled: boolean
  running: boolean
  macAddress: string
  securityProfile: string
}

export interface WifiSecurityProfile {
  id: string
  name: string
  mode: string
  authentication: string
  wpaPreSharedKey: string
  wpa2PreSharedKey: string
}

export interface UpdateWifiRequest extends ConnectionRequest {
  id: string
  ssid?: string
}

export interface UpdateSecurityProfileRequest extends ConnectionRequest {
  id: string
  wpaPreSharedKey?: string
  wpa2PreSharedKey?: string
}

// ── DHCP Estático ─────────────────────────────────────────────────────────────

export interface StaticLease {
  id: string
  address: string
  macAddress: string
  hostName: string
  comment: string
  server: string
  disabled: boolean
}

export interface AddStaticLeaseRequest extends ConnectionRequest {
  address: string
  macAddress: string
  hostName?: string
  comment?: string
  server?: string
}

export interface RemoveRequest extends ConnectionRequest {
  id: string
}

// ── Filtro de MAC ─────────────────────────────────────────────────────────────

export interface MacAccessEntry {
  id: string
  macAddress: string
  interface: string
  authentication: boolean
  forwarding: boolean
  comment: string
  disabled: boolean
}

export interface AddMacAccessRequest extends ConnectionRequest {
  macAddress: string
  interface?: string
  comment?: string
}

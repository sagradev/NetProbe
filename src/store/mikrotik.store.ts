import { create } from 'zustand'
import { environment } from '../environments/environment'
import type {
  ConnectionRequest, MikrotikData, SystemResource, ChartPoint,
  PingRequest, PingResult, TracerouteRequest, TracerouteResult,
  BandwidthTestRequest, BandwidthTestResult,
} from '../models/netprobe.models'

const BASE = environment.apiUrl
const POLL_INTERVAL = 60_000

interface MikrotikState {
  connected: boolean
  loading: boolean
  data: MikrotikData | null
  lastUpdate: Date | null
  countdown: number
  errorMessage: string | null
  cpuHistory: ChartPoint[]
  ramHistory: ChartPoint[]
  credentials: ConnectionRequest | null

  connect: (req: ConnectionRequest) => Promise<void>
  disconnect: () => void
  refresh: () => void

  ping: (req: PingRequest) => Promise<PingResult>
  traceroute: (req: TracerouteRequest) => Promise<TracerouteResult>
  bandwidthTest: (req: BandwidthTestRequest) => Promise<BandwidthTestResult>
}

let pollTimer: ReturnType<typeof setInterval> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null

function stopPolling() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null }
}

function addHistoryPoint(
  res: SystemResource,
  get: () => MikrotikState,
  set: (partial: Partial<MikrotikState>) => void,
) {
  const ts = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const cpu = [...get().cpuHistory, { timestamp: ts, value: res.cpuLoad }].slice(-30)
  const usedMem = res.totalMemory - res.freeMemory
  const ram = [...get().ramHistory, { timestamp: ts, value: Math.round(usedMem) }].slice(-30)
  set({ cpuHistory: cpu, ramHistory: ram })
}

async function apiFetch<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }
  return res.json()
}

export const useMikrotik = create<MikrotikState>((set, get) => ({
  connected: false,
  loading: false,
  data: null,
  lastUpdate: null,
  countdown: POLL_INTERVAL / 1000,
  errorMessage: null,
  cpuHistory: [],
  ramHistory: [],
  credentials: null,

  connect: async (req) => {
    set({ loading: true, errorMessage: null })
    try {
      const data = await apiFetch<MikrotikData>(`${BASE}/mikrotik/connect`, req)
      set({ credentials: req, data, lastUpdate: new Date(), loading: false, connected: true })
      addHistoryPoint(data.systemResource, get, set)

      stopPolling()
      set({ countdown: POLL_INTERVAL / 1000 })
      countdownTimer = setInterval(() => {
        const cur = get().countdown - 1
        set({ countdown: cur <= 0 ? POLL_INTERVAL / 1000 : cur })
      }, 1000)
      pollTimer = setInterval(() => get().refresh(), POLL_INTERVAL)
    } catch (e) {
      set({ loading: false, errorMessage: (e as Error).message })
      throw e
    }
  },

  disconnect: () => {
    stopPolling()
    set({
      connected: false, data: null, lastUpdate: null, errorMessage: null,
      cpuHistory: [], ramHistory: [], credentials: null, countdown: POLL_INTERVAL / 1000,
    })
  },

  refresh: async () => {
    const { credentials } = get()
    if (!credentials) return
    set({ loading: true })
    try {
      const data = await apiFetch<MikrotikData>(`${BASE}/mikrotik/connect`, credentials)
      set({ data, lastUpdate: new Date(), loading: false, countdown: POLL_INTERVAL / 1000 })
      addHistoryPoint(data.systemResource, get, set)
    } catch {
      set({ loading: false })
    }
  },

  ping: (req) => apiFetch<PingResult>(`${BASE}/diagnostic/ping`, req),
  traceroute: (req) => apiFetch<TracerouteResult>(`${BASE}/diagnostic/traceroute`, req),
  bandwidthTest: (req) => apiFetch<BandwidthTestResult>(`${BASE}/diagnostic/bandwidth-test`, req),
}))

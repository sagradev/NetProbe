import { useState } from 'react'
import { useMikrotik } from '../store/mikrotik.store'
import type { ConnectionRequest, PingResult, TracerouteResult, BandwidthTestResult } from '../models/netprobe.models'

const Spinner = () => (
  <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
)

export default function DiagnosticPanel({ credentials }: { credentials: ConnectionRequest }) {
  const { ping, traceroute, bandwidthTest } = useMikrotik()

  const [pingTarget, setPingTarget] = useState('')
  const [pingCount, setPingCount] = useState(4)
  const [pingLoading, setPingLoading] = useState(false)
  const [pingResult, setPingResult] = useState<PingResult | null>(null)
  const [pingError, setPingError] = useState<string | null>(null)

  const [traceTarget, setTraceTarget] = useState('')
  const [traceLoading, setTraceLoading] = useState(false)
  const [traceResult, setTraceResult] = useState<TracerouteResult | null>(null)
  const [traceError, setTraceError] = useState<string | null>(null)

  const [bwTarget, setBwTarget] = useState('')
  const [bwDirection, setBwDirection] = useState('both')
  const [bwDuration, setBwDuration] = useState(10)
  const [bwLoading, setBwLoading] = useState(false)
  const [bwResult, setBwResult] = useState<BandwidthTestResult | null>(null)
  const [bwError, setBwError] = useState<string | null>(null)

  const runPing = async () => {
    if (!pingTarget) return
    setPingLoading(true); setPingResult(null); setPingError(null)
    try {
      const r = await ping({ ...credentials, target: pingTarget, count: pingCount })
      setPingResult(r)
    } catch (e) { setPingError((e as Error).message ?? 'Erro ao executar ping') }
    finally { setPingLoading(false) }
  }

  const runTrace = async () => {
    if (!traceTarget) return
    setTraceLoading(true); setTraceResult(null); setTraceError(null)
    try {
      const r = await traceroute({ ...credentials, target: traceTarget })
      setTraceResult(r)
    } catch (e) { setTraceError((e as Error).message ?? 'Erro ao executar traceroute') }
    finally { setTraceLoading(false) }
  }

  const runBwTest = async () => {
    if (!bwTarget) return
    setBwLoading(true); setBwResult(null); setBwError(null)
    try {
      const r = await bandwidthTest({ ...credentials, target: bwTarget, direction: bwDirection, duration: bwDuration })
      setBwResult(r)
    } catch (e) { setBwError((e as Error).message ?? 'Erro ao executar bandwidth test') }
    finally { setBwLoading(false) }
  }

  return (
    <div className="space-y-6">

      {/* Ping */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Ping</h3>
        <div className="flex gap-3 flex-wrap">
          <input
            value={pingTarget} onChange={e => setPingTarget(e.target.value)}
            placeholder="IP ou hostname destino"
            className="flex-1 min-w-[180px] bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm"
          />
          <input
            value={pingCount} onChange={e => setPingCount(Number(e.target.value))}
            type="number" min={1} max={100} placeholder="Pacotes"
            className="w-24 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
          />
          <button onClick={runPing} disabled={pingLoading || !pingTarget}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
            {pingLoading && <Spinner />}
            {pingLoading ? 'Executando...' : 'Executar'}
          </button>
          {(pingResult || pingError) && (
            <button onClick={() => { setPingResult(null); setPingError(null) }}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-2 rounded-lg text-sm transition">Limpar</button>
          )}
        </div>
        {pingError && <div className="mt-3 text-red-400 text-sm">{pingError}</div>}
        {pingResult && (
          <div className="mt-3">
            <div className="bg-gray-950 border border-gray-700 rounded-lg p-4 font-mono text-xs text-green-300 space-y-0.5">
              {pingResult.lines.map((line, i) => <div key={i}>{line}</div>)}
            </div>
            <div className="mt-2 flex gap-4 text-xs text-gray-400">
              <span>Enviados: <b className="text-white">{pingResult.sent}</b></span>
              <span>Recebidos: <b className="text-green-400">{pingResult.received}</b></span>
              <span>Perdidos: <b className="text-red-400">{pingResult.lost}</b></span>
              {pingResult.avgRtt > 0 && <span>RTT médio: <b className="text-white">{pingResult.avgRtt}ms</b></span>}
            </div>
          </div>
        )}
      </div>

      {/* Traceroute */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Traceroute</h3>
        <div className="flex gap-3 flex-wrap">
          <input
            value={traceTarget} onChange={e => setTraceTarget(e.target.value)}
            placeholder="IP ou hostname destino"
            className="flex-1 min-w-[180px] bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm"
          />
          <button onClick={runTrace} disabled={traceLoading || !traceTarget}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
            {traceLoading && <Spinner />}
            {traceLoading ? 'Executando...' : 'Executar'}
          </button>
          {(traceResult || traceError) && (
            <button onClick={() => { setTraceResult(null); setTraceError(null) }}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-2 rounded-lg text-sm transition">Limpar</button>
          )}
        </div>
        {traceError && <div className="mt-3 text-red-400 text-sm">{traceError}</div>}
        {traceResult && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">IP</th>
                  <th className="py-2 pr-4">Hostname</th>
                  <th className="py-2">Latência</th>
                </tr>
              </thead>
              <tbody>
                {traceResult.hops.map(hop => (
                  <tr key={hop.hopNumber} className="border-b border-gray-800 font-mono text-xs">
                    <td className="py-2 pr-4 text-gray-400">{hop.hopNumber}</td>
                    <td className="py-2 pr-4 text-white">{hop.address || '*'}</td>
                    <td className="py-2 pr-4 text-gray-400">{hop.hostname || '—'}</td>
                    <td className="py-2 text-green-400">{hop.latency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bandwidth Test */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-2">Bandwidth Test</h3>
        <div className="bg-yellow-900/30 border border-yellow-700/50 text-yellow-300 text-xs rounded-lg px-4 py-3 mb-4">
          Requer dois MikroTiks: o destino deve ter o <b>bandwidth-server</b> habilitado (<code>tool bandwidth-server set enabled=yes</code>).
        </div>
        <div className="flex gap-3 flex-wrap">
          <input
            value={bwTarget} onChange={e => setBwTarget(e.target.value)}
            placeholder="IP do MikroTik destino"
            className="flex-1 min-w-[180px] bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm"
          />
          <select value={bwDirection} onChange={e => setBwDirection(e.target.value)}
            className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm">
            <option value="both">Upload + Download</option>
            <option value="upload">Upload</option>
            <option value="download">Download</option>
          </select>
          <input
            value={bwDuration} onChange={e => setBwDuration(Number(e.target.value))}
            type="number" min={1} max={60} placeholder="Duração (s)"
            className="w-28 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
          />
          <button onClick={runBwTest} disabled={bwLoading || !bwTarget}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
            {bwLoading && <Spinner />}
            {bwLoading ? 'Testando...' : 'Executar'}
          </button>
          {(bwResult || bwError) && (
            <button onClick={() => { setBwResult(null); setBwError(null) }}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-2 rounded-lg text-sm transition">Limpar</button>
          )}
        </div>
        {bwError && <div className="mt-3 text-red-400 text-sm">{bwError}</div>}
        {bwResult && (
          <div className="mt-4 flex gap-6 flex-wrap">
            {bwResult.txMbps > 0 && (
              <div className="bg-gray-900 rounded-xl px-6 py-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Upload (TX)</p>
                <p className="text-2xl font-bold text-blue-400">{bwResult.txMbps.toFixed(1)} <span className="text-sm text-gray-400">Mbps</span></p>
              </div>
            )}
            {bwResult.rxMbps > 0 && (
              <div className="bg-gray-900 rounded-xl px-6 py-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Download (RX)</p>
                <p className="text-2xl font-bold text-purple-400">{bwResult.rxMbps.toFixed(1)} <span className="text-sm text-gray-400">Mbps</span></p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}

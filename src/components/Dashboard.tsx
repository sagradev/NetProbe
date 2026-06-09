import { useState } from 'react'
import { useMikrotik } from '../store/mikrotik.store'
import SystemResources from './SystemResources'
import InterfacesTable from './InterfacesTable'
import RoutesTable from './RoutesTable'
import ArpTable from './ArpTable'
import DhcpTable from './DhcpTable'
import LogsViewer from './LogsViewer'
import DiagnosticPanel from './DiagnosticPanel'

type Tab = 'overview' | 'interfaces' | 'routes' | 'arp' | 'dhcp' | 'logs' | 'diagnostic'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'interfaces', label: 'Interfaces' },
  { id: 'routes', label: 'Rotas' },
  { id: 'arp', label: 'ARP' },
  { id: 'dhcp', label: 'DHCP' },
  { id: 'logs', label: 'Logs' },
  { id: 'diagnostic', label: 'Diagnóstico' },
]

const Spinner = () => (
  <svg className="animate-spin h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
)

export default function Dashboard() {
  const { data, loading, lastUpdate, countdown, cpuHistory, ramHistory, credentials, disconnect, refresh } = useMikrotik()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  if (!data || !credentials) return null

  const countdownWidth = Math.round((countdown / 60) * 100) + '%'
  const formatTime = (d: Date) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">

      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between gap-4 flex-wrap sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <span className="text-white font-bold text-lg">{data.systemResource.identity || 'MikroTik'}</span>
          <span className="text-xs text-gray-400 font-mono bg-gray-900 px-2 py-1 rounded">{credentials.ip}</span>
          <span className="text-xs text-gray-400">RouterOS {data.systemResource.routerOsVersion}</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-28 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-1000 rounded-full" style={{ width: countdownWidth }} />
            </div>
            <span className="text-xs text-gray-400 tabular-nums">{countdown}s</span>
          </div>
          {lastUpdate && (
            <span className="text-xs text-gray-500">Atualizado: {formatTime(lastUpdate)}</span>
          )}
          {loading && <Spinner />}
          <button onClick={refresh} disabled={loading}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-200 text-xs px-3 py-1.5 rounded-lg transition">
            Atualizar agora
          </button>
          <button onClick={disconnect}
            className="bg-red-800/60 hover:bg-red-700 text-red-300 text-xs px-3 py-1.5 rounded-lg transition">
            Desconectar
          </button>
        </div>
      </header>

      <nav className="bg-gray-800 border-b border-gray-700 px-6 flex gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}>
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-6">
        {activeTab === 'overview' && (
          <SystemResources resource={data.systemResource} cpuHistory={cpuHistory} ramHistory={ramHistory} />
        )}
        {activeTab === 'interfaces' && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <h2 className="text-gray-200 font-semibold mb-4">Interfaces de rede</h2>
            <InterfacesTable interfaces={data.interfaces} />
          </div>
        )}
        {activeTab === 'routes' && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <h2 className="text-gray-200 font-semibold mb-4">Tabela de rotas</h2>
            <RoutesTable routes={data.routes} />
          </div>
        )}
        {activeTab === 'arp' && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <h2 className="text-gray-200 font-semibold mb-4">Tabela ARP</h2>
            <ArpTable entries={data.arpEntries} />
          </div>
        )}
        {activeTab === 'dhcp' && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <h2 className="text-gray-200 font-semibold mb-4">DHCP Leases</h2>
            <DhcpTable leases={data.dhcpLeases} />
          </div>
        )}
        {activeTab === 'logs' && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <h2 className="text-gray-200 font-semibold mb-4">Logs do sistema</h2>
            <LogsViewer logs={data.logs} />
          </div>
        )}
        {activeTab === 'diagnostic' && (
          <DiagnosticPanel credentials={credentials} />
        )}
      </main>
    </div>
  )
}

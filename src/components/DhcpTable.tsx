import type { DhcpLease } from '../models/netprobe.models'

const statusColor: Record<string, string> = {
  bound: 'bg-green-900 text-green-300',
  waiting: 'bg-yellow-900 text-yellow-300',
  expired: 'bg-red-900 text-red-300',
}

export default function DhcpTable({ leases }: { leases: DhcpLease[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-700">
            <th className="py-3 pr-4">Hostname</th>
            <th className="py-3 pr-4">IP</th>
            <th className="py-3 pr-4">MAC</th>
            <th className="py-3 pr-4">Status</th>
            <th className="py-3 pr-4">Expira em</th>
          </tr>
        </thead>
        <tbody>
          {leases.map((l, i) => (
            <tr key={i} className="border-b border-gray-800 hover:bg-gray-700/40 transition">
              <td className="py-3 pr-4 text-white">{l.hostname || '—'}</td>
              <td className="py-3 pr-4 font-mono text-gray-300 text-xs">{l.address}</td>
              <td className="py-3 pr-4 font-mono text-gray-300 text-xs">{l.macAddress}</td>
              <td className="py-3 pr-4">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor[l.status] ?? 'bg-gray-700 text-gray-400'}`}>
                  {l.status}
                </span>
              </td>
              <td className="py-3 pr-4 text-gray-400 text-xs">{l.expiresAfter || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {leases.length === 0 && (
        <p className="text-gray-500 text-sm py-6 text-center">Nenhum lease DHCP encontrado</p>
      )}
    </div>
  )
}

import type { ArpEntry } from '../models/netprobe.models'

export default function ArpTable({ entries }: { entries: ArpEntry[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-700">
            <th className="py-3 pr-4">IP</th>
            <th className="py-3 pr-4">MAC</th>
            <th className="py-3 pr-4">Interface</th>
            <th className="py-3 pr-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={i} className="border-b border-gray-800 hover:bg-gray-700/40 transition">
              <td className="py-3 pr-4 font-mono text-white text-xs">{e.address}</td>
              <td className="py-3 pr-4 font-mono text-gray-300 text-xs">{e.macAddress}</td>
              <td className="py-3 pr-4 text-gray-300">{e.interface}</td>
              <td className="py-3 pr-4">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${e.status === 'reachable' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                  {e.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {entries.length === 0 && (
        <p className="text-gray-500 text-sm py-6 text-center">Nenhuma entrada ARP encontrada</p>
      )}
    </div>
  )
}

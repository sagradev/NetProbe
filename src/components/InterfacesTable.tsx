import type { NetworkInterface } from '../models/netprobe.models'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function InterfacesTable({ interfaces }: { interfaces: NetworkInterface[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-700">
            <th className="py-3 pr-4">Nome</th>
            <th className="py-3 pr-4">Tipo</th>
            <th className="py-3 pr-4">Status</th>
            <th className="py-3 pr-4">MAC</th>
            <th className="py-3 pr-4">MTU</th>
            <th className="py-3 pr-4">RX</th>
            <th className="py-3 pr-4">TX</th>
            <th className="py-3 pr-4">Erros RX/TX</th>
          </tr>
        </thead>
        <tbody>
          {interfaces.map(iface => (
            <tr key={iface.name} className="border-b border-gray-800 hover:bg-gray-700/40 transition">
              <td className="py-3 pr-4 font-mono text-white">{iface.name}</td>
              <td className="py-3 pr-4 text-gray-300">{iface.type}</td>
              <td className="py-3 pr-4">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${iface.running ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                  {iface.running ? 'up' : 'down'}
                </span>
              </td>
              <td className="py-3 pr-4 font-mono text-gray-300 text-xs">{iface.macAddress}</td>
              <td className="py-3 pr-4 text-gray-300">{iface.mtu}</td>
              <td className="py-3 pr-4 text-gray-300">{formatBytes(iface.rxBytes)}</td>
              <td className="py-3 pr-4 text-gray-300">{formatBytes(iface.txBytes)}</td>
              <td className="py-3 pr-4 text-gray-400 text-xs">{iface.rxErrors} / {iface.txErrors}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {interfaces.length === 0 && (
        <p className="text-gray-500 text-sm py-6 text-center">Nenhuma interface encontrada</p>
      )}
    </div>
  )
}

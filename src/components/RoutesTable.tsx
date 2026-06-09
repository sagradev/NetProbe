import { useState } from 'react'
import type { Route } from '../models/netprobe.models'

export default function RoutesTable({ routes }: { routes: Route[] }) {
  const [filter, setFilter] = useState('')

  const filtered = filter ? routes.filter(r => r.routeType === filter) : routes
  const types = Array.from(new Set(routes.map(r => r.routeType)))

  return (
    <div>
      {types.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFilter('')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${filter === '' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Todos
          </button>
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${filter === t ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              {t}
            </button>
          ))}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="py-3 pr-4">Destino</th>
              <th className="py-3 pr-4">Gateway</th>
              <th className="py-3 pr-4">Interface</th>
              <th className="py-3 pr-4">Tipo</th>
              <th className="py-3 pr-4">Distância</th>
              <th className="py-3 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} className="border-b border-gray-800 hover:bg-gray-700/40 transition">
                <td className="py-3 pr-4 font-mono text-white text-xs">{r.dstAddress}</td>
                <td className="py-3 pr-4 font-mono text-gray-300 text-xs">{r.gateway || '—'}</td>
                <td className="py-3 pr-4 text-gray-300">{r.interface}</td>
                <td className="py-3 pr-4 text-gray-400 text-xs">{r.routeType}</td>
                <td className="py-3 pr-4 text-gray-300">{r.distance}</td>
                <td className="py-3 pr-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.active ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                    {r.active ? 'ativo' : 'inativo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-gray-500 text-sm py-6 text-center">Nenhuma rota encontrada</p>
        )}
      </div>
    </div>
  )
}

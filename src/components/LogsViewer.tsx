import { useState } from 'react'
import type { LogEntry } from '../models/netprobe.models'

export default function LogsViewer({ logs }: { logs: LogEntry[] }) {
  const [filter, setFilter] = useState('')

  const topics = Array.from(new Set(logs.map(l => l.topics).filter(Boolean)))
  const filtered = filter ? logs.filter(l => l.topics === filter) : logs

  return (
    <div>
      {topics.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFilter('')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${filter === '' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Todos
          </button>
          {topics.map(t => (
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
      <div className="space-y-1 max-h-[60vh] overflow-y-auto">
        {filtered.map((log, i) => (
          <div key={i} className="flex gap-3 text-xs font-mono bg-gray-900 px-3 py-2 rounded">
            <span className="text-gray-500 shrink-0">{log.time}</span>
            <span className="text-blue-400 shrink-0">[{log.topics}]</span>
            <span className="text-gray-200">{log.message}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-500 text-sm py-6 text-center">Nenhum log encontrado</p>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useMikrotik } from '../store/mikrotik.store'

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
)

export default function ConnectionForm() {
  const connect = useMikrotik(s => s.connect)
  const [ip, setIp] = useState('')
  const [port, setPort] = useState(8728)
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ip || !username) return
    setLoading(true)
    setError(null)
    try {
      await connect({ ip, port, username, password })
    } catch (err) {
      setError((err as Error).message ?? 'Falha ao conectar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">NetProbe</h1>
          <p className="text-gray-400 mt-1 text-sm">Monitoramento MikroTik em tempo real</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-xl">
          <h2 className="text-lg font-semibold text-gray-200 mb-6">Conectar ao roteador</h2>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">Endereço IP</label>
                  <input
                    value={ip} onChange={e => setIp(e.target.value)}
                    required placeholder="192.168.1.1"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div className="w-28">
                  <label className="block text-sm text-gray-400 mb-1">Porta API</label>
                  <input
                    value={port} onChange={e => setPort(Number(e.target.value))}
                    type="number" required min={1} max={65535}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Usuário</label>
                <input
                  value={username} onChange={e => setUsername(e.target.value)}
                  required
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Senha</label>
                <input
                  value={password} onChange={e => setPassword(e.target.value)}
                  type="password"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading || !ip || !username}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading && <Spinner />}
              {loading ? 'Conectando...' : 'Conectar'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Porta padrão 8728 (RouterOS API) • v6 e v7+
        </p>
      </div>
    </div>
  )
}

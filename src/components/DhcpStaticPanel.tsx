import { useEffect, useState } from 'react'
import { useMikrotik } from '../store/mikrotik.store'
import type { ConnectionRequest, StaticLease } from '../models/netprobe.models'

const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
const IP_REGEX  = /^(\d{1,3}\.){3}\d{1,3}$/

const emptyForm = { address: '', macAddress: '', hostName: '', comment: '' }

export default function DhcpStaticPanel({ credentials }: { credentials: ConnectionRequest }) {
  const { listStaticLeases, addStaticLease, removeStaticLease } = useMikrotik()

  const [leases,   setLeases]   = useState<StaticLease[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [form,     setForm]     = useState(emptyForm)
  const [saving,   setSaving]   = useState(false)
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null)

  const load = async () => {
    setLoading(true); setError(null)
    try { setLeases(await listStaticLeases(credentials)) }
    catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const showFeedback = (msg: string, ok: boolean) => {
    setFeedback({ msg, ok })
    setTimeout(() => setFeedback(null), 3000)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!IP_REGEX.test(form.address))    { showFeedback('IP inválido', false); return }
    if (!MAC_REGEX.test(form.macAddress)) { showFeedback('MAC inválido (formato: XX:XX:XX:XX:XX:XX)', false); return }
    setSaving(true)
    try {
      await addStaticLease({ ...credentials, ...form })
      showFeedback('Reserva adicionada com sucesso!', true)
      setForm(emptyForm)
      await load()
    } catch (e) { showFeedback((e as Error).message, false) }
    finally { setSaving(false) }
  }

  const handleRemove = async (id: string) => {
    try {
      await removeStaticLease({ ...credentials, id })
      showFeedback('Reserva removida.', true)
      await load()
    } catch (e) { showFeedback((e as Error).message, false) }
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${feedback.ok ? 'bg-green-900/40 border border-green-700 text-green-300' : 'bg-red-900/40 border border-red-700 text-red-300'}`}>
          {feedback.msg}
        </div>
      )}

      {/* Formulário de adição */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Adicionar Reserva DHCP</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Endereço IP *</label>
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="192.168.1.100" required
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">MAC Address *</label>
            <input value={form.macAddress} onChange={e => setForm({ ...form, macAddress: e.target.value })}
              placeholder="AA:BB:CC:DD:EE:FF" required
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Hostname</label>
            <input value={form.hostName} onChange={e => setForm({ ...form, hostName: e.target.value })}
              placeholder="meu-dispositivo"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Comentário</label>
            <input value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })}
              placeholder="Observação"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div className="md:col-span-2 lg:col-span-4">
            <button type="submit" disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2 rounded-lg transition">
              {saving ? 'Adicionando...' : 'Adicionar Reserva'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabela de reservas */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Reservas Estáticas</h3>
        {loading
          ? <p className="text-gray-400 text-sm">Carregando...</p>
          : error
            ? <p className="text-red-400 text-sm">Erro: {error}</p>
            : leases.length === 0
              ? <p className="text-gray-500 text-sm">Nenhuma reserva estática encontrada.</p>
              : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-gray-700">
                        <th className="py-2 pr-4">IP</th>
                        <th className="py-2 pr-4">MAC</th>
                        <th className="py-2 pr-4">Hostname</th>
                        <th className="py-2 pr-4">Comentário</th>
                        <th className="py-2 pr-4">Servidor</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {leases.map(l => (
                        <tr key={l.id} className="border-b border-gray-800 hover:bg-gray-700/30">
                          <td className="py-2 pr-4 font-mono text-white text-xs">{l.address}</td>
                          <td className="py-2 pr-4 font-mono text-blue-300 text-xs">{l.macAddress}</td>
                          <td className="py-2 pr-4 text-gray-300 text-xs">{l.hostName || '—'}</td>
                          <td className="py-2 pr-4 text-gray-400 text-xs">{l.comment || '—'}</td>
                          <td className="py-2 pr-4 text-gray-400 text-xs">{l.server || '—'}</td>
                          <td className="py-2 pr-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${l.disabled ? 'bg-gray-700 text-gray-400' : 'bg-green-900 text-green-300'}`}>
                              {l.disabled ? 'desabilitado' : 'ativo'}
                            </span>
                          </td>
                          <td className="py-2">
                            <button onClick={() => handleRemove(l.id)}
                              className="bg-red-800/60 hover:bg-red-700 text-red-300 text-xs px-3 py-1 rounded-lg transition">
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
        }
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useMikrotik } from '../store/mikrotik.store'
import type { ConnectionRequest, MacAccessEntry } from '../models/netprobe.models'

const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/

export default function MacFilterPanel({ credentials }: { credentials: ConnectionRequest }) {
  const { listAccessList, addAccessList, removeAccessList } = useMikrotik()

  const [entries,  setEntries]  = useState<MacAccessEntry[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [mac,      setMac]      = useState('')
  const [iface,    setIface]    = useState('all')
  const [comment,  setComment]  = useState('')
  const [saving,   setSaving]   = useState(false)
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null)

  const load = async () => {
    setLoading(true); setError(null)
    try { setEntries(await listAccessList(credentials)) }
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
    if (!MAC_REGEX.test(mac)) { showFeedback('MAC inválido (formato: XX:XX:XX:XX:XX:XX)', false); return }
    setSaving(true)
    try {
      await addAccessList({ ...credentials, macAddress: mac, interface: iface, comment })
      showFeedback('MAC adicionado com sucesso!', true)
      setMac(''); setComment(''); setIface('all')
      await load()
    } catch (e) { showFeedback((e as Error).message, false) }
    finally { setSaving(false) }
  }

  const handleRemove = async (id: string) => {
    try {
      await removeAccessList({ ...credentials, id })
      showFeedback('Entrada removida.', true)
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

      {/* Formulário */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Adicionar MAC à Lista de Acesso</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">MAC Address *</label>
            <input value={mac} onChange={e => setMac(e.target.value)}
              placeholder="AA:BB:CC:DD:EE:FF" required
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Interface</label>
            <input value={iface} onChange={e => setIface(e.target.value)}
              placeholder="all"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Comentário</label>
            <input value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Identificação do dispositivo"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div className="md:col-span-3">
            <button type="submit" disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2 rounded-lg transition">
              {saving ? 'Adicionando...' : 'Adicionar MAC'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabela */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Lista de Acesso Wireless</h3>
        {loading
          ? <p className="text-gray-400 text-sm">Carregando...</p>
          : error
            ? <p className="text-red-400 text-sm">Erro: {error}</p>
            : entries.length === 0
              ? <p className="text-gray-500 text-sm">Nenhuma entrada na lista de acesso.</p>
              : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-gray-700">
                        <th className="py-2 pr-4">MAC</th>
                        <th className="py-2 pr-4">Interface</th>
                        <th className="py-2 pr-4">Auth</th>
                        <th className="py-2 pr-4">Forward</th>
                        <th className="py-2 pr-4">Comentário</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map(e => (
                        <tr key={e.id} className="border-b border-gray-800 hover:bg-gray-700/30">
                          <td className="py-2 pr-4 font-mono text-blue-300 text-xs">{e.macAddress}</td>
                          <td className="py-2 pr-4 text-gray-300 text-xs">{e.interface || 'all'}</td>
                          <td className="py-2 pr-4">
                            <span className={`px-2 py-0.5 rounded text-xs ${e.authentication ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                              {e.authentication ? 'sim' : 'não'}
                            </span>
                          </td>
                          <td className="py-2 pr-4">
                            <span className={`px-2 py-0.5 rounded text-xs ${e.forwarding ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                              {e.forwarding ? 'sim' : 'não'}
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-gray-400 text-xs">{e.comment || '—'}</td>
                          <td className="py-2 pr-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${e.disabled ? 'bg-gray-700 text-gray-400' : 'bg-green-900 text-green-300'}`}>
                              {e.disabled ? 'desabilitado' : 'ativo'}
                            </span>
                          </td>
                          <td className="py-2">
                            <button onClick={() => handleRemove(e.id)}
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

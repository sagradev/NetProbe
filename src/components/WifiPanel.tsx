import { useEffect, useState } from 'react'
import { useMikrotik } from '../store/mikrotik.store'
import type { ConnectionRequest, WifiInterface, WifiSecurityProfile } from '../models/netprobe.models'

interface EditSsid  { interfaceId: string; value: string }
interface EditPass  { profileId: string; value: string; confirm: string }

export default function WifiPanel({ credentials }: { credentials: ConnectionRequest }) {
  const { getWifiInterfaces, getSecurityProfiles, updateWifiInterface, updateSecurityProfile } = useMikrotik()

  const [interfaces, setInterfaces]   = useState<WifiInterface[]>([])
  const [profiles,   setProfiles]     = useState<WifiSecurityProfile[]>([])
  const [loading,    setLoading]      = useState(true)
  const [error,      setError]        = useState<string | null>(null)
  const [editSsid,   setEditSsid]     = useState<EditSsid | null>(null)
  const [editPass,   setEditPass]     = useState<EditPass | null>(null)
  const [feedback,   setFeedback]     = useState<{ msg: string; ok: boolean } | null>(null)
  const [saving,     setSaving]       = useState(false)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const [ifaces, profs] = await Promise.all([
        getWifiInterfaces(credentials),
        getSecurityProfiles(credentials),
      ])
      setInterfaces(ifaces); setProfiles(profs)
    } catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const showFeedback = (msg: string, ok: boolean) => {
    setFeedback({ msg, ok })
    setTimeout(() => setFeedback(null), 3000)
  }

  const saveSsid = async () => {
    if (!editSsid) return
    setSaving(true)
    try {
      await updateWifiInterface({ ...credentials, id: editSsid.interfaceId, ssid: editSsid.value })
      showFeedback('SSID atualizado com sucesso!', true)
      setEditSsid(null)
      await load()
    } catch (e) { showFeedback((e as Error).message, false) }
    finally { setSaving(false) }
  }

  const savePassword = async () => {
    if (!editPass) return
    if (editPass.value !== editPass.confirm) { showFeedback('As senhas não conferem', false); return }
    if (editPass.value.length < 8) { showFeedback('Senha deve ter no mínimo 8 caracteres', false); return }
    setSaving(true)
    try {
      await updateSecurityProfile({ ...credentials, id: editPass.profileId, wpaPreSharedKey: editPass.value, wpa2PreSharedKey: editPass.value })
      showFeedback('Senha atualizada com sucesso!', true)
      setEditPass(null)
    } catch (e) { showFeedback((e as Error).message, false) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="text-gray-400 text-sm p-6">Carregando interfaces WiFi...</div>
  if (error)   return <div className="text-red-400 text-sm p-6">Erro: {error}</div>

  return (
    <div className="space-y-6">
      {feedback && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${feedback.ok ? 'bg-green-900/40 border border-green-700 text-green-300' : 'bg-red-900/40 border border-red-700 text-red-300'}`}>
          {feedback.msg}
        </div>
      )}

      {/* Interfaces */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Interfaces Wireless</h3>
        {interfaces.length === 0
          ? <p className="text-gray-500 text-sm">Nenhuma interface wireless encontrada.</p>
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="py-2 pr-4">Nome</th>
                    <th className="py-2 pr-4">SSID</th>
                    <th className="py-2 pr-4">Banda</th>
                    <th className="py-2 pr-4">Canal</th>
                    <th className="py-2 pr-4">Perfil Seg.</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {interfaces.map(iface => (
                    <>
                      <tr key={iface.id} className="border-b border-gray-800 hover:bg-gray-700/30">
                        <td className="py-2 pr-4 text-white font-mono text-xs">{iface.name}</td>
                        <td className="py-2 pr-4 text-blue-300">{iface.ssid || '—'}</td>
                        <td className="py-2 pr-4 text-gray-300 text-xs">{iface.band || '—'}</td>
                        <td className="py-2 pr-4 text-gray-300 text-xs">{iface.channel || '—'}</td>
                        <td className="py-2 pr-4 text-gray-400 text-xs">{iface.securityProfile || '—'}</td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${iface.running && !iface.disabled ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                            {iface.disabled ? 'desabilitado' : iface.running ? 'ativo' : 'inativo'}
                          </span>
                        </td>
                        <td className="py-2">
                          <button onClick={() => setEditSsid({ interfaceId: iface.id, value: iface.ssid })}
                            className="bg-blue-700 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-lg transition">
                            Editar SSID
                          </button>
                        </td>
                      </tr>
                      {editSsid?.interfaceId === iface.id && (
                        <tr key={`edit-${iface.id}`} className="bg-gray-700/30">
                          <td colSpan={7} className="py-3 px-2">
                            <div className="flex items-center gap-3">
                              <input
                                value={editSsid.value}
                                onChange={e => setEditSsid({ ...editSsid, value: e.target.value })}
                                placeholder="Novo SSID"
                                className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                              />
                              <button onClick={saveSsid} disabled={saving || !editSsid.value}
                                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white text-xs px-4 py-2 rounded-lg transition">
                                {saving ? 'Salvando...' : 'Salvar'}
                              </button>
                              <button onClick={() => setEditSsid(null)}
                                className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs px-3 py-2 rounded-lg transition">
                                Cancelar
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      {/* Perfis de Segurança */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Perfis de Segurança</h3>
        {profiles.length === 0
          ? <p className="text-gray-500 text-sm">Nenhum perfil encontrado.</p>
          : (
            <div className="space-y-2">
              {profiles.map(p => (
                <div key={p.id}>
                  <div className="flex items-center justify-between bg-gray-700/40 rounded-lg px-4 py-3">
                    <div>
                      <span className="text-white font-medium text-sm">{p.name}</span>
                      <span className="text-gray-400 text-xs ml-3">{p.mode}</span>
                      {p.authentication && <span className="text-gray-500 text-xs ml-2">{p.authentication}</span>}
                    </div>
                    <button onClick={() => setEditPass({ profileId: p.id, value: '', confirm: '' })}
                      className="bg-yellow-700 hover:bg-yellow-600 text-white text-xs px-3 py-1.5 rounded-lg transition">
                      Alterar Senha
                    </button>
                  </div>
                  {editPass?.profileId === p.id && (
                    <div className="mt-2 bg-gray-700/30 rounded-lg p-4 space-y-3">
                      <input
                        type="password" value={editPass.value} placeholder="Nova senha (mín. 8 caracteres)"
                        onChange={e => setEditPass({ ...editPass, value: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="password" value={editPass.confirm} placeholder="Confirmar senha"
                        onChange={e => setEditPass({ ...editPass, confirm: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex gap-2">
                        <button onClick={savePassword} disabled={saving || !editPass.value}
                          className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-yellow-900 text-white text-xs px-4 py-2 rounded-lg transition">
                          {saving ? 'Salvando...' : 'Salvar Senha'}
                        </button>
                        <button onClick={() => setEditPass(null)}
                          className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs px-3 py-2 rounded-lg transition">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}

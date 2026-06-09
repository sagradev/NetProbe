import { useMikrotik } from './store/mikrotik.store'
import ConnectionForm from './components/ConnectionForm'
import Dashboard from './components/Dashboard'

export default function App() {
  const connected = useMikrotik(s => s.connected)
  return connected ? <Dashboard /> : <ConnectionForm />
}

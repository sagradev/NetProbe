import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Tooltip, Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { SystemResource, ChartPoint } from '../models/netprobe.models'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 300 },
  plugins: { legend: { display: false }, tooltip: { mode: 'index' as const, intersect: false } },
  scales: {
    x: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: '#374151' } },
    y: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: '#374151' }, beginAtZero: true },
  },
}

function makeChartData(points: ChartPoint[], color: string) {
  return {
    labels: points.map(p => p.timestamp),
    datasets: [{
      data: points.map(p => p.value),
      borderColor: color,
      backgroundColor: color.replace(')', ', 0.1)').replace('rgb', 'rgba'),
      fill: true,
      tension: 0.3,
      pointRadius: 2,
    }],
  }
}

interface Props {
  resource: SystemResource
  cpuHistory: ChartPoint[]
  ramHistory: ChartPoint[]
}

export default function SystemResources({ resource, cpuHistory, ramHistory }: Props) {
  const usedMemMB = Math.round(resource.totalMemory - resource.freeMemory)
  const ramPercent = resource.totalMemory > 0 ? Math.round((usedMemMB / resource.totalMemory) * 100) : 0
  const usedDiskMB = Math.round(resource.totalDisk - resource.freeDisk)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide">CPU</p>
          <p className="text-3xl font-bold text-blue-400 mt-1">{resource.cpuLoad}<span className="text-lg text-gray-400">%</span></p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide">RAM usada</p>
          <p className="text-3xl font-bold text-purple-400 mt-1">{usedMemMB}<span className="text-lg text-gray-400"> MB</span></p>
          <p className="text-xs text-gray-500 mt-1">{ramPercent}% de {resource.totalMemory.toLocaleString('pt-BR')} MB</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Disco usado</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{usedDiskMB}<span className="text-base text-gray-400"> MB</span></p>
          <p className="text-xs text-gray-500 mt-1">livre: {resource.freeDisk.toLocaleString('pt-BR')} MB</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Uptime</p>
          <p className="text-lg font-semibold text-white mt-1 break-all">{resource.uptime}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <p className="text-sm text-gray-400 mb-3">CPU (%) — últimos 30 pontos</p>
          <div className="h-48">
            <Line data={makeChartData(cpuHistory, 'rgb(96, 165, 250)')} options={chartOptions} />
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <p className="text-sm text-gray-400 mb-3">RAM (MB) — últimos 30 pontos</p>
          <div className="h-48">
            <Line data={makeChartData(ramHistory, 'rgb(167, 139, 250)')} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <div><span className="text-gray-400">Versão: </span><span className="text-white">{resource.routerOsVersion}</span></div>
        <div><span className="text-gray-400">Plataforma: </span><span className="text-white">{resource.platform}</span></div>
        <div><span className="text-gray-400">Identidade: </span><span className="text-white">{resource.identity}</span></div>
      </div>
    </div>
  )
}

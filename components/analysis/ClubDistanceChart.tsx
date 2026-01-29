'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface ClubStat {
  club_type: string
  avg_carry: number
  avg_total: number
  avg_ball_speed: number
  avg_spin_rate: number
  total_shots: number
}

interface ClubDistanceChartProps {
  statistics: ClubStat[]
  locale: string
}

const CLUB_ORDER = [
  'driver', '3wood', '5wood', 'hybrid',
  '3iron', '4iron', '5iron', '6iron', '7iron', '8iron', '9iron',
  'pw', 'gw', 'sw', 'lw',
]

const CLUB_LABELS: Record<string, Record<string, string>> = {
  en: {
    driver: 'DR', '3wood': '3W', '5wood': '5W', hybrid: 'HY',
    '3iron': '3i', '4iron': '4i', '5iron': '5i', '6iron': '6i',
    '7iron': '7i', '8iron': '8i', '9iron': '9i',
    pw: 'PW', gw: 'GW', sw: 'SW', lw: 'LW',
  },
  ko: {
    driver: 'DR', '3wood': '3W', '5wood': '5W', hybrid: 'HY',
    '3iron': '3i', '4iron': '4i', '5iron': '5i', '6iron': '6i',
    '7iron': '7i', '8iron': '8i', '9iron': '9i',
    pw: 'PW', gw: 'GW', sw: 'SW', lw: 'LW',
  },
}

const CLUB_COLORS: Record<string, string> = {
  driver: '#10B981',
  '3wood': '#059669',
  '5wood': '#047857',
  hybrid: '#3B82F6',
  '3iron': '#6366F1', '4iron': '#6366F1', '5iron': '#6366F1',
  '6iron': '#8B5CF6', '7iron': '#8B5CF6', '8iron': '#8B5CF6',
  '9iron': '#A855F7',
  pw: '#F59E0B', gw: '#F59E0B', sw: '#EF4444', lw: '#EF4444',
}

export default function ClubDistanceChart({ statistics, locale }: ClubDistanceChartProps) {
  const labels = CLUB_LABELS[locale] || CLUB_LABELS.en

  const sortedData = [...statistics]
    .sort((a, b) => {
      const idxA = CLUB_ORDER.indexOf(a.club_type)
      const idxB = CLUB_ORDER.indexOf(b.club_type)
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB)
    })
    .map((stat) => ({
      ...stat,
      label: labels[stat.club_type] || stat.club_type,
      color: CLUB_COLORS[stat.club_type] || '#6B7280',
    }))

  if (sortedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        {locale === 'ko' ? '데이터가 없습니다' : 'No data available'}
      </div>
    )
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sortedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            label={{
              value: locale === 'ko' ? '야드' : 'yards',
              angle: -90,
              position: 'insideLeft',
              offset: 20,
              style: { fontSize: 11, fill: '#9CA3AF' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '13px',
            }}
            formatter={(value: unknown, name: unknown) => {
              const v = typeof value === 'number' ? value : 0
              const n = String(name)
              return [
                `${Math.round(v)} ${locale === 'ko' ? '야드' : 'yds'}`,
                n === 'avg_carry'
                  ? (locale === 'ko' ? '캐리' : 'Carry')
                  : (locale === 'ko' ? '토탈' : 'Total'),
              ]
            }}
            labelFormatter={(label: unknown) => String(label)}
          />
          <Bar dataKey="avg_carry" radius={[4, 4, 0, 0]} maxBarSize={32}>
            {sortedData.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} opacity={0.8} />
            ))}
          </Bar>
          <Bar dataKey="avg_total" radius={[4, 4, 0, 0]} maxBarSize={32}>
            {sortedData.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} opacity={0.4} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

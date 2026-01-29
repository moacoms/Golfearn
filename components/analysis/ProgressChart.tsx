'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface Session {
  id: string
  session_date: string
  session_type: string
  shot_data?: Array<{
    club_type: string
    carry: number
    ball_speed?: number
    spin_rate?: number
  }>
}

interface ProgressChartProps {
  sessions: Session[]
  metric: 'carry' | 'ballSpeed' | 'spinRate'
  clubFilter?: string
  locale: string
}

const METRIC_CONFIG = {
  carry: {
    key: 'carry',
    en: 'Avg Carry',
    ko: '평균 캐리',
    unit: { en: 'yds', ko: '야드' },
    color: '#10B981',
  },
  ballSpeed: {
    key: 'ball_speed',
    en: 'Avg Ball Speed',
    ko: '평균 볼스피드',
    unit: { en: 'mph', ko: 'mph' },
    color: '#3B82F6',
  },
  spinRate: {
    key: 'spin_rate',
    en: 'Avg Spin Rate',
    ko: '평균 스핀량',
    unit: { en: 'rpm', ko: 'rpm' },
    color: '#F59E0B',
  },
}

export default function ProgressChart({ sessions, metric, clubFilter = 'driver', locale }: ProgressChartProps) {
  const config = METRIC_CONFIG[metric]

  const chartData = sessions
    .filter((s) => s.shot_data && s.shot_data.length > 0)
    .map((session) => {
      const filteredShots = session.shot_data!.filter(
        (shot) => !clubFilter || shot.club_type === clubFilter
      )

      if (filteredShots.length === 0) return null

      const values = filteredShots
        .map((shot) => {
          if (metric === 'carry') return shot.carry
          if (metric === 'ballSpeed') return shot.ball_speed
          if (metric === 'spinRate') return shot.spin_rate
          return null
        })
        .filter((v): v is number => v != null && v > 0)

      if (values.length === 0) return null

      const avg = values.reduce((sum, v) => sum + v, 0) / values.length

      return {
        date: new Date(session.session_date).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
          month: 'short',
          day: 'numeric',
        }),
        value: Math.round(avg * 10) / 10,
        sessionType: session.session_type,
      }
    })
    .filter(Boolean)
    .reverse()

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        {locale === 'ko' ? '데이터가 없습니다' : 'No data available'}
      </div>
    )
  }

  const label = locale === 'ko' ? config.ko : config.en
  const unit = locale === 'ko' ? config.unit.ko : config.unit.en

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            domain={['auto', 'auto']}
            label={{
              value: unit,
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
            formatter={(value: unknown) => [`${value} ${unit}`, label]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={config.color}
            strokeWidth={2.5}
            dot={{ fill: config.color, r: 4, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: config.color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

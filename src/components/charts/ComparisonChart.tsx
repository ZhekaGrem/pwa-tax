'use client'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function ComparisonChart({
  subjectPerSqft,
  medianPerSqft,
}: {
  subjectPerSqft: number
  medianPerSqft: number
}) {
  const data = [
    { name: 'Your property', usd: Math.round(subjectPerSqft) },
    { name: 'Median comp', usd: Math.round(medianPerSqft) },
  ]
  return (
    <div role="figure" aria-label="Per-square-foot comparison" className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(v) => `$${v}/sqft`} />
          <Tooltip formatter={(v) => `$${Number(v)}/sqft`} />
          <Bar dataKey="usd" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

'use client'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function SavingsBarChart({
  currentTax,
  proposedTax,
}: {
  currentTax: number
  proposedTax: number
}) {
  const data = [
    { name: 'Current tax', usd: Math.round(currentTax) },
    { name: 'Proposed tax', usd: Math.round(proposedTax) },
  ]
  return (
    <div role="figure" aria-label="Tax savings comparison" className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(v) => `$${v.toLocaleString()}`} />
          <Tooltip formatter={(v) => `$${Number(v).toLocaleString('en-US')}`} />
          <Bar dataKey="usd" fill="#16a34a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

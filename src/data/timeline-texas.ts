export type TimelinePhase = {
  id: 'assessment' | 'filing' | 'waiting' | 'hearing'
  label: string
  description: string
  startMonth: number // 0-indexed
  startDay: number
  endMonth: number
  endDay: number
  tone: 'grey' | 'yellow' | 'blue'
}

export const TEXAS_TIMELINE: readonly TimelinePhase[] = [
  {
    id: 'assessment',
    label: 'Assessment period',
    description: 'Appraisal district determines property values',
    startMonth: 0,
    startDay: 1,
    endMonth: 3,
    endDay: 14,
    tone: 'grey',
  },
  {
    id: 'filing',
    label: 'Notice received — time to file',
    description: 'Deadline to file Form 50-132 is May 15',
    startMonth: 3,
    startDay: 15,
    endMonth: 4,
    endDay: 15,
    tone: 'yellow',
  },
  {
    id: 'waiting',
    label: 'Waiting for ARB hearing',
    description: 'Appraisal Review Board schedules your hearing',
    startMonth: 4,
    startDay: 16,
    endMonth: 6,
    endDay: 31,
    tone: 'blue',
  },
  {
    id: 'hearing',
    label: 'Hearing season / judicial appeal window',
    description: 'Informal and formal hearings; judicial appeal after ARB',
    startMonth: 7,
    startDay: 1,
    endMonth: 11,
    endDay: 31,
    tone: 'blue',
  },
]

function dayOfYear(m: number, d: number): number {
  return new Date(2001, m, d).getTime() / 86_400_000
}

export function getCurrentPhase(now: Date): TimelinePhase {
  const nowDoy = dayOfYear(now.getMonth(), now.getDate())
  for (const phase of TEXAS_TIMELINE) {
    const start = dayOfYear(phase.startMonth, phase.startDay)
    const end = dayOfYear(phase.endMonth, phase.endDay)
    if (nowDoy >= start && nowDoy <= end) return phase
  }
  return TEXAS_TIMELINE[0]
}

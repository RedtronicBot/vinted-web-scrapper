export function isOlderThanOneWeek(text: string): boolean {
  const lower = text.toLowerCase()

  const weeksMatch = lower.match(/il y a (\d+)\s*semaine/)
  if (weeksMatch) return true

  const monthsMatch = lower.match(/il y a (\d+)\s*mois/)
  if (monthsMatch) return true

  const yearsMatch = lower.match(/il y a (\d+)\s*an/)
  if (yearsMatch) return true

  const daysMatch = lower.match(/il y a (\d+)\s*jour/)
  if (daysMatch) {
    return parseInt(daysMatch[1], 10) >= 7
  }

  return false
}

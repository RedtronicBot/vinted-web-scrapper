export function isOlderThanOneWeek(text: string): boolean {
  const lower = text.toLowerCase()

  const weeksMatch = lower.match(/il y a\s+(\d+|une)\s+semaine[s]?/i)
  if (weeksMatch) return true

  const monthsMatch = lower.match(/il y a (\d+)\s*mois/i)
  if (monthsMatch) return true

  const yearsMatch = lower.match(/il y a (\d+)\s*an/i)
  if (yearsMatch) return true

  const daysMatch = lower.match(/il y a (\d+)\s*jour/i)
  if (daysMatch) {
    return parseInt(daysMatch[1], 10) >= 7
  }

  return false
}

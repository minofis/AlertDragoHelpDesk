export const reorderFullName = (fullName: string | undefined | null): string => {
  if (!fullName) return ''

  const trimmed = fullName.trim()
  if (!trimmed) return ''

  const parts = trimmed.split(/\s+/)

  if (parts.length <= 2) return trimmed

  const lastName = parts.pop()!
  return [lastName, ...parts].join(' ')
}

export const formatShortName = (fullName: string | undefined | null): string => {
  if (!fullName) return 'Unknown'

  const reordered = reorderFullName(fullName)

  if (!reordered) return 'Unknown'

  const parts = reordered.split(/\s+/)

  if (parts.length === 0) return 'Unknown'
  if (parts.length === 1) return parts[0]

  const lastName = parts[0]
  const initials = parts.slice(1).map(p => p[0] + '.').join(' ')

  return `${lastName} ${initials}`
}

export function truncateFileName(name: string, maxLength = 36): string {
  if (name.length <= maxLength) return name

  const dotIndex = name.lastIndexOf('.')
  const extension = dotIndex > 0 ? name.slice(dotIndex) : ''
  const base = extension ? name.slice(0, dotIndex) : name
  const available = maxLength - extension.length - 1

  if (available <= 4) {
    return `${name.slice(0, maxLength - 1)}…`
  }

  return `${base.slice(0, available)}…${extension}`
}

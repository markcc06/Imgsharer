export function paginate<T>(items: T[], page: number, pageSize = 5) {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(1, page), totalPages)
  const start = (current - 1) * pageSize
  const end = start + pageSize

  return {
    slice: items.slice(start, end),
    current,
    totalPages,
  }
}

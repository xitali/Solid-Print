export function mediaId(value: unknown): number | undefined {
  const id = typeof value === 'object' && value && 'id' in value ? value.id : value
  if (typeof id !== 'number' && (typeof id !== 'string' || !/^\d+$/.test(id))) return
  const number = Number(id)
  if (Number.isSafeInteger(number) && number > 0) return number
}

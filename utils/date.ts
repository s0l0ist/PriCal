export const addMilliseconds = (date: Date, durationMs: number) =>
  new Date(date.getTime() + durationMs)
export const addSeconds = (date: Date, count: number) =>
  addMilliseconds(date, count * 1000)
export const addMinutes = (date: Date, count: number) =>
  addSeconds(date, count * 60)
export const addHours = (date: Date, count: number) =>
  addMinutes(date, count * 60)
export const addDays = (date: Date, count: number) => addHours(date, count * 24)
export const addWeeks = (date: Date, count: number) => addDays(date, count * 7)

export const getTodayRange = (date: Date) => {
  const temp = new Date(date) // Create copy
  const start = new Date(temp.setHours(0, 0, 0, 0))
  const end = new Date(temp.setHours(23, 59, 59, 999))
  return { start, end }
}

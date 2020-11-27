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

export const getDateRange = (days: number, date: Date) => {
  const temp = new Date(date) // Create copy
  const start = new Date(temp.setHours(0, 0, 0, 0))
  const daysOut = new Date(temp.setDate(temp.getDate() + (days - 1)))
  const end = new Date(daysOut.setHours(23, 59, 59, 999))
  return { start, end }
}

export const getStartOfDay = (date: Date) => {
  const temp = new Date(date) // Create copy
  return new Date(temp.setHours(0, 0, 0, 0))
}

export const getEndOfDay = (date: Date) => {
  const temp = new Date(date) // Create copy
  return new Date(temp.setHours(23, 59, 59, 999))
}

export const getDaysOut = (days: number, date: Date) => {
  const temp = new Date(date)
  return new Date(temp.setDate(temp.getDate() + days))
}

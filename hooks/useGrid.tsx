import * as React from 'react'
import useRandom from './useRandom'
import { Event } from '../types'
import { timeSliceMs, gridElementsPerDay, oneDay } from '../constants/Grid'

export default function useGrid() {
  const { getRandomString } = useRandom()
  /**
   * Check to see if a specific date is inside an calendar event
   *
   * @param check Date to check
   * @param event Calendar event
   */
  const isInsideEventRange = (check: Date, event: Event): boolean => {
    const { start, end } = event
    const startTime = start.getTime()
    const endTime = end.getTime()
    const checkTime = check.getTime()
    return startTime <= checkTime && endTime > checkTime
  }

  /**
   * Returns a time-grid from a list of events
   *
   * @param events A list of calendar events
   */
  const convertToGrid = (events: Event[], start: Date, end: Date): string[] => {
    // create the full grid
    const differenceMs = end.getTime() - start.getTime()
    const days = Math.ceil(differenceMs / oneDay)
    const grid: string[] = Array.from({ length: gridElementsPerDay * days })

    // For each time slice, check and set our availability
    for (let i = 0; i < grid.length; i++) {
      const timeIncrement = new Date(start.getTime() + i * timeSliceMs)

      grid[i] = `${timeIncrement.toISOString()} | ${getRandomString(4)}`

      events.forEach(event => {
        if (isInsideEventRange(timeIncrement, event)) {
          grid[i] = `${timeIncrement.toISOString()} | [true]`
        }
      })
    }
    return grid
  }

  return React.useMemo(
    () =>
      ({
        convertToGrid
      } as const),
    []
  )
}

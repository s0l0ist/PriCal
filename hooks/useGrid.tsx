import * as React from 'react'
import { getTodayRange } from '../utils/Date'
import useRandom from './useRandom'
import { Event } from '../types'
import { timeSliceMs, maxGridElements } from '../constants/Grid'

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
  const convertToGrid = (events: Event[]): string[] => {
    // create the full grid
    const grid: string[] = Array.from({ length: maxGridElements })

    // FIXME: Using today as the start index
    // but we will need to change this to be dynamic
    const rightNow = new Date()
    const today = getTodayRange(rightNow)

    // For each time slice, check and set our availability
    for (let i = 0; i < grid.length; i++) {
      const timeIncrement = new Date(today.start.getTime() + i * timeSliceMs)

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

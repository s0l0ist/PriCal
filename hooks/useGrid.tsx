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
    // Determine the granularity of the grid
    const startTime = start.getTime()
    const endTime = end.getTime()
    const differenceMs = endTime - startTime
    const days = Math.ceil(differenceMs / oneDay)
    // Next, create a grid of time slices
    const dateGrid: Date[] = Array.from(
      { length: gridElementsPerDay * days },
      (_, i: number) => new Date(startTime + i * timeSliceMs)
    )

    // For each time slice, check to see if any events overlap O(N*M)
    // This is our availability map.
    const grid = dateGrid.map(timeIncrement => {
      // Determine if any event overlaps with a time slice
      const eventOverlap = events.some(event =>
        isInsideEventRange(timeIncrement, event)
      )

      // TODO: Flip the conditional. We're using the inverse for easier debugging
      // If theres an overlap, we mark it!
      if (eventOverlap) {
        return `${timeIncrement.toISOString()} | [true]`
      }
      // else, we append a random string
      return `${timeIncrement.toISOString()} | ${getRandomString(4)}`
    })

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

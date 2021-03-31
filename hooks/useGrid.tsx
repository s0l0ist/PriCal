import * as React from 'react'

import {
  TIME_SLICE_MS,
  GRID_ELEMENTS_PER_DAY,
  ONE_DAY
} from '../constants/Grid'
import useRandom from './useRandom'

type Event = {
  start: Date
  end: Date
}
/**
 * A hook for interfacing with a time-grid used for the input in the PSI payloads
 */
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
   * Create an empty time-grid
   */
  const createGrid = (start: Date, end: Date) => {
    // Determine the granularity of the grid
    const startTime = start.getTime()
    const endTime = end.getTime()
    const differenceMs = endTime - startTime
    const days = Math.ceil(differenceMs / ONE_DAY)
    return Array.from(
      { length: GRID_ELEMENTS_PER_DAY * days },
      (_, i: number) => new Date(startTime + i * TIME_SLICE_MS)
    )
  }

  /**
   * Returns a time-grid from a list of events
   */
  const convertToGrid = (events: Event[], start: Date, end: Date): string[] => {
    // Create a grid of time slices
    const dateGrid: Date[] = createGrid(start, end)

    // For each time slice, check to see if any events overlap O(N*M)
    // This is our availability map.
    const grid = dateGrid.map(timeIncrement => {
      // Determine if any event overlaps with a time slice
      const eventOverlap = events.some(event =>
        isInsideEventRange(timeIncrement, event)
      )

      if (!eventOverlap) {
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
        createGrid,
        convertToGrid
      } as const),
    []
  )
}

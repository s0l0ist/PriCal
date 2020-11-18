import 'react-native-get-random-values'
import * as React from 'react'
import { getTodayRange } from '../utils/date'
import useRandom from './useRandom'

const oneMillisecond = 1
const oneSecond = oneMillisecond * 1000
const oneMinute = oneSecond * 60
const oneHour = oneMinute * 60
const oneDay = oneHour * 24
const timeSliceMs = oneMinute * 15
const maxGridElements = oneDay / timeSliceMs

type Event = {
  start: Date
  end: Date
}

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
   * Gets a list of indexes into a time-grid from a list of events
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
          console.log('we have a block:', grid[i])
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

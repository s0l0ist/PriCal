import * as React from 'react'
// import psi from '@openmined/psi'
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
  const createGrid = () => Uint8Array.from({ length: maxGridElements }, () => 0)

  const setGridPoint = (idx: number, value: 0 | 1, grid: Uint8Array) => {
    grid[idx] = value
  }

  /**
   * Converts a start date to an index in a array of 96 elements
   * @param start
   */
  const convertToIndex = (start: Date) => {
    return (
      start.getHours() * (oneHour / timeSliceMs) +
      Math.floor(start.getMinutes() / (timeSliceMs / oneMinute))
    )
  }

  /**
   * Takes an event and generates indexes to a time-grid
   * @param event
   */
  const spread = (event: Event) => {
    const { start, end } = event
    // Get the number of time blocks for the event
    const numberOfBlocks = Math.ceil(
      (end.getTime() - start.getTime()) / timeSliceMs
    )
    // Convert the event start time to an index
    const index = convertToIndex(start)
    return Array.from({ length: numberOfBlocks }, (_, i: number) => index + i)
  }

  /**
   * Gets a list of indexes into a time-grid from a list of events
   * @param events
   */
  const convertToIndexes = (events: Event[]) => {
    return events
      .map(event => spread(event))
      .reduce((acc, blocks) => [...new Set([...acc, ...blocks])], [])
  }

  const convertToGrid = (events: Event[]) => {
    const indexes = convertToIndexes(events)
    const grid = createGrid()
    indexes.forEach(idx => {
      setGridPoint(idx, 1, grid)
    })
    return grid
  }

  return React.useMemo(
    () => ({
      convertToGrid
    }),
    []
  )
}

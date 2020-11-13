import 'react-native-get-random-values'
import * as React from 'react'
import PSI from '@openmined/psi.js/combined_wasm_web'
import { PSILibrary } from '@openmined/psi.js/implementation/psi'
import { getTodayRange } from '../utils/date'

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
  // Define a singleton
  let psi: PSILibrary

  /**
   * Convert a decimal number to hex
   * Ex: i.e. 0-255 -> '00'-'ff'
   * @param dec The decimal number to convert
   */
  const dec2hex = (dec: number) => {
    return dec < 10 ? '0' + String(dec) : dec.toString(16)
  }

  /**
   * Generate a random string from the specified number of bytes
   *
   * @param bytes Number of random bytes for returned string
   */
  const getRandomString = (bytes: number) => {
    const byteArray = Uint8Array.from({ length: bytes })
    crypto.getRandomValues(byteArray)
    return Array.from(byteArray, dec2hex).join('')
  }

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
   * Initializes the PSI library singleton
   */
  const initPSI = async () => {
    if (!psi) {
      psi = await PSI()
    }
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

      events.forEach(event => {
        if (isInsideEventRange(timeIncrement, event)) {
          grid[i] = `${timeIncrement.toISOString()} | [true]`
          // console.log('we have a block:', grid[i])
        } else {
          grid[i] = `${timeIncrement.toISOString()} | ${getRandomString(4)}`
        }
      })
    }
    return grid
  }

  /**
   * Encrypts a grid and returns the serialized client request
   * @param grid The time-grid to encrypt
   */
  const encryptGrid = async (grid: string[]) => {
    await initPSI()
    const client = psi.client!.createWithNewKey(true)
    const clientRequest = client.createRequest(grid)
    console.log('clientRequest', clientRequest.toObject())
    return clientRequest.serializeBinary()
  }

  return React.useMemo(
    () => ({
      convertToGrid,
      encryptGrid
    }),
    []
  )
}

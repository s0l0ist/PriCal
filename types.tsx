import * as Calendar from 'expo-calendar'

export type RootStackParamList = {
  Root: undefined
  NotFound: undefined
}

export type BottomTabParamList = {
  TabOne: undefined
  TabTwo: undefined
}

export type TabOneParamList = {
  TabOneScreen: undefined
}

export type TabTwoParamList = {
  TabTwoScreen: undefined
}

/**
 * Defines a ReturnType that is the sync or async return type of a function
 */
export type ReturnTypeAsync<T extends (...args: any) => any> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : T extends (...args: any) => infer R
  ? R
  : any

export type PermissionResponse = {
  Response: Calendar.PermissionResponse
  Permission: string
}

export type PermissionsArray = ReadonlyArray<
  (...args: any[]) => Promise<PermissionResponse>
>

export enum DateTypeEnum {
  Minute = 0,
  Hour,
  Day,
  Week,
  Month,
  Year
}

export type Event = {
  start: Date
  end: Date
}

export type Subscription = {
  remove: () => void
}

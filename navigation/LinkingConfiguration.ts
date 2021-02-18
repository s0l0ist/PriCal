import * as Linking from 'expo-linking'

export default {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Root: {
        screens: {
          Create: {
            screens: {
              CreateScreen: 'create'
            }
          },
          Schedules: {
            screens: {
              SchedulesScreen: 'schedules',
              ScheduleDetailsScreen: 'schedule/:requestId'
            }
          }
        }
      },
      Approval: {
        screens: {
          ApprovalScreen: 'approval/:requestId'
        }
      },
      NotFound: '*'
    }
  }
}

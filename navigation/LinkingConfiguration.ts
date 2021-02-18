import * as Linking from 'expo-linking'

export default {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Root: {
        screens: {
          CreateTab: {
            screens: {
              CreateScreen: 'create'
            }
          },
          SchedulesTab: {
            screens: {
              SchedulesScreen: 'schedules',
              ScheduleDetailsScreen: 'schedule'
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

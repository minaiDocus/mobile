import { StackNavigator } from 'react-navigation'
import { Easing, Animated } from 'react-native'

import LoginScreen from './screens/login'
import HomeScreen from './screens/home'

import SendDocScreen from './screens/sending/send_documents'
import SendProcessScreen from './screens/sending/send_documents_process'

import DocumentsScreen from './screens/my_documents/my_documents'
import PublishScreen from './screens/my_documents/publishing'

import StatsScreen from './screens/stats/stats'

import SharingScreen from './screens/sharing/account_sharing'
import SharingContactsScreen from './screens/sharing/sharing_contacts'

import './Initializer'
import './screens/themes'

const StackNavigatorConfig = {
  initialRoutesName: 'Login',
  headerMode: 'none',
  transitionConfig: () => ({
    transitionSpec: {
      duration: 0,
      timing: Animated.timing,
      easing: Easing.step0,
    },
  }),
}


const StackApp = StackNavigator({
                                    Login: {
                                      screen: LoginScreen,
                                    }, 
                                    Home: { 
                                      screen: HomeScreen,
                                    },
                                    Send: {
                                      screen: SendDocScreen
                                    }, 
                                    Sending: {
                                      screen: SendProcessScreen
                                    },
                                    Documents: {
                                      screen: DocumentsScreen
                                    },
                                    Publish: {
                                      screen: PublishScreen
                                    },
                                    Stats: {
                                      screen: StatsScreen
                                    },
                                    Sharing: {
                                      screen: SharingScreen
                                    },                             
                                    SharingContacts: {
                                      screen: SharingContactsScreen
                                    }
                                }, StackNavigatorConfig)

export default StackApp
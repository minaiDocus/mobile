import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'

import { Easing, Animated } from 'react-native'

import LoginScreen from './screens/login'
import HomeScreen from './screens/home'

import SendDocScreen from './screens/sending/send_documents'
import SendProcessScreen from './screens/sending/send_documents_process'

import InvoicesScreen from './screens/my_documents/invoices'
import OperationsScreen from './screens/my_documents/operations'
import PublishScreen from './screens/my_documents/publishing'

import StatsScreen from './screens/stats/stats'

import SharingScreen from './screens/sharing/account_sharing'
import SharingContactsScreen from './screens/sharing/sharing_contacts'

import './Initializer'
import './screens/themes'

const StackNavigatorConfig = {
  initialRouteName: 'Login',
  headerMode: 'none',
}

const transitionAnimation = {
  animationEnabled: true,
  transitionSpec: {
    open: { animation: 'timing', config: { duration: 0 } },
    close: { animation: 'timing', config: { duration: 0 } },
  }
}

const StackApp = createStackNavigator({
                                          Login: {
                                            screen: LoginScreen,
                                            navigationOptions: transitionAnimation
                                          }, 
                                          Home: { 
                                            screen: HomeScreen,
                                            navigationOptions: transitionAnimation
                                          },
                                          Send: {
                                            screen: SendDocScreen,
                                            navigationOptions: transitionAnimation
                                          }, 
                                          Sending: {
                                            screen: SendProcessScreen,
                                            navigationOptions: transitionAnimation
                                          },
                                          Invoices: {
                                            screen: InvoicesScreen,
                                            navigationOptions: transitionAnimation
                                          },
                                          Operations: {
                                            screen: OperationsScreen,
                                            navigationOptions: transitionAnimation
                                          },
                                          Publish: {
                                            screen: PublishScreen,
                                            navigationOptions: transitionAnimation
                                          },
                                          Stats: {
                                            screen: StatsScreen,
                                            navigationOptions: transitionAnimation
                                          },
                                          Sharing: {
                                            screen: SharingScreen,
                                            navigationOptions: transitionAnimation
                                          },                             
                                          SharingContacts: {
                                            screen: SharingContactsScreen,
                                            navigationOptions: transitionAnimation
                                          }
                                      }, StackNavigatorConfig)

export default createAppContainer(StackApp)
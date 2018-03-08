import { StackNavigator } from 'react-navigation'

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

const StackApp = StackNavigator({   Login: {
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
                                    Stats: {
                                      screen: StatsScreen
                                    },
                                    Publish: {
                                      screen: PublishScreen
                                    },
                                    Sharing: {
                                      screen: SharingScreen
                                    },                             
                                    SharingContacts: {
                                      screen: SharingContactsScreen
                                    }
                                }, {initialRouteName: 'Login'})

export default StackApp
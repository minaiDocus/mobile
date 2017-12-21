// import React, { Component } from 'react'
import Config from './Config'
import { StackNavigator } from 'react-navigation'

import LoginScreen from './Login'
import HomeScreen from './Home'

import SendScreen from './screens/sending/send_documents'
import SendingScreen from './screens/sending/send_documents_process'

import DocumentsScreen from './screens/my_documents/my_documents'
import PublishScreen from './screens/my_documents/publishing'

import StatsScreen from './screens/stats/stats'

import SharingScreen from './screens/sharing/account_sharing'
import SharingContactsScreen from './screens/sharing/sharing_contacts'

import './components/initializer'

const StackApp = StackNavigator({
                              Login: {
                                screen: LoginScreen,
                              }, 
                              Home: { 
                                screen: HomeScreen,
                              },
                              Send: {
                                screen: SendScreen
                              }, 
                              Sending: {
                                screen: SendingScreen
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
                          },{initialRouteName: 'Login'})

export default StackApp
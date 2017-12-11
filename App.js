// import React, { Component } from 'react'
import Config from './Config'
import { StackNavigator } from 'react-navigation'
import LoginScreen from './Login'
import HomeScreen from './Home'
import SendScreen from './Send_documents'
import DocumentsScreen from './My_documents'
import PublishScreen from './Publishing'
import StatsScreen from './Stats'
import SendingScreen from './Send_documents_process'
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
                              }
                          },{initialRouteName: 'Login'})

export default StackApp

//147038
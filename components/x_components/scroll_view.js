import React, { Component } from 'react'
import { ScrollView } from 'react-native'

export class XScrollView extends Component{
  constructor(props){
    super(props)
  }

  render(){
    return  <ScrollView { ...this.props } keyboardShouldPersistTaps='handled'>
              { this.props.children }
            </ScrollView>
  }
}
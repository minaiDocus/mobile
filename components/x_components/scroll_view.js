import React, { Component } from 'react'
import { ScrollView } from 'react-native'

export class XScrollView extends Component{
  constructor(props){
    super(props)
  }

  scrollToEnd(options){
    this.refs.main_scroll.scrollToEnd(options)
  }

  scrollTo(options){
    this.refs.main_scroll.scrollTo(options)
  }

  render(){
    return  <ScrollView { ...this.props } ref='main_scroll' keyboardShouldPersistTaps='always'>
              { this.props.children }
            </ScrollView>
  }
}
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Config from '../Config'
import {View} from 'react-native'
import NoticeBox from './notifications'

class Screen extends Component{
  static propTypes = {
      navigation: PropTypes.object.isRequired,
  }

  constructor(props){
    super(props)
    this.width = this.last_width = 0
    this.height = this.last_height = 0
    this.orientation = "none"
  }

  handleLayout(event){
    this.width = event.nativeEvent.layout.width
    this.height = event.nativeEvent.layout.height

    if(this.width != this.last_width || this.height != this.last_height)
    {
      this.orientation = "portrait"
      if(this.width > this.height)
      {
        this.orientation = "landscape"
      }
      try{
        this.props.onChangeOrientation(this.orientation)
      }catch(e){}
    }

    this.last_width = this.width
    this.last_height = this.height
  }

  componentWillUnmount(){
    this.props.navigation.screenClose()
  }

  render(){
    return <View {...this.props} onLayout={(event)=>{this.handleLayout(event)}}>
              {this.props.children}
              <NoticeBox />
           </View>
  }
}

export default Screen
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
  }

  componentWillUnmount(){
    this.props.navigation.screenClose()
  }

  render(){
    return <View {...this.props}>
              {this.props.children}
              <NoticeBox />
           </View>
  }
}

export default Screen
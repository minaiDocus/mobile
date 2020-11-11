import React, { Component } from 'react'
import { Text } from 'react-native'

export class XText extends Component{
  constructor(props){
    super(props)

    this.class = this.props.class || ''

    this.generateStyle()
  }
  
  generateStyle(){
    this.styles = { 
                    fontFamily: Config.platform == 'ios' ? 'arial' : 'lucida grande',
                    color: '#000',
                    fontSize: 12,
                  }
  }

  render(){
    const style_extended = this.props.style || {}
    return <Text {...this.props} style={[this.styles, (Theme.global_text || {}), style_extended]} >{this.props.children}</Text>
  }
}
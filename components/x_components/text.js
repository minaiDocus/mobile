import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'

export class XText extends Component{
  constructor(props){
    super(props)
    this.generateStyles()

    switch(this.props.class)
    {
      case 'title_screen' :
        this.style_class = { fontSize:18, fontWeight:'bold', color:'#000' }
        break;
      default:
        this.style_class = {}
    }
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      default:  {
                  fontFamily: 'lucida grande',   
                }
    })
  }

  render(){
    var style_extended = this.props.style
    return <Text style={[this.styles.default, this.style_class, style_extended]} >{this.props.children}</Text>           
  }
}
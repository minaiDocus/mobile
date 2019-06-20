import React, { Component } from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'

import { XImage, AnimatedBox, XText } from '../index'

export class RadioButton extends Component{
  constructor(props){
    super(props)

    this.state = { value: this.props.defaultValue || this.props.value || '' }

    this.options = this.props.dataOptions

    this.generateStyles()
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      content : {
                  flexDirection:'row',
                  alignItems:'center',
                  justifyContent:'flex-start',
                  padding:10
                },
      box:  {
              flex:0,
              padding:2,
              borderColor: '#909090',
              borderWidth: 1,
            },
      text: {
              flex:0,
              textAlign:'center',
              color:'#909090',
              padding: 5
            },
      images: {
                flex:0,
                width:15,
                height:15
              }
    })
  }

  changeValue(value){
    this.setState({ value: value })
    this.props.onChange(value)
  }

  renderLists(){
    let TStyle_plus = "";
    if(this.props.TStyle)
    {
      TStyle_plus = this.props.TStyle
    }

    return this.options.map((opt, index) => {
      let bt_style = {flex: 1}
      let selected_style = {}
      if(this.state.value == opt.value)
      {
        bt_style.backgroundColor = '#909090'
        selected_style.color = '#fff'
      }

      return  <TouchableOpacity key={index} style={this.styles.box} onPress={()=>this.changeValue(opt.value)}>
                <View style={bt_style}>
                  <XText style={[this.styles.text, Theme.textBold, TStyle_plus, selected_style]}>{opt.label}</XText>
                </View>
              </TouchableOpacity>
    })
  }

  render(){
    let CStyle_plus = "";
    if(this.props.CStyle)
    {
      CStyle_plus = this.props.CStyle
    }

    return <View style={[this.styles.content, CStyle_plus]}>
             { this.renderLists() }
           </View>
  }
}
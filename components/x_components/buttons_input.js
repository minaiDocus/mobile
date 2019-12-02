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
                },
      box:  {
              flex:0,
              paddingHorizontal:2,
              borderLeftWidth: 1,
              borderColor: Theme.inputs.shape.borderColor || '#999',
            },
      text: {
              flex:0,
              color: Theme.inputs.text.color || '#999',
              textAlign:'center',
              padding: 5
            },
      images: {
                flex:0,
                width:15,
                height:15
              },
      labelBox:{
        flex: 0,
        justifyContent: 'center',
        width: '40%',
        height: '98%',
        borderRightWidth: 0,
        borderTopLeftRadius: Theme.inputs.shape.borderRadius,
        borderBottomLeftRadius: Theme.inputs.shape.borderRadius,
        backgroundColor: Theme.inputs.label.backgroundColor || '#F9F9F9',
        paddingTop: 1,
        paddingLeft: 5,
        overflow: 'hidden'
      },
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
        bt_style.backgroundColor = Theme.inputs.shape.selectedBG || '#909090'
        selected_style.color = Theme.inputs.text.selected || '#fff'
      }

      return  <TouchableOpacity key={index} style={this.styles.box} onPress={()=>this.changeValue(opt.value)}>
                <View style={bt_style}>
                  <XText style={[this.styles.text, TStyle_plus, selected_style]}>{opt.label}</XText>
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

    return <View style={[this.styles.content, Theme.inputs.shape, CStyle_plus]}>
             <View style={this.styles.labelBox}><XText style={[{flex: 0}, Theme.inputs.label]}>{this.props.label}</XText></View>
             { this.renderLists() }
           </View>
  }
}

export class CheckboxButton extends Component{
  constructor(props){
    super(props)

    this.state = { values: this.props.defaultValues || this.props.values || '' }

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
    let values = this.state.values

    if(values.includes(value))
      values = values.filter(v=>{ return v != value})
    else
      values.push(value)

    this.setState({ values: values })
    this.props.onChange(values)
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
      if(this.state.values.includes(opt.value))
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

    return  <View style={[this.styles.content, CStyle_plus]}>
              { this.renderLists() }
            </View>
  }
}
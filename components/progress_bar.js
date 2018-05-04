import React, { Component } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { XText } from './index'

export class ProgressBar extends Component{
  constructor(props){
    super(props)

    this.state = {width: 0}
    this.generateStyles()
  }

  componentDidMount(){
    this.calculateProgress(this.props.progress)
  }

  componentWillReceiveProps(nextProps){
    if(typeof(nextProps.progress) !== "undefined" && nextProps.progress > 0)
      this.calculateProgress(nextProps.progress)
  }

  calculateProgress(progress){
    let prog = progress * 100
    if(prog < 0){prog = 0}
    else if(prog > 100){prog = 100}
    this.setState({width: prog})
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      container: {
                    flex:1,
                    borderColor: '#9E9E9E',
                    maxHeight:15,
                    borderRadius:10,
                    borderWidth:1
                 },
      bar:  {
              flex:0,
              height:'100%',
              borderRadius:10,
            },
      text: {
              flex:1,
              textAlign:'center',
              color:'#FFF',
              fontWeight:'bold',
              fontSize:10
            } 
    })
  }

  render(){
    this.generateStyles()
    const stylePlus = this.props.style || {}
    return  <LinearGradient colors={['#FFF', '#CECECE']} style={[this.styles.container, stylePlus]}>
              <LinearGradient colors={['#00F', '#26C4EC']} style={[this.styles.bar, {width: `${this.state.width}%`}]}>
                <XText style={this.styles.text}>{Math.ceil(this.state.width)} %</XText>
              </LinearGradient>
            </LinearGradient>
  }
}
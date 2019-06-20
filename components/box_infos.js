import React, { Component } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'

import { ImageButton, XText } from './index'

export class BoxInfos extends Component{
  constructor(props){
    super(props)
    this.generateStyles()
  }

  generateStyles(){
   this.styles = StyleSheet.create({
      container:{
                  flex:1,
                  flexDirection:'row',
                  alignItems:'center',
                  justifyContent:'center',
                  backgroundColor:'rgba(0,0,0,0.7)',
                  paddingVertical:20
                },
      box:{
            flex:0,
            backgroundColor:'#EBEBEB',
            width:'90%',
            borderRadius:10,
            paddingVertical:8
          },
      head:{
              flex:0,
              minHeight:35,
              paddingHorizontal:10,
              flexDirection:'row',
              backgroundColor:'#EBEBEB',
              borderColor:'#000',
              borderBottomWidth:1,
            },
      body:{
              flex:1,
              backgroundColor:'#fff',
              padding:10
            },
      })
  }

  render(){
      return  <View style={this.styles.container} >
                <View style={this.styles.box}>
                  <View style={this.styles.head}>
                     <XText style={{flex:1, textAlign:'center',fontSize:24, paddingLeft:25, color: '#463119'}}>{this.props.title}</XText>
                     <ImageButton  source={{uri:"delete"}} 
                      CStyle={{flex:0, flexDirection:'column', alignItems:'center',width:25}}
                      IStyle={{width:10, height:10}}
                      onPress={()=>{this.props.dismiss()}} />
                  </View>
                  <ScrollView style={this.styles.body}>
                    {this.props.children}
                  </ScrollView>
                </View>
              </View>
  }
}
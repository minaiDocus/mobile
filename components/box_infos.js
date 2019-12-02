import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'

import { ImageButton, XText, XScrollView } from './index'

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
            width:'90%'
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
              padding:10
            },
      })
  }

  render(){
      return  <View style={this.styles.container} >
                <View style={[this.styles.box, Theme.modal.shape]}>
                  <View style={[this.styles.head, Theme.modal.head]}>
                     <XText style={[{flex: 1, paddingTop: 5}, Theme.modal.title]}>{this.props.title}</XText>
                     <ImageButton  source={{icon: "window-close"}} 
                      CStyle={{flex:0, flexDirection:'column', alignItems:'center',width:25}}
                      IStyle={{width:19, height:19}}
                      onPress={()=>{this.props.dismiss()}} />
                  </View>
                  <XScrollView style={this.styles.body} >
                    {this.props.children}
                  </XScrollView>
                </View>
              </View>
  }
}
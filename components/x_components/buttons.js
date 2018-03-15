import React, { Component } from 'react'
import {Text,TouchableOpacity,View,StyleSheet} from 'react-native'

import BlinkView from 'react-native-blink-view'
import LinearGradient from 'react-native-linear-gradient'

import {XImage} from '../index'

export class SimpleButton extends Component{
  constructor(props){
    super(props)

    this.generateStyles()
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      content : {
                  flexDirection:'row',
                  alignItems:'center',
                  justifyContent:'center',
                  padding:10,
                  borderRadius:2,
                  backgroundColor:'#C0D838'
                },
      text: {
              flex:0,
              textAlign:'center',
              color:'#fff',
              fontWeight:"bold"
            },
      images: {
                flex:0,
                width:15,
                height:15
              }
    })
  }

  render(){
    let Tstyle_plus = "";
    let Pstyle_plus = "";
    if(this.props.Tstyle)
    {
      Tstyle_plus = this.props.Tstyle
    }
    if(this.props.Pstyle)
    {
      Pstyle_plus = this.props.Pstyle
    }

    let leftImage = null
    let rightImage = null
    if(this.props.LImage != "" && this.props.LImage != null)
    {
      leftImage = <XImage style={[this.styles.images, {marginRight:10}]} source={this.props.LImage} local={true} />
    }

    if(this.props.RImage != "" && this.props.RImage != null)
    {
      rightImage = <XImage style={[this.styles.images, {marginLeft:10}]} source={this.props.RImage} local={true} />
    }

    return <TouchableOpacity style={[this.styles.content, Pstyle_plus]} onPress={this.props.onPress}>
              {leftImage}
              <Text style={[this.styles.text, Tstyle_plus]}>{this.props.title}</Text>
              {rightImage}
           </TouchableOpacity>
  }
}

export class ImageButton extends Component{
  render(){
    const flex = {flex:1}
    const Pstyle = this.props.Pstyle || ""
    const Istyle = this.props.Istyle || ""

    return <TouchableOpacity style={[flex, Pstyle]} onPress={()=>{this.props.onPress()}}>
              <XImage style={[flex, Istyle]} source={this.props.source} local={this.props.local || true} />
            </TouchableOpacity>
  }
}

export class BoxButton extends Component{
  constructor(props){
    super(props)

    this.generateStyles()
  }

  generateStyles(){
    const rayon = this.props.rayon || 60
    this.styles = StyleSheet.create({
      touchable:{
                  flex:1,
                  margin:10,
                  alignItems:'center'
                },
      boxControl: {
                    alignItems:'center',
                    justifyContent:'center',
                    flex:0,
                    backgroundColor:'#C0D838',
                    width:rayon,
                    height:rayon,
                    marginBottom:5,
                    borderRadius:100
                  },
      icons:{
              flex:0,
              width:"60%",
              height:"60%"
            },
      boxText:{
                flex:0,
                backgroundColor:'#AEAEAE',
                justifyContent:'center',
                alignItems: 'center',
                paddingHorizontal:10,
                paddingVertical:5,
                borderRadius:5
              },
      text:{
            flex:0,
            fontWeight:'bold',
            color:'#fff',
            textAlign:'center'
            },
      boxMarker:{
                  position:'absolute',
                },
      marker:{ 
                fontSize:12,
                fontWeight:'bold',
                color:'#F7230C',
                fontStyle:'italic',
                textAlign:'center'
              }  
    })
  }

  render(){
    return  <TouchableOpacity onPress={this.props.onPress} style={this.styles.touchable}>
              <LinearGradient colors={['#D1E949', '#C0D838', '#9DA505']} style={this.styles.boxControl}>
                <XImage source={this.props.source} style={this.styles.icons} local={this.props.local || true} />
                {this.props.marker && <View style={this.styles.boxMarker}><BlinkView element={Text} delay={1300} style={this.styles.marker}>{this.props.marker}</BlinkView></View> }
              </LinearGradient>
              <View style={this.styles.boxText}>
                <Text style={this.styles.text}>{this.props.title}</Text>
              </View>
            </TouchableOpacity>
  }
}

export class LinkButton extends Component{
  constructor(props){
    super(props)

    this.generateStyles()
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      content:{
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'center',
              },
      text:  {
                flex:3,
                textAlign:'left',
                paddingLeft:10
              },
      image:  {
                flex:1,
                width:30,
                height:20,
              }
    })
  }
  
  render(){
    const Tstyle_plus = this.props.Tstyle || ""
    const Pstyle_plus = this.props.Pstyle || ""
    const Istyle_plus = this.props.Istyle || ""

    return <TouchableOpacity style={[this.styles.content, Pstyle_plus]} onPress={this.props.onPress}>
              {this.props.source && <XImage source={this.props.source} resizeMode={this.props.resizeMode} style={[this.styles.image, Istyle_plus]} local={this.props.local || true}/>}
              <Text style={[this.styles.text, Tstyle_plus]}>{this.props.title}</Text>
           </TouchableOpacity>
  }
}
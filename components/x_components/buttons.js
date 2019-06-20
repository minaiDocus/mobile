import React, { Component } from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'

import LinearGradient from 'react-native-linear-gradient'

import { XImage, AnimatedBox, XText } from '../index'

export class SimpleButton extends Component{
  constructor(props){
    super(props)

    this.state = { width: 0, height: 0, padding: {}  }

    this.linearColors = null
    this.CStyle_plus = this.TStyle_plus = {}
    if(this.props.CStyle)
    {
      let styles = JSON.parse(JSON.stringify(this.props.CStyle)) //clone the props because of deletion

      if(Array.isArray(styles))
      {
        styles.forEach(st => {
          if(st.linearColors !== undefined && st.linearColors !== null) {
            this.linearColors = st.linearColors
            delete st.linearColors
          }
        })
      }
      else
      {
        if(styles.linearColors !== undefined) {
          this.linearColors = styles.linearColors
          delete styles.linearColors
        }
      }
      this.CStyle_plus = styles
    }

    if(this.props.TStyle)
      this.TStyle_plus = this.props.TStyle

    this.getLayoutSize = this.getLayoutSize.bind(this)
    this.generateStyles()
  }

  async getLayoutSize(event){
    if(this.state.width == 0)
    {
      let {width, height} = event.nativeEvent.layout
      await this.setState({ width: width, height: height, padding: {padding: 0} })
    }
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      content : {
                  flex:0,
                  flexDirection:'row',
                  alignItems:'center',
                  justifyContent:'center',
                  backgroundColor: '#A6A6A6',
                  padding: 10,
                },
      touchable: {
        flex: 0,
        alignItems:'center',
        justifyContent:'center',
        padding: 0,
        margin: 0
      },
      text: {
              flex:0,
              textAlign:'center',
              color:'#000',
            },
      images: {
                flex:0,
                width:15,
                height:15
              }
    })
  }

  render(){
    let leftImage = null
    let rightImage = null
    if(this.props.LImage != "" && this.props.LImage != null)
      leftImage = <XImage style={[this.styles.images, {marginRight:7}]} source={this.props.LImage} local={true} />

    if(this.props.RImage != "" && this.props.RImage != null)
      rightImage = <XImage style={[this.styles.images, {marginLeft:7}]} source={this.props.RImage} local={true} />

    return  <LinearGradient onLayout={this.getLayoutSize} colors={this.linearColors || ['rgba(0,0,0,0)', 'rgba(0,0,0,0)']} style={[this.styles.content, this.CStyle_plus, this.state.padding]}>
              <TouchableOpacity style={[this.styles.touchable, { minWidth: this.state.width, minHeight: this.state.height }]} onPress={this.props.onPress}>
                {leftImage}
                  <XText style={[this.styles.text, Theme.textBold, this.TStyle_plus]}>{this.props.title}</XText>
                {rightImage}
              </TouchableOpacity>
            </LinearGradient>
  }
}

export class ImageButton extends Component{
  render(){
    const flex = {flex:1}
    const CStyle = this.props.CStyle || ""
    const IStyle = this.props.IStyle || ""

    return <TouchableOpacity style={[flex, CStyle]} onPress={()=>{this.props.onPress()}}>
              <XImage style={[flex, IStyle]} source={this.props.source} local={this.props.local || true} />
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
                {this.props.marker && <View style={this.styles.boxMarker}><AnimatedBox type="blink" durationIn={1500} durationOut={1500}><XText style={this.styles.marker}>{this.props.marker}</XText></AnimatedBox></View> }
              </LinearGradient>
              <View style={this.styles.boxText}>
                <XText style={this.styles.text}>{this.props.title}</XText>
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
    const TStyle_plus = this.props.TStyle || ""
    const CStyle_plus = this.props.CStyle || ""
    const IStyle_plus = this.props.IStyle || ""

    return <TouchableOpacity style={[this.styles.content, CStyle_plus]} onPress={this.props.onPress}>
              {this.props.source && <XImage source={this.props.source} resizeMode={this.props.resizeMode} style={[this.styles.image, IStyle_plus]} local={this.props.local || true}/>}
              <XText style={[this.styles.text, TStyle_plus]}>{this.props.title}</XText>
           </TouchableOpacity>
  }
}
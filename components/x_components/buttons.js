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
        flexDirection: 'row',
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
                width:19,
                height:19
              }
    })
  }

  render(){
    const IOptions = this.props.IOptions || {}
    let leftImage  = null
    let rightImage = null

    if(this.props.LImage != "" && this.props.LImage != null)
      leftImage = <XImage style={[this.styles.images, {marginRight:7}]} size={IOptions.size || 13} color={IOptions.color || Theme.global_text.color} source={this.props.LImage} local={true} />

    if(this.props.RImage != "" && this.props.RImage != null)
      rightImage = <XImage style={[this.styles.images, {marginLeft:7}]} size={IOptions.size || 13} color={IOptions.color || Theme.global_text.color} source={this.props.RImage} local={true} />

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
    const IOptions    = this.props.IOptions || {}
    const CStyle = this.props.CStyle || ""
    const IStyle = this.props.IStyle || ""

    return <TouchableOpacity style={[{flex: 1}, CStyle]} onPress={()=>{this.props.onPress()}}>
              <XImage style={[{flex: 1}, IStyle]} size={IOptions.size} color={IOptions.color} source={this.props.source} local={this.props.local || true} />
            </TouchableOpacity>
  }
}

export class BoxButton extends Component{
  constructor(props){
    super(props)

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

    this.generateStyles()
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      touchable:{
                  flex:1,
                  margin:3,
                  alignItems:'center'
                },
      boxControl: {
                    alignItems:'center',
                    flex:0,
                    width:45,
                    height:45,
                    marginBottom:-1,
                    borderRadius:100,
                    borderRadius:100
                  },
      icons:{
              flex:0,
              top: 3,
              position: 'absolute',
              zIndex: 2,
              width:"50%",
              height:"50%"
            },
      boxText:{
                flex:0,
                zIndex: 1,
                position: 'absolute',
                top: 18,
                minWidth: 90,
                justifyContent:'center',
                alignItems: 'center',
                paddingHorizontal:10,
                paddingVertical:5,
                borderTopLeftRadius:10,
                borderBottomRightRadius:10,
              },
      text:{
            flex:0,
            textAlign:'center',
            },
      blinkedText:  { color: '#fff' }
    })
  }

  render(){
    const IOptions = this.props.IOptions || {}
    const IStyle = this.props.IStyle || {}

    return  <TouchableOpacity onPress={()=>this.props.onPress()} style={this.styles.touchable}>
              <LinearGradient colors={Theme.box_button.shape.linearColors || this.linearColors || ['rgba(0,0,0,0)', 'rgba(0,0,0,0)']} style={[this.styles.boxControl, Theme.box_button.shape, this.CStyle_plus]}>
                <XImage source={this.props.source} size={IOptions.size || 16} color={IOptions.color || Theme.global_text.color} XStyle={{textShadowColor:'#BBB', textShadowOffset:{width: 1, height: 1}, textShadowRadius:1}} style={[this.styles.icons, IStyle]} local={this.props.local || true} />
              </LinearGradient>
              <View style={[this.styles.boxText, Theme.box_button.box_text]}>
              {
                this.props.blink &&
                <AnimatedBox type="blink" durationIn={600} durationOut={600}>
                  <XText style={[this.styles.text, Theme.box_button.text, this.TStyle_plus, this.styles.blinkedText]}>{this.props.title}</XText>
                </AnimatedBox>
              }
              {
                !this.props.blink &&
                <XText style={[this.styles.text, Theme.box_button.text, this.TStyle_plus]}>{this.props.title}</XText>
              }
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
              },
      image:  {
                flex:1,
                width:30,
                height:20,
                marginRight: 10
              }
    })
  }
  
  render(){
    const IOptions    = this.props.IOptions || {}
    const TStyle_plus = this.props.TStyle || ""
    const CStyle_plus = this.props.CStyle || ""
    const IStyle_plus = this.props.IStyle || ""

    return <TouchableOpacity style={[this.styles.content, CStyle_plus]} onPress={this.props.onPress}>
              {this.props.source && <XImage source={this.props.source} size={IOptions.size} color={IOptions.color} resizeMode={this.props.resizeMode} style={[this.styles.image, IStyle_plus]} local={this.props.local || true}/>}
              <XText style={[this.styles.text, TStyle_plus]}>{this.props.title}</XText>
           </TouchableOpacity>
  }
}
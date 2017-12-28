import React, { Component } from 'react'
import {Text,TouchableOpacity,View,StyleSheet} from 'react-native'
import {XImage} from './XComponents'
import LinearGradient from 'react-native-linear-gradient'

export class SimpleButton extends Component{
  constructor(props){
    super(props);

    this.content = {
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'center',
      padding:10,
      borderRadius:2,
      backgroundColor:'#C0D838'
    }

    this.style = {
      flex:0,
      textAlign:'center',
      color:'#fff',
      fontWeight:"bold"
    }
  }

  render(){
    var Tstyle_plus = "";
    var Pstyle_plus = "";
    if(this.props.Tstyle)
    {
      Tstyle_plus = this.props.Tstyle
    }
    if(this.props.Pstyle)
    {
      Pstyle_plus = this.props.Pstyle
    }
    return <TouchableOpacity style={[this.content, Pstyle_plus]} onPress={this.props.onPress}>
              <Text style={[this.style, Tstyle_plus]}>{this.props.title}</Text>
           </TouchableOpacity>
  }
}

export class ImageButton extends Component{
  constructor(props){
    super(props)
  }

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
  }


  render(){
    const rayon = this.props.rayon || 60
    const boxStyle = StyleSheet.create({
      touchable:{
        flex:1,
        margin:10,
        alignItems:'center'
      },
      boxControl:{
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
      text:{
        flex:0,
        fontWeight:'bold',
        color:'#fff',
        backgroundColor:'#AEAEAE',
        textAlign:'center',
        paddingHorizontal:10,
        paddingVertical:5,
        borderRadius:5
      }, 
    });

    return  <TouchableOpacity onPress={this.props.onPress} style={boxStyle.touchable}>
              <LinearGradient colors={['#D1E949', '#C0D838', '#9DA505']} style={boxStyle.boxControl}>
                <XImage source={this.props.source} style={boxStyle.icons} local={this.props.local || true} />
              </LinearGradient>
              <Text style={boxStyle.text}>{this.props.title}</Text>
            </TouchableOpacity>
  }
}

export class LinkButton extends Component{
  constructor(props){
    super(props);
  }
  
  render(){

    const styles = StyleSheet.create({
      content:{
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'center',
              },
      text:  {
                flex:3,
                textAlign:'left',
                paddingLeft:10,
              },
      image:  {
                flex:1,
                width:30,
                height:20,
              }
    })

    const Tstyle_plus = this.props.Tstyle || ""
    const Pstyle_plus = this.props.Pstyle || ""
    const Istyle_plus = this.props.Istyle || ""

    return <TouchableOpacity style={[styles.content, Pstyle_plus]} onPress={this.props.onPress}>
              {this.props.source && <XImage source={this.props.source} resizeMode={this.props.resizeMode} style={[styles.image, Istyle_plus]} local={this.props.local || true}/>}
              <Text style={[styles.text, Tstyle_plus]}>{this.props.title}</Text>
           </TouchableOpacity>
  }
}

export default SimpleButton
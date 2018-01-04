import React, { Component } from 'react'
import {Image, View, Text, TextInput, Platform, TouchableOpacity, TouchableWithoutFeedback, Modal, StyleSheet} from 'react-native'
import AnimatedBox from './animatedBox'

function require_images(name){
  const images = {
    arrow_doc:require('../images/arrow_doc.png'),
    arrow_down:require('../images/arrow_down.png'),
    arrow_up:require('../images/arrow_up.png'),
    camera_icon:require('../images/camera_icon.png'),
    charge:require('../images/charge.png'),
    delete:require('../images/delete.png'),
    doc_curr:require('../images/doc_curr.png'),
    doc_trait:require('../images/doc_trait.png'),
    documents:require('../images/documents.png'),
    doc_view:require('../images/doc_view.png'),
    folder:require('../images/folder.png'),
    ico_docs:require('../images/ico_docs.png'),
    ico_home:require('../images/ico_home.png'),
    ico_send:require('../images/ico_send.png'),
    ico_suiv:require('../images/ico_suiv.png'),
    ico_sharing:require('../images/ico_sharing.png'),
    information:require('../images/information.png'),
    logo:require('../images/logo.png'),
    menu_ico:require('../images/menu_ico.png'),
    options:require('../images/options.png'),
    plane:require('../images/plane.png'),
    zoom_x:require('../images/zoom_x.png'),
    validate:require('../images/validate.png'),
    userpic:require('../images/userpic.png'),
    cadenas:require('../images/cadenas.png'),
    add_contact:require('../images/add_contact.png'),
    edition:require('../images/edition.png'),
    sharing_account:require('../images/sharing_account.png'),
    request_access:require('../images/request_access.png'),
    infos:require('../images/infos.png'),
    img_crop:require('../images/img_crop.png'),
    default: require("../images/loader.gif"),
  }
  const loaded_img = eval('images.'+name) || images.default
  return loaded_img;
}

export class XImage extends Component{
  constructor(props){
    super(props)

    this.renderImage = this.renderImage.bind(this)
    this.ajustImage = this.ajustImage.bind(this)
  }

  ajustImage(e){
    console.error(e)
  }

  renderImage(){
    this.img_style = this.props.style
    this.local = true
    if(this.props.local == false){this.local = false}

    this.img_source = this.props.source
    if(typeof(this.props.source) !== "undefined" && typeof(this.props.source.uri) !== "indefined" && this.local)
    {
      this.img_source = require_images(this.props.source.uri)
    }
  }

  render(){
    this.renderImage()
    if(this.props.loader == true)
    {
      const loader_img = require('../images/loader.gif')
      const width = this.props.width || 60
      const height = this.props.height || 60
      const style = this.props.style || {}

      return  <Image source={loader_img} resizeMode="contain" style={[{flex:0,width:width,height:height}, style]} />
    }
    else
    {
      const loader = require('../images/img_loader.gif')
      if(this.props.children || (typeof(this.props.type)!=='undefined' && this.props.type == 'container'))
      {
        const absolute = {
          position:'absolute',
          flex:0,
          width:'100%',
          height:'100%',
          justifyContent:'flex-end'
        }

        return  <View style={[{flex:0}, this.props.PStyle]}>
                  <Image 
                    source={this.img_source} 
                    style={this.img_style} 
                    resizeMode={this.props.resizeMode||'contain'}
                    onLoadEnd={this.props.onLoadEnd}
                    loadingIndicatorSource={loader}
                    />
                  <View style={absolute}>
                    {this.props.children}
                  </View>
                </View>
      }
      else
      {
        return  <Image 
                    source={this.img_source} 
                    style={this.img_style} 
                    resizeMode={this.props.resizeMode||'contain'}
                    onLoadEnd={this.props.onLoadEnd}
                    loadingIndicatorSource={loader}
                />
      }
    }
  }
}

export class XTextInput extends Component{
  constructor(props){
    super(props)
    this.state = {
                   openKeyboard: false,
                   value: this.props.value || this.props.defaultValue || "",
                 }
    this.initValue = null
    this.liveChange = this.props.liveChange || false
    this.label = this.props.placeholder || this.props.label || ""

    this.renderModalText = this.renderModalText.bind(this)
    this.closeKeyboard = this.closeKeyboard.bind(this)
  }

  openKeyboard(){
    if(this.props.onFocus){this.props.onFocus()}
    this.setState({openKeyboard: true})
  }

  closeKeyboard(){
    this.refs.input.blur()
    const exit = ()=>{
                        this.setState({openKeyboard: false})
                        if(this.state.value != this.initValue && this.liveChange == false)
                        {
                          try
                          {this.props.onChangeText(this.state.value)}
                          catch(e){}
                        }
                        try{this.props.onBlur()}
                        catch(e){}
                        this.initValue = null
                      }
    this.refs.animatedInput.leave(exit)
  }

  async changeText(value=""){
    await this.setState({value: value})
    if(this.liveChange)
    {
      try
      {this.props.onChangeText(this.state.value)}
      catch(e){}
    }
  }

  renderModalText(){
    if(this.initValue == null)
    {
      this.initValue = this.state.value
    }
    const styles = StyleSheet.create({
      content:{
        flex:1,
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'rgba(0,0,0,0.7)'
      },
      box:{
        flex:0,
        height:53,
        width:'100%',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#F1F1F1' 
      },
      label:{
        flex:0,
        fontSize:14,
        color:'#707070'
      },
      input:{
        flex:0,
        width:180,
        fontSize:14,
        height:28,
        paddingVertical:7,
        paddingHorizontal:8,
        backgroundColor:'#FFF'
      }
    })

    let iosStyle = {}
    if(Platform.os == 'ios')
    {
      iosStyle={
        borderColor:'#707070',
        borderBottomWidth: 1
      }
    }
    return <Modal  transparent={true}
                   animationType="none" 
                   visible={true}
                   supportedOrientations={['portrait', 'landscape']}
                   onRequestClose={()=>{this.closeKeyboard()}}
            >
              <TouchableWithoutFeedback onPress={()=>this.closeKeyboard()}>
                <View style={styles.content}>
                  <AnimatedBox ref="animatedInput" style={styles.box} type='DownSlide' durationIn={300} >
                    {this.label != "" && <Text style={styles.label}>{this.label}</Text>}
                    <TextInput ref="input"
                               autoFocus={true}
                               autoCorrect={this.props.autoCorrect || true}
                               secureTextEntry={this.props.secureTextEntry || false}
                               defaultValue={this.state.value}
                               onChangeText={(value)=>this.changeText(value)}
                               onBlur={()=>{this.closeKeyboard()}}
                               keyboardType={this.props.keyboardType}
                               style={[styles.input, iosStyle]}/>
                  </AnimatedBox>
                  <View style={{flex:1}} />
                </View>       
              </TouchableWithoutFeedback>
            </Modal>
  }

  render(){
    const prevStyle = {
      minHeight:30,
      paddingBottom:8
    }

    const textStyle = {
      flex:1,
      color: '#707070',
      borderBottomWidth:1,
      borderColor:'#909090',
      fontSize:14,
      padding:5,
    }

    const PStyle = this.props.PStyle
    const TStyle = this.props.TStyle
    let value = this.state.value || this.props.placeholder || ""
    if(this.props.secureTextEntry && this.state.value.length > 0)
    {
      let password = ""
      for(i=0;i<value.length;i++)
      {
        password += "*"
      }
      value = password
    }
    return <TouchableOpacity style={[prevStyle, PStyle]} onPress={()=>this.openKeyboard()} >
            {this.state.openKeyboard && this.renderModalText()}  
            <Text style={[textStyle, TStyle]}>{value}</Text>
           </TouchableOpacity>
           
  }
}
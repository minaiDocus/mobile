import React, { Component } from 'react'
import {Image, View, Text, TextInput, Platform, TouchableOpacity, TouchableWithoutFeedback, Modal, StyleSheet} from 'react-native'
import AnimatedBox from './animatedBox'
import {SimpleButton} from './buttons'

//Function for declaring image to React
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
    notification:require('../images/notification.png'),
    notification_green:require('../images/notification_green.png'),
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
                    resizeMode={this.props.resizeMode || 'contain'}
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
                    resizeMode={this.props.resizeMode || 'contain'}
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

    this.initValue = this.props.value || this.props.defaultValue || ""
    this.state = {
                   openKeyboard: false,
                   value: this.initValue,
                 }

    this.editable = true
    if(this.props.editable == false)
    {
      this.editable = false
    }

    this.previous_action = this.props.previous || null
    this.next_action = this.props.next || null

    this.closing = false             

    this.liveChange = this.props.liveChange || false
    this.label = this.props.placeholder || this.props.label || ""

    this.renderModalText = this.renderModalText.bind(this)
    this.closeKeyboard = this.closeKeyboard.bind(this)
    this.handleLayout = this.handleLayout.bind(this)

    this.generateStyles()
  }

  openKeyboard(){
    if(this.editable){
      if(this.props.onFocus){this.props.onFocus()}
      this.setState({openKeyboard: true})
    }
  }

  closeKeyboard(callback_action=null){
    if(this.closing == false)
    {
      this.closing = true
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
                          this.closing = false
                          this.initValue = this.state.value

                          if(callback_action != null)
                          {
                            callback_action()
                          }
                        }
      this.refs.animatedInput.leave(exit)
    }
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

  handleLayout(){
    if(this.editable){
      setTimeout(()=>{this.refs.input.focus()}, 500)
    }
  }

  generateStyles(){
    this.stylesModalText = StyleSheet.create({
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
      boxInput: {
                  flex:0,
                  width:180,
                  height:28,
                  borderColor:'#707070',
                  borderBottomWidth: 1,
                  paddingVertical:7,
                  paddingHorizontal:8,
                  backgroundColor:'#FFF',
                },
      miniContent: {
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        borderWidth:1
      },
      buttonStyle: {
        flex:1,
        maxWidth:100,
        maxHeight:28,   // =======
        minHeight:28,   // ======= instead of height: value
      }
    })

    this.styles = StyleSheet.create({
      prevStyle:  {
                    minHeight:30,
                    paddingBottom:8
                  },
      textStyle:  {
                    flex:1,
                    color: this.editable? '#606060' : '#A6A6A6',
                    fontSize:14,
                  },
      boxText:  {
                  flex:1,
                  borderBottomWidth:1,
                  borderColor:'#909090',
                  padding:5
                }
    })
  }

  renderModalText(){
    let iosStyle = androidStyle = {}
    if(Platform.OS == 'ios')
    {
      iosStyle={
        marginTop: 20,
      }
    }
    else if(Platform.OS == 'android')
    {
      androidStyle={
        paddingVertical:0,
        borderBottomWidth:0,
        height:35
      }
    }
    return <Modal  transparent={true}
                   animationType="none" 
                   visible={true}
                   supportedOrientations={['portrait', 'landscape']}
                   onRequestClose={()=>{this.closeKeyboard()}}
            >
              <TouchableWithoutFeedback onPress={()=>this.closeKeyboard()}>
                <View style={[this.stylesModalText.content, iosStyle]}>
                  <AnimatedBox ref="animatedInput" style={this.stylesModalText.box} type='DownSlide' durationIn={300} >
                    <View style={{flex:1, flexDirection:'row'}}>
                      <View style={{flex:1, alignItems:'flex-end', justifyContent:'center'}}>
                      {
                        this.previous_action != null && 
                        <SimpleButton onPress={()=>{this.closeKeyboard(this.previous_action.action)}} 
                                      Pstyle={[this.stylesModalText.buttonStyle, {marginRight: '10%'}]} 
                                      Tstyle={{fontSize:12}} 
                                      title={this.previous_action.title || "<< Prev."} />
                      }
                      </View>
                      <View style={{flex:0, justifyContent:'center', alignItems:'center'}}>
                        {this.label != "" && <Text style={this.stylesModalText.label}>{this.label}</Text>}
                        <View style={[this.stylesModalText.boxInput, androidStyle]}>
                          <TextInput ref="input"
                                     autoFocus={true}
                                     onLayout={()=>this.handleLayout()}
                                     autoCorrect={this.props.autoCorrect || true}
                                     secureTextEntry={this.props.secureTextEntry || false}
                                     defaultValue={this.state.value}
                                     onChangeText={(value)=>this.changeText(value)}
                                     editable={this.editable}
                                     onBlur={()=>{this.closeKeyboard()}}
                                     keyboardType={this.props.keyboardType}
                                     style={{flex:1, fontSize:14}}/>
                        </View>
                      </View>
                      <View style={{flex:1, alignItems:'flex-start', justifyContent:'center'}}>
                      {
                        this.next_action != null && 
                        <SimpleButton onPress={()=>{this.closeKeyboard(this.next_action.action)}} 
                                      Pstyle={[this.stylesModalText.buttonStyle, {marginLeft: '10%'}]} 
                                      Tstyle={{fontSize:12}} 
                                      title={this.next_action.title || "Suiv. >>"} />
                      }
                      </View>
                  </View>
                  </AnimatedBox>
                  <View style={{flex:1}} />
                </View>       
              </TouchableWithoutFeedback>
            </Modal>
  }

  render(){
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
    return <TouchableOpacity style={[this.styles.prevStyle, PStyle]} onPress={()=>this.openKeyboard()} >
            {this.state.openKeyboard && this.renderModalText()}  
            <View style={this.styles.boxText}>
              <Text style={[this.styles.textStyle, TStyle]}>{value}</Text>
            </View>
           </TouchableOpacity>
           
  }
}
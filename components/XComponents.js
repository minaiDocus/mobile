import React, { Component } from 'react'
import {Image, View, Text, TextInput, Platform} from 'react-native'

function require_images(name){
  const images = {
    arrow_doc:require('../images/arrow_doc.png'),
    arrow_down:require('../images/arrow_down.png'),
    arrow_up:require('../images/arrow_up.png'),
    camera_icon:require('../images/camera_icon.png'),
    charge:require('../images/charge.png'),
    delete:require('../images/delete.png'),
    doc_curr:require('../images/doc_curr.png'),
    docs_ico:require('../images/docs_ico.png'),
    doc_trait:require('../images/doc_trait.png'),
    documents:require('../images/documents.png'),
    doc_view:require('../images/doc_view.png'),
    folder:require('../images/folder.png'),
    ico_docs:require('../images/ico_docs.png'),
    ico_home:require('../images/ico_home.png'),
    ico_send:require('../images/ico_send.png'),
    ico_suiv:require('../images/ico_suiv.png'),
    information:require('../images/information.png'),
    logo:require('../images/logo.png'),
    menu_ico:require('../images/menu_ico.png'),
    n_arrow_down:require('../images/n_arrow_down.png'),
    n_arrow_up:require('../images/n_arrow_up.png'),
    options:require('../images/options.png'),
    plane:require('../images/plane.png'),
    suivi_ico:require('../images/suivi_ico.png'),
    zoom_x:require('../images/zoom_x.png'),
    userpic:require('../images/userpic.png'),
    cadenas:require('../images/cadenas.png'),
    default: require("../images/loader.gif"),
  }
  const loaded_img = eval('images.'+name) || images.default
  return loaded_img;
}

export class XImage extends Component{
  constructor(props){
    super(props)

    this.renderImage = this.renderImage.bind(this)
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
    const loader_img = require('../images/loader.gif')
    if(this.props.loader == true)
    {
      const width = this.props.width || 60
      const height = this.props.height || 60
      const style = this.props.style || {}

      return  <Image source={loader_img} resizeMode="contain" style={[{flex:0,width:width,height:height}, style]} />
    }
    else
    {
      return  <View>
              <Image 
                source={this.img_source} 
                style={this.img_style} 
                resizeMode={this.props.resizeMode||'contain'}
                onLoadEnd={this.props.onLoadEnd}
                loadingIndicatorSource={loader_img}
                />
                <View style={{flex:0}}/>
                {this.props.children}
              </View>
    }
  }
}

export class XTextInput extends Component{
  render(){
    let prevStyle = {}
    if(Platform.OS == 'ios')
    {
      prevStyle = {
        borderBottomWidth:1,
        borderColor:'#707070',
      }
    }

    const style = this.props.style
    return <TextInput {...this.props} style={[prevStyle, style]} />
  }
}
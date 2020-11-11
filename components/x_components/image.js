import React, { Component } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';
import {Image, View, StyleSheet} from 'react-native'

//Function for declaring image to React
function require_images(name){
  const images = {
    compta_analytics:require('../../images/compta_analytics.png'),
    doc_curr:require('../../images/doc_curr.png'),
    doc_trait:require('../../images/doc_trait.png'),
    doc_view:require('../../images/doc_view.png'),
    information:require('../../images/information.png'),
    logo:require('../../images/logo.png'),
    menu_ico:require('../../images/menu_ico.png'),
    options:require('../../images/options.png'),
    preaff_deliv:require('../../images/preaff_deliv.png'),
    preaff_deliv_pending:require('../../images/preaff_deliv_pending.png'),
    preaff_err:require('../../images/preaff_err.png'),
    preaff_pending:require('../../images/preaff_pending.png'),
    preaff_dupl:require('../../images/preaff_dupl.png'),
    preaff_ignored:require('../../images/preaff_ignored.png'),
    sharing_account:require('../../images/sharing_account.png'),
    request_access:require('../../images/request_access.png'),
    back:require('../../images/back.png'),
    remake:require('../../images/remake.png'),
    organization:require('../../images/organization.png'),
    zoom_x:require('../../images/zoom_x.png'),
    default: require("../../images/loader.gif"),
  }
  const loaded_img = images[name] || images.default
  return loaded_img;
}

export class XImage extends Component{
  constructor(props){
    super(props)

    this.prepareSource = this.prepareSource.bind(this)
  }

  prepareSource(){
    this.type = (isPresent(this.props.source) && isPresent(this.props.source.icon))? 'icon' : 'image'
    this.img_style = this.props.style || {}
    this.local = true
    if(this.props.local == false){this.local = false}

    this.img_source = this.props.source
    if(typeof(this.props.source) !== 'undefined' && isPresent(this.props.source.uri) && this.local)
      this.img_source = require_images(this.props.source.uri)
  }

  render(){
    this.prepareSource()

    if(this.props.loader == true)
    {
      const loader_img = require('../../images/loader.gif')
      const width = this.props.width || 50
      const height = this.props.height || 50
      const style = this.props.style || {}

      return  <Image source={loader_img} resizeMode="contain" style={[{flex:0,width:width,height:height}, style]} />
    }
    else if(this.type == 'icon')
    {
      const size = this.props.size || 19
      const color = this.props.color || Theme.global_text.color
      const style = this.props.XStyle || {}

      return <View style={[{flex: 0, justifyContent: 'center', alignItems: 'center'}, this.img_style]}><Icon name={this.img_source.icon} size={size} color={color} style={style} /></View>
    }
    else
    {
      const loader = require('../../images/img_loader.gif')
      if(this.props.children || (isPresent(this.props.type) && this.props.type == 'container'))
      {
        const absolute = {
          position:'absolute',
          flex:0,
          width:'100%',
          height:'100%',
          justifyContent:'flex-end'
        }

        return  <View style={[{flex:0}, this.props.CStyle]}>
                  <Image 
                    source={this.img_source} 
                    style={this.img_style} 
                    resizeMode={this.props.resizeMode || 'contain'}
                    onLoadEnd={this.props.onLoadEnd}
                    loadingIndicatorSource={loader}
                    />
                  <View style={[absolute, this.props.CldStyle]}>
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
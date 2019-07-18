import React, { Component } from 'react'
import {Image, View, StyleSheet} from 'react-native'

//Function for declaring image to React
function require_images(name){
  const images = {
    arrow_doc:require('../../images/arrow_doc.png'),
    arrow_doc_green:require('../../images/arrow_doc_green.png'),
    arrow_down:require('../../images/arrow_down.png'),
    arrow_up:require('../../images/arrow_up.png'),
    camera_icon:require('../../images/camera_icon.png'),
    charge:require('../../images/charge.png'),
    compta_analytics:require('../../images/compta_analytics.png'),
    delete:require('../../images/delete.png'),
    delete_green:require('../../images/delete_green.png'),
    doc_curr:require('../../images/doc_curr.png'),
    doc_trait:require('../../images/doc_trait.png'),
    documents:require('../../images/documents.png'),
    doc_view:require('../../images/doc_view.png'),
    folder:require('../../images/folder.png'),
    ico_docs:require('../../images/ico_docs.png'),
    ico_home:require('../../images/ico_home.png'),
    ico_send:require('../../images/ico_send.png'),
    ico_suiv:require('../../images/ico_suiv.png'),
    ico_sharing:require('../../images/ico_sharing.png'),
    information:require('../../images/information.png'),
    logo:require('../../images/logo.png'),
    loopc:require('../../images/loopc.png'),
    loopc_green:require('../../images/loopc_green.png'),
    menu_ico:require('../../images/menu_ico.png'),
    no_selection:require('../../images/no_selection.png'),
    options:require('../../images/options.png'),
    plane:require('../../images/plane.png'),
    plane:require('../../images/plane.png'),
    preaff_deliv:require('../../images/preaff_deliv.png'),
    preaff_deliv_pending:require('../../images/preaff_deliv_pending.png'),
    preaff_err:require('../../images/preaff_err.png'),
    preaff_pending:require('../../images/preaff_pending.png'),
    preaff_dupl:require('../../images/preaff_dupl.png'),
    preaff_ignored:require('../../images/preaff_ignored.png'),
    validate:require('../../images/validate.png'),
    validate_green:require('../../images/validate_green.png'),
    userpic:require('../../images/userpic.png'),
    cadenas:require('../../images/cadenas.png'),
    add_contact:require('../../images/add_contact.png'),
    edition:require('../../images/edition.png'),
    edition_green:require('../../images/edition_green.png'),
    sharing_account:require('../../images/sharing_account.png'),
    request_access:require('../../images/request_access.png'),
    infos:require('../../images/infos.png'),
    img_crop:require('../../images/img_crop.png'),
    notification:require('../../images/notification.png'),
    notification_green:require('../../images/notification_green.png'),
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

    this.renderImage = this.renderImage.bind(this)
  }

  renderImage(){
    this.img_style = this.props.style
    this.local = true
    if(this.props.local == false){this.local = false}

    this.img_source = this.props.source
    if(typeof(this.props.source) !== 'undefined' && isPresent(this.props.source.uri) && this.local)
    {
      this.img_source = require_images(this.props.source.uri)
    }
  }

  render(){
    this.renderImage()
    if(this.props.loader == true)
    {
      const loader_img = require('../../images/loader.gif')
      const width = this.props.width || 60
      const height = this.props.height || 60
      const style = this.props.style || {}

      return  <Image source={loader_img} resizeMode="contain" style={[{flex:0,width:width,height:height}, style]} />
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
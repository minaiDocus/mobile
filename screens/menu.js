import React, { Component } from 'react'
import { EventRegister } from 'react-native-event-listeners'
import { TouchableOpacity, TouchableWithoutFeedback, View, StyleSheet, Modal, Slider, ScrollView, findNodeHandle, Animated } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { NavigationActions } from 'react-navigation'

import { XImage, XText, AnimatedBox, SimpleButton, LinkButton, ImageButton, ModalForm } from '../components'

import { User } from '../models'

import { RemoteAuthentication } from '../requests'

class Header extends Component{
  constructor(props){
    super(props)
    this.master = User.getMaster()
    this.generateStyles()
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      container:{
                  flex:0,
                  paddingVertical:5,
                  flexDirection:'row',
                  alignItems:'center',
                },
      left: {
              flex:0,
              width:80,
              flexDirection:'row',
              alignItems:'center',
              justifyContent:'center'
            },
      right:{
              flex:1,
              marginHorizontal:10
            },
      logobox:{
                flex:0,
                height:65,
                width:65,
                borderRadius:100,
                backgroundColor:'#fff',
              },
      logo: {
              position:'absolute',
              flex:0,
              height:70,
              width:70
            }
    })
  }

  render(){
    const userName = User.fullNameOf(this.master) || ""
    return  <View style={[this.styles.container, Theme.menu.head.shape]} >
              <View style={this.styles.left} >
                <View style={this.styles.logobox} />
                <XImage style={this.styles.logo} source={{uri:'logo'}} />
              </View>
              <View style={this.styles.right}>
                <XText style={Theme.menu.head.text_1}>Bienvenue</XText>
                {userName != "" && <XText style={Theme.menu.head.text_2}>{userName}</XText>}
                <XText style={[Theme.menu.head.text_2, { fontSize:10 }]}>{this.master.email}</XText>
              </View>
            </View>
  }
}

class Footer extends Component{
  constructor(props){
    super(props)
    this.generateStyles()
  }

  logOut(){
    this.props.navigate(null)

    setTimeout(()=>{
      renderToFrontView(  <View style={{flex:1, backgroundColor:'rgba(255,255,255,0.7)', alignItems:'center', justifyContent:'center'}}>
                            <XImage loader={true} width={40} height={40} />
                          </View>)

      //remove data cache (REALM)
      RemoteAuthentication.logOut()

      //refreshFCMtoken
      EventRegister.emit("revokeFCMtoken")
      
      //go back to Login
      CurrentScreen.dismissTo('Login', { goodbye: true })
    }, 1)
  }

  generateStyles(){
    this.styles = {
                    container:{
                                flex:0,
                                paddingVertical:5,
                                flexDirection: 'row',
                                justifyContent: 'center'
                              }
                  }
  }

  render(){
    //test
    this.generateStyles()
    return  <View style={[this.styles.container, Theme.menu.footer.shape]}>
              <SimpleButton CStyle={Theme.primary_button.shape} TStyle={Theme.primary_button.text} title='Deconnexion' onPress={()=>{this.logOut()}}/>
            </View>
  }
}

class Body extends Component{
  constructor(props){
    super(props)
    this.generateStyles()
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      container:{
                  flex:2,
                  paddingVertical:20
                },
      linkP:{
              marginVertical:5,
              marginHorizontal:25
            },
      linkI:{
        flex: 0,
        width: 20,
        height: 20
      }
    })
  }

  render(){
    return  <View style={this.styles.container}>
              <ScrollView>
                <LinkButton onPress={()=>{this.props.navigate(null)}} source={{uri:'ico_home'}} resizeMode='contain' title='Accueil' IStyle={this.styles.linkI} TStyle={Theme.menu.body.links} CStyle={this.styles.linkP} />
                <LinkButton onPress={()=>{this.props.navigate('Send')}} source={{uri:'ico_send'}} resizeMode='contain' title='Envoi documents' IStyle={this.styles.linkI} TStyle={Theme.menu.body.links} CStyle={this.styles.linkP} />
                <LinkButton onPress={()=>{this.props.navigate('Documents')}} source={{uri:'ico_docs'}} resizeMode='contain' title='Mes documents' IStyle={this.styles.linkI} TStyle={Theme.menu.body.links} CStyle={this.styles.linkP} />
                <LinkButton onPress={()=>{this.props.navigate('Stats')}} source={{uri:'ico_suiv'}} resizeMode='contain' title='Suivi' IStyle={this.styles.linkI} TStyle={Theme.menu.body.links} CStyle={this.styles.linkP} />
                <LinkButton onPress={()=>{this.props.navigate('Sharing')}} source={{uri:'ico_sharing'}} resizeMode='contain' title='Partage dossier' IStyle={this.styles.linkI} TStyle={Theme.menu.body.links} CStyle={this.styles.linkP} />
              </ScrollView>
            </View>
  }
}

class ModalMenu extends Component{
  constructor(props){
    super(props)
    this.modalDismiss = this.modalDismiss.bind(this)

    this.state = { visible: this.props.visible }
    this.moveDirection = 'left'

    this.animatedX = -230
    this.lastX = 0

    this.panHanlder = this.panHanlder.bind(this)
    this.generateStyles()
  }

  componentWillReceiveProps(nextProps){
    if(typeof(nextProps.visible))
      this.setState({ visible: nextProps.visible })
  }

  modalDismiss(screen = null){
    if(this.refs.animatedMenu)
      this.refs.animatedMenu.leave(()=>{
        this.props.navigate(screen)
      })
  }

  async releaseCapture(){
    if(this.moveDirection == 'left')
    {
      if(this.refs.animatedMenu)
        setTimeout(()=>{ this.refs.animatedMenu.start() }, 3)
    }
    else
    {
      setTimeout(()=>{ this.modalDismiss() }, 3)
    }
  }

  panHanlder(evt, gestureState){
    let startX = 0
    if(gestureState.dx >= 0){
      startX = -230
      this.moveDirection = 'left'
    }
    else
    {
      startX = 1 //not 0
      this.moveDirection = 'right'
    }

    if(this.refs.animatedMenu)
      this.refs.animatedMenu.move({ animateOpacity: { start: -230, end: 0 }, startX: startX, dx: gestureState.dx, limitX: [-230, 0] })
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      container:{
                  flex:1,
                  flexDirection:'row',
                  backgroundColor: "rgba(0,0,0,0.5)"
                },
      box:{
            flex:0,
            width:230
          },
      gradient: {
                  flex:1, 
                  paddingLeft:10,
                  paddingRight:15
                }
    });
  }

  render(){
    return  <Modal transparent={true}
                   visible={this.state.visible}
                   animationType="fade"
                   supportedOrientations={['portrait', 'landscape']}
                   onRequestClose={()=>{ this.modalDismiss() }}
            >
            <View style={[this.styles.container]}>
              <AnimatedBox  ref="animatedMenu" 
                            style={[this.styles.box]}
                            type='LeftSlide'
                            animateOpacity={true}
                            startOnLoad={this.props.animate}
                            durationIn={400}
                            durationOut={400}
                            >
                <LinearGradient colors={[Theme.menu.bg.color_1, Theme.menu.bg.color_2, Theme.menu.bg.color_3]} style={[this.styles.gradient, Theme.menu.shape]}>
                  <Header />
                  <Body navigate={this.modalDismiss}/>
                  <Footer navigate={this.modalDismiss}/>
                </LinearGradient>
              </AnimatedBox>
              <TouchableWithoutFeedback style={{flex:1}} onPress={()=>this.modalDismiss()}>
                <View style={{flex:1}} />
              </TouchableWithoutFeedback>
            </View>
          </Modal>
  }
}

export class Menu extends Component{
  constructor(props){
    super(props)

    this.state = { visible: false }

    this.animate = true
    this.locked_capture = false
    this.moveDirection = null

    this.dismiss = this.dismiss.bind(this)
    this.panHanlder = this.panHanlder.bind(this)

    this.generateStyles()
  }

  toggleMenu(animate=true){
    this.animate = animate

    this.setState({ visible: !this.state.visible });
  }

  dismiss(screen = null){
    this.toggleMenu(true)

    if(screen != 'close' && screen != null)
      CurrentScreen.goTo(screen)
  }

  panHanlder(evt, gestureState, type){
    if(!KeyboardShow)
    {
      if(type == 'shouldMoveCapture')
      {
        this.locked_capture = false
        if(!this.state.visible && gestureState.moveX <= 40 && gestureState.moveY >= 40)
        {
          this.locked_capture = true
        }
        else if(this.state.visible && gestureState.dx < -15)
        {
          this.locked_capture = true
        }
      }
      else if(type == 'move' && this.locked_capture)
      {
        if(gestureState.dx > 15 && !this.state.visible)
          this.toggleMenu(false)

        if(this.state.visible)
          this.refs.modalMenu.panHanlder(evt, gestureState)
      }
      else if((type == 'release' || type == 'terminate') && this.locked_capture)
      {
        setTimeout(()=>{this.refs.modalMenu.releaseCapture()}, 3)
        this.locked_capture = false
      }

      return this.locked_capture
    }
    else
    {
      return false
    }
  }

  generateStyles(){
    this.styles = {
                    container:{
                                flex:1,
                                flexDirection:'row',
                                alignItems:'center',
                                paddingLeft:10
                              }
                  }
  }

  render(){
    return  <View style={this.styles.container} >
              <ModalMenu ref='modalMenu' animate={this.animate} navigate={this.dismiss} visible = {this.state.visible}/>
              <ImageButton source={{uri:"menu_ico"}} IStyle={{flex:0, width:20, height:20}} onPress={()=>{this.toggleMenu(true)}} />
            </View>             
  }
}
import React, { Component } from 'react'
import Config from '../Config'
import {Text,TouchableOpacity,TouchableWithoutFeedback,View,StyleSheet,Modal,Slider,ScrollView,findNodeHandle} from 'react-native'
import {XImage} from './XComponents'
import AnimatedBox from './animatedBox'
import LinearGradient from 'react-native-linear-gradient'
import { NavigationActions } from 'react-navigation'
import {SimpleButton, LinkButton, ImageButton} from './buttons'
import User from '../models/User'
import Cfetcher from './dataFetcher'

let Fetcher = new Cfetcher()
let GLOB = {navigation: {}}

const styles = StyleSheet.create({
  generalText: {color: '#FFF'}
})


class Header extends Component{
  constructor(props){
    super(props)
    this.master = User.getMaster()
    this.generateStyles()
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      container:{
                  flex:1,
                  paddingVertical:10,
                  flexDirection:'row',
                  borderColor:'#fff',
                  borderBottomWidth:2,
                  alignItems:'center',
                },
      left: {
              flex:0,
              width:93,
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
                height:80,
                width:80,
                borderRadius:100,
                backgroundColor:'#fff',
              },
      logo: {
              position:'absolute',
              flex:0,
              height:28,
              width:76
            }
    })
  }

  render(){
    const userName = User.fullName_of(this.master) || ""
    return  <View style={this.styles.container} >
              <View style={this.styles.left} >
                <View style={this.styles.logobox} />
                <XImage style={this.styles.logo} source={{uri:'logo'}} />
              </View>
              <View style={this.styles.right}>
                <Text style={styles.generalText}>Bienvenue</Text>
                {userName != "" && <Text style={{color:"#FFF"}}>{userName}</Text>}
                <Text style={{color:"#FFF"}}>({this.master.email})</Text>
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
    //remove data cache (REALM)
    Fetcher.clearAll()
    
    //go back to Login
    GLOB.navigation.dismissTo('Login', {goodbye: true})
  }

  generateStyles(){
    this.styles = {
                    container:{
                                flex:1,
                                borderColor:'#fff',
                                borderTopWidth:2,
                                paddingTop:30,
                                paddingLeft:30,
                                paddingRight:30,
                              }
                  }
  }

  render(){
    return  <View style={this.styles.container}>
              <SimpleButton title='Deconnexion' onPress={()=>{this.logOut()}}/>
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
                  flex:3,
                  paddingVertical:20
                },
      linkP:{
              marginVertical:7,
              marginHorizontal:25
            }
    })
  }

  render(){
    return  <View style={this.styles.container}>
              <ScrollView>
                <LinkButton onPress={()=>{this.props.navigate(null)}} source={{uri:'ico_home'}} resizeMode='contain' title='Accueil' Tstyle={styles.generalText} Pstyle={this.styles.linkP} />
                <LinkButton onPress={()=>{this.props.navigate('Send')}} source={{uri:'ico_send'}} resizeMode='contain' title='Envoi documents' Tstyle={styles.generalText} Pstyle={this.styles.linkP} />
                <LinkButton onPress={()=>{this.props.navigate('Documents')}} source={{uri:'ico_docs'}} resizeMode='contain' title='Mes documents' Tstyle={styles.generalText} Pstyle={this.styles.linkP} />
                <LinkButton onPress={()=>{this.props.navigate('Stats')}} source={{uri:'ico_suiv'}} resizeMode='contain' title='Suivi' Tstyle={styles.generalText} Pstyle={this.styles.linkP} />
                <LinkButton onPress={()=>{this.props.navigate('Sharing')}} source={{uri:'ico_sharing'}} resizeMode='contain' title='Partage dossier' Tstyle={styles.generalText} Pstyle={this.styles.linkP} />
              </ScrollView>
            </View>
  }
}

class ModalMenu extends Component{
  constructor(props){
    super(props)
    this.modalDismiss = this.modalDismiss.bind(this)
    this.generateStyles()
  }

  modalDismiss(screen = null){
    this.refs.animatedMenu.leave(()=>{this.props.navigate(screen)})
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      container:{
                  flex:1,
                  flexDirection:'row',
                  backgroundColor:'rgba(255,255,255,0.7)',
                },
      box:{
            flex:0,
            width:260
          },
      gradient: {
                  flex:1, 
                  paddingLeft:10,
                  paddingRight:15,
                  borderTopRightRadius:10,
                  borderBottomRightRadius:10,
                }
    });
  }

  render(){
    return  <Modal transparent={true}
                   animationType="fade" 
                   visible={true}
                   supportedOrientations={['portrait', 'landscape']}
                   onRequestClose={()=>{}}
            >
            <View style={this.styles.container}>
              <AnimatedBox ref="animatedMenu" style={this.styles.box} type='DownSlide' >
                <LinearGradient colors={['#9E9E9E', '#8f8f8f', '#808080']} style={this.styles.gradient}>
                  <Header navigate={this.modalDismiss}/>
                  <Body navigate={this.modalDismiss}/>
                  <Footer navigate={this.modalDismiss}/>
                </LinearGradient>
              </AnimatedBox>
              <TouchableWithoutFeedback style={{flex:1}} onPress={this.modalDismiss}>
                <View style={{flex:1}} />
              </TouchableWithoutFeedback>
            </View>
          </Modal>
  }
}

class Menu extends Component{
  constructor(props){
    super(props);
    GLOB.navigation = this.props.navigation
    
    this.state = {visible: false}
    this.dismiss = this.dismiss.bind(this)
    this.generateStyles()
  }

  toggleMenu(){
    this.setState({visible: !this.state.visible});
  }

  dismiss(screen = null){
    this.toggleMenu()
    if(screen != 'close' && screen != null)
    {
      GLOB.navigation.goTo(screen);
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
    return <View style={this.styles.container} >
              {this.state.visible == true && <ModalMenu navigate={this.dismiss} />}
              <ImageButton source={{uri:"menu_ico"}} Istyle={{flex:0, width:30, height:30}} onPress={()=>{this.toggleMenu()}} />
            </View>             
  }
}

export default Menu
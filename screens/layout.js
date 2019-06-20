import React, { Component } from 'react'
import { View, Modal, BackHandler, PanResponder} from 'react-native'
import { EventRegister } from 'react-native-event-listeners'
import PropTypes from 'prop-types'
import { NoticeBox, XImage, XText, AnimatedBox, ImageButton, Navigator } from '../components'

import { Menu } from './menu'

function addScreenKey(key, screen){
  ScreenList.push({ key: key, screen: screen })
}

function removeScreenKey(key){
  ScreenList = ScreenList.filter((f)=>{ return f.key != key })
}

//A View that render a modal, visible on any pages but login
class FrontView extends Component{
  static loaded = false;
  
  constructor(props){
    super(props)

    this.state = {children: null, animation: "fade", closeCallback: null}

    this.handleBackPress = this.handleBackPress.bind(this)
    this.openFrontView = this.openFrontView.bind(this)
    this.closeFrontView = this.closeFrontView.bind(this)
  }

  componentWillMount(){
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }

  componentWillUnmount(){
    this.backHandler.remove()
  }

  openFrontView(params){
    this.setState({children: params.children, animation: params.animation, closeCallback: params.closeCallback})
  }

  closeFrontView(){
    this.setState({children: null, animation: "fade", closeCallback: null})
  }

  handleBackPress(){
    // if(isPresent(PreviousScreen) && CurrentScreen != 'login')
    //   EventRegister.emit('leavePage', ()=>{ this.props.navigation.dismissTo(PreviousScreen) })
    return true
  }

  render(){
    if(this.state.children != null)
    {
      return  <Modal  transparent={true}
                      animationType={this.state.animation} 
                      visible={true}
                      supportedOrientations={['portrait', 'landscape']}
                      onRequestClose={ ()=>{ if(this.state.closeCallback) this.state.closeCallback() } }
              >
                {this.state.children}
              </Modal>
    }
    else
    {
      return null
    }
  }
}

class Header extends Component {
  constructor(props){
    super(props)

    this.title = this.props.title || '...'
    this.options = this.props.options || null
    this.withMenu = this.props.withMenu || false

    this.menuPanHanlder = this.menuPanHanlder.bind(this)
    this.start = this.start.bind(this)
    this.leave = this.leave.bind(this)

    this.generateStyles();
  }

  menuPanHanlder(evt, gestureState, type){
    if(this.withMenu)
      return this.refs.mainMenu.panHanlder(evt, gestureState, type)
    else
      return false
  }

  start(callback=null){
    setTimeout(()=>{
      if(this.refs.main_header){
        this.refs.main_header.start(()=>{
          try{ callback() }catch(e){}
        })
      }
    }, 300)
  }

  leave(callback=null){
    setTimeout(()=>{
      if(this.refs.main_header){
        this.refs.main_header.leave(()=>{
          try{ callback() }catch(e){}
        })
      }
    }, 300)
  }

  generateStyles(){
    this.styles = {
      header: {
        flex: 0,
        height: 33,
        width: '100%',
        backgroundColor: '#ddd',
        flexDirection: 'row',
        justifyContent: 'center',
        elevation: 7, //Android Shadow
      },
      headLeft:{
        flex: 0,
        minWidth: 50
      },
      headMiddle:{
        flex: 1,
        paddingHorizontal: 5
      },
      headRight:{
        flex: 0,
        minWidth: 50
      },
      imgBack:{
                flex:1,
                flexDirection:'row',
                alignItems:'center',
                paddingLeft:10
              }
    }
  }

  render(){
    return  <AnimatedBox ref='main_header' startOnLoad={false} hideTillStart={true} type='DownSlide' durationIn={300} durationOut={100} style={[this.styles.header, Theme.header.shape]}>
              <View style={[this.styles.headLeft, Theme.header.left]}>
                { this.withMenu && <Menu panHandler={this.props.panHandler} ref='mainMenu' /> }
                { 
                  !this.withMenu && 
                  <View style={this.styles.imgBack} >
                    <ImageButton source={{uri:"back"}} IStyle={{flex:0, width:17, height:17}} onPress={()=>{ CurrentScreen.goBack() }} />
                  </View> 
                }
              </View>
              <View style={[this.styles.headMiddle, Theme.header.middle.shape]}>
                <XText style={[{textAlignVertical: 'center', height:'100%'}, Theme.header.middle.text]}>{ this.title }</XText>
              </View>
              <View style={[this.styles.headRight, Theme.header.right]}>
                { this.options }
              </View>
            </AnimatedBox>
  }
}

export class Screen extends Component{
  static propTypes = {
    navigation: PropTypes.object.isRequired,
  }

  constructor(props){
    super(props)

    this.navigation = new Navigator(this.props.navigation)
    addScreenKey(this.navigation.navigation.state.key, this)

    CurrentScreen = this

    this.width = this.last_width = 0
    this.height = this.last_height = 0
    this.orientation = "none"

    this.noHeader = this.props.noHeader || false

    this.closeScreen = this.closeScreen.bind(this)
    this.openScreen = this.openScreen.bind(this)
    this.goTo = this.goTo.bind(this)
    this.dismissTo = this.dismissTo.bind(this)
    this.goBack = this.goBack.bind(this)
    this.getNavigator = this.getNavigator.bind(this)
    this.panHandler = this.panHandler.bind(this)
    this.getFrontView = this.getFrontView.bind(this)
  }

  componentWillMount(){
    this.boxPanResponder = this.createPanResponder(this.panHandler)
  }

  componentWillUnmount(){
    this.navigation.screenClose()
    removeScreenKey(this.navigation.navigation.state.key)
  }

  createPanResponder(_move_function){
    return PanResponder.create({
              onStartShouldSetPanResponder: (evt, gestureState) => { return _move_function(evt, gestureState, 'shouldSet') },
              onStartShouldSetPanResponderCapture: (evt, gestureState) => { return _move_function(evt, gestureState, 'shouldCapture') },
              onMoveShouldSetPanResponder: (evt, gestureState) => { return _move_function(evt, gestureState, 'shouldMove') },
              onMoveShouldSetPanResponderCapture: (evt, gestureState) => { return _move_function(evt, gestureState, 'shouldMoveCapture') },
              onPanResponderTerminationRequest: (evt, gestureState) => { return _move_function(evt, gestureState, 'terminateRequest') },
              onPanResponderGrant: (evt, gestureState) => { _move_function(evt, gestureState, 'grant') },
              onPanResponderMove: (evt, gestureState) => { _move_function(evt, gestureState, 'move') },
              onPanResponderRelease: (evt, gestureState) => {_move_function(evt, gestureState, 'release') },
              onPanResponderTerminate: (evt, gestureState)=> { _move_function(evt, gestureState, 'terminate') }
          })
  }

  panHandler(evt, gestureState, type){
    if(!this.noHeader)
      return this.refs.header.menuPanHanlder(evt, gestureState, type)
    else
      return false
  }

  getNavigator(){
    return this.navigation
  }

  closeScreen(callback=null){
    if(this.refs.header){
      this.refs.header.leave(()=>{
        this.refs.main_page.leave(async ()=>{
          try{ callback() }catch(e){}
        })
      })
    }
    else
    {
      this.refs.main_page.leave(async ()=>{
        try{ callback() }catch(e){}
      })
    }
  }

  async openScreen(callback=null){
    if(this.refs.header){
      this.refs.header.start()
      this.refs.main_page.start(()=>{
        try{ callback() }catch(e){}
      })
    }
    else
    {
      this.refs.main_page.start(()=>{
        try{ callback() }catch(e){}
      })
    }
  }

  goTo(screen, params={}){
    this.closeScreen(()=>{
      this.navigation.goTo(screen, params)
    })
  }

  dismissTo(screen, params={}){
    this.closeScreen(()=>{
      this.navigation.dismissTo(screen, params)
    })
  }

  goBack(params={}){
    this.closeScreen(()=>{
      this.navigation.goBack()
    })
  }

  getFrontView(){
    return this.refs.main_front_view
  }

  handleLayout(event){
    this.width = event.nativeEvent.layout.width
    this.height = event.nativeEvent.layout.height

    if(this.width != this.last_width || this.height != this.last_height)
    {
      this.orientation = "portrait"
      Orientation = "portrait"
      if(this.width > this.height)
      {
        this.orientation = "landscape"
        Orientation = "landscape"
      }
      try{
        this.props.onChangeOrientation(this.orientation)
      }catch(e){}
    }

    this.last_width = this.width
    this.last_height = this.height
  }

  render(){
    const CStyle = this.props.style
    const back = require('../images/bg_body.png')

    return <View {...this.props} style={CStyle} onLayout={(event)=>{this.handleLayout(event)}} {...this.boxPanResponder.panHandlers}>
                <XImage type='container' source={back} resizeMode='contain' CStyle={{width: '100%', height: '100%'}}>
                  { !this.noHeader && <Header ref="header" closeScreen={(callback)=>this.closeScreen(callback)} title={this.props.title} options={this.props.options} withMenu={this.props.withMenu} /> }
                  <AnimatedBox ref='main_page' startOnLoad={false} hideTillStart={true} style={{flex: 1}} type='fade' durationIn={600} durationOut={100}>
                   { this.props.children }
                  </AnimatedBox>
                  <FrontView ref='main_front_view' />
                  <NoticeBox />
                </XImage>
           </View>
  }
}
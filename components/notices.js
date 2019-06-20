import React from 'react'
import { StyleSheet, View, TouchableOpacity, TouchableHighlight, Alert } from 'react-native'
import { EventRegister } from 'react-native-event-listeners'
import { AnimatedBox, XText } from './index'

export class Notice {
  static _noticeMessages = [];

  static info(message, opt={}){
    const options = {
                      permanent: opt.permanent || false,
                      type: 'info',
                      name: opt.name || '',
                      delay: opt.delay || 5000,
                      noClose: opt.noClose || false
                    }
    Notice._addNoticeMessages(message, options)
    EventRegister.emit('addNoticeMessages', null)
  }

  static danger(message, opt={}){
    const options = {
                      permanent: (opt.permanent != false)? true : false,
                      type: 'danger',
                      name: opt.name || '',
                      delay: opt.delay || 5000,
                      noClose: opt.noClose || false
                    }
    Notice._addNoticeMessages(message, options)
    EventRegister.emit('addNoticeMessages', null)
  }

  static alert(...args){
    Alert.alert(...args)
  }

  static remove(name="", with_animation=false){
    if(isPresent(name))
    {
      Notice._noticeMessages.map((value, index)=>{
        if(value != null && value.options.name != "" && value.options.name == name)
        {
          Notice._removeNoticeMessages(index, with_animation)
        }
      })
    }
  }

  static exist(name=""){
    let exist = false
    Notice._noticeMessages.map((value, index)=>{
        if(value != null && value.options.name != "" && value.options.name == name)
        {
          exist = true
        }
      })
    return exist
  }

  static _addNoticeMessages(message, options){
    objmess = {message: message, options}
    let toAdd = true

    if(options.name != "")
    {
      Notice._noticeMessages.map((value, index)=>{
        if(value != null && value.options.name != "" && value.options.name == options.name)
        {
          Notice._noticeMessages[index] = objmess
          toAdd = false
        }
      })
    }
    if(toAdd) Notice._noticeMessages = Notice._noticeMessages.concat([objmess])
  }

  static _removeNoticeMessages(index, with_animation=false){
    if(with_animation)
    {
      to_remove = Notice._noticeMessages[index].options.name || null
    }
    else
    {
      Notice._noticeMessages[index] = null
      to_remove = null
    }

    EventRegister.emit('removeNoticeMessages', to_remove)
  }
}

class Message extends React.Component{
  constructor(props){
    super(props)
    this.index = this.props.index
    this.options = this.props.data.options

    this.closeMessage = this.closeMessage.bind(this)
    this.activeClosing = this.activeClosing.bind(this)

    this.generateStyles()
  }

  componentDidMount(){
    if(this.options.permanent == false)
    {
      this._timeout = setTimeout(this.closeMessage, this.options.delay)
    }
  }

  componentWillUnmount(){
    if(this._timeout)
    {
      clearTimeout(this._timeout)
    }
  }

  closeMessage(){
    this.refs.animatedMessage.leave(this.activeClosing)
  }

  activeClosing(){
    Notice._removeNoticeMessages(this.index)
  }

  generateStyles(){
    const colorText = (this.options.type == 'danger')? '#EC5656' : '#C0D838'
    this.styles = StyleSheet.create({
      messageView:{
                    backgroundColor:'rgba(48,48,48,0.8)',
                    flex:1,
                    flexDirection:'row',
                    alignItems:'center',
                    borderBottomWidth:1,
                    borderColor:'#AFAFAF',
                    padding:5
                  },
      title:{
              flex:1,
              color:'#FFF',
              paddingHorizontal:20
            },
      text:{
             flex:1,
             textAlign:'left',
             color:colorText,
             paddingHorizontal:20
           },
      close:{
              flex:0,
              textAlign:'right',
              fontSize:18,
              color:colorText,
              paddingHorizontal:10
            }
      })
  }

  render(){
    const message = this.props.data.message
    if(typeof(message) === 'string')
    {
      return  <AnimatedBox ref="animatedMessage" style={this.styles.messageView}>
                <XText style={this.styles.text}>{message}</XText>
                <TouchableHighlight style={{flex:0}} onPress={()=>this.closeMessage()}>
                  <XText style={[this.styles.close, Theme.textBold]}>X</XText>
                </TouchableHighlight>
              </AnimatedBox>
    }
    else
    {
      let body = <View style={{flex:1}}>{message}</View>
      if(isPresent(message.title) || isPresent(message.body))
      {
        body =  <View style={{flex:1}}>
                  {
                    typeof(message.title) !== "undefined" && 
                    <XText style={[this.styles.title, Theme.textBold]}>
                      {message.title}
                    </XText>
                  }
                  <XText style={[this.styles.text, {fontSize:10}]}>{message.body}</XText>
                </View>
      }
      return  <AnimatedBox ref="animatedMessage" style={this.styles.messageView}>
                {body}
                {
                  this.options.noClose == false &&
                  <TouchableHighlight style={{flex:0}} onPress={()=>this.closeMessage()}>
                    <XText style={[this.styles.close, Theme.textBold]}>X</XText>
                  </TouchableHighlight>
                }
              </AnimatedBox>
    }
  }
}

export class NoticeBox extends React.Component{
  constructor(props){
    super(props)

    this.isListening = false

    this.state = {refresh: 0}
    this.renderMessage = this.renderMessage.bind(this)
    this.closeMessage = this.closeMessage.bind(this)
    this.renderItems = this.renderItems.bind(this)

    this.generateStyles()
  }

  componentDidMount(){
    if(!this.isListening)
    {
      this.isListening = true
      this._addNoticeListener = EventRegister.on('addNoticeMessages', (e) => {
          this.renderMessage()
      })
      this._removeNoticeListener = EventRegister.on('removeNoticeMessages', (e) => {
          if(isPresent(e))
            this.closeMessage(e)
          else
            this.renderMessage()
      })
    }
  }

  componentWillUnmount(){
    if(this.isListening)
    {
      EventRegister.rm(this._addNoticeListener)
      EventRegister.rm(this._removeNoticeListener)
    }
  }

  closeMessage(name){
    try{
      this.refs[`noticeOBJ_${name}`].closeMessage()
    }
    catch(e){}
  }

  async renderMessage(messages){
    let rotation = this.state.refresh
    rotation = (rotation > 10)? 0 : rotation+1
    await this.setState({messagesChange: rotation})
  }

  renderItems(){
    let content = []
    for(i=Notice._noticeMessages.length; i>=0; i--)
    {
      if(isPresent(Notice._noticeMessages[i]))
      {
        if(isPresent(Notice._noticeMessages[i].options.name))
          content.push(<Message key={i} index={i} data={Notice._noticeMessages[i]} ref={`noticeOBJ_${Notice._noticeMessages[i].options.name}`} />)
        else
          content.push(<Message key={i} index={i} data={Notice._noticeMessages[i]} />)
      }
    }

    return content
  }

  generateStyles(){
    this.styles = {
                    box:{
                          position: 'absolute',
                          bottom:0,
                          left:0,
                          right:0
                        }
                  }
  }

  render(){
    return <View style={this.styles.box}>
              {this.renderItems()}
           </View> 
  }
}
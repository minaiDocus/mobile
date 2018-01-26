import React from 'react'
import {StyleSheet, Text, View, ScrollView, TouchableOpacity, TouchableHighlight, Alert} from 'react-native'
import { EventRegister } from 'react-native-event-listeners'
import AnimatedBox from './animatedBox'

export class Notice {
  static _noticeMessages = [];

  static info(message, permanent = false, name="", delay=5000){
    const options = {
                      permanent: permanent,
                      type: 'info',
                      name: name,
                      delay: delay
                    }
    Notice._addNoticeMessages(message, options)
    EventRegister.emit('addNoticeMessages', null)
  }

  static danger(message, permanent = true, name="", delay=5000){
    const options = {
                      permanent: permanent,
                      type: 'danger',
                      name: name,
                      delay: delay
                    }
    Notice._addNoticeMessages(message, options)
    EventRegister.emit('addNoticeMessages', null)
  }

  static alert(...args){
    Alert.alert(...args)
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

  static _removeNoticeMessages(index){
    Notice._noticeMessages[index] = null
    EventRegister.emit('removeNoticeMessages', Notice._noticeMessages)
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
              fontWeight:"bold",
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
              fontWeight:'bold',
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
                <Text style={this.styles.text}>{message}</Text>
                <TouchableHighlight style={{flex:0}} onPress={()=>this.closeMessage()}>
                  <Text style={this.styles.close}>X</Text>
                </TouchableHighlight>
              </AnimatedBox>
    }
    else
    {
      let body = <View style={{flex:1}}>{message}</View>
      if(typeof(message.title) !== "undefined" || typeof(message.body) !== "undefined")
      {
        body =  <View style={{flex:1}}>
                  {
                    typeof(message.title) !== "undefined" && 
                    <Text style={this.styles.title}>
                      {message.title}
                    </Text>
                  }
                  <Text style={[this.styles.text, {fontSize:10}]}>{message.body}</Text>
                </View>
      }
      return  <AnimatedBox ref="animatedMessage" style={this.styles.messageView}>
                {body}
                <TouchableHighlight style={{flex:0}} onPress={()=>this.closeMessage()}>
                  <Text style={this.styles.close}>X</Text>
                </TouchableHighlight>
              </AnimatedBox>
    }
  }
}

class NoticeBox extends React.Component{
  constructor(props){
    super(props)

    this.isListening = false

    this.state = {refresh: 0}
    this.renderMessage = this.renderMessage.bind(this)
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

  async renderMessage(messages){
    let rotation = this.state.refresh
    rotation = (rotation > 10)? 0 : rotation+1
    await this.setState({messagesChange: rotation})
  }

  renderItems(){
    let content = []
    for(i=Notice._noticeMessages.length; i>=0; i--)
    {
      if(typeof(Notice._noticeMessages[i]) !== 'undefined' && Notice._noticeMessages[i] != null)
      {
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


export default NoticeBox
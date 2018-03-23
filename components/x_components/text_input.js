import React, { Component } from 'react'
import {View, Text, TextInput, Platform, TouchableOpacity, TouchableWithoutFeedback, Modal, StyleSheet, Keyboard} from 'react-native'
import {SimpleButton, AnimatedBox} from '../index'

class ModalInput extends Component{
  constructor(props){
    super(props)

    this.closing = false

    this.keyboardShow = false

    this.closeKeyboard = this.closeKeyboard.bind(this)
    this._keyboardDidShow = this._keyboardDidShow.bind(this)
    this._keyboardDidHide = this._keyboardDidHide.bind(this)

    this.generateStyles()
  }

  componentDidMount(){
    this.timerTest = null
    const keyboardTest = ()=>{
      if(!this.keyboardShow)
      {
        try{
          this.refs.input.focus()
          clearInterval(this.timerTest)
        }
        catch(e){}
      }
      else
      {
        clearInterval(this.timerTest)
      }
    }

    this.timerTest = setInterval(keyboardTest, 200)
  }

  componentWillMount(){
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow)
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide)
  }

  componentWillUnmount(){
    this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener.remove()
    clearInterval(this.timerTest)
  }

  _keyboardDidShow(e) {
    this.keyboardShow = true
  }

  _keyboardDidHide(e) {
    this.keyboardShow = false
  }

  generateStyles(){
    this.styles = StyleSheet.create({
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
        backgroundColor:'#A6A6A6',
        maxWidth:100,
        maxHeight:28,   // =======
        minHeight:28,   // ======= instead of height: value
      }
    })
  }

  closeKeyboard(callback=null){
    if(this.closing == false)
    {
      this.closing = true
      this.refs.input.blur()
      this.refs.animatedInput.leave(()=>{this.props.closeKeyboard(callback)})
    }
  }

  render(){
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
                <View style={[this.styles.content, iosStyle]}>
                  <AnimatedBox ref="animatedInput" style={this.styles.box} type='DownSlide' durationIn={300} durationOut={150}>
                    <View style={{flex:1, flexDirection:'row'}}>
                      <View style={{flex:1, alignItems:'flex-end', justifyContent:'center'}}>
                      {
                        this.props.previous_action != null && 
                        <SimpleButton onPress={()=>{this.closeKeyboard(this.props.previous_action.action)}} 
                                      Pstyle={[this.styles.buttonStyle, {marginRight: '10%'}]} 
                                      Tstyle={{fontSize:12}} 
                                      title={this.props.previous_action.title || "<< Prev."} />
                      }
                      </View>
                      <View style={{flex:0, justifyContent:'center', alignItems:'center'}}>
                        {this.label != "" && <Text style={this.styles.label}>{this.label}</Text>}
                        <View style={[this.styles.boxInput, androidStyle]}>
                          <TextInput ref="input"
                                     autoFocus={false}
                                     autoCorrect={(this.props.autoCorrect == false)? false : true}
                                     autoCapitalize="none"
                                     selectTextOnFocus={this.props.selectTextOnFocus || false}
                                     secureTextEntry={this.props.secureTextEntry || false}
                                     defaultValue={this.props.currValue}
                                     onChangeText={(value)=>this.props.changeText(value)}
                                     editable={this.props.editable}
                                     onBlur={()=>{this.closeKeyboard()}}
                                     keyboardType={this.props.keyboardType}
                                     style={{flex:1, fontSize:14}}/>
                        </View>
                      </View>
                      <View style={{flex:1, alignItems:'flex-start', justifyContent:'center'}}>
                      {
                        this.props.next_action != null && 
                        <SimpleButton onPress={()=>{this.closeKeyboard(this.props.next_action.action)}} 
                                      Pstyle={[this.styles.buttonStyle, {marginLeft: '10%'}]} 
                                      Tstyle={{fontSize:12}} 
                                      title={this.props.next_action.title || "Suiv. >>"} />
                      }
                      </View>
                  </View>
                  </AnimatedBox>
                  <View style={{flex:1}} />
                </View>       
              </TouchableWithoutFeedback>
            </Modal>
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

    this.editable = (this.props.editable == false)? false : true

    this.previous_action = this.props.previous || null
    this.next_action = this.props.next || null      

    this.liveChange = this.props.liveChange || false
    this.label = this.props.placeholder || this.props.label || ""

    this.openKeyboard = this.openKeyboard.bind(this)
    this.closeKeyboard = this.closeKeyboard.bind(this)
    this.changeText = this.changeText.bind(this)

    this.generateStyles()
  }

  componentWillReceiveProps(nextProps){
    if(typeof(nextProps.editable) !== "undefined")
    {
      this.editable = (nextProps.editable == false)? false : true
    }
  }

  openKeyboard(){
    if(this.editable){
      if(this.props.onFocus){this.props.onFocus()}
      this.setState({openKeyboard: true})
    }
  }

  closeKeyboard(callback_action=null){
    this.setState({openKeyboard: false})
    if(this.state.value != this.initValue && this.liveChange == false)
    {
      try
      {this.props.onChangeText(this.state.value)}
      catch(e){}
    }
    
    try{this.props.onBlur()}
    catch(e){}

    this.initValue = this.state.value

    if(callback_action != null)
    {
      callback_action()
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

  generateStyles(){
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
            {this.state.openKeyboard && 
              <ModalInput 
                {...this.props}
                currValue={this.state.value}
                closeKeyboard={this.closeKeyboard}
                changeText={this.changeText}
                previous_action={this.previous_action}
                next_action={this.next_action}
                editable={this.editable}
              />
            }  
            <View style={this.styles.boxText}>
              <Text style={[this.styles.textStyle, TStyle]}>{value}</Text>
            </View>
           </TouchableOpacity>
           
  }
}
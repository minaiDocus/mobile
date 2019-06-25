import React, { Component } from 'react'
import {View, TextInput, Platform, TouchableOpacity, TouchableWithoutFeedback, Modal, StyleSheet, Keyboard, Dimensions} from 'react-native'
import {XText, SimpleButton, AnimatedBox, LinkButton} from '../index'

class ModalInput extends Component{
  constructor(props){
    super(props)

    this.closing = false

    this.keyboardShow = false

    this.state = { secureText: ((this.props.secureTextEntry)? 'Afficher mot de passe' : 'Cache mot de passe'), animated: (this.props.withAnimation || false), opacity: {display: 'flex'} }

    const x = (Dimensions.get('window').width / 2) - (this.props.offset.w / 2)
    this.endPosition = { x: x, y: 0 }

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
    KeyboardShow = true
    this.keyboardShow = true
  }

  _keyboardDidHide(e) {
    KeyboardShow = false
    this.keyboardShow = false
  }

  closeKeyboard(callback=null){
    if(this.closing == false)
    {
      this.closing = true
      this.refs.input.blur()
      this.refs.animatedInput.leave(()=>{
        if(this.props.withAnimation)
        {
          this.setState({ opacity: {display: 'flex'} })
          this.refs.fakeInput.leave(()=>{
            this.props.closeKeyboard(callback)
          })
        }
        else
        {
          this.props.closeKeyboard(callback)
        }
      })
    }
  }

  toggleSecurityText(){
    if(this.state.secureText == 'Afficher mot de passe')
      this.setState({ secureText: 'Cacher mot de passe' })
    else
      this.setState({ secureText: 'Afficher mot de passe' })
  }

  generateStyles(){
    let height = this.props.secureTextEntry ? 73 : 53
    if(this.props.multiline)
      height += 15

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
            height: height,
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
                  height: (this.props.multiline) ? 50 : 30,
                  borderColor:'#707070',
                  borderBottomWidth: 1,
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
        marginHorizontal: 5,
        maxWidth:100,
        maxHeight:28,   // =======
        minHeight:28,   // ======= instead of height: value
      },
      fakeText:{
        flex:0,
        position: 'absolute',
        zIndex: 100,
        width: this.props.offset.w,
        height: this.props.offset.h,
        borderBottomWidth:1,
        borderColor:'#909090',
        backgroundColor: '#FFF',
        padding:5
      }
    })
  }

  render(){

    this.generateStyles()

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
        borderBottomWidth:0,
      }
    }
    return <Modal  transparent={true}
                   animationType="none" 
                   visible={true}
                   supportedOrientations={['portrait', 'landscape']}
                   onRequestClose={()=>{this.closeKeyboard()}}
            >
              { this.props.withAnimation &&
                <AnimatedBox ref='fakeInput'
                             type='transform'
                             durationIn={200}
                             durationOut={200}
                             style={[this.styles.fakeText, this.state.opacity]}
                             startPosition={{x: this.props.offset.x, y: this.props.offset.y}}
                             endPosition={this.endPosition}
                             callbackIn={()=>{this.setState({ animated: false, opacity: {display: 'none'} })}}>
                  <XText style={{flex: 1}}>{this.cValue || '...'}</XText>
                </AnimatedBox>
              }
              { !this.state.animated &&
                <View style={[this.styles.content, iosStyle]}>
                  <AnimatedBox ref="animatedInput" style={[this.styles.box]} type='DownSlide' durationIn={300} durationOut={150}>
                    <View style={{flex:1, flexDirection:'row'}}>
                      <View style={{flex:1, alignItems:'flex-end', justifyContent:'center'}}>
                      {
                        this.props.previous_action != null && 
                        <SimpleButton onPress={()=>{this.closeKeyboard(this.props.previous_action.action)}} 
                                      CStyle={[this.styles.buttonStyle, Theme.primary_button.shape]} 
                                      TStyle={Theme.primary_button.text} 
                                      title={this.props.previous_action.title || "<< Prev."} />
                      }
                      </View>
                      <View style={{flex:0, justifyContent: 'center', alignItems:'center'}}>
                        {this.label && <XText style={this.styles.label}>{this.label}</XText>}
                        <View style={[this.styles.boxInput, androidStyle]}>
                          <TextInput ref="input"
                                     onSubmitEditing={()=>{this.closeKeyboard(this.props.onSubmitEditing)}}
                                     returnKeyType={this.props.returnKeyType}
                                     multiline={false}
                                     autoFocus={false}
                                     autoCorrect={(this.props.autoCorrect == false)? false : true}
                                     autoCapitalize="none"
                                     selectTextOnFocus={this.props.selectTextOnFocus || false}
                                     secureTextEntry={(this.state.secureText == 'Afficher mot de passe') ? true : false}
                                     defaultValue={this.props.currValue}
                                     onChangeText={(value)=>{this.cValue = value; this.props.changeText(value)}}
                                     editable={this.props.editable}
                                     onBlur={()=>{this.closeKeyboard()}}
                                     keyboardType={this.props.keyboardType}
                                     style={{flex:1, fontSize:12, paddingBottom: 6, margin: 0}}/>
                        </View>
                        {this.props.secureTextEntry && <LinkButton CStyle={{padding:5}} TStyle={{color:'#003366', paddingLeft:0, textDecorationLine:'underline', textAlign:'center'}} title={this.state.secureText} onPress={()=>this.toggleSecurityText()} />}
                      </View>
                      <View style={{flex:1, alignItems:'flex-start', justifyContent:'center'}}>
                      {
                        this.props.next_action != null && 
                        <SimpleButton onPress={()=>{this.closeKeyboard(this.props.next_action.action)}} 
                                      CStyle={[this.styles.buttonStyle, Theme.primary_button.shape]} 
                                      TStyle={Theme.primary_button.text} 
                                      title={this.props.next_action.title || "Suiv. >>"} />
                      }
                      </View>
                    </View>
                  </AnimatedBox>
                  <TouchableWithoutFeedback onPress={()=>{this.closeKeyboard()}}>
                    <View style={{flex:1, width:'100%'}} />
                  </TouchableWithoutFeedback>
                </View>
              }
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
                   ready: false
                 }

    this.editable = (this.props.editable == false)? false : true
    this.offset = {}

    this.previous_action = this.props.previous || null
    this.next_action = this.props.next || null      

    this.liveChange = this.props.liveChange || false
    this.label = this.props.placeholder || this.props.label || ""

    this.openKeyboard = this.openKeyboard.bind(this)
    this.closeKeyboard = this.closeKeyboard.bind(this)
    this.changeText = this.changeText.bind(this)
    this.onLayoutOnce = this.onLayoutOnce.bind(this)

    this.generateStyles()
  }

  componentWillReceiveProps(nextProps){
    if(typeof(nextProps.editable) !== "undefined")
    {
      this.editable = (nextProps.editable == false)? false : true
    }
  }

  async onLayoutOnce(event){
    if(!this.state.ready)
    {
      this.refs.mainView.measure( async (fx, fy, width, height, px, py) => {
        this.offset = { x: px, y: py, w: width, h: height }
        await this.setState({ ready: true })
      })
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

    let final_val = this.state.value.trim()

    if(final_val != this.initValue && this.liveChange == false)
    {
      try
      {this.props.onChangeText(final_val)}
      catch(e){}
    }
    
    try{this.props.onBlur()}
    catch(e){}

    this.initValue = final_val

    if(callback_action != null)
    {
      callback_action()
    }
  }

  async changeText(value=""){
    await this.setState({value: value.trim()})
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
                  },
      boxText:  {
                  flex:1,
                  borderBottomWidth:1,
                  borderColor:'#909090',
                  backgroundColor: '#FFF',
                  padding:5
                }
    })
  }

  render(){
    const CStyle = this.props.CStyle
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
    return <View style={[this.styles.prevStyle, CStyle]}>
            {this.state.openKeyboard && 
              <ModalInput 
                {...this.props}
                currValue={this.state.value}
                closeKeyboard={this.closeKeyboard}
                changeText={this.changeText}
                previous_action={this.previous_action}
                next_action={this.next_action}
                editable={this.editable}
                withAnimation={false}
                offset = {this.offset}
              />
            }  
            <TouchableOpacity style={{flex: 1}} onPress={()=>this.openKeyboard()} >
              <View ref='mainView' style={this.styles.boxText} onLayout={this.onLayoutOnce} >
                <XText style={[this.styles.textStyle, TStyle]}>{value}</XText>
              </View>
            </TouchableOpacity>
          </View>
           
  }
}
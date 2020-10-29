import React, { Component } from 'react'
import {View, TextInput, Platform, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Keyboard, Dimensions} from 'react-native'
import {XModal, XImage, XText, SimpleButton, AnimatedBox, LinkButton, XScrollView} from '../index'

class ModalInput extends Component{
  constructor(props){
    super(props)

    this.dataCompletions = this.props.dataCompletions || []

    this.closing = false

    this.keyboardShow = false

    this.state = { dataCompletions: this.dataCompletions, secureText: ((this.props.secureTextEntry)? 'Afficher mot de passe' : 'Cache mot de passe'), animated: (this.props.withAnimation || false), opacity: {display: 'flex'} }

    const x = (Dimensions.get('window').width / 2) - (this.props.offset.w / 2)
    this.endPosition = { x: x, y: 0 }

    this.closeKeyboard = this.closeKeyboard.bind(this)
    this.fillValue = this.fillValue.bind(this)
    this.handleChangeText = this.handleChangeText.bind(this)
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

  UNSAFE_componentWillMount(){
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

  fillValue(value=''){
    this.refs.input.value = value
    this.handleChangeText(value)
  }

  handleChangeText(value=''){
    let dataC = this.dataCompletions

    if(isPresent(value) && isPresent(dataC)){
      try{
        let matcher = new RegExp(value, "i")
        dataC = dataC.filter(d => matcher.test(d))
      }catch(e){}

      try{this.refs.autoCompletionScroll.scrollTo({x: 0, y: 0, animated: false})}catch(e){}
    }

    this.setState({ dataCompletions: dataC })
    this.cValue = value

    if(['decimal-pad', 'numeric'].includes(this.props.keyboardType))
      this.cValue = this.cValue.replace(',', '.')

    this.props.changeText(this.cValue)
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
            width:'100%',
            alignItems:'center',
            justifyContent:'center',
            backgroundColor:'#F1F1F1' 
          },
      box_2:{
                  flex: 0,
                  width: '100%',
                  flexDirection: 'row',
                  height: height,
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

  renderCompletionList(){
    let dataC = arrayCompact(this.state.dataCompletions, true)

    if(isPresent(dataC))
    {
      return  <XScrollView ref='autoCompletionScroll' style={{flex: 0, width: '100%', flexDirection: 'row', backgroundColor: '#FFF'}} horizontal={true} >
                { dataC.map((text, index) => {
                    if(isPresent(text)){
                      return <LinkButton  key={index}
                                          CStyle={{marginVertical: 10, marginHorizontal: 5, paddingHorizontal: 5, flex: 0, backgroundColor: '#F2F2F2'}}
                                          TStyle={{flex:0, color:'#003366', paddingLeft:0, textDecorationLine:'underline', textAlign:'center'}}
                                          title={text}
                                          onPress={()=>{ this.fillValue(text) }}
                                          />
                    }
                  })
                }
              </XScrollView>
    }
    else
    {
      return null
    }
  }

  render(){
    let iosStyle = androidStyle = {}
    if(Platform.OS == 'android')
    {
      androidStyle={
        borderBottomWidth:0,
      }
    }
    return <XModal  transparent={true}
                    animationType="none"
                    visible={true}
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
                    <View style={this.styles.box_2}>
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
                        {this.props.label && <XText style={this.styles.label}>{this.props.label}</XText>}
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
                                     onChangeText={(value)=>{this.handleChangeText(value)}}
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
                    { this.renderCompletionList() }
                  </AnimatedBox>
                  <TouchableWithoutFeedback onPress={()=>{this.closeKeyboard()}}>
                    <View style={{flex:1, width:'100%'}} />
                  </TouchableWithoutFeedback>
                </View>
              }
            </XModal>
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
    this.dataCompletions = this.props.dataCompletions || []

    this.liveChange = this.props.liveChange || false
    this.label = this.props.label || this.props.placeholder || null

    this.openKeyboard = this.openKeyboard.bind(this)
    this.closeKeyboard = this.closeKeyboard.bind(this)
    this.changeText = this.changeText.bind(this)
    this.onLayoutOnce = this.onLayoutOnce.bind(this)

    this.generateStyles()
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    if(typeof(nextProps.value) !== "undefined" && nextProps.value != this.initValue && !this.state.openKeyboard){
      this.initValue = nextProps.value
      this.changeText(nextProps.value)
    }

    if(typeof(nextProps.editable) !== "undefined")
      this.editable = (nextProps.editable == false)? false : true

    if(typeof(nextProps.previous) !== "undefined")
      this.previous_action = nextProps.previous

    if(typeof(nextProps.next) !== "undefined")
      this.next_action = nextProps.next

    if(typeof(nextProps.label) !== "undefined" || typeof(nextProps.placeholder) !== "undefined")
      this.label = nextProps.label || nextProps.placeholder || null

    if(typeof(nextProps.dataCompletions) !== "undefined")
      this.dataCompletions = nextProps.dataCompletions || []
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

  getValue(){
    return this.state.value.trim()
  }

  openKeyboard(){
    if(this.editable){
      if(this.props.onFocus){this.props.onFocus()}
      this.setState({openKeyboard: true})
    }
  }

  closeKeyboard(callback_action=null){
    let final_val = this.state.value.trim()

    if(final_val != this.initValue && this.liveChange == false)
    {
      try
      {this.props.onChangeText(final_val)}
      catch(e){}
    }

    this.initValue = final_val
    
    try{this.props.onBlur()}
    catch(e){}

    if(callback_action != null)
    {
      callback_action()
    }

    this.setState({openKeyboard: false})
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
                    overflow: 'hidden'
                  },
      textStyle:  {
                    flex:1,
                    paddingHorizontal: 4,
                    color: this.editable? Theme.inputs.text.color : '#A6A6A6',
                  },
      boxText:  {
                  flex:1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 5,
                  overflow: 'hidden'
                },
      labelBox:{
        flex: 0,
        justifyContent: 'center',
        width: '41%',
        height: '98%',
        borderColor: Theme.inputs.shape.borderColor || '#999',
        borderRightWidth: 1,
        borderTopLeftRadius: Theme.inputs.shape.borderRadius,
        borderBottomLeftRadius: Theme.inputs.shape.borderRadius,
        backgroundColor: '#F9F9F9',
        marginRight: 5,
        marginLeft: -5,
        paddingTop: 1,
        paddingLeft: 5,
        overflow: 'hidden'
      },
    })
  }

  render(){
    const IOptions = this.props.IOptions || {}
    const CStyle = this.props.CStyle
    const TStyle = this.props.TStyle
    let value = this.state.value || this.label || ""
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
                label={this.label}
                dataCompletions={this.dataCompletions}
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
              <View ref='mainView' style={[this.styles.boxText, Theme.inputs.shape]} onLayout={this.onLayoutOnce} >
                {this.props.LImage && <XImage size={IOptions.size || 17} color={IOptions.color || Theme.primary_button.shape.backgroundColor } source={this.props.LImage} style={{marginLeft: 5}}/>}
                {this.state.value.length > 0 && this.label && <View style={this.styles.labelBox}><XText style={[{flex: 0}, Theme.inputs.label]}>{this.label}</XText></View>}
                <XText style={[this.styles.textStyle, TStyle]}>{value}</XText>
                {this.props.RImage && <XImage size={IOptions.size || 17} color={IOptions.color || Theme.primary_button.shape.backgroundColor } source={this.props.RImage} style={{marginRight: 5}}/>}
              </View>
            </TouchableOpacity>
          </View>
           
  }
}
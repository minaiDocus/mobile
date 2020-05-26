import React, { Component } from 'react'
import SplashScreen from 'react-native-splash-screen'
import { StyleSheet, View } from 'react-native'

import { XImage, XText, XTextInput, Navigator, SimpleButton, AnimatedBox, SelectInput } from '../components'

import { Screen } from './layout'

import { User } from '../models'

import { RemoteAuthentication, UsersFetcher } from '../requests'

let GLOB = { login: '', password: '', system_reject: false }

class LoginScreen extends Component {
  static navigationOptions = { header: null }

  constructor(props){
    super(props)

    this.screen_name = 'Login'

    GLOB.login = GLOB.password = ""
    this.state = {loading: false, ready: false, orientation: 'portrait'}

    this.goToHome = this.goToHome.bind(this)
    this.actionLogin = this.actionLogin.bind(this)
    this.actionPassword = this.actionPassword.bind(this)
    this.dismissLoader = this.dismissLoader.bind(this)
    this.submitForm = this.submitForm.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.hideSplash = this.hideSplash.bind(this)

    this.generateStyles() //style generation
  }
  
  componentDidMount(){
    if(CurrentScreen.getNavigator().getParams("goodbye"))
    {
      clearFrontView()
      setTimeout(()=>Notice.info(`A bientot !!`), 1000)
    }

    RemoteAuthentication.waitFor(['pingServer()'], responses=>{
      this.setState({ready: true})
      if(responses[0].code != 200)
      {
        Notice.danger({title: "Alèrte système", body: responses[0].message}, { name: responses[0].message })
        if(responses[0].code == 500)
        { //automatic logout
          RemoteAuthentication.logOut()
          GLOB.system_reject = true
        }
      }

      if(User.getMaster().id && responses[0].code != 500)
      {
        this.goToHome()
        setTimeout(()=>{ this.hideSplash() }, 1000)
      }
      else
      {
        this.hideSplash()
      }
    })
  }

  hideSplash(){
    SplashScreen.hide()

    setTimeout(()=>{
      try{
        this.refs.animated_logo.start(()=>{
          this.refs.animated_copyright.start()
        })
      }catch(e){}
    }, 700)
  }

  dismissLoader(message){
    Notice.alert("Erreur connexion", message)
    this.setState({loading: false})
  }

  handleOrientation(orientation){
    this.setState({orientation: orientation}) // exemple use of Orientation changing
  }

  goToHome(){
    Master = realmToJson(User.getMaster())
    RemoteAuthentication.getParameters()

    try{
      this.refs.animated_copyright.leave(()=>{
        this.refs.animated_logo.leave(()=>{
          CurrentScreen.dismissTo('Home', { welcome: true })
        })
      })
    }
    catch(e){
      CurrentScreen.dismissTo('Home', { welcome: true })
    }
  }

  handleLogin(text){
    GLOB.login = text
  }

  handlePass(text){
    GLOB.password = text
  }

  handleSubmit(){
    this.setState({loading: true})
    if(GLOB.password != "" && GLOB.login != "")
    {
      const params = { user_login: {login: GLOB.login, password: GLOB.password} }
      RemoteAuthentication.logIn(params).then(r => this.goToHome()).catch(e => this.dismissLoader(e.message))
    }
    else
    {
      this.goToHome()
    }
  }

  submitForm(){
    if(!GLOB.system_reject)
    {
      if(GLOB.login == "" || GLOB.password == "")
      {
        Notice.alert("Erreur connexion", "Login / Mot de passe incorrect!")
      }
      else
      {
        this.handleSubmit()
      }
    }
    else
    {
      Notice.danger({title: "Erreur système", body: "Veuillez mettre à jour votre application. Merci"})
    }
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      container:{
                  flex:1,
                  flexDirection:'column',
                  justifyContent:'flex-start',
                  paddingHorizontal:3,
                  marginHorizontal:20,

                  elevation: 7, //Android Shadow
                    
                  shadowColor: '#000',                  //===
                  shadowOffset: {width: 0, height: 2},  //=== iOs shadow    
                  shadowOpacity: 0.8,                   //===
                  shadowRadius: 2,                      //===
                },
      textCharging: {
                      fontSize:10,
                      color:'#6D071A',
                      textAlign:'center',
                      flex:1
                    },
      form: {
              flex:1,
              flexDirection:'column',
              justifyContent:'center',
              alignItems:'flex-end',
              marginBottom:10,
              marginHorizontal:15,
            },
      boxInput: {
                  flex:1,
                  flexDirection:'row',
                  alignItems:'center',
                  maxHeight:50,
                },
      inputs: {
                flex:1,
                height:40,
                marginLeft:5
              },
      submit: {
                flex:0,
                paddingVertical:6,
                paddingHorizontal:10,
                marginVertical:15,
                alignSelf:'center'
              }
    })

    // Exemple orientation Styles
    // this.ORstyle = []
    // this.ORstyle["landscape"] = {
    //                               background: {backgroundColor: '#000'}
    //                             }
    // this.ORstyle["portrait"] =  {
    //                               background: {backgroundColor: '#f00'}
    //                             }
    // [VIEW] : <View style={[this.styles.container, this.ORstyle[this.state.orientation].background]}>
  }

  actionLogin(){
    this.refs.inputLogin.openKeyboard()
  }

  actionPassword(){
    this.refs.inputPassword.openKeyboard()
  }

  render() {
    return (
      <Screen style={[{flex:1}, Theme.body]}
              navigation={this.props.navigation}
              name='Login'
              noFCM={true}
              onChangeOrientation={(orientation)=>this.handleOrientation(orientation)}
              noHeader={true}
              >
        <View style={{flex:1, elevation:0}}>{/*For fixing bug Android elevation notification*/}
          <View style={[this.styles.container, Theme.container]}>   
            <AnimatedBox ref='animated_logo' type='DownSlide' startOnLoad={false} hideTillStart={true} durationIn={300} durationOut={300} style={{flex: 0,flexDirection: 'row',alignItems: 'center',paddingVertical: 10,marginTop: 3,backgroundColor: 'rgba(13,13,13,0.3)'}}>
              <XImage style={{flex:0, width: '100%', height:40}} source={{uri:"logo"}} />
            </AnimatedBox>
            {
              !this.state.ready && <XText style={this.styles.textCharging}>Communication au serveur en cours ..., Veuillez patienter svp</XText>
            }
            {this.state.ready && 
              <View style={this.styles.form}>
                <View style={this.styles.boxInput}>
                  <XTextInput ref="inputLogin"
                              editable={!this.state.loading}
                              autoCorrect={false}
                              selectTextOnFocus={true}
                              CStyle={this.styles.inputs}
                              TStyle={{color: '#FFF'}}
                              placeholder="Identifiant (Email | Code)"
                              keyboardType="email-address"
                              next={{action: this.actionPassword}}
                              returnKeyType='next'
                              onSubmitEditing={this.actionPassword}
                              RImage={{icon: "user"}}
                              IOptions={{color: '#FFF'}}
                              onChangeText={(text) => this.handleLogin(text)}/>
                </View>
                <View style={this.styles.boxInput}>
                  <XTextInput ref="inputPassword"
                              editable={!this.state.loading}
                              autoCorrect={false} 
                              selectTextOnFocus={true}
                              secureTextEntry={true} 
                              CStyle={this.styles.inputs}
                              TStyle={{color: '#FFF'}}
                              returnKeyType='go'
                              onSubmitEditing={this.submitForm}
                              placeholder="Mot de passe"
                              next={{title: "Connexion", action: this.submitForm}}
                              previous={{action: this.actionLogin}}
                              RImage={{icon: "lock"}}
                              IOptions={{color: '#FFF'}}
                              onChangeText={(text) => this.handlePass(text)}/>
                </View>
                {!this.state.loading && <SimpleButton onPress={() => this.submitForm()} CStyle={[this.styles.submit, Theme.primary_button.shape]} TStyle={Theme.primary_button.text} title="Connexion" />}
                {this.state.loading && <View style={{flex:0, marginTop:15, alignSelf:"center"}}><XImage loader={true} width={40} height={40} /></View>}
              </View>
            }
          </View>
        </View>
        <View style={{flex:0, position:'absolute', bottom: 0, right: 0, width: '40%'}}>
          <AnimatedBox ref='animated_copyright' type='RightSlide' startOnLoad={false} hideTillStart={true} durationIn={300} durationOut={300} style={{flex:1, flexDirection:'column', justifyContent: 'center', alignItems:'center', padding: 2, backgroundColor: '#4C5A65', borderTopLeftRadius: 5}}>
            <XText style={{flex:1, textAlign: 'center', fontSize: 10, color: '#FFF'}}>IDOCUS © Copyright {Config.cp_year.toString()}</XText>
             { Config.server != 'production' && <XText style={{flex:1, textAlign: 'center', fontSize: 10, color: '#FFF'}}>Host: {Config.http_host.toString()}</XText> }
          </AnimatedBox>
        </View>
      </Screen>
    )
  }
}

export default LoginScreen
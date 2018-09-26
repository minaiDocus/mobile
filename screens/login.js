import React, { Component } from 'react'
import SplashScreen from 'react-native-splash-screen'
import { StyleSheet, TextInput, View, ScrollView, Modal } from 'react-native'

import { Screen, XImage, XText, XTextInput, Navigator, SimpleButton } from '../components'

import { User } from '../models'

import { RemoteAuthentication, UsersFetcher } from '../requests'

let GLOB = {navigation: {}, login: '', password: '', system_reject: false}

class LoginScreen extends Component {
  static navigationOptions = {header: null}

  constructor(props){
    super(props)

    GLOB.navigation = new Navigator(this.props.navigation)

    GLOB.login = GLOB.password = ""
    this.state = {loading: false, focusInput: false, ready: false, orientation: 'portrait'}

    this.goToHome = this.goToHome.bind(this)
    this.actionLogin = this.actionLogin.bind(this)
    this.actionPassword = this.actionPassword.bind(this)
    this.dismissLoader = this.dismissLoader.bind(this)
    this.focusInput = this.focusInput.bind(this)
    this.leaveFocusInput = this.leaveFocusInput.bind(this)
    this.submitForm = this.submitForm.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    
    this.generateStyles() //style generation
  }
  
  componentDidMount(){
    if(GLOB.navigation.getParams("goodbye"))
    {
      clearFrontView()
      setTimeout(()=>Notice.info(`A bientot !!`), 1000)
    }

    RemoteAuthentication.waitFor(['pingServer()']).then(responses=>{
      this.setState({ready: true})
      if(responses[0].code != 200)
      {
        Notice.danger({title: "Alèrte système", body: responses[0].message}, true, responses[0].message)
        if(responses[0].code == 500)
        { //automatic logout
          RemoteAuthentication.logOut()
          GLOB.system_reject = true
        }
      }
      
      const user = User.getMaster()
      SplashScreen.hide()
      if(user.id && responses[0].code != 500)
      {
        this.goToHome()
      }
    })
  }

  componentWillUnmount(){
    GLOB.navigation.screenClose()
  }

  dismissLoader(message){
    Notice.alert("Erreur connexion", message)
    this.setState({loading: false})
  }

  handleOrientation(orientation){
    this.setState({orientation: orientation}) // exemple use of Orientation changing
  }

  goToHome(){
    GLOB.navigation.dismissTo('Home', {welcome: true})
  }

  handleLogin(text){
    GLOB.login = text
  }

  handlePass(text){
    GLOB.password = text
  }

  focusInput(){
    this.setState({focusInput: true})
  }

  leaveFocusInput(){
    this.setState({focusInput: false})
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
                  paddingHorizontal:20,
                  marginHorizontal:20,
                  backgroundColor:'#FFF',

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
      icons:{
              flex:0,
              width:20,
              height:20,
            },
      inputs: {
                flex:1,
                height:40,
                marginLeft:5
              },
      submit: {
                flex:0,
                paddingVertical:9,
                paddingHorizontal:30,
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
      <Screen style={{flex:1}}
              navigation={GLOB.navigation}
              onChangeOrientation={(orientation)=>this.handleOrientation(orientation)}
              >
        <View style={{flex:1, elevation:0}}>{/*For fixing bug Android elevation notification*/}
          <View style={this.styles.container}>   
            { this.state.focusInput == false && 
              <View style={{flex:1,flexDirection:'row',alignItems:'center'}}>
                <XImage style={{flex:1, height:100}} source={{uri:"charge"}} />
              </View>
            }
            {
              !this.state.ready && <XText style={this.styles.textCharging}>Communication au serveur en cours ..., Veuillez patienter svp</XText>
            }
            {this.state.ready && 
              <View style={this.styles.form}>
                <View style={this.styles.boxInput}>
                  <XImage style={this.styles.icons} source={{uri:"userpic"}} />
                  <XTextInput ref="inputLogin"
                              editable={!this.state.loading}
                              onFocus={this.focusInput} 
                              onBlur={this.leaveFocusInput}
                              autoCorrect={false}
                              selectTextOnFocus={true}
                              PStyle={this.styles.inputs} 
                              placeholder="Identifiant (Email)"
                              keyboardType="email-address"
                              next={{action: this.actionPassword}} 
                              onChangeText={(text) => this.handleLogin(text)}/>
                </View>
                <View style={this.styles.boxInput}>
                  <XImage style={this.styles.icons} source={{uri:"cadenas"}} />
                  <XTextInput ref="inputPassword"
                              editable={!this.state.loading}
                              onFocus={this.focusInput} 
                              onBlur={this.leaveFocusInput} 
                              autoCorrect={false} 
                              selectTextOnFocus={true}
                              secureTextEntry={true} 
                              PStyle={this.styles.inputs} 
                              placeholder="Mot de passe"
                              next={{title: "Connexion", action: this.submitForm}}
                              previous={{action: this.actionLogin}} 
                              onChangeText={(text) => this.handlePass(text)}/>
                </View>
                {!this.state.loading && <SimpleButton onPress={() => this.submitForm()} Pstyle={this.styles.submit} Tstyle={{fontSize:18}} title="Connexion" />}
                {this.state.loading && <View style={{flex:0, marginTop:15, alignSelf:"center"}}><XImage loader={true} width={40} height={40} /></View>}
              </View>
            }
          </View>
        </View>
      </Screen>
    )
  }
}

export default LoginScreen
import React, { Component } from 'react'
import SplashScreen from 'react-native-splash-screen'
import { StyleSheet, Text, TextInput, View, ScrollView, Modal} from 'react-native'

import {Screen,XImage,XTextInput,Navigator,SimpleButton} from '../components'

import {User} from '../models'

import {RemoteAuthentication,UsersFetcher} from '../requests'

let GLOB = {navigation: {}, login: '', password: '', system_reject: false}

function goToHome(){
  UsersFetcher.waitFor(
    ['refreshCustomers()', 'refreshOrganizations()'],
    (responses)=>{
      responses.map(r=>{if(r!=true)Notice.danger(r, true, r)})
      SplashScreen.hide()
      GLOB.navigation.dismissTo('Home', {welcome: true})
  })
}

class ModalLoader extends Component{
  constructor(props){
    super(props)
    this.message = ""

    this.generateStyles() //style generation
  }

  componentDidMount(){
    if(GLOB.password != "" && GLOB.login != "")
    {
      const params = { user_login: {login: GLOB.login, password: GLOB.password} }
      RemoteAuthentication.logIn(params, (type, message) => {
        if(type=='error'){this.props.dismiss(message)}
        if(type=='success'){goToHome()}
      })
    }
    else
    {
      goToHome()
    }
  }

  generateStyles(){
    this.styles = {container: {
                                flex:1,
                                backgroundColor:"rgba(255,255,255,0.7)",
                                flexDirection:'row',
                                alignItems:'center',
                                justifyContent:'center'
                               }
                  }
  }

  render(){
    return <Modal transparent={true}
             animationType="fade" 
             visible={true}
             supportedOrientations={['portrait', 'landscape']}
             onRequestClose={()=>{}}
          >
            <View style={this.styles.container}>
              <XImage loader={true} width={90} height={90} />
            </View>
          </Modal>
  }
}

class LoginScreen extends Component {
  static navigationOptions = {header: null}

  constructor(props){
    super(props)

    GLOB.navigation = new Navigator(this.props.navigation)

    GLOB.login = GLOB.password = ""
    this.state = {loading: false, focusInput: false, ready: false, orientation: 'portrait'}

    this.actionLogin = this.actionLogin.bind(this)
    this.actionPassword = this.actionPassword.bind(this)
    this.dismissLoader = this.dismissLoader.bind(this)
    this.focusInput = this.focusInput.bind(this)
    this.leaveFocusInput = this.leaveFocusInput.bind(this)
    this.submitForm = this.submitForm.bind(this)
    
    this.generateStyles() //style generation
  }
  
  componentDidMount(){
    if(GLOB.navigation.getParams("goodbye"))
    {
      setTimeout(()=>Notice.info(`A bientot !!`), 1000)
    }

    RemoteAuthentication.waitFor(
      [`pingServer("${Config.version}", "${Config.platform}")`],
      (responses)=>{
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
        if(user.id && responses[0].code != 500)
        {
          this.setState({loading: true})
        }
        else
        {
          SplashScreen.hide()
        }
      })
  }

  componentWillUnmount(){
    GLOB.navigation.screenClose()
  }

  dismissLoader(message){
    setTimeout(()=>{Notice.alert("Erreur connexion", message)}, 1000)
    this.setState({loading: false})
  }

  handleOrientation(orientation){
    this.setState({orientation: orientation}) // exemple use of Orientation changing
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

  submitForm(){
    if(!GLOB.system_reject)
    {
      if(GLOB.login == "" || GLOB.password == "")
      {
        Notice.alert("Erreur connexion", "Login / Mot de passe incorrect!")
      }
      else
      {
        this.setState({loading: true})
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
            { this.state.loading && <ModalLoader dismiss={this.dismissLoader}/> }
            { this.state.focusInput == false && 
              <View style={{flex:1,flexDirection:'row',alignItems:'center'}}>
                <XImage style={{flex:1, height:100}} source={{uri:"charge"}} />
              </View>
            }
            {
              !this.state.ready && <Text style={this.styles.textCharging}>Communication au serveur en cours ..., Veuillez patienter svp</Text>
            }
            {this.state.ready && 
              <View style={this.styles.form}>
                <View style={this.styles.boxInput}>
                  <XImage style={this.styles.icons} source={{uri:"userpic"}} />
                  <XTextInput ref="inputLogin"
                              onFocus={this.focusInput} 
                              onBlur={this.leaveFocusInput}
                              autoCorrect={false}
                              PStyle={this.styles.inputs} 
                              placeholder="Identifiant (Email)"
                              keyboardType="email-address"
                              next={{action: this.actionPassword}} 
                              onChangeText={(text) => this.handleLogin(text)}/>
                </View>
                <View style={this.styles.boxInput}>
                  <XImage style={this.styles.icons} source={{uri:"cadenas"}} />
                  <XTextInput ref="inputPassword"
                              onFocus={this.focusInput} 
                              onBlur={this.leaveFocusInput} 
                              autoCorrect={false} 
                              secureTextEntry={true} 
                              PStyle={this.styles.inputs} 
                              placeholder="Mot de passe"
                              next={{title: "Connexion", action: this.submitForm}}
                              previous={{action: this.actionLogin}} 
                              onChangeText={(text) => this.handlePass(text)}/>
                </View>
                <SimpleButton onPress={() => this.submitForm()} Pstyle={this.styles.submit} Tstyle={{fontSize:18}} title="Connexion" />
              </View>
            }
          </View>
        </View>
      </Screen>
    )
  }
}

export default LoginScreen
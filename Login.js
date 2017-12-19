import React, { Component } from 'react'
import Config from './Config'
import Screen from './components/screen'
import { StyleSheet, Text, TextInput, View, ScrollView, Modal} from 'react-native'
import {XImage, XTextInput} from './components/XComponents'
import Navigator from './components/navigator'
import {SimpleButton} from './components/buttons'
import Fetcher from './components/dataFetcher'
import SplashScreen from 'react-native-splash-screen'
import User from './models/User'

var GLOB = {navigation: {}, login: '', password: ''}

function goToHome(){
  Fetcher.wait_for(
    ['refreshCustomers()', 'refreshPacks()'],
    (responses)=>{
      
      responses.map(r=>{if(r!=true)Notice.info(r)})

      SplashScreen.hide()
      
      GLOB.navigation.dismissTo('Home', {welcome: true})
  })
}

class ModalLoader extends Component{
  constructor(props){
    super(props)
    this.message = ""
  }

  componentDidMount(){
    if(GLOB.password != "" && GLOB.login != "")
    {
      // GLOB.login = "luc@idocus.com"
      // GLOB.password = "1234567"
      const params = { user_login: {login: GLOB.login, password: GLOB.password} }
      Fetcher.remoteAUTH(params, (type, message) => {
        if(type=='error'){this.props.dismiss(message)}
        if(type=='success'){goToHome()}
      })
    }
    else
    {
      goToHome()
    }
  }

  render(){
    const styles = StyleSheet.create({
      container:{
        flex:1,
        backgroundColor:"rgba(255,255,255,0.7)",
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center'
      }
    });
    return <Modal transparent={true}
             animationType="fade" 
             visible={true}
             onRequestClose={()=>{}}
          >
            <View style={styles.container}>
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
    this.state = {loading: false, focusInput: false}
    this.dismissLoader = this.dismissLoader.bind(this)
    this.focusInput = this.focusInput.bind(this)
    this.leaveFocusInput = this.leaveFocusInput.bind(this)
    this.submitForm = this.submitForm.bind(this)
  }
  
  componentDidMount(){
    if(GLOB.navigation.getParams("goodbye"))
    {
      setTimeout(()=>Notice.info(`A bientot !!`), 1000)
    }
    
    Fetcher.wait_for(
      ['ping_server()'],
      (responses)=>{
        if(responses[0] != "Ping success!")
        {
          Notice.danger(responses[0])
        }
        const user = User.getMaster()
        if(user.id)
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
    if(GLOB.login == "" || GLOB.password == "")
    {
      Notice.alert("Erreur connexion", "Login / Mot de passe incorrect!")
    }
    else
    {
      this.setState({loading: true})
    }
  }

  render() {
    return (
      <Screen style={{flex:1}}
              navigation={GLOB.navigation}>
        <View style={styles.container}>   
          {this.state.loading && <ModalLoader dismiss={this.dismissLoader}/>}
          { this.state.focusInput == false && 
            <View style={{flex:1,flexDirection:'row',alignItems:'center'}}>
              <XImage style={styles.logo} source={{uri:"charge"}} />
            </View>
          }
          <View style={styles.form}>
            <View style={styles.boxInput}>
              <XImage style={styles.icons} source={{uri:"userpic"}} />
              <XTextInput onFocus={this.focusInput} onBlur={this.leaveFocusInput} style={styles.inputs} placeholder="Identifiant(E-mail)" onChangeText={(text) => this.handleLogin(text)} autoCorrect={false}/>
            </View>
            <View style={styles.boxInput}>
              <XImage style={styles.icons} source={{uri:"cadenas"}} />
              <XTextInput onFocus={this.focusInput} onBlur={this.leaveFocusInput} autoCorrect={false} secureTextEntry={true} style={styles.inputs} placeholder="Mot de passe" onChangeText={(text) => this.handlePass(text)}/>
            </View>
            <SimpleButton onPress={() => this.submitForm()} Pstyle={styles.submit} Tstyle={{fontSize:18}} title="Connexion" />
          </View>
        </View>
      </Screen>
    );
  }
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    flexDirection:'column',
    paddingHorizontal:20,
    marginHorizontal:20,
    backgroundColor:'#FFF'
  },
  logo: {
    flex:1,
    height:100,
  },
  form:{
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
    flex:1,
    height:20,
  },
  inputs:{
    flex:6,
  },
  submit: {
    flex:0,
    paddingVertical:9,
    paddingHorizontal:30,
    marginVertical:15,
    alignSelf:'center'
  }

})

export default LoginScreen
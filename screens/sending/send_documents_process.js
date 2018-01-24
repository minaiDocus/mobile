import React, { Component } from 'react'
import Config from '../../Config'
import Screen from '../../components/screen'
import Navigator from '../../components/navigator';
import {StyleSheet,Text,View,ScrollView,ListView,TouchableOpacity,Picker} from 'react-native'
import {XImage} from '../../components/XComponents'
import { NavigationActions } from 'react-navigation'
import * as Progress from 'react-native-progress';
import {SimpleButton} from '../../components/buttons'
import SelectInput from '../../components/select'
import User from '../../models/User'
import { EventRegister } from 'react-native-event-listeners'
import UploderFiles from '../../components/uploader'
import RealmControl from '../../components/realmControl'

import Cfetcher from '../../components/dataFetcher'
import request1 from "../../requests/file_uploader"

let Fetcher = new Cfetcher(request1)
let GLOB = {navigation:{}, dataList:[], customer: '', period: '', journal: '', file_upload_params: [], imagesSent: []}

const styles = StyleSheet.create({
  minicontainer:{
    flex:0, 
    flexDirection:'row',
    backgroundColor:'#E1E2DD'
  },
  button: {
    flex:1,
    margin:10
  }
});

function loadData(){
  if(typeof(GLOB.dataList) !== "undefined" && GLOB.dataList.length > 0)
  {
    const auth_token = User.getMaster().auth_token
    const file_code = User.find(`id_idocus = ${GLOB.customer}`)[0].code

    let nothingToSend = true
    let alreadySent = false
    let dataSave = []
    let img_sent = null
    
    const form = new FormData()
    
    form.append('auth_token', auth_token)
    form.append('file_code', file_code)
    form.append('file_account_book_type', GLOB.journal)
    form.append('file_prev_period_offset', GLOB.period)

    GLOB.dataList.forEach((doc) => {
      const path = doc.path.toString()
      const name = path.split("/").slice(-1)[0]
      const filename = doc.filename.toString()

      if(!inListImages(filename))
      {
        try{
          img_sent = GLOB.imagesSent.filtered(`id = "${filename}"`)[0] || null
        }catch(e){img_sent = null}

        if(typeof(img_sent) !== "undefined" && img_sent != null && img_sent != "")
        {
          alreadySent = true
        }
        else
        {
          nothingToSend = false

          form.append('files[]', {
            uri: path,
            type: doc.mime.toString(), // or photo.type
            name: name
          });
          

          dataSave = [{
            id: filename,
            path: path,
            send_at: new Date(),
            is_sent: true, 
          }]

          setListImages(dataSave, true)           
        }
      }
    });

    GLOB.dataList = []
    
    if(alreadySent)
      Notice.info({title: "Envoi", body: "Certains fichiers ont déjà été envoyés!!"})

    if(nothingToSend)
      return null
    else
      return form
  }
  else
  {
    Notice.info({title: "Erreur", body: "Aucun document à envoyer!!"})
    return null
  }
}

class ImgBox extends Component{
  constructor(props){
    super(props)
    this.generateStyles()
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      styleImg: {
          flex:0,
          width:80,
          height:80
        },
      styleContainer:{
          backgroundColor:'#fff',
          borderRadius:5,
          marginVertical:10,
          marginHorizontal:5,
          width:86,
          height:86,
          justifyContent:'center',
          alignItems:'center',
      },
    });
  }

  render(){
    return  <View style={{flex:0}}>
              <XImage type='container' PStyle={this.styles.styleContainer} style={this.styles.styleImg} local={false} source={this.props.source} />
            </View>
  }
}

class Header extends Component{
  constructor(props){
    super(props)
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    this.state = { dataList: this.ds.cloneWithRows(GLOB.dataList), }
  }

  render(){
    const dataList = this.state.dataList;
    return  <View style={styles.minicontainer}>
              <ScrollView style={{flex:1}}>
                <ListView horizontal={true}
                          contentContainerStyle={{flex:0,flexDirection:'row'}}
                          dataSource={dataList}
                          renderRow={(img) => <ImgBox source={ {uri: img.path.toString()} } /> } />
              </ScrollView>
            </View>
  }
}


class Body extends Component{
  constructor(props){
    super(props)

    this.state = {ready: false, journalsOptions: [], periodsOptions: []}

    this.master = User.getMaster()
    GLOB.journal = GLOB.periods = GLOB.customer = ""

    this.renderForm = this.renderForm.bind(this)
    this.renderLoading = this.renderLoading.bind(this)
    this.refreshWarning = this.refreshWarning.bind(this)

    this.generateStyles()
  }

  componentDidMount(){
    Fetcher.wait_for(
      ["refreshFormParams()"],
      (responses) => {
        if(responses[0].error)
        {
          Notice.danger(responses[0].message, true, responses[0].message)
        }
        else
        {
          users = User.find_by_list_of("code", responses[0].userList)

          this.clients = [{value:"", label:"Choisir un client"}].concat(User.create_Selection(users))
          GLOB.file_upload_params = responses[0].data

          GLOB.journal = GLOB.period = GLOB.customer = ""
        }
        this.setState({ready: true, period_start: "", period_expired: ""})
      })
  }

  refreshWarning(message){
    if(message)
    {
      this.setState({period_start: message.period, period_expired: message.date})
    }
    else
    {
      this.setState({period_start: "", period_expired: ""})
    }
  }

  async handleChangeCustomer(value){
    GLOB.journal = GLOB.period = ""
    let opt_period = []
    let opt_journal = []
    let user_code = value != ""? User.find(`id_idocus = ${value}`)[0].code : ""
    if(user_code != "" && typeof(user_code != "undefined"))
    {
      opt_journal = [].concat(GLOB.file_upload_params[user_code].journals.map((journal, index) => { return {value: journal.split(" ")[0].toString(), label: journal.toString()}}))
      opt_period = [].concat(GLOB.file_upload_params[user_code].periods.map((prd, index) => { return {value: prd[1].toString(), label: prd[0].toString()}}))
      this.refreshWarning(GLOB.file_upload_params[user_code].message)
    }
    await this.setState({journalsOptions: opt_journal, periodsOptions: opt_period})
    if(opt_journal.length > 0) GLOB.journal = opt_journal[0].value || ""
    if(opt_period.length > 0) GLOB.period =  opt_period[0].value || ""
    GLOB.customer = value.toString()
  }

  handleChangeJournal(value){
    GLOB.journal = value.toString()
  }

  handleChangePeriod(value){
    GLOB.period = value.toString()
  }

  generateStyles(){
    this.styles = StyleSheet.create({
        container:{
          flex:1,
          flexDirection:'column',
          borderRadius:10,
         
          elevation: 7, //Android shadow

          shadowColor: '#000',                  //===
          shadowOffset: {width: 0, height: 2},  //=== iOs shadow    
          shadowOpacity: 0.8,                   //===
          shadowRadius: 2,                      //===
          
          backgroundColor:"#E9E9E7",
          margin:10,
          paddingHorizontal:20,
          paddingVertical:10
        },
        textBody:{
          flex:0,
          textAlign:'center',
          fontSize:16,
          fontWeight:'bold'
        },
        inputs:{
          flex: 1,
          marginVertical:5,
          paddingHorizontal:10,
          fontSize:16,
        },
        select:{
          flex:0,
          height:40,
          borderColor:'#909090',
          marginVertical:5
        },
        progressBar:{
          marginVertical:15,
        },
        warning:{
          marginVertical:5,
          backgroundColor:'#F89744',
          padding:5,
        },
        warntitle:{
          fontWeight:"bold",
          fontSize:16,
          color:'#fff',
          borderBottomWidth:1,
          borderColor:'#fff',
          marginBottom:5
        }
    })
  }

  renderForm(){
  const valueProgress = this.props.progress
  const colorBar = (valueProgress < 1)? "blue" : "#C0D838"

  return  <View style={{flex:1}}>
            {this.clients && <SelectInput textInfo='Clients' filterSearch={true} dataOptions={this.clients} Pstyle={this.styles.select} style={{color:'#707070'}} onChange={(value)=>this.handleChangeCustomer(value)}/>}
            <SelectInput textInfo='Journal comptable' dataOptions={this.state.journalsOptions} Pstyle={this.styles.select} style={{color:'#707070'}} onChange={(value)=>this.handleChangeJournal(value)}/>
            <SelectInput textInfo='Période comptable' dataOptions={this.state.periodsOptions} Pstyle={this.styles.select} style={{color:'#707070'}} onChange={(value)=>this.handleChangePeriod(value)}/>
            {this.state.period_start != "" && 
              <View style={this.styles.warning}>
                <Text style={this.styles.warntitle} >
                  Attention :
                </Text>
                <Text>
                  Pour des raisons de clôture de période comptable,
                  vous ne pouvez plus affecter de documents à la période {this.state.period_start + " "}
                  après le {this.state.period_expired}.
                </Text>
              </View>
            }

            {valueProgress > 0 &&
              <View style={this.styles.progressBar}>
                <Progress.Bar progress={valueProgress} width={null} height={10} color={colorBar} unfilledColor={"#fff"} borderColor={"#909090"} borderWidth={2} />
                <Text style={{flex:1, textAlign:'center', color:colorBar}}>{(valueProgress < 1)? "Téléversement en cours ..." : "Téléversement terminé"}</Text>
              </View>
            }
          </View>
  }

  renderLoading(){
    return <XImage loader={true} style={{flex:1, width:60, height:60, alignSelf:'center'}} />
  }

  render(){
    return  <View style={{flex:1, padding:3}}>
              <Text style={this.styles.textBody}>{GLOB.dataList.length} : Document(s)</Text>
              <View style={this.styles.container}>
                {this.state.ready && this.renderForm()}
                {!this.state.ready && this.renderLoading()}
              </View>
            </View>
  }
}

class Footer extends Component{
  constructor(props){
    super(props)
    this.state = {sending: false}
  }

  sendingDocs(){
    const call = ()=> {
                        if(GLOB.period != "" && GLOB.journal != "" && GLOB.customer != "")
                        {
                          this.setState({sending: true})
                          CronTask.addTask(UploderFiles)
                          CronTask.task.launchUpload(loadData())
                        }
                        else
                        {
                          Notice.danger({title: "Erreur formulaire", body: "Veuillez renseigner correctement les champs avant l'envoi"}, true, "form_error")
                        }
                      }
    actionLocker(call)
  }

  leaveScreen(){
    GLOB.navigation.goBack();
  }

  render(){
    return  <View style={styles.minicontainer}>
              <SimpleButton Pstyle={styles.button} onPress={()=>{this.leaveScreen()}} title="<< Precedent" />
              {this.state.sending == false && this.props.sending == false && <SimpleButton Pstyle={styles.button} onPress={()=>{this.sendingDocs()}} title="Envoyer" />}
            </View>
  }
}

class SendScreen extends Component {
  static navigationOptions = {headerTitle: 'Envoi documents',}

  constructor(props){
    super(props)
    GLOB.navigation = new Navigator(this.props.navigation)
    GLOB.dataList = GLOB.navigation.getParams('images')
    GLOB.customer = ''
    GLOB.period = ''
    GLOB.journal = ''
    GLOB.file_upload_params = []
    GLOB.imagesSent = RealmControl.get_temp_realm("imagesSent")

    setListImages([]) //Initialize list images beeing send

    this.state = {progress: 0, sending: false}

    this.uploadProgress = this.uploadProgress.bind(this)
    this.uploadComplete = this.uploadComplete.bind(this)
    this.uploadError = this.uploadError.bind(this)
  }

  componentWillMount(){
    //add Listener for Uploading Files
    EventRegister.on('progressUploadFile', this.uploadProgress)
    EventRegister.on('completeUploadFile', this.uploadComplete)
    EventRegister.on('errorUploadFile', this.uploadError)
  }

  componentWillUnmount(){
    GLOB.navigation.screenClose()

    //remove Listener for Uploading Files
    EventRegister.rm('progressUploadFile')
    EventRegister.rm('completeUploadFile')
    EventRegister.rm('errorUploadFile')
  }

  uploadProgress(progressEvent){
    if(this.refs._baseScroll)
    {
      let progress = progressEvent.loaded / progressEvent.total
      if(progress >= 1){progress = 0.99}

      this.refs._baseScroll.scrollToEnd({animated: true})
      this.setState({progress: progress, sending: true})
    }
  }

  uploadComplete(result){
    if(this.refs._baseScroll)
    {
      //handle complete
      if(result.error)
      {//handle error from Complete
        this.uploadError(result)
      }
      this.refs._baseScroll.scrollToEnd({animated: true})
      this.setState({progress: 1})
    }
  }

  uploadError(result){
    try{
      Notice.danger({title:"Erreur envoi", body: result.message}, true, result.message)
    }catch(e){
      Notice.danger({title:"Erreur envoi", body: "Une erreur s'est produite lors de l'envoi de document!!!"}, true, "erreur_upload")
    }
  }

  render() {
      return  <Screen style={{flex: 1, flexDirection: 'column'}}
                      navigation={GLOB.navigation}>
                <Header />
                <ScrollView ref="_baseScroll" style={{flex:1, flexDirection:'column'}}>
                  <Body progress={this.state.progress} />
                </ScrollView>
                <Footer sending={this.state.sending} />
              </Screen>
    }
}

export default SendScreen;
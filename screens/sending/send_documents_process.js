import React, { Component } from 'react'
import { StyleSheet, View, ScrollView, ListView, TouchableOpacity } from 'react-native'
import { EventRegister } from 'react-native-event-listeners'
import ScrollableTabView from 'react-native-scrollable-tab-view'
import { NavigationActions } from 'react-navigation'

import { Navigator, XImage, XText, LinkButton, SimpleButton, SelectInput, XTextInput, UploderFiles, ProgressBar } from '../../components'

import { Screen } from '../layout'

import { ModalComptaAnalysis } from '../modals/compta_analytics'

import { User, Document } from '../../models'

import { FileUploader } from "../../requests"

let GLOB = {
              dataList:[],
              customer: '',
              period: '',
              journal: '',
              sending_finished: false,
              analysis: [
                          {section: '', ventilation: 0, axis1: '', axis2: '', axis3: ''},
                          {section: '', ventilation: 0, axis1: '', axis2: '', axis3: ''},
                          {section: '', ventilation: 0, axis1: '', axis2: '', axis3: ''}
                        ]
          }

function loadData(){
  if(typeof(GLOB.dataList) !== "undefined" && GLOB.dataList.length > 0)
  {
    let nothingToSend = true
    let alreadySent = false
    let img_sent = null
    
    const auth_token = User.getMaster().auth_token
    const file_code = User.find(`id_idocus = ${GLOB.customer}`)[0].code
    const form = new FormData()
    
    form.append('auth_token', auth_token)
    form.append('file_code', file_code)
    form.append('file_account_book_type', GLOB.journal)
    form.append('file_prev_period_offset', GLOB.period)
    form.append('file_compta_analysis', JSON.stringify(GLOB.analysis))

    GLOB.dataList.forEach((img) => {
      const path = img.path.toString()
      const name = img.filename || path.split("/").slice(-1)[0]
      const id_64 = img.id_64.toString()

      const doc = Document.getById(id_64)
      if( doc != null && doc.state == 'sent' )
      {
        alreadySent = true
      }
      else if (doc != null)
      {
        nothingToSend = false

        form.append('files[]', {
          uri: path,
          type: img.mime.toString(),
          name: name
        });
        
        Document.createOrUpdate(doc.id, {state: 'sending'})
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
              <XImage type='container' CStyle={this.styles.styleContainer} style={this.styles.styleImg} local={false} source={this.props.source} />
            </View>
  }
}

class Header extends Component{
  constructor(props){
    super(props)
  }

  renderItems(){
    return GLOB.dataList.map((d, k)=>{
      return <ImgBox key={k} source={{ uri: d.path.toString() }} />
    })
  }

  render(){
    return  <View style={[{flex: 0, flexDirection: 'row'}, Theme.head.shape, {padding: 0, paddingHorizontal: 1}]}>
              <ScrollView style={{flex:1}} horizontal={true}>
                <View style={{flex: 0, flexDirection: 'row'}}>
                  { this.renderItems() }
                </View>
              </ScrollView>
            </View>
  }
}

class Body extends Component{
  constructor(props){
    super(props)

    this.state = {period_start: "", period_expired: "", ready: false, paramsReady: false, journalsOptions: [], periodsOptions: [], comptaAnalysisActivated: false, analysisOpen: false, comptaAnalysisResume: false}

    this.master = User.getMaster()
    this.customers = []
    GLOB.journal = GLOB.periods = GLOB.customer = ""

    this.renderForm = this.renderForm.bind(this)
    this.renderLoading = this.renderLoading.bind(this)
    this.refreshWarning = this.refreshWarning.bind(this)
    this.toggleComptaAnalysis = this.toggleComptaAnalysis.bind(this)
    this.comptaAnalysisOnClose = this.comptaAnalysisOnClose.bind(this)

    this.generateStyles()
  }

  componentDidMount(){
    const loading = () => {
      if(User.isUpdating()){
        setTimeout(loading, 1000)
      }
      else
      {
        FileUploader.waitFor(["refreshFormUsers()"], responses => {
          if(responses[0].error)
          {
            Notice.danger(responses[0].message, { name: responses[0].message })
          }
          else
          {
            users = User.findByListOf("code", responses[0].userList)

            this.customers = [{value:"", label:"Choisir un client"}].concat(User.createSelection(users))
            GLOB.journal = GLOB.period = GLOB.customer = ""
          }
          this.setState({ready: true, paramsReady: true, period_start: "", period_expired: ""})
        })
      }
    }
    loading()
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

  toggleComptaAnalysis(toggle=true){
    this.setState({ analysisOpen: toggle, comptaAnalysisResume: ModalComptaAnalysis.exist() })
  }

  comptaAnalysisOnClose(data){
    GLOB.analysis = data
    this.toggleComptaAnalysis(false)
  }

  handleChangeCustomer(value){
    this.setState({ paramsReady: false, comptaAnalysisActivated: false, comptaAnalysisResume: false })
    GLOB.journal = GLOB.period = ""
    GLOB.analysis = ModalComptaAnalysis.reset()
    let opt_period = []
    let opt_journal = []
    let compta_analysis = false
    let message = ''

    const refreshParams = ()=>{
        this.refreshWarning(message)
        if(opt_journal.length > 0) GLOB.journal = opt_journal[0].value || ""
        if(opt_period.length > 0) GLOB.period =  opt_period[0].value || ""
        GLOB.customer = value.toString()
        this.setState({ paramsReady: true, journalsOptions: opt_journal, periodsOptions: opt_period, comptaAnalysisActivated: compta_analysis })
    }

    if(value != "")
    {
      FileUploader.waitFor([`refreshFormParams(${value})`], responses => {
        const file_upload_params = responses[0].data
        if(isPresent(file_upload_params))
        {
          opt_journal = [].concat(file_upload_params.journals.map((journal, index) => { return {value: journal.split(" ")[0].toString(), label: journal.toString()}}))
          opt_period = [].concat(file_upload_params.periods.map((prd, index) => { return {value: prd[1].toString(), label: prd[0].toString()}}))
          compta_analysis = file_upload_params.compta_analysis
          message = file_upload_params.message
        }
        refreshParams()
      })
    }
    else
    {
      refreshParams()
    }
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

  renderAnalyticResume(){
    const _analysis_resume = GLOB.analysis.map( (a, j) => {
      if(a.analysis != '')
      {
        const _references = a.references.map( (r, i) => {
          let ref = arrayCompact([r.axis1, r.axis2, r.axis3], true).join(', ')
          if(isPresent(ref))
            return  <View key={i} style={{flex:1, flexDirection:'row', paddingHorizontal:10, overflow:'hidden'}}>
                      <XText style={{flex:0, fontSize:12}}>{ref} : </XText>
                      <XText style={{flex:0, fontSize:12, fontWeight:'bold'}}>{r.ventilation} %</XText>
                    </View>
        })

        return  <View key={j} style={{flex:1, marginBottom:5}}>
                  <XText style={{flex:1, marginVertical:2, fontWeight:'bold', fontSize:14}}>
                    {a.analysis}
                  </XText>
                  {_references}
                </View>
      }
    })

    return <View style={{flex:1, backgroundColor:'#FFF', padding:5}}>
            {_analysis_resume}
           </View>
  }

  renderForm(){
  const valueProgress = this.props.progress
  const colorBar = (valueProgress < 1)? "blue" : "#C0D838"
  const analysis_message = (ModalComptaAnalysis.exist()) ? 'Compta analytique (modifier)' : 'Compta analytique (ajouter)'

  return  <View style={{flex:1}}>
            <SelectInput textInfo={`Clients (${this.customers.length - 1})`} filterSearch={true} dataOptions={this.customers} CStyle={this.styles.select} style={{color:'#707070'}} onChange={(value)=>this.handleChangeCustomer(value)}/>
            {this.state.paramsReady &&
              <View style={{flex:1}}>
                <SelectInput textInfo='Journal comptable' dataOptions={this.state.journalsOptions} CStyle={this.styles.select} style={{color:'#707070'}} onChange={(value)=>this.handleChangeJournal(value)}/>
                <SelectInput textInfo='Période comptable' dataOptions={this.state.periodsOptions} CStyle={this.styles.select} style={{color:'#707070'}} onChange={(value)=>this.handleChangePeriod(value)}/>
                {this.state.comptaAnalysisActivated && <SimpleButton CStyle={Theme.primary_button.shape} TStyle={Theme.primary_button.text} onPress={()=>{this.toggleComptaAnalysis(true)}} title={analysis_message} />}
                {this.state.comptaAnalysisActivated && this.state.comptaAnalysisResume && this.renderAnalyticResume()}
                {this.state.period_start != "" &&
                  <View style={this.styles.warning}>
                    <XText style={this.styles.warntitle} >
                      Attention :
                    </XText>
                    <XText>
                      Pour des raisons de clôture de période comptable,
                      vous ne pouvez plus affecter de documents à la période {this.state.period_start + " "}
                      après le {this.state.period_expired}.
                    </XText>
                  </View>
                }
              </View>
            }
            {!this.state.paramsReady && this.renderLoading()}
            {valueProgress > 0 &&
              <View style={this.styles.progressBar}>
                <ProgressBar progress={valueProgress} />
                <XText style={{flex:1, textAlign:'center', color:colorBar}}>{(valueProgress < 1)? "Téléversement en cours ..." : "Téléversement terminé"}</XText>
              </View>
            }
            {this.state.analysisOpen && <ModalComptaAnalysis currentScreen='file_sending' resetOnOpen={false} hide={(data)=>this.comptaAnalysisOnClose(data)} customer={GLOB.customer} journal={GLOB.journal} />}
          </View>
  }

  renderLoading(){
    return <XImage loader={true} style={{flex:1, width:40, height:40, alignSelf:'center'}} />
  }

  render(){
    return  <View style={{flex:1, padding:3}}>
              <XText style={Theme.lists.title}>{GLOB.dataList.length} : Document(s)</XText>
              <View style={[this.styles.container, Theme.lists.shape]}>
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
                          setTimeout(()=>{ new UploderFiles().launchUpload(loadData()) }, 1)
                          this.setState({sending: true})
                        }
                        else
                        {
                          Notice.danger({title: "Erreur formulaire", body: "Veuillez renseigner correctement les champs avant l'envoi"}, { name: "form_error" })
                        }
                      }
    actionLocker(call)
  }

  leaveScreen(){
    CurrentScreen.goBack({ resetSendScreen: GLOB.sending_finished })
  }

  render(){
    return  <View style={[{flex: 0, flexDirection: 'row', padding: 1, width: '100%'}, Theme.head.shape]}>
              <SimpleButton CStyle={[{flex: 1}, Theme.secondary_button.shape, {paddingVertical: 3}]} TStyle={Theme.secondary_button.text} onPress={()=>{this.leaveScreen()}} title="<< Precedent" />
              {this.state.sending == false && this.props.sending == false && <SimpleButton CStyle={[{flex: 1, marginLeft: '3%'}, Theme.secondary_button.shape, {paddingVertical: 3}]} TStyle={Theme.secondary_button.text} onPress={()=>{this.sendingDocs()}} title="Envoyer" />}
            </View>
  }
}

class SendScreen extends Component {
  constructor(props){
    super(props)

    const navigation = new Navigator(this.props.navigation)

    GLOB.dataList = navigation.getParams('images')
    GLOB.customer = ''
    GLOB.period = ''
    GLOB.journal = ''
    GLOB.sending_finished = false
    GLOB.analysis = ModalComptaAnalysis.reset()

    this.state = {progress: 0, sending: false}

    this.uploadProgress = this.uploadProgress.bind(this)
    this.uploadComplete = this.uploadComplete.bind(this)
    this.uploadError = this.uploadError.bind(this)
  }

  componentWillMount(){
    EventRegister.on('progressUploadFile', this.uploadProgress)
    EventRegister.on('completeUploadFile', this.uploadComplete)
  }

  componentWillUnmount(){
    EventRegister.rm('progressUploadFile')
    EventRegister.rm('completeUploadFile')
  }

  uploadProgress(progressEvent){
    if(this.refs._baseScroll)
      this.refs._baseScroll.scrollToEnd({animated: true})

    let progress = progressEvent.loaded / progressEvent.total
    if(progress >= 0.99){progress = 0.99}
    this.setState({progress: progress, sending: true})
  }

  uploadComplete(result){
    if(this.refs._baseScroll)
      this.refs._baseScroll.scrollToEnd({animated: true})
    this.setState({progress: 1})
    GLOB.sending_finished = true
  }

  uploadError(result){
    //Upload Errors is handled by uploader component
  }

  render() {
      return  <Screen style={{flex: 1, flexDirection: 'column'}}
                      title="Envoi documents"
                      name='Sending'
                      navigation={this.props.navigation}>
                <Header />
                <ScrollView ref="_baseScroll" style={{flex:1, flexDirection:'column'}}>
                  <Body progress={this.state.progress} />
                </ScrollView>
                <Footer sending={this.state.sending} />
              </Screen>
    }
}

export default SendScreen;
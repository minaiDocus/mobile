import React, { Component } from 'react'
import { StyleSheet, View, ListView, TouchableOpacity } from 'react-native'
import ImageResizer from 'react-native-image-resizer'

import { EventRegister } from 'react-native-event-listeners'
import ScrollableTabView from 'react-native-scrollable-tab-view'
import { NavigationActions } from 'react-navigation'

import { Navigator, XImage, XScrollView, XText, LinkButton, SimpleButton, SelectInput, XTextInput, UploderFiles, ProgressBar } from '../../components'

import { Screen } from '../layout'

import { ModalComptaAnalysis } from '../modals/compta_analytics'

import { User, Document, SendingParams } from '../../models'

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

function sendDatas(){
  let documents_count = GLOB.dataList.length

  if(typeof(GLOB.dataList) !== "undefined" && documents_count > 0)
  {
    let nothingToSend = true
    let alreadySent = false
    let img_sent = null
    
    const auth_token = Master.auth_token
    const file_code = User.find(`id_idocus = ${GLOB.customer}`)[0].code
    const form = new FormData()
    
    form.append('auth_token', auth_token)
    form.append('file_code', file_code)
    form.append('file_account_book_type', GLOB.journal)
    form.append('file_prev_period_offset', GLOB.period)
    form.append('file_compta_analysis', JSON.stringify(GLOB.analysis))

    const prepare_sending = (img, resized_path = null)=>{
      const path = resized_path || img.path.toString()
      const name = (resized_path)? path.split("/").slice(-1)[0] : (img.filename || path.split("/").slice(-1)[0])
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
          type: (resized_path)? 'image/jpeg' : img.mime.toString(),
          name: name
        });

        Document.createOrUpdate(doc.id, {state: 'sending', name: name})
      }
    }

    let iteration = 0
    GLOB.dataList.forEach(async (img) => {
      //resize image before sending if needed
      const size_limit = 3000
      if(img.width > size_limit || img.height > size_limit)
      {
        let new_path = null
        await ImageResizer.createResizedImage(img.path.toString(), size_limit, size_limit, 'JPEG', 100, 0).then(result=>{
          new_path = result.uri.toString()
        }).catch((err)=>{
          new_path = null
        })

        prepare_sending(img, new_path)
      }
      else
      {
        prepare_sending(img)
      }

      iteration += 1
    });

    const finalize_sending = ()=>{
      if(iteration >= documents_count)
      {
        iteration = -1 //for multiple sending instance security

        if(alreadySent)
          Notice.info({ title: "Envoi", body: "Certains fichiers ont déjà été envoyés!!" })

        if(!nothingToSend)
          new UploderFiles().launchUpload(form)
      }
      else if(iteration >= 0)
      {
        setTimeout(()=>{ finalize_sending() }, 100)
      }
    }
    
    finalize_sending()
  }
  else
  {
    Notice.info({title: "Erreur", body: "Aucun document à envoyer!!"})
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

    this.ORstyle = []
    this.ORstyle["landscape"] = {
                                  body: { flexDirection: 'column', width: 100 }
                                }
    this.ORstyle["portrait"] =  {
                                  body: { flexDirection: 'row' }
                                }
  }

  renderItems(){
    return GLOB.dataList.map((d, k)=>{
      return <ImgBox key={k} source={{ uri: d.path.toString() }} />
    })
  }

  render(){
    return  <View style={[{flex: 0}, Theme.head.shape, {padding: 0, paddingHorizontal: 1}, this.ORstyle[this.props.orientation].body]}>
              <XScrollView  style={{flex:1}} horizontal={(this.props.orientation == 'portrait')? true : false}>
                <View style={{flex: 0, flexDirection: this.ORstyle[this.props.orientation].body.flexDirection}}>
                  { this.renderItems() }
                </View>
              </XScrollView>
            </View>
  }
}

class Body extends Component{
  constructor(props){
    super(props)

    this.state = {period_start: "", period_expired: "", ready: false, paramsReady: false, journalsOptions: [], periodsOptions: [], comptaAnalysisActivated: false, analysisOpen: false, comptaAnalysisResume: false}

    this.customers = []

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
            this.handleChangeCustomer(GLOB.customer, true)
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

  handleChangeCustomer(value, init=false){
    if(!init){ this.setState({ paramsReady: false, comptaAnalysisActivated: false, comptaAnalysisResume: false }) }

    let opt_period = []
    let opt_journal = []
    let compta_analysis = ModalComptaAnalysis.exist()
    let message = ''

    const refreshParams = ()=>{
        this.refreshWarning(message)
        if(opt_journal.length > 0) GLOB.journal = GLOB.journal || opt_journal[0].value || ''
        if(opt_period.length > 0) GLOB.period =  GLOB.period || opt_period[0].value || ''

        GLOB.customer = value.toString()
        this.setState({ paramsReady: true, journalsOptions: opt_journal, periodsOptions: opt_period, comptaAnalysisActivated: compta_analysis, comptaAnalysisResume: ModalComptaAnalysis.exist() })
    }

    if(isPresent(value) && this.customers.find(e=>{ return e.value == value }))
    {
      if(GLOB.customer != value){
        GLOB.journal = GLOB.period = ''
        GLOB.analysis = ModalComptaAnalysis.reset()
      }

      FileUploader.waitFor([`refreshFormParams(${value})`], responses => {
        const file_upload_params = responses[0].data
        if(isPresent(file_upload_params))
        {
          opt_journal = [].concat(file_upload_params.journals.map((journal, index) => { return {value: journal.split(" ")[0].toString(), label: journal.toString()} }))
          opt_period = [].concat(file_upload_params.periods.map((prd, index) => { return {value: prd[1].toString(), label: prd[0].toString()} }))
          compta_analysis = file_upload_params.compta_analysis
          if(!compta_analysis){ GLOB.analysis = ModalComptaAnalysis.reset() }
          message = file_upload_params.message
        }
        refreshParams()
      })
    }
    else
    {
      if(init){
        GLOB.journal = GLOB.period = GLOB.customer = ''
        GLOB.analysis = ModalComptaAnalysis.reset()
      }else{
        refreshParams()
      }
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
  const analysis_message = (ModalComptaAnalysis.exist()) ? 'Compta analytique (modifier)' : 'Compta analytique (ajouter)'

  return  <View style={{flex:1}}>
            <SelectInput textInfo={`Clients (${this.customers.length - 1})`} filterSearch={true} selectedItem={GLOB.customer} dataOptions={this.customers} CStyle={this.styles.select} style={{color:'#707070'}} onChange={(value)=>this.handleChangeCustomer(value)}/>
            {this.state.paramsReady &&
              <View style={{flex:1}}>
                <SelectInput textInfo='Journal comptable' selectedItem={GLOB.journal} dataOptions={this.state.journalsOptions} CStyle={this.styles.select} style={{color:'#707070'}} onChange={(value)=>this.handleChangeJournal(value)}/>
                <SelectInput textInfo='Période comptable' selectedItem={GLOB.period} dataOptions={this.state.periodsOptions} CStyle={this.styles.select} style={{color:'#707070'}} onChange={(value)=>this.handleChangePeriod(value)}/>
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
                <XText style={{flex:1, textAlign:'center', color:'#FFF', textShadowColor:'#5f85bf', textShadowOffset:{width: 1, height: 1}, textShadowRadius:0.1}}>{(valueProgress < 1)? "Téléversement en cours ..." : "Téléversement terminé"}</XText>
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
                          setTimeout(()=>{ sendDatas() }, 1)
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
    GLOB.sending_finished = false

    this.fetchParams()

    this.state = {orientation: 'portrait', progress: 0, sending: false}

    this.ORstyle = []
    this.ORstyle["landscape"] = {
                                  body: { flexDirection: 'row' }
                                }
    this.ORstyle["portrait"] =  {
                                  body: { flexDirection: 'column' }
                                }

    this.fetchParams = this.fetchParams.bind(this)
    this.saveParams = this.saveParams.bind(this)
    this.uploadProgress = this.uploadProgress.bind(this)
    this.uploadComplete = this.uploadComplete.bind(this)
    this.uploadError = this.uploadError.bind(this)
  }

  fetchParams(){
    const params = SendingParams.getParameters()

    GLOB.customer = GLOB.customer || params.customer || ''
    GLOB.period   = GLOB.period   || params.period   || ''
    GLOB.journal  = GLOB.journal  || params.journal  || ''
    GLOB.analysis = isPresent(params.analysis) ? params.analysis : GLOB.analysis

    if(isPresent(GLOB.analysis)) ModalComptaAnalysis.set(GLOB.analysis)
  }

  saveParams(){
    SendingParams.setParameters({customer: GLOB.customer, period: GLOB.period, journal: GLOB.journal, analysis: GLOB.analysis})
  }

  handleOrientation(orientation){
    this.setState({orientation: orientation}) // exemple use of Orientation changing
  }

  UNSAFE_componentWillMount(){
    EventRegister.on('progressUploadFile', this.uploadProgress)
    EventRegister.on('completeUploadFile', this.uploadComplete)
  }

  componentWillUnmount(){
    this.saveParams()
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
                      onChangeOrientation={(orientation)=>this.handleOrientation(orientation)}
                      title="Envoi documents"
                      name='Sending'
                      navigation={this.props.navigation}>
                <View style={[{flex: 1}, this.ORstyle[this.state.orientation].body]}>
                  <Header orientation={this.state.orientation}/>
                  <View style={{flex: 1}}>
                    <XScrollView ref="_baseScroll" style={{flex:1, flexDirection:'column'}} >
                      <Body progress={this.state.progress} />
                    </XScrollView>
                    <Footer sending={this.state.sending} />
                    </View>
                </View>
              </Screen>
    }
}

export default SendScreen;
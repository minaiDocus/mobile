import React, { Component } from 'react'
import { StyleSheet, View, ScrollView, ListView, TouchableOpacity, Modal } from 'react-native'
import { EventRegister } from 'react-native-event-listeners'
import ScrollableTabView from 'react-native-scrollable-tab-view'
import { NavigationActions } from 'react-navigation'

import { Screen,Navigator,XImage,XText,LinkButton,SimpleButton,SelectInput,XTextInput,UploderFiles,ProgressBar } from '../../components'

import { User, Document } from '../../models'

import { FileUploader } from "../../requests"

let GLOB = {
              navigation:{},
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
let ANALYSIS =  {
                  sections: [],
                  axis: [
                          {axis1: {name:'', data: []}, axis2: {name:'', data: []}, axis3: {name:'', data: []}},
                          {axis1: {name:'', data: []}, axis2: {name:'', data: []}, axis3: {name:'', data: []}},
                          {axis1: {name:'', data: []}, axis2: {name:'', data: []}, axis3: {name:'', data: []}}
                        ]
                }


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
})

function totalVentilation(){
  let total_ventilation = 0
  GLOB.analysis.map(a=>{total_ventilation += parseInt(a.ventilation)})
  return total_ventilation
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

class AnalysisView extends Component{
  constructor(props){
    super(props)

    this.state = {ready: false, axis1_data: [], axis2_data: [], axis3_data: []}

    this.handleChangeSection = this.handleChangeSection.bind(this)
    this.handleChangeVentilation = this.handleChangeVentilation.bind(this)
    this.handleChangeAxis = this.handleChangeAxis.bind(this)
    this.renderAxis = this.renderAxis.bind(this)

    this.generateStyles()
  }

  componentDidMount(){
    this.setState({ready: true})
  }

  async handleChangeSection(value){
    await this.setState({ready: false})
    GLOB.analysis[this.props.index].section = value
    GLOB.analysis[this.props.index].axis1 = GLOB.analysis[this.props.index].axis2 = GLOB.analysis[this.props.index].axis3 = ''
    if(value == '') 
      this.handleChangeVentilation(0)

    this.setState({ready: true})
  }

  handleChangeVentilation(value){
    GLOB.analysis[this.props.index].ventilation = value
    EventRegister.emit("incrementVentilation", value)
  }

  handleChangeAxis(index, value){
    if(index == 0) GLOB.analysis[this.props.index].axis1 = value
    if(index == 1) GLOB.analysis[this.props.index].axis2 = value
    if(index == 2) GLOB.analysis[this.props.index].axis3 = value
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      container: {
                  flex:1,
                  flexDirection:'row',
                  alignItems:'center',
                  marginVertical:7,
                  marginHorizontal:8
                },
      input:{
              flex:1.3
            },
      label:{
              flex:1,
              fontSize:14,
              color:'#463119'
            }
    })
  }

  renderAxis(){
    const section = GLOB.analysis[this.props.index].section
    let axis1 = axis2 = axis3 = []
    if(section != undefined && section != '' && section != null)
    {
      if(ANALYSIS.axis[section].axis1 != undefined) axis1 = ANALYSIS.axis[section].axis1.data || []
      if(ANALYSIS.axis[section].axis2 != undefined) axis2 = ANALYSIS.axis[section].axis2.data || []
      if(ANALYSIS.axis[section].axis3 != undefined) axis3 = ANALYSIS.axis[section].axis3.data || []
    }

    return  <View style={{flex:1}}>
              {section != '' &&
                <View style={this.styles.container}>
                  <XText style={this.styles.label}>Ventilation</XText>
                  <XTextInput defaultValue={GLOB.analysis[this.props.index].ventilation.toString()} keyboardType='numeric' onChangeText={(value)=>{this.handleChangeVentilation(value)}} PStyle={this.styles.input} />
                </View>
              }
              {axis1.length > 0 &&
                <View style={this.styles.container}>
                  <XText style={this.styles.label}>Axe 1</XText>
                  <SelectInput textInfo={`Axe 1 (${ANALYSIS.axis[section].axis1.name})`} selectedItem={GLOB.analysis[this.props.index].axis1} dataOptions={axis1} Pstyle={this.styles.input} style={{color:'#707070'}} onChange={(value)=>this.handleChangeAxis(0, value)}/>
                </View>
              }
              {axis2.length > 0 &&
                <View style={this.styles.container}>
                  <XText style={this.styles.label}>Axe 2</XText>
                  <SelectInput textInfo={`Axe 2 (${ANALYSIS.axis[section].axis2.name})`} selectedItem={GLOB.analysis[this.props.index].axis2} dataOptions={axis2} Pstyle={this.styles.input} style={{color:'#707070'}} onChange={(value)=>this.handleChangeAxis(1, value)}/>
                </View>
              }
              {axis3.length > 0 &&
                <View style={this.styles.container}>
                  <XText style={this.styles.label}>Axe 3</XText>
                  <SelectInput textInfo={`Axe 3 (${ANALYSIS.axis[section].axis3.name})`} selectedItem={GLOB.analysis[this.props.index].axis3} dataOptions={axis3} Pstyle={this.styles.input} style={{color:'#707070'}} onChange={(value)=>this.handleChangeAxis(2, value)}/>
                </View>
              }
            </View>
  }

  render(){
    return  <ScrollView style={{flex:1}}>
              <View style={this.styles.container}>
                <XText style={this.styles.label}>Analyse</XText>
                <SelectInput textInfo='Analyse' selectedItem={GLOB.analysis[this.props.index].section} dataOptions={ANALYSIS.sections} Pstyle={this.styles.input} style={{color:'#707070'}} onChange={(value)=>this.handleChangeSection(value)}/>
              </View>
              {this.state.ready && this.renderAxis()}
            </ScrollView>
  }
}

class ModalComptaAnalysis extends Component{
  constructor(props){
    super(props)

    this.state = {index: 0, ready: false, total_ventilation: totalVentilation()}

    this.hideModal = this.hideModal.bind(this)
    this.handleIndexChange = this.handleIndexChange.bind(this)
    this.incrementVentilation = this.incrementVentilation.bind(this)

    this.generateStyles()
  }

  componentWillMount(){
    EventRegister.on("incrementVentilation", (value)=>{ this.incrementVentilation(value) })
  }

  componentWillUnmount(){
    EventRegister.rm("incrementVentilation")
  }

  componentDidMount(){
    if(GLOB.customer != '' && GLOB.customer != null && GLOB.customer != undefined)
    {
      FileUploader.waitFor([`getComptaAnalytics(${GLOB.customer})`], responses => {
        if(responses[0].error)
          this.setAnalytics([])
        else
          this.setAnalytics((responses[0].data)? JSON.parse(responses[0].data) : "")
        this.setState({ready: true})
      })
    }
    else
    {
      this.setAnalytics([])
      this.setState({ready: true})
    }
  }

  incrementVentilation(value){
    this.setState({total_ventilation: totalVentilation()})
  }

  setAnalytics(data){
    if(data.length == 0)
    {
      ANALYSIS =  {
                    sections: [],
                    axis: []
                  }
    }
    else
    {
      ANALYSIS.sections = [{label: 'Selectionnez une analyse', value: ''}]
      data.map((section, index)=>{
        ANALYSIS.sections = ANALYSIS.sections.concat([{label: section.name, value: section.name}])
        if(section.axis1 != null && section.axis1 != undefined && section.axis1 != '')
        {
          ANALYSIS.axis[section.name] = {
                                          axis1:  {
                                                    name: section.axis1.name,
                                                    data: [{label: 'Selectionnez une section', value: ''}].concat( section.axis1.sections.map(s=>{return {label: s.description, value: s.code}}) )
                                                  }
                                        }
        }
        if(section.axis2 != null && section.axis2 != undefined && section.axis2 != '')
        {
          ANALYSIS.axis[section.name] = {
                                          axis2:  {
                                                    name: section.axis2.name,
                                                    data: [{label: 'Selectionnez une section', value: ''}].concat( section.axis2.sections.map(s=>{return {label: s.description, value: s.code}}) )
                                                  }
                                        }
        }
        if(section.axis3 != null && section.axis3 != undefined && section.axis3 != '')
        {
          ANALYSIS.axis[section.name] = {
                                          axis3:  {
                                                    name: section.axis3.name,
                                                    data: [{label: 'Selectionnez une section', value: ''}].concat( section.axis3.sections.map(s=>{return {label: s.description, value: s.code}}) )
                                                  }
                                        }
        }
      })
    }
  }

  hideModal(save=false){
    if(save)
    {
      let error_message = ''
      GLOB.analysis.map((a, i)=>{
        if(a.section != '' && a.axis1 == '' && a.axis2 == '' && a.axis3 == '')
        {
          error_message = `Vous devez choisir au moin un axe pour l'analyse ${i+1}`
        }
      })
      if(this.state.total_ventilation != 100)
        error_message = "La ventilation analytique doit être égale à 100%"

      if(error_message != '')
        Notice.alert(error_message)
      else
        this.props.hide()
    }
    else
    {
        GLOB.analysis = [
                          {section: '', ventilation: 0, axis1: '', axis2: '', axis3: ''},
                          {section: '', ventilation: 0, axis1: '', axis2: '', axis3: ''},
                          {section: '', ventilation: 0, axis1: '', axis2: '', axis3: ''}
                        ]
        this.props.hide()
    }
  }

  handleIndexChange(index){
    this.setState({index: index})
  }

  generateStyles(){
    this.styles = StyleSheet.create({
        box:    {
                  flex:1,
                  padding:"5%",
                  backgroundColor:'rgba(0,0,0,0.8)',
                  flexDirection:'column',
                },
        content:  {
                    flex:1,
                    backgroundColor:'#fff',
                    padding:10
                  },
        formbox:   {
                  flex:1,
                  borderRadius:10,

                  elevation: 7, //Android shadow

                  shadowColor: '#000',                  //===
                  shadowOffset: {width: 0, height: 2},  //=== iOs shadow
                  shadowOpacity: 0.8,                   //===
                  shadowRadius: 2,                      //===

                  padding:5,
                  marginVertical:8,
                  backgroundColor:"#E9E9E7"
                }
    })

    this.stylesTabBar = StyleSheet.create({
      container:{
                  flex:0,
                  flexDirection:'row',
                  width:'100%',
                  height:50,
                  borderColor:'#DFE0DF',
                  borderBottomWidth:1,
                  marginTop:10,
                },
      icons:{
              flex:0,
              marginLeft:5,
              width:30,
              height:30,
            },
      title:{
              flex:1,
              fontSize:12,
              fontWeight:'bold',
              textAlign:'center'
            },
      box:{
            flex:1,
            borderTopLeftRadius:10,
            borderTopRightRadius:10,
            marginHorizontal:2,
            backgroundColor:"#BEBEBD",
            borderColor:'#DFE0DF',
            borderWidth:1,
            flexDirection:'row',
            alignItems:'center',
          },
    })
  }

  renderTabBar(){
    const tabs = [
      {title: "Analyse 1"},
      {title: "Analyse 2"},
      {title: "Analyse 3"},
    ]

    let indexStyle = ""
    const content = tabs.map((tb, index) => {
          indexStyle = (index == this.state.index)? {backgroundColor:'#E9E9E7', borderColor:'#C0D838'} : {};
          return (
           <TouchableOpacity key={index} onPress={()=>{this.handleIndexChange(index)}} style={{flex:1}}>
            <View style={[this.stylesTabBar.box, indexStyle]}>
              <XText style={this.stylesTabBar.title}>{tb.title}</XText>
            </View>
          </TouchableOpacity>
      )})

    return <View style={this.stylesTabBar.container}>
             {content}
           </View>
  }

  render(){
    const ventilStyle = (this.state.total_ventilation != 100)? '#ff0921' : '#22780f'
    return  <Modal transparent={true}
                   animationType="slide"
                   visible={true}
                   supportedOrientations={['portrait', 'landscape']}
                   onRequestClose={()=>{ this.hideModal(true) }}
            >
              <View style={this.styles.box}>
                <View style={this.styles.content}>
                  <View style={{flex:1}}>
                    <XText style={{flex:0, minHeight:35, textAlign:'center', fontSize:24, color: '#463119'}}>Compta Analytique</XText>
                    <XText style={{flex:0}}>Ventilation à 100% uniquement.</XText>
                    <XText style={{flex:0, color:ventilStyle}}>(Total ventilation actuelle : {this.state.total_ventilation}%)</XText>
                    <View style={this.styles.formbox}>
                      {this.state.ready &&
                        <ScrollableTabView tabBarPosition="top" renderTabBar={()=>this.renderTabBar()} page={this.state.index} onChangeTab={(object) => {this.handleIndexChange(object.i)}}>
                          <AnalysisView index={0}/>
                          <AnalysisView index={1}/>
                          <AnalysisView index={2}/>
                        </ScrollableTabView>
                      }
                      {!this.state.ready && <XImage loader={true} style={{flex:1, width:60, height:60, alignSelf:'center'}} />}
                    </View>
                  </View>
                  <View style={{flex:0,flexDirection:'row'}}>
                    <SimpleButton Pstyle={{flex:1, marginHorizontal:3}} onPress={()=>this.hideModal(true)} title="Valider" />
                    <SimpleButton Pstyle={{flex:1, marginHorizontal:3}} onPress={()=>this.hideModal(false)} title="Supprimer" />
                  </View>
                </View>
              </View>
            </Modal>
  }
}

class Body extends Component{
  constructor(props){
    super(props)

    this.state = {period_start: "", period_expired: "", ready: false, paramsReady: false, journalsOptions: [], periodsOptions: [], comptaAnalysisActivated: false, analysisOpen: false}

    this.master = User.getMaster()
    this.customers = []
    GLOB.journal = GLOB.periods = GLOB.customer = ""

    this.renderForm = this.renderForm.bind(this)
    this.renderLoading = this.renderLoading.bind(this)
    this.refreshWarning = this.refreshWarning.bind(this)
    this.toggleComptaAnalysis = this.toggleComptaAnalysis.bind(this)

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
            Notice.danger(responses[0].message, true, responses[0].message)
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
    this.setState({ analysisOpen: toggle })
  }

  handleChangeCustomer(value){
    this.setState({ paramsReady: false, comptaAnalysisActivated: false })
    GLOB.journal = GLOB.period = ""
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
        if(file_upload_params != undefined && file_upload_params != "" && file_upload_params != null)
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
  const analysis_message = (totalVentilation() == 0)? 'Compta analytique (ajouter)' : 'Compta analytique (modifier)'

  return  <View style={{flex:1}}>
            <SelectInput textInfo={`Clients (${this.customers.length - 1})`} filterSearch={true} dataOptions={this.customers} Pstyle={this.styles.select} style={{color:'#707070'}} onChange={(value)=>this.handleChangeCustomer(value)}/>
            {this.state.paramsReady &&
              <View style={{flex:1}}>
                <SelectInput textInfo='Journal comptable' dataOptions={this.state.journalsOptions} Pstyle={this.styles.select} style={{color:'#707070'}} onChange={(value)=>this.handleChangeJournal(value)}/>
                <SelectInput textInfo='Période comptable' dataOptions={this.state.periodsOptions} Pstyle={this.styles.select} style={{color:'#707070'}} onChange={(value)=>this.handleChangePeriod(value)}/>
                {this.state.comptaAnalysisActivated && <SimpleButton Pstyle={styles.button} onPress={()=>{this.toggleComptaAnalysis(true)}} title={analysis_message} />}
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
            {this.state.analysisOpen && <ModalComptaAnalysis hide={()=>this.toggleComptaAnalysis(false)}/>}
          </View>
  }

  renderLoading(){
    return <XImage loader={true} style={{flex:1, width:60, height:60, alignSelf:'center'}} />
  }

  render(){
    return  <View style={{flex:1, padding:3}}>
              <XText style={this.styles.textBody}>{GLOB.dataList.length} : Document(s)</XText>
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
    GLOB.navigation.goBack({ resetSendScreen: GLOB.sending_finished })
  }

  render(){
    return  <View style={styles.minicontainer}>
              <SimpleButton Pstyle={styles.button} onPress={()=>{this.leaveScreen()}} title="<< Precedent" />
              {this.state.sending == false && this.props.sending == false && <SimpleButton Pstyle={styles.button} onPress={()=>{this.sendingDocs()}} title="Envoyer" />}
            </View>
  }
}

class SendScreen extends Component {
  static navigationOptions = {headerTitle: <XText class='title_screen'>Envoi documents</XText>}

  constructor(props){
    super(props)
    GLOB.navigation = new Navigator(this.props.navigation)
    GLOB.dataList = GLOB.navigation.getParams('images')
    GLOB.customer = ''
    GLOB.period = ''
    GLOB.journal = ''
    GLOB.sending_finished = false
    GLOB.analysis = [
                      {section: '', ventilation: 0, axis1: '', axis2: '', axis3: ''},
                      {section: '', ventilation: 0, axis1: '', axis2: '', axis3: ''},
                      {section: '', ventilation: 0, axis1: '', axis2: '', axis3: ''}
                    ]

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
    GLOB.navigation.screenClose()

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
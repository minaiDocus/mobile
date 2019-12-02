import React, { Component } from 'react'
import {StyleSheet,View,ScrollView,TouchableOpacity} from 'react-native'
import { NavigationActions } from 'react-navigation'
import { EventRegister } from 'react-native-event-listeners'
import ScrollableTabView from 'react-native-scrollable-tab-view'

import { XModal,ModalForm,Navigator,XImage,XText,XTextInput,PDFView,SimpleButton,LinkButton,ImageButton,BoxList,AnimatedBox,LineList,Table,Pagination,TabNav, Swiper } from '../../components'

import { ModalComptaAnalysis } from '../modals/compta_analytics'

import { DocumentsFetcher, FileUploader } from "../../requests"

let GLOB = { master: null, pack_or_report:{}, preseizures:[], source: '', idZoom:"", dataFilter: {}, selectedItems:[], press_action: 'zoom', currPresPage: 1, currPresTab: 0, needRefresh: false }

function getImgStampOf(state=''){
  let stamp_img = 'none'

  switch(state){
    case 'awaiting_analytics':
      stamp_img = 'compta_analytics'
      break;
    case 'awaiting_pre_assignment':
      stamp_img = 'preaff_pending'
      break;
    case 'delivery_failed':
      stamp_img = 'preaff_err'
      break;
    case 'delivered':
      stamp_img = 'preaff_deliv'
      break;
    case 'delivery_pending':
      stamp_img = 'preaff_deliv_pending'
      break;
    case 'duplication':
      stamp_img = 'preaff_dupl'
      break;
    case 'piece_ignored':
      stamp_img = 'preaff_ignored'
      break;
    default:
      stamp_img = 'none'
  }

  return stamp_img
}

class SwiperBox extends Component{
  constructor(props){
    super(props)

    this.nextElement = this.nextElement.bind(this)
    this.prevElement = this.prevElement.bind(this)
    this.selectElement = this.selectElement.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }

  nextElement(){
    GLOB.idZoom = GLOB.idZoom + 1 
    if(typeof(this.props.datas[GLOB.idZoom]) === 'undefined')
      GLOB.idZoom = GLOB.idZoom - 1
    else
      this.refs.main_swiper.changePage(GLOB.idZoom)
  }

  prevElement(){
    GLOB.idZoom = GLOB.idZoom - 1 
    if(typeof(this.props.datas[GLOB.idZoom]) === 'undefined')
      GLOB.idZoom = GLOB.idZoom + 1
    else
      this.refs.main_swiper.changePage(GLOB.idZoom)
  }

  selectElement(){
    if(isPresent(GLOB.idZoom) && typeof(this.props.datas[GLOB.idZoom]) !== 'undefined' && isPresent(this.props.datas[GLOB.idZoom].actionOnSelect))
      EventRegister.emit(`select_preseizure_${this.props.datas[GLOB.idZoom].id}`, 'toggle')
  }

  closeModal(){
    this.refs.main_modal.closeModal(()=>this.props.hide())
  }

  renderElement(){
    return this.props.datas.map((e, i)=>{
      return <BoxZoom  key={i}
                       index={i}
                       counts={this.props.datas.length}
                       hide={()=> { this.closeModal() }}
                       nextElement={this.nextElement}
                       prevElement={this.prevElement}
                       selectElement={(isPresent(e.actionOnSelect))? this.selectElement : false} 
                       data={e} />
    })
  }

  render(){
    return  <XModal ref='main_modal'
                    transparent={true}
                    animationType="UpSlide"
                    visible={true}
                    onRequestClose={()=>{ this.closeModal() }}
            >
              <Swiper ref='main_swiper' style={{flex: 1}} index={GLOB.idZoom || 0} onIndexChanged={(index)=>{ GLOB.idZoom = index }}>
                { this.renderElement() }
              </Swiper>
            </XModal>
  }
}

class BoxZoom extends Component{
  constructor(props){
    super(props)

    exist = GLOB.selectedItems.find(elem => { return elem == this.props.data.id })

    this.src = null
    this.preseizure_entries = null
    this.analytics = null
    this.preseizure = null
    this.pre_tax_amount = 0
    this.edition = {}
    this.id_edition = 0
    this.current_info_page = 0
    this.accountCompletion = {}

    this.state = {
                    ready: false,
                    nb_pages: 0,
                    current_page: 1,
                    is_selected: exist? true : false,
                    hiddenNextAction: null,
                    hiddenPrevAction: null,
                    hiddenKeyboard: null,
                    dataCompletions: []
                  }

    this.refreshData = this.refreshData.bind(this)
    this.editAccount = this.editAccount.bind(this)
    this.editEntry = this.editEntry.bind(this)
    this.validateProcess = this.validateProcess.bind(this)
    this.validateEdition = this.validateEdition.bind(this)

    this.generateStyles()
  }

  componentDidMount(){
    this.refreshData()
  }

  refreshData(){
    this.setState({ ready: false })
    const setFormInputs = (preseizure={})=>{
      this.form_inputs = []

      let year = formatDate(new Date(), 'YYYY')
      let month = formatDate(new Date(), 'MM')
      let day = formatDate(new Date(), 'DD')
      month = parseInt(month) + 4
      if(month > 12){
        month = 1
        year = parseInt(year) + 1
      }
      const max_date = `${year}-${formatNumber(month, '00')}-${day}`

      this.form_inputs.push({ label: "Date", name: "date", type: "date", allowBlank: true, maxDate: max_date, value: preseizure.date })
      this.form_inputs.push({ label: "Date d'échéance", name: "deadline_date", type: "date", allowBlank: true, maxDate: max_date, value: preseizure.deadline_date })
      this.form_inputs.push({ label: "Nom de tiers", name: "third_party", value: preseizure.third_party })
      this.form_inputs.push({ label: "Libelé opération", name: "operation_label", value: preseizure.operation_label })
      this.form_inputs.push({ label: "Numéro de pièces", name: "piece_number", value: preseizure.piece_number })
      this.form_inputs.push({ label: "Montant d'origine", name: "amount", keyboardType: 'decimal-pad', value: preseizure.amount })
      this.form_inputs.push({ label: "Devise", name: "currency", value: preseizure.currency })
      this.form_inputs.push({ label: "Taux de conversion", name: "conversion_rate", keyboardType: 'decimal-pad', value: preseizure.conversion_rate })
      this.form_inputs.push({ label: "Remarque", name: "observation", multiline: true, value: preseizure.observation })
    }

    DocumentsFetcher.waitFor([`getPreseizureDetails(${this.props.data.id})`], responses => {
      if(responses[0].error){
        Notice.danger(responses[0].message, { name: responses[0].message })
      }
      else{
        setFormInputs(responses[0].preseizure)
        this.preseizure_entries = responses[0].preseizure_entries
        this.preseizure_accounts = responses[0].preseizure_accounts
        this.preseizure = responses[0].preseizure
        this.id_edition = responses[0].preseizure.id
        this.analytics = responses[0].analytics
        this.accountCompletion = responses[0].accountCompletion || {}
        this.pre_tax_amount = responses[0].pre_tax_amount
      }

      this.setState({ ready: true })
    })
  }

  nextElement(){
    this.props.nextElement()
  }

  prevElement(){
    this.props.prevElement()
  }

  handleSelection(){
    this.props.selectElement()
    this.setState({ is_selected: !this.state.is_selected })
  }

  async editAccount(account){
    if(Master.is_prescriber || Master.is_admin)
    {
      this.edition['type'] = 'account'
      this.edition['obj'] = account

      this.refs.hiddeninput.changeText(account.number)
      await this.setState({ hiddenKeyboard: null, hiddenNextAction: null, hiddenPrevAction: null, dataCompletions: this.accountCompletion[account.id.toString()] })
      this.refs.hiddeninput.openKeyboard()
    }
  }

  async editEntry(entry){
    if(Master.is_prescriber || Master.is_admin)
    {
      this.edition['type'] = 'entry'
      this.edition['obj'] = entry

      const chg_action = () => {
        this.new_type = next_value
        this.validateProcess(true)
      }

      this.new_type = entry.type
      let prev_act = { title: '<- Débit', action: chg_action }
      let next_act = null
      let next_value = '1'

      if(entry.type == '1'){
        prev_act = null
        next_act = { title: 'Crédit ->', action: chg_action }
        next_value = '2'
      }

      this.refs.hiddeninput.changeText(entry.amount || 0)
      await this.setState({ hiddenKeyboard: 'decimal-pad', hiddenPrevAction: prev_act, hiddenNextAction: next_act, dataCompletions: [] })
      this.refs.hiddeninput.openKeyboard()
    }
  }

  validateProcess(force_edit = false){
    let new_value = this.refs.hiddeninput.getValue().toString()
    let init_value = (this.edition['type'] == 'account')? this.edition['obj'].number : (this.edition['obj'].amount || 0)

    if((init_value != new_value || force_edit) && isPresent(new_value))
    {
      if(Master.is_prescriber || Master.is_admin)
      {
        Notice.info('Edition en cours ...', {name: 'preseizure_edition'})

        let url = ''
        let datas = null
        if(this.edition['type'] == 'account'){
          datas = { number: new_value }
          url = `setPreseizureAccount(${this.edition['obj'].id}, ${JSON.stringify(datas)})`
        }
        else if(this.edition['type'] == 'entry'){
          datas = { amount: new_value, type: this.new_type }
          url = `setPreseizureEntry(${this.edition['obj'].id}, ${JSON.stringify(datas)})`
        }

        if(isPresent(url)){
          DocumentsFetcher.waitFor([url], responses=>{
            if(responses[0].error)
              Notice.alert('Erreur', responses[0].message)
            else
              this.refreshData()
          })
        }
      }
    }
  }

  validateEdition(){
    if((Master.is_prescriber || Master.is_admin) && isPresent(this.id_edition))
    {
      Notice.info('Edition en cours ...', {name: 'preseizure_edition'})

      let values = this.refs.form_1.values

      DocumentsFetcher.waitFor([`editPreseizures(${JSON.stringify([this.id_edition])}, ${JSON.stringify(values)})`], responses => {
        if(responses[0].error){
          Notice.alert('Erreur', responses[0].message)
        }
        else{
          GLOB.needRefresh = true
          this.refreshData()
        }
      })
    }
  }

  indicator(){
    return  <View style={{flex:0, width:'100%', height:'100%', backgroundColor:'#FFF', alignItems:'center', justifyContent:'center'}}>
              <XImage loader={true} width={40} height={40} style={{marginTop:10}} />
            </View>
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      boxZoom:{
                flex:1,
                flexDirection:'column',
                justifyContent:'flex-end',
                backgroundColor: Theme.modal.shape.backgroundColor || '#fff'
              },
      head: {
              flex:0,
              flexDirection:'row',
              alignItems: 'center',
              borderBottomWidth:2,
              borderColor:'#DFE0DF',
              height: 30,
              paddingHorizontal:"2%",
              width: '100%',
            },
      foot: { 
              flex:0,
              flexDirection:'row',
              alignItems:'center',
              justifyContent:'center',
              padding:"1%",
            },
      body: {
              flex:1,
              marginHorizontal:"3%",
              marginVertical:"2%",
              overflow: 'hidden',
              backgroundColor: '#000',
              borderColor:'#000',
              borderWidth:2
            },
      text: {
              flex:0,
              textAlign:'center',
              color:'#000',
              fontSize:18
            },
      piece_number: {
                      flex:0,
                      textAlign:'center',
                      fontSize:16,
                      borderRadius:5,
                      paddingVertical:2,
                      paddingHorizontal:7,
                      marginHorizontal:3,
                      fontWeight:'bold',
                      color:'#FFF'
                    },
      textFoot: {
                  flex:1,
                  padding:5,
                  fontSize:12,
                },
      stamp:  {
                flex:1,
                alignItems: 'center',
                justifyContent: 'center',
                height:40
              },
      stamp_absolute: {
                        flex: 0,
                        position: 'absolute',
                        height:40,
                        zIndex: 100,
                        bottom: 0,
                        left: 0
                      },
      control:{
                flex:1,
                flexDirection:'row',
                justifyContent:'flex-end',
                alignItems:'center'
              },
      btnNav: {
                flex:0,
                width: 30,
                height: 20,
                marginHorizontal:10,
              },
    })
  }

  renderPreview(){
    if(!this.src && this.props.data.large)
      this.src = DocumentsFetcher.renderDocumentUri(this.props.data.large)

    let stamp_img = getImgStampOf(this.props.data.state)

    return  <View style={{flex: 1, paddingHorizontal: '3%'}}>
              <View style={this.styles.body}>
              {
                this.src &&
                <PDFView
                  source={this.src}
                  onLoadComplete={(pageCount, filePath)=>{
                    this.setState({nb_pages: pageCount})
                  }}
                  onPageChanged={(page,pageCount)=>{
                    this.setState({current_page: page})
                  }}
                  onError={(error)=>{
                    if(! (/Canceled/i.test(error.toString())) )
                      Notice.alert("Erreur loading pdf", error.toString())
                  }} />
              }
              </View>
              <View style={this.styles.foot}>
                <XText style={[this.styles.text, this.styles.textFoot, {textAlign:'left'}]}>{this.state.current_page}</XText>
                { stamp_img != 'none' && <XImage source={{uri:stamp_img}} style={this.styles.stamp} /> }
                <XText style={[this.styles.text, this.styles.textFoot, {textAlign:'right'}]}>{this.state.nb_pages} page(s)</XText>
              </View>
            </View>
  }

  renderPreseizure(){
    let stamp_img = getImgStampOf(this.props.data.state)

    const renderDetails = () =>{
      let entries = []
      let debit_amount = 0
      let credit_amount = 0

      this.preseizure_entries.forEach((entry, index)=>{
        const account = this.preseizure_accounts.find((a)=>{ return a.id == entry.account_id })

        const account_number_link = <LinkButton TStyle={{textDecorationLine: 'underline'}} title={account.number} onPress={()=>{this.editAccount(account)}} />

        let entry_debit_link = entry_credit_link = '-'
        if(entry.type == 1){
          debit_amount += parseFloat(entry.amount)
          entry_debit_link = <LinkButton TStyle={{textDecorationLine: 'underline'}} title={entry.amount} onPress={()=>{this.editEntry(entry)}} />
        }
        else{
          credit_amount += parseFloat(entry.amount)
          entry_credit_link = <LinkButton TStyle={{textDecorationLine: 'underline'}} title={entry.amount} onPress={()=>{this.editEntry(entry)}} />
        }

        entries.push([account_number_link, entry_debit_link, entry_credit_link])
      })

      let analytics = []
      this.analytics.forEach(analytic=>{
        const tab_axis = arrayCompact([analytic.axis1, analytic.axis2, analytic.axis3])
        const axis = tab_axis.join('; ')
        const amount = (this.pre_tax_amount * analytic.ventilation) / 100

        analytics.push([analytic.name, axis, `${analytic.ventilation} %`, amount])
      })

      let tab_headers = [{title: "Infos."}, {title: "Ecritures"}]

      const barStyle =  {
                          shape: { marginTop: 0, padding: 3 },
                          head: { borderTopRightRadius: 0, borderTopLeftRadius: 0, backgroundColor: "rgba(255,255,255,0.2)"  },
                          text: { color: '#3e2f24' },
                          selectedHead: { backgroundColor: '#3e2f24', borderTopRightRadius: 0, borderTopLeftRadius: 0 },
                          selectedText: { color: '#fff' }
                        }

      return  <View style={{width: '100%', flex: 1}} >
                <TabNav CStyle={{flex: 1}}
                        BStyle={ barStyle }
                        initialPage={this.current_info_page}
                        handleIndexChange={(index)=>{ this.current_info_page = index }}
                        headers={tab_headers}
                >
                  <ModalForm  ref = 'form_1'
                              CStyle={{paddingVertical: 0, backgroundColor: 'transparent', flex: 1, marginBottom: 5}}
                              SStyle={{width: '100%'}}
                              HStyle={{maxHeight: 0, minHeight: 0}}
                              FStyle={{backgroundColor: '#FFF'}}
                              flatMode = {true}
                              dismiss={()=>{}}
                              inputs={this.form_inputs}
                              buttons={[
                                {title: "Valider", action: ()=>this.validateEdition()},
                              ]} />
                  <View style={{flex: 1}}>
                    <XText style={{flex: 0, paddingBottom: 5, marginLeft: 3}}>Unité monétaire: <XText style={{fontWeight: 'bold'}}>{ this.preseizure.currency || 'EUR' }</XText></XText>
                    <View ref='entries' style={{flex: 1}}>
                      <View style={{flexDirection: 'row', flex: 0}}>
                        <XText style={{flex: 0, paddingBottom: 5, marginLeft: 7, fontStyle: 'italic'}}>Ecritures</XText>
                        {
                          debit_amount != credit_amount &&
                          <AnimatedBox type='blink' style={{flex:0, alignItem: 'center', justifyContent: 'center'}}>
                            <XText style={{flex: 0, paddingBottom: 5, marginLeft: 5, color: '#900604'}}>( Balance non équilibrée )</XText>
                          </AnimatedBox>
                        }
                      </View>
                      <Table  headers={["Num. compte", "Débit", "Crédit"]}
                              body={entries}/>
                    </View>
                    {
                      analytics.length > 0 &&
                      <View ref='analytics' style={{flex: 1}}>
                        <XText style={{flex: 0, paddingBottom: 5, marginLeft: 7, fontStyle: 'italic'}}>Analyse compta.</XText>
                        <Table  headers={["Analyse", "Axe", "Ventilation", "Montant ventilé"]}
                                body={analytics}/>
                      </View>
                    }
                  </View>
                </TabNav>
              </View>
    }

    return <View style={{flex: 1.3, alignItems: 'center', justifyContent: 'center', paddingHorizontal: '3%'}}>
            { !this.state.ready && <XImage loader={true} width={40} height={40} /> }
            { this.state.ready && renderDetails() }
           </View>
  }

  renderHiddenInput(){
    return  <XTextInput ref="hiddeninput"
                        dataCompletions={this.state.dataCompletions}
                        autoCorrect={false}
                        selectTextOnFocus={true}
                        keyboardType={this.state.hiddenKeyboard}
                        CStyle={{flex: 0, position: 'absolute', opacity: 0, zIndex: -10}}
                        defaultValue={0}
                        next={this.state.hiddenNextAction}
                        previous={this.state.hiddenPrevAction}
                        onBlur={()=>this.validateProcess()}
                        />
  }

  render(){
    const selection_img = this.state.is_selected ? 'ban' : 'check'

    let piece_number = GLOB.idZoom + 1
    let style_number = { backgroundColor:'#BEBEBD' }

    if(isPresent(this.props.data.position)) {
      piece_number = formatNumber(this.props.data.position)
      style_number = {backgroundColor: (GLOB.source == 'pack')? '#F89406' : '#17a2b8'}
    }

    return  <View style={this.styles.boxZoom}>
              { this.renderHiddenInput() }
              <View style={[this.styles.head, Theme.modal.head]}>
                <SimpleButton CStyle={[{flex:0, width: 50, height: 20}, Theme.primary_button.shape]} TStyle={Theme.primary_button.text} onPress={()=>this.props.hide()} title="Retour" />
                {
                  this.props.selectElement &&
                  <ImageButton  source={{icon:selection_img}}
                                IOptions={{color: Theme.primary_button.shape.backgroundColor}}
                                CStyle={{flex:0, flexDirection:'column', alignItems:'center', justifyContent:'center', width:45, backgroundColor: 'transparent', marginHorizontal: 5}}
                                IStyle={{flex:0, width:18, height:18}}
                                onPress={()=>{this.handleSelection()}} />
                }
                <View style={this.styles.control} >
                  {
                    this.props.index > 0 && <SimpleButton TStyle={Theme.secondary_button.text} CStyle={[this.styles.btnNav, Theme.secondary_button.shape, {marginLeft:0}]} onPress={()=>this.prevElement()} title="<-" />
                  }
                  <XText style={[this.styles.piece_number, style_number]}>{piece_number}</XText>
                  {
                    this.props.index < (this.props.counts - 1) && <SimpleButton TStyle={Theme.secondary_button.text} CStyle={[this.styles.btnNav, Theme.secondary_button.shape, {marginRight:0}]} onPress={()=>this.nextElement()} title="->" />
                  }
                </View>
              </View>
              <XText style={{flex: 0, marginBottom: 3, padding: '3%'}}>{this.props.data.name}</XText>
              {
                GLOB.source == 'pack' &&
                <TabNav headers={[{title: "Pré-affectation"}, {title: "Pièce"}]}
                        BStyle={ {shape: {marginTop: 0}, text:{color: '#888'}} }
                >
                  { this.renderPreseizure() }
                  { this.renderPreview() }
                </TabNav>
              }
              { GLOB.source != 'pack' && this.renderPreseizure() }
            </View>
  }
}

class Header extends Component{
  constructor(props){
    super(props)
    this.generateStyles()
  }

  generateStyles(){
    this.styles = StyleSheet.create({
       minicontainer:{
                      flex:0, 
                      flexDirection:'row',
                      alignItems:'center',
                      justifyContent:'center',
                    },
        text: {
                fontSize:18,
                fontWeight:"bold"
              },
        filter: {
                  fontSize:10,
                  fontWeight:"bold"
                }
      })
  }

  render(){
    return  <View style={[this.styles.minicontainer, Theme.head.shape]}>
              <XText style={[this.styles.text, Theme.head.text]}>{GLOB.pack_or_report.name || "test"}</XText>
            </View>
  }
}

class BoxInfos extends Component{
  constructor(props){
    super(props)

    this.state = { delivery: !GLOB.pack_or_report.is_delivered }

    this.multiDelivery = this.multiDelivery.bind(this)
    this.generateStyles()
  }

  multiDelivery(){
    this.props.multiDelivery(()=>{ this.setState({ delivery: false }) })
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      label:{
              flex:1,
              fontWeight:'bold',
              marginLeft:5
            },
      value:{
              flex:1,
              marginLeft:25
            }
    })
  }

  renderItems(data){
    return  <View style={{flex:1, paddingVertical:10}}>
              <XText style={this.styles.label}>{data.label.toString()}</XText>
              <XText style={this.styles.value}>{data.value.toString()}</XText>
            </View>
  }

  render(){
    const infos = [
                    {label: "Nom du lot :", value: GLOB.pack_or_report.name},
                    {label: "Date première écriture :", value: formatDate(GLOB.pack_or_report.first_preseizure_created_at)},
                    {label: "Date dernière écriture :", value: formatDate(GLOB.pack_or_report.last_preseizure_created_at)},
                    {label: "Logiciel compta :", value: GLOB.pack_or_report.software_human_name},
                    {label: "Date dernière envoi :", value: formatDate(GLOB.pack_or_report.last_delivery_tried_at)},
                    {label: "Message d'erreur d'envoi :", value: GLOB.pack_or_report.last_delivery_message},
                  ]

    return  <ScrollView style={{flex:0, padding:3}} keyboardShouldPersistTaps={'always'}>
              <LineList datas={infos}
                        renderItems={(data) => this.renderItems(data)} />
              { 
                (Master.is_prescriber || Master.is_admin) && this.state.delivery &&
                <SimpleButton CStyle={[{position: 'absolute', top:0, right:0, zIndex: 200, elevation: 8 /**Elevate because of line list elevation**/}, Theme.primary_button.shape]}
                              TStyle={Theme.primary_button.text}
                              title='Livraison écritures'
                              LImage={{icon: 'refresh'}}
                              IOptions={{color:Theme.primary_button.text.color}}
                              onPress={()=>{this.multiDelivery()}}/>
              }
            </ScrollView>
  }
}

class PreseizureBox extends Component{
  constructor(props){
    super (props)

    this.state = { is_selected: false, is_delivered: this.props.data.is_delivered }

    this.selectionListener = null

    this.prepareSelection = this.prepareSelection.bind(this)
    this.selectItem = this.selectItem.bind(this)
    this.initWith = this.initWith.bind(this)
    this.deliver = this.deliver.bind(this)
    this.pressAction = this.pressAction.bind(this)

    this.generateStyles()
  }

  componentWillReceiveProps(nextProps){
    if(this.props.data.id != nextProps.data.id)
      this.initWith(nextProps)
  }

  componentDidMount(){
    this.initWith(this.props)
  }

  componentWillUnmount(){
    if(this.selectionListener)
    {
      EventRegister.rm(this.selectionListener)
      this.selectionListener = null
    }
  }

  initWith(props){
    if(this.selectionListener)
    {
      EventRegister.rm(this.selectionListener)
      this.selectionListener = null
    }

    if(props.withSelection)
      this.selectionListener = EventRegister.on(`select_preseizure_${props.data.id}`, this.selectItem)

    exist = GLOB.selectedItems.find(elem => { return elem == props.data.id })
    this.setState({ is_selected: exist? true : false })
  }

  deliver(){
    const call = ()=>{
      DocumentsFetcher.deliverPreseizure([this.props.data.id])
      Notice.info('Livraison en cours ...')
      this.setState({ is_delivered: true })
    }

    Notice.alert('Livraison écriture', `Voulez vous vraiment livrer cette écriture vers ${this.props.data.software_human_name}`, 
      [
        {text: 'Oui', onPress: () => call() },
        {text: 'Non', style: 'cancel'}
      ]
    )
  }

  pressAction(){
    if(this.props.withSelection && GLOB.press_action == 'selection')
    {
      this.selectItem()

      if(GLOB.selectedItems.length == 0)
        Notice.remove('selection_items_notification', true)
    }
    else
    {
      GLOB.idZoom = this.props.index
      this.props.toggleZoom()
    }
  }

  prepareSelection(){
    if(this.props.withSelection)
    {
      GLOB.press_action = 'selection'
      this.selectItem()
    }
  }

  selectItem(action='toggle'){
    let selectType = action

    if(action == 'toggle')
    {
      if(this.state.is_selected == true)
        selectType = 'out'
      else
        selectType = 'in'
    }

    if(selectType == 'in')
    {
      if(! GLOB.selectedItems.find( elem =>{ return elem == this.props.data.id }))
      {
        GLOB.selectedItems.push(this.props.data.id)
        this.setState({ is_selected: true })
      }
    }
    else
    {
      GLOB.selectedItems = GLOB.selectedItems.filter( elem => { return elem != this.props.data.id } )
      this.setState({ is_selected: false })
    }

    EventRegister.emit('selectionPreseizuresItems')
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      styleTouch: {
                    flex:0,
                    paddingVertical: 3,
                    paddingHorizontal: 5,
                    width:'100%',
                    marginVertical:5,
                    alignItems:'flex-start',
                    justifyContent:'flex-start',
                  },
      image:{
        flex:0,
        width:20,
        height:20
      },
      styleImg: {
                  flex:0,
                  height:79,
                  width:60,
                  backgroundColor:'#FFF'
                },
      styleContainer: {
                        backgroundColor:'#463119',
                        justifyContent:'center',
                        alignItems:'center',
                        height:95,
                        width:77,
                        overflow:'hidden' //For iOS overflow content
                      },
      stamp:{
                flex:0,
                flexDirection:'row',
                height:'20%',
                width:'100%',
                backgroundColor:'#FFF',
                borderWidth:1,
                borderColor: '#463119',
                transform: [{rotate: '30deg'}],
                alignItems:'center',
                justifyContent: 'center',
                paddingLeft: 10,
                marginLeft: 20,
              },
      stamp_img:{
              flex:0,
              height:'90%',
            },
      positions:  {
                    position: 'absolute',
                    bottom:5,
                    borderRadius:5,
                    backgroundColor: (GLOB.source == 'pack')? '#F89406' : '#17a2b8',
                    padding:3,
                    marginHorizontal:5,
                    fontSize:10,
                    fontWeight:'bold',
                    color:'#FFF'
                  }
    });
  }

  render(){
    let stamp_img = getImgStampOf(this.props.data.state)

    let src = {uri: "logo"}
    let local = true
    if(this.props.data.thumb)
    {
      src = DocumentsFetcher.renderDocumentUri(this.props.data.thumb)
      local = false
    }

    if(this.state.is_selected)
      var styleSelected = { backgroundColor: '#C9DD03' }

    return  <TouchableOpacity style={this.styles.styleTouch} onLongPress={()=>this.prepareSelection()} onPress={()=>this.pressAction()}>
              <XText style={{flex: 0, fontWeight: 'bold'}}>{this.props.data.name}</XText>
              <View style={{flex: 1, flexDirection: 'row', marginTop: 3}}>
                <XImage type='container' CStyle={[this.styles.styleContainer, styleSelected]} CldStyle={{justifyContent:'flex-start'}} style={this.styles.styleImg} source={src} local={local} >
                  { stamp_img != 'none' && <XImage type='container' source={{uri:stamp_img}} CStyle={this.styles.stamp} style={this.styles.stamp_img}/> }
                  { isPresent(this.props.data.position) && <XText style={this.styles.positions}>{formatNumber(this.props.data.position, 'xxx')}</XText> }
                </XImage>
                <View style={{flex: 1, flexDirection: 'column', marginLeft: 5}}>
                  <View style={{flex: 1}}>
                    <XText style={{flex: 1}}><XText style={{fontWeight: 'bold'}}>Date:</XText> {formatDate(this.props.data.date)}</XText>
                    { isPresent(this.props.data.deadline_date) && <XText style={{flex: 1}}><XText style={{fontWeight: 'bold'}}>Date échéance:</XText> {formatDate(this.props.data.deadline_date)}</XText> }
                    { isPresent(this.props.data.delivery_tried_at) && <XText style={{flex: 1}}><XText style={{fontWeight: 'bold'}}>Livrée le :</XText> {formatDate(this.props.data.delivery_tried_at)}</XText> }
                    { isPresent(this.props.data.error_message) && <XText style={{flex: 0, marginTop: 3, color:"#F7230C"}}>{truncate(this.props.data.error_message, 100)}</XText> }
                  </View>
                  {
                    (Master.is_prescriber || Master.is_admin) &&
                    <View style={{flex: 0, flexDirection: 'row', justifyContent: 'flex-end'}}>
                      { !this.state.is_delivered && <ImageButton source={{icon: 'refresh'}} CStyle={{flex:0, width:25, padding:15, alignItems:'center', justifyContent:'center'}} IStyle={this.styles.image} onPress={()=>{this.deliver()}}/> }
                    </View>
                  }
                </View>
              </View>
            </TouchableOpacity>
  }
}

class BoxPublish extends Component{
  constructor(props){
    super(props)
    this.state = { zoomActive: false, showForm: false }

    this.ids_edition = []
    this.form_inputs = []

    this.toggleZoom = this.toggleZoom.bind(this)
    this.showForm = this.showForm.bind(this)
    this.dismissForm = this.dismissForm.bind(this)
  }

  componentWillMount(){
    this.showFormListener = EventRegister.on('showPreseizureEdition', (params)=>{
      this.showForm(params.ids, (params.type || 'multi'))
    })
  }

  componentWillUnmount(){
    EventRegister.rm(this.showFormListener)
  }

  async toggleZoom(){
    if(GLOB.needRefresh)
      EventRegister.emit('refreshPreseizure', false)

    await this.setState({zoomActive: !this.state.zoomActive})
  }

  dismissForm(){
    this.refs.form_1.close(()=>{
      this.setState({ showForm: false })
    })
  }

  async showForm(ids){
    this.ids_edition = ids

    renderToFrontView(<View style={{flex:1, backgroundColor:'rgba(255,255,255,0.7)', alignItems:'center', justifyContent:'center'}}>
                        <XImage loader={true} width={40} height={40} />
                      </View>)

    setTimeout(()=>{
      const setFormInputs = (preseizure={})=>{
        this.form_inputs = []

        let year = formatDate(new Date(), 'YYYY')
        let month = formatDate(new Date(), 'MM')
        let day = formatDate(new Date(), 'DD')
        month = parseInt(month) + 4
        if(month > 12){
          month = 1
          year = parseInt(year) + 1
        }
        const max_date = `${year}-${formatNumber(month, '00')}-${day}`

        this.form_inputs.push({ label: "Date", name: "date", type: "date", allowBlank: true, maxDate: max_date, value: preseizure.date })
        this.form_inputs.push({ label: "Date d'échéance", name: "deadline_date", type: "date", allowBlank: true, maxDate: max_date, value: preseizure.deadline_date })
        this.form_inputs.push({ label: "Nom de tiers", name: "third_party", value: preseizure.third_party })
        this.form_inputs.push({ label: "Devise", name: "currency", value: preseizure.currency })
        this.form_inputs.push({ label: "Taux de conversion", name: "conversion_rate", keyboardType: 'decimal-pad', value: preseizure.conversion_rate })
        this.form_inputs.push({ label: "Remarque", name: "observation", multiline: true, value: preseizure.observation })
      }

      clearFrontView()
      setFormInputs()
      setTimeout(()=>{this.setState({ showForm: true })}, 500)
    }, 1000)
  }

  validateProcess(){
    if((Master.is_prescriber || Master.is_admin) && isPresent(this.ids_edition))
    {
      Notice.info('Edition en cours ...', {name: 'preseizure_edition'})

      let values = this.refs.form_1.values
      values = jsonCompact(values, true)

      DocumentsFetcher.waitFor([`editPreseizures(${JSON.stringify(this.ids_edition)}, ${JSON.stringify(values)})`], responses => {
        if(responses[0].error){
          Notice.danger(responses[0].message, { name: responses[0].message })
        }
        else{
          Notice.info('Edition terminer.', {name: 'preseizure_edition'})
          EventRegister.emit('refreshPreseizure', false)
        }
      })
    }

    this.dismissForm()
  }

  render(){
    return <ScrollView style={{flex:0, padding:3}} keyboardShouldPersistTaps='always' >
              {
                this.state.showForm &&
                <ModalForm  ref = 'form_1'
                            title="Edition écriture"
                            dismiss={()=>{ this.dismissForm() } }
                            inputs={this.form_inputs}
                            buttons={[
                              {title: "Valider", action: ()=>this.validateProcess()},
                            ]}
                />
              }
              {this.state.zoomActive && <SwiperBox  hide={this.toggleZoom} 
                                                    datas={this.props.datas}
                                        />
              }
              <LineList datas={this.props.datas}
                        title={`${this.props.totalCount} ${this.props.title}`}
                        waitingData={!this.props.ready}
                        noItemText='Aucun résultat'
                        renderItems={(data, index) => <PreseizureBox withSelection={true} data={data} index={index} toggleZoom={()=>this.toggleZoom()}/> } />
              <Pagination onPageChanged={(page)=>this.props.onChangePage(page)} nb_pages={this.props.nb_pages || 1} page={this.props.page || 1} />
          </ScrollView>
  }
}

class CustomTabNav extends Component{
  constructor(props){
    super(props);
    this.state = {index: 0, ready: false}

    this.page = this.limit_page = 1
    this.total = 0

    this.refreshPreseizure = this.refreshPreseizure.bind(this)
    this.changePage = this.changePage.bind(this)
  }

  componentWillMount(){
    this.refreshListener = EventRegister.on('refreshPreseizure', (renew = false)=>{
      this.refreshPreseizure(renew)
    })
  }

  componentWillUnmount(){
    EventRegister.rm(this.refreshListener)
  }

  componentDidMount(){
    let renew = true
    if(GLOB.currPresPage > 1){
      this.page = GLOB.currPresPage
      renew = false
    }

    this.refreshPreseizure(renew)
  }

  changePage(page=1){
    this.page = page
    this.refreshPreseizure(false)
  }

  refreshPreseizure(renew = true){
    if(renew)
      this.page = 1

    GLOB.needRefresh = false
    GLOB.currPresPage = this.page
    this.setState({ready: false})
    const s_id = GLOB.pack_or_report.pack_id || GLOB.pack_or_report.id

    DocumentsFetcher.waitFor([`getPreseizures(${s_id}, '${GLOB.source}',  ${this.page}, ${JSON.stringify(GLOB.dataFilter)})`], responses => {
      if(responses[0].error)
      {
        Notice.danger(responses[0].message, { name: responses[0].message })
      }
      else
      {
        GLOB.preseizures = responses[0].preseizures
        this.total = responses[0].total
        this.limit_page = responses[0].nb_pages
      }

      this.setState({ready: true})
    })
  }

  render(){
    return  <TabNav headers={[{title: "Ecritures Compta.", icon:"doc_curr"}, {title: "Infos", icon:"information"}]}
                    initialPage={GLOB.currPresTab}
                    handleIndexChange={(ind)=>{GLOB.currPresTab = ind}}>
              <BoxPublish key={1} 
                          datas={GLOB.preseizures}
                          totalCount={this.total || 0}
                          ready={this.state.ready}
                          title="Ecriture(s) comptable(s)"
                          onChangePage={(page)=>{this.changePage(page)}}
                          nb_pages={this.limit_page}
                          page={this.page} />
              <BoxInfos key={0}
                        nb_published={this.totalPublished}
                        nb_publishing={this.totalPublishing}
                        multiDelivery={(callback)=>{this.props.multiDelivery(callback)}}/>
            </TabNav>
  }
}

export class PreseizuresView extends Component{
  constructor(props){
    super(props)

    this.state = { analysisOpen: false }

    if(this.props.initView){
      GLOB.currPresPage = 1
      GLOB.currPresTab  = 0
    }

    GLOB.needRefresh = false

    this.handleSelection = this.handleSelection.bind(this)
    this.selectAllItem = this.selectAllItem.bind(this)
    this.unselectAllItem = this.unselectAllItem.bind(this)
    this.multiDelivery = this.multiDelivery.bind(this)
    this.multiEdition = this.multiEdition.bind(this)

    const navigation = new Navigator(this.props.navigation)
    GLOB.pack_or_report =  navigation.getParams('pack') || navigation.getParams('report') || {}
    GLOB.dataFilter = navigation.getParams('filter') || {}
    GLOB.source = navigation.getParams('type')

    GLOB.press_action = 'zoom'
    GLOB.preseizures = GLOB.selectedItems = []
  }

  componentWillMount(){
    this.selectionItemsListener = EventRegister.on('selectionPreseizuresItems', this.handleSelection)
  }

  componentWillUnmount(){
    Notice.remove('selection_items_notification', true)
    EventRegister.rm(this.selectionItemsListener)
  }

  selectAllItem(){
    GLOB.press_action = 'selection'
    GLOB.preseizures.map(elem => { EventRegister.emit(`select_preseizure_${elem.id}`, 'in') })
  }

  unselectAllItem(){
    GLOB.press_action = 'zoom'
    GLOB.selectedItems.map(elem => { EventRegister.emit(`select_preseizure_${elem}`, 'out') })
    GLOB.selectedItems = []
  }

  multiDelivery(type='selection', callback=null){
    if(Master.is_prescriber || Master.is_admin)
    {
      if(type == 'selection' && isPresent(GLOB.selectedItems))
      {
        const call = ()=>{
          DocumentsFetcher.deliverPreseizure(GLOB.selectedItems)
          Notice.info('Livraison en cours ...')
          setTimeout(() => EventRegister.emit('refreshPreseizure', false), 2000)
          try{ callback() }catch(e){}
        }

        Notice.alert('Livraison écriture', `Voulez vous vraiment livrer ${GLOB.selectedItems.length} écriture(s) comptable(s), seulles les écritures non livrées seront affectées`, 
          [
            {text: 'Oui', onPress: () => call() },
            {text: 'Non', style: 'cancel'}
          ]
        )
      }
      else if(type == 'all' && isPresent(GLOB.pack_or_report.id))
      {
        const call = ()=>{
            DocumentsFetcher.deliverPreseizure(null, GLOB.pack_or_report.id, GLOB.source)
            Notice.info('Livraison en cours ...')
            setTimeout(() => EventRegister.emit('refreshPreseizure', false), 2000)
            try{ callback() }catch(e){}
          }

          Notice.alert('Livraison écriture', `Voulez vous vraiment livrer toutes les écritures comptables non livrées du lot vers ${GLOB.pack_or_report.software_human_name}?`, 
            [
              {text: 'Oui', onPress: () => call() },
              {text: 'Non', style: 'cancel'}
            ]
          )
      }
    }
  }

  multiEdition(){
    if((Master.is_prescriber || Master.is_admin) && isPresent(GLOB.selectedItems))
      EventRegister.emit('showPreseizureEdition', {ids: GLOB.selectedItems, type: 'multi'})
  }

  handleSelection(){
    const mess_obj =  <View style={{flex:1, flexDirection:'row'}}>
                        <View style={{ flex:1, paddingHorizontal: 10}}>
                          <XText style={{flex:0, height: 25, color:'#FFF', fontWeight:"bold"}}>Séléctions</XText>
                          <XText style={{flex:1, color:'#C0D838', fontSize:10}}>{GLOB.selectedItems.length} écriture(s) comptable(s) séléctionnée(s)</XText>
                        </View>
                        <View style={{flex:1}}>
                          <View style={{flex:1, flexDirection:'row', height: 20, justifyContent:'flex-end'}}>
                            <ImageButton  source={{icon:"check"}}
                              IOptions={{size: 17, color: '#FFF'}}
                              CStyle={{flex:0, flexDirection:'column', alignItems:'center', justifyContent:'center', width:35}}
                              IStyle={{flex:0, width:17, height:17}}
                              onPress={()=>{this.selectAllItem()}} />
                            <ImageButton  source={{icon:"ban"}} 
                              IOptions={{size: 17, color: '#FFF'}}
                              CStyle={{flex:0, flexDirection:'column', alignItems:'center', justifyContent:'center', width:35}}
                              IStyle={{flex:0, width:17, height:17}}
                              onPress={()=>{this.unselectAllItem()}} />
                            <ImageButton  source={{icon:"close"}} 
                              IOptions={{size: 17, color: '#FFF'}}
                              CStyle={{flex:0, flexDirection:'column', alignItems:'center', justifyContent:'center', width:35}}
                              IStyle={{flex:0, width:17, height:17}}
                              onPress={()=>{ Notice.remove('selection_items_notification', true) }} />
                          </View>
                          {
                            (Master.is_prescriber || Master.is_admin) &&
                            <View style={{flex:1, flexDirection:'row', height: 35, justifyContent:'flex-end',  marginTop:7}}>
                              <ImageButton  source={{icon:"refresh"}}
                                IOptions={{size: 17, color: '#FFF'}}
                                CStyle={{flex:0, flexDirection:'column', alignItems:'center', justifyContent:'center', width:35}}
                                IStyle={{flex:0, width:17, height:17}}
                                onPress={()=>{this.multiDelivery()}} />
                              <ImageButton  source={{icon:"edit"}} 
                                IOptions={{size: 17, color: '#FFF'}}
                                CStyle={{flex:0, flexDirection:'column', alignItems:'center', justifyContent:'center', width:35}}
                                IStyle={{flex:0, width:17, height:17}}
                                onPress={()=>{this.multiEdition()}} />
                            </View>
                          }
                        </View>
                      </View>
    Notice.info(mess_obj, { permanent: true, name: "selection_items_notification", noClose: true })

    if(GLOB.selectedItems.length == 0)
      GLOB.press_action = 'zoom'
  }

  render(){
    return  <View style={{flex: 1, display: this.props.display}}>
              <Header />
              <CustomTabNav multiDelivery={(callback)=>{this.multiDelivery('all', callback)}}/>
            </View>
  }
}
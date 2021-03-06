import React, { Component } from 'react'
import {StyleSheet,View,TouchableOpacity} from 'react-native'
import { EventRegister } from 'react-native-event-listeners'

import { AnimatedBox,XScrollView,XImage,XText,LineList,Pagination,SelectInput,ModalForm,SimpleButton,BoxButton,ImageButton,LinkButton } from '../../../components'

import { Screen } from '../../layout'

import { AccountSharing } from "../../../requests"

let GLOB = {
              datas:[],
              dataFilter: {},
            }

class Header extends Component{
  constructor(props){
    super(props)

    this.state =  {
                    filter: false,
                    collaborator: 0, 
                    account: 0,
                    optionsCollaborator: [{value:0, label:"Contact ou client"}],
                    optionsAccount: [{value:0, label:"Dossier client"}],
                    loading_add: false
                  }

    this.ORstyle = []
    this.ORstyle["landscape"] = {
                                  body: { flexDirection: 'column', width: '25%' },
                                  left: { marginLeft: 0, alignSelf: 'flex-start', marginTop: 0 },
                                  form: { height: 120 }
                                }
    this.ORstyle["portrait"] =  {
                                  body: { flexDirection: 'row' },
                                  left: {},
                                  form: { height: '100%' }
                                }

    this.closeFilter = this.closeFilter.bind(this)
    this.filterAccount = this.filterAccount.bind(this)
    this.filterCollaborator = this.filterCollaborator.bind(this)

    this.generateStyles()
  }

  UNSAFE_componentWillMount(){
    this.refreshOrganization = EventRegister.on('OrganizationSwitched', () => {
      this.setState({ 
                      optionsCollaborator: [{value:0, label:"Contact ou client"}],
                      optionsAccount: [{value:0, label:"Dossier client"}]
                    })
    })
  }

  componentWillUnmount(){
    EventRegister.rm(this.refreshOrganization)
  }

  filterAccount(text=""){
    AccountSharing.waitFor([`getListCustomers("${text}")`], responses=>{
      if(responses[0].error)
      {
        Notice.danger(responses[0].message, { name: responses[0].message })
      }
      else
      {
        this.setState({optionsAccount: [{value:0, label:"Dossier client"}].concat(responses[0].dataList)})
      }
    })
  }

  filterCollaborator(text=""){
    AccountSharing.waitFor([`getListCollaborators("${text}")`], responses=>{
        if(responses[0].error)
        {
          Notice.danger(responses[0].message, { name: responses[0].message })
        }
        else
        {
          this.setState({optionsCollaborator: [{value:0, label:"Contact ou client"}].concat(responses[0].dataList)})
        }
    })
  }

  handleClientChange(value, target='collaborator'){
    if(target == 'collaborator')
    {
      this.setState({collaborator: value})
    }
    else
    {
      this.setState({account: value})
    }
  }

  addSharedDoc(){
    const call = ()=>{
                        if(this.state.collaborator > 0 && this.state.account > 0)
                        {
                          Notice.info("Partage en cours ...")
                          this.setState({loading_add: true})
                          AccountSharing.waitFor([`addSharedDoc(${JSON.stringify({collaborator_id: this.state.collaborator, account_id: this.state.account})})`], responses=>{
                            if(responses[0].error)
                            {
                              Notice.danger(responses[0].message, { name: responses[0].message })
                            }
                            else
                            {
                              Notice.info(responses[0].message)
                              this.setState({loading_add: false})
                            }
                            EventRegister.emit('refreshPage', true)
                          })
                        }
                        else
                        {
                          Notice.info({title: "Attention", body: "Veuillez renseigner correctement les champs pour le partage de dossier!!"})
                        }
                      }
    actionLocker(call)
  }

  openFilter(){
    this.setState({filter: true})
  }

  closeFilter(withFilter="none"){
    const form = this.refs.form_1
    GLOB.dataFilter = { account: form.values.account, collaborator: form.values.collaborator }

    GLOB.dataFilter = jsonCompact(GLOB.dataFilter, true)

    if(withFilter == "reInit")
      GLOB.dataFilter = {}

    if(withFilter != "none")
      this.props.onFilter()

    this.setState({filter: false})
  }

  checkFilterActive(){
    if (isPresent(GLOB.dataFilter)) return true
    else return false
  }

  generateStyles(){
    this.styles = StyleSheet.create({
        container:{
          flex:0,
          backgroundColor:'#E1E2DD',
          width:'100%',
        },
        left:{
          flex:2,
          flexDirection:'row',
          alignItems:'center',
          marginLeft:20,
          justifyContent:'center',
        },
        right:{
          flex:1,
          flexDirection:'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal:20,
        },
        image:{
          flex:0,
          width:40,
          height:40,
          marginRight:15
        },
        select:{
          flex:0,
          height: 30,
          marginTop:5,
          width:'100%'
        },
        filterbox:{
          flex:1,
          flexDirection:'row',
          alignItems:'center',
          justifyContent:'center'
        },
        form:{
          flex:1,
          backgroundColor:'#FFF',
          paddingHorizontal:8,

          // elevation: 7, //Android Shadow
          
          shadowColor: '#000',                  //===
          shadowOffset: {width: 0, height: 0},  //=== iOs shadow    
          shadowOpacity: 0.8,                   //===
          shadowRadius: 2,                      //===

          alignItems:'center'
        }
      })
  }

  render(){
    let loading_add = null
    if(this.state.loading_add)
    {
      loading_add = {uri:"img_loader"}
    }  

    return  <View style={[this.styles.container, Theme.head.shape, { padding: 0 }, this.ORstyle[this.props.orientation].body]}>
              { this.state.filter && 
                <ModalForm  ref='form_1'
                            title="Filtre"
                            dismiss={()=>this.closeFilter("none")}
                            inputs={[
                              { label:'Dossier', name: 'account', value: GLOB.dataFilter.account },
                              { label:'Client ou contact', name: 'collaborator', value: GLOB.dataFilter.collaborator }
                            ]}
                            buttons={[
                              {title: "Filtrer", withDismiss: true, action: ()=>this.closeFilter("filter")},
                              {title: "Annuler filtre", withDismiss: true, action: ()=>this.closeFilter("reInit")},
                            ]}
                />
              }
              <View style={[this.styles.left, this.ORstyle[this.props.orientation].left]}>
                <View style={[this.styles.form, this.ORstyle[this.props.orientation].form]}>
                  <SelectInput  filterSearch={true}
                                filterCallback={this.filterCollaborator} 
                                dataOptions={this.state.optionsCollaborator}
                                textInfo="Contact ou Client - (Tapez un therme à rechercher)" 
                                style={{color:'#707070'}}
                                CStyle={this.styles.select} 
                                onChange={(value) => this.handleClientChange(value, "collaborator")}
                  />
                  <SelectInput  filterSearch={true}
                                filterCallback={this.filterAccount} 
                                dataOptions={this.state.optionsAccount}
                                textInfo="Dossier client - (Tapez un therme à rechercher)" 
                                style={{color:'#707070'}} 
                                CStyle={this.styles.select} 
                                onChange={(value) => this.handleClientChange(value, "account")}
                  />
                  <SimpleButton CStyle={[{flex:0, height:30, width:100, margin:10}, Theme.primary_button.shape]} TStyle={Theme.primary_button.text}  RImage={loading_add} onPress={()=>this.addSharedDoc()} title="Partager" />
                </View>
              </View>
              <View style={this.styles.right}> 
                <BoxButton title="Filtre" blink={!this.state.filter && this.checkFilterActive()} onPress={()=>{this.openFilter()}} source={{icon: "filter"}} />
              </View>
            </View> 
  }
}

class BoxStat extends Component{
  constructor(props){
    super(props)

    this.state = {showDetails: false}

    this.toggleDetails = this.toggleDetails.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleValidate = this.handleValidate.bind(this)

    this.generateStyles()
  }

  toggleDetails(){
    this.setState({showDetails: !this.state.showDetails})
  }

  deleteSharedDoc(id_doc){
    Notice.info("Suppression de partage en cours ...")
    AccountSharing.waitFor([`deleteSharedDoc(${id_doc})`], responses=>{
      if(responses[0].error)
      {
        Notice.danger(responses[0].message, { name: responses[0].message })
      }
      else
      {
        Notice.info(responses[0].message)
        EventRegister.emit('refreshPage', true)
      }
    })
  }


  acceptSharedDoc(id_doc){
    Notice.info("Partage en cours ...")
    AccountSharing.waitFor([`acceptSharedDoc(${id_doc})`], responses=>{
      if(responses[0].error)
      {
        Notice.danger(responses[0].message, { name: responses[0].message })
      }
      else
      {
        Notice.info(responses[0].message)
        EventRegister.emit('refreshPage', true)
      }
    })
  }

  handleDelete(id_doc){
    Notice.alert( 'Suppression de partage', 
                  'Êtes-vous sûr de vouloir annuler le partage du dossier',
                  [
                    {text: 'Non', onPress: () =>{}},
                    {text: 'Oui', onPress: () =>{this.deleteSharedDoc(id_doc)}},
                  ],
                )
  }

  handleValidate(id_doc){
    if(!this.props.data.approval)
    {
      Notice.alert( 'Validation de partage', 
                    'Êtes-vous sûr de vouloir accepter le partage du dossier',
                    [
                      {text: 'Non', onPress: () =>{}},
                      {text: 'Oui', onPress: () =>{this.acceptSharedDoc(id_doc)}},
                    ],
                  )
    }
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      container: {
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        paddingHorizontal:8,
      },
      image:{
        flex:0,
        width:19,
        height:19
      },
      champ:{
        flex:1,
        fontSize:14,
        marginVertical:2
      },
      label:{
        flex:1,
        fontWeight:"bold",
      },
      infos:{
        flex:1,
        marginHorizontal:30,
        marginTop:5,
        borderTopWidth:1,
        borderColor:'#A6A6A6'
      },
    })
  }

  render(){
    const arrow = (this.state.showDetails)? "caret-down" : "caret-right"

    const styleApproved = {
                            opacity: this.props.data.approval? 0.3 : 1
                          }

    const state = this.props.data.approval? 'Partagé' : 'En attente de validation'

    return  <TouchableOpacity style={{flex:1, paddingVertical:10}} onPress={()=>this.toggleDetails()} >
              <View style={this.styles.container}>
                <XImage source={{icon: arrow}} style={[{flex:0, width:20, marginRight:8}, this.styles.image]} />
                <View style={{flex:1}}>
                  <XText style={{fontWeight:'bold'}}>{this.props.data.document.toString()}</XText>
                </View>
                <View style={{flex:0, width:70, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                  <ImageButton source={{icon:'check'}} CStyle={{padding:8}} IStyle={[this.styles.image, styleApproved]} onPress={()=>this.handleValidate(this.props.data.id_idocus)}/>
                  <ImageButton source={{icon:'close'}} CStyle={{padding:8}} IStyle={this.styles.image} onPress={()=>this.handleDelete(this.props.data.id_idocus)}/>
                </View>
              </View>
              {
                  this.state.showDetails == true && 
                    <View style={this.styles.infos}>
                      <XText style={this.styles.champ}><XText style={this.styles.label}>Date : </XText>{formatDate(this.props.data.date, "DD-MM-YYYY HH:ii")}</XText>
                      <XText style={this.styles.champ}><XText style={this.styles.label}>Dossier : </XText>{this.props.data.document}</XText>
                      <XText style={this.styles.champ}><XText style={this.styles.label}>Client ou Contact : </XText>{this.props.data.client}</XText>
                      <XText style={this.styles.champ}><XText style={this.styles.label}>Etat : </XText>{state}</XText>
                    </View>
              }
            </TouchableOpacity>
  }
}

class OrderBox extends Component{
  constructor(props){
    super(props)
    this.state = {show: false}

    this.generateStyles()
  }

  UNSAFE_componentWillReceiveProps(prevProps){
    if(prevProps.visible === true){
      this.setState({show: true})
    }
    else if(prevProps.visible === false){
      if(this.refs.animatedOptions)
        this.refs.animatedOptions.leave(()=>{ this.setState({show: false}) })
    }
  }

  handleOrder(order_by){
    this.refs.animatedOptions.leave(()=>{
      this.props.handleOrder(order_by)
    })
  }

  generateStyles(){
    this.styles = StyleSheet.create({
        container: {
          position:'absolute',
          backgroundColor:'#FFF',
          borderWidth:2,
          borderColor:'#D6D6D6',
          paddingHorizontal:20,
          paddingVertical:5,
          right:0,
        },
        title:{
          fontSize:18,
          fontWeight:'bold',
          borderBottomWidth:1,
          borderColor:'#D6D6D6'
        },
        list:{
          marginBottom:10
        }
      })
  }

  render(){
    if(this.state.show)
    {
      return  <AnimatedBox ref="animatedOptions" type='DownSlide' durationIn={300} durationOut={300} style={this.styles.container}>
                  <XText style={this.styles.title}>Trier par : </XText>
                  <View style={{flex:1, marginTop:5}}>
                    <LinkButton onPress={()=>this.handleOrder(['Date','date'])} title='Date' CStyle={this.styles.list} />
                    {
                    // <LinkButton onPress={()=>this.handleOrder(['Dossier','document'])} title='Dossier' CStyle={this.styles.list} />
                    // <LinkButton onPress={()=>this.handleOrder(['Client','client'])} title='Client' CStyle={this.styles.list} />
                    }
                    <LinkButton onPress={()=>this.handleOrder(['Etat','approval'])} title='Etat' CStyle={this.styles.list} />
                  </View>
              </AnimatedBox>
    }
    else
    {
      return null
    }
  }
}

class SharingScreen extends Component {
  constructor(props){
    super(props)

    this.state = {orientation: 'portrait', ready: false, dataList: [], orderBox: false, orderText: null, orderBy: "", direction: ""}

    this.ORstyle = []
    this.ORstyle["landscape"] = {
                                  body: { flexDirection: 'row' },
                                }
    this.ORstyle["portrait"] =  {
                                  body: { flexDirection: 'column' },
                                }

    this.page = this.limit_page = 1
    this.order = {}
    this.total = 0

    this.renderStats = this.renderStats.bind(this)
    this.refreshDatas = this.refreshDatas.bind(this)
    this.toggleOrderBox = this.toggleOrderBox.bind(this)
    this.handleOrder = this.handleOrder.bind(this)
    this.changePage = this.changePage.bind(this)
  }

  handleOrientation(orientation){
    this.setState({orientation: orientation}) // exemple use of Orientation changing
  }

  UNSAFE_componentWillMount(){
    this.orderBoxListener = EventRegister.on('clickOrderBox', (data) => {
        this.toggleOrderBox()
    })

    this.refreshPage = EventRegister.on('refreshPage', (data=false) => {
        this.refreshDatas(data)
    })

    this.refreshOrganization = EventRegister.on('OrganizationSwitched', () => {
        this.refreshDatas(true)
    })
  }

  componentWillUnmount(){
    EventRegister.rm(this.orderBoxListener)
    EventRegister.rm(this.refreshPage)
    EventRegister.rm(this.refreshOrganization)
  }

  componentDidMount(){
    this.refreshDatas()
  }

  toggleOrderBox(){
    if(GLOB.datas.length > 0)
    {
      this.setState({orderBox: !this.state.orderBox})
    }
  }

  changePage(page=1){
    this.page = page
    this.refreshDatas(false)
  }

  handleOrder(orderBy=[], direction = false){ 
    if(orderBy.length > 0) this.toggleOrderBox()

    order_text = orderBy[0] || this.state.orderText
    order_by = orderBy[1] || this.state.orderBy

    this.order={
                  order_by: order_by,
                  direction: direction
                }

    this.refreshDatas()
    this.setState({orderText: order_text, orderBy:order_by, direction: direction})
  }

  async changeDirectionSort(){
    await this.setState({direction: !this.state.direction})
    this.handleOrder([], this.state.direction)
  }

  refreshDatas(renew=true){
    if(renew){
      this.page = 1
    }

    this.setState({ready: false, dataList: []})
    AccountSharing.waitFor([`getSharedDocs(${JSON.stringify(GLOB.dataFilter)}, ${this.page}, ${JSON.stringify(this.order)})`], responses=>{
      if(responses[0].error)
        Notice.danger(responses[0].message, {name: responses[0].message })
      else
        GLOB.datas = responses[0].data_shared || []

      this.limit_page = responses[0].nb_pages || 1
      this.total = responses[0].total || 0
      this.setState({ready: true, dataList: GLOB.datas})
    })
  }

  renderStats(){
    const arrow_direction = this.state.direction? 'V' : 'Λ'

     return  <XScrollView style={{flex:1, padding:3}}>
                {this.state.orderText && this.state.dataList.length > 0 && 
                  <View style={{flex:1,flexDirection:'row',paddingVertical:5,alignItems:'center'}}>
                    <XText style={{flex:0}}>Trie par: <XText style={{fontWeight:'bold'}}>{this.state.orderText}</XText></XText>
                    <TouchableOpacity style={{flex:0,width:30,alignItems:'center'}} onPress={()=>this.changeDirectionSort()}>
                      <XText style={{fontSize:14, fontWeight:'bold'}}>{arrow_direction}</XText>
                    </TouchableOpacity>
                  </View>
                }
                <LineList datas={this.state.dataList}
                          waitingData={!this.state.ready}
                          title={`Dossiers partagés (${this.total})`}
                          renderItems={(data) => <BoxStat data={data} deleteSharedDoc={this.deleteSharedDoc}/> } />
                <Pagination onPageChanged={(page)=>this.changePage(page)} nb_pages={this.limit_page} page={this.page} />
             </XScrollView>
  }

  render() {
      return (
          <Screen style={[{flex:1}, Theme.body]}
                  onChangeOrientation={(orientation)=>this.handleOrientation(orientation)}
                  title={this.props.title}
                  name='Sharing'
                  withMenu={true}
                  options={this.props.options}
                  navigation={this.props.navigation}>
            <View style={[{flex: 1}, this.ORstyle[this.state.orientation].body]}>
              <Header orientation={this.state.orientation} onFilter={()=>this.refreshDatas(true)}/>
              <View style={{flex: 1}}>
                { this.renderStats() }
                <View style={[{flex: 0}, Theme.head.shape, {padding: 1}]}>
                  <SimpleButton title='Contacts >>' CStyle={[{flex: 0, margin: 3}, Theme.secondary_button.shape, {paddingVertical: 3}]} TStyle={Theme.secondary_button.text} onPress={()=>CurrentScreen.goTo("SharingContacts")} />
                </View>
              </View>
            </View>
            <OrderBox visible={this.state.orderBox} handleOrder={this.handleOrder}/>
          </Screen>
      );
    }
}

export default SharingScreen;
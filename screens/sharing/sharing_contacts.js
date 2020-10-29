import React, { Component } from 'react'
import {StyleSheet,View,TouchableOpacity} from 'react-native'
import { EventRegister } from 'react-native-event-listeners'

import { AnimatedBox,Navigator,XScrollView,XImage,XText,LineList,Pagination,ModalForm,SimpleButton,BoxButton,ImageButton,LinkButton,OrganizationSwitcher } from '../../components'

import { Screen } from '../layout'

import { User } from '../../models'

import { AccountSharing } from "../../requests"

let GLOB =  {
              datas:[],
              dataFilter: {email:'', company:'', first_name: '', last_name:''},
            }

class ContactForm extends Component{
  constructor(props){
    super(props)

    this.type = (typeof(this.props.data.id_idocus) !== "undefined" && this.props.data.id_idocus > 0)? 'edit' : 'add'
    this.input_edit = true

    this.dataForm = { email:'', company: '', first_name: '', last_name: '' }
    if(this.type == "edit")
    {
      this.input_edit = false
      this.dataForm = {
                        id_idocus: this.props.data.id_idocus,
                        email:this.props.data.email, 
                        company: this.props.data.company, 
                        first_name: this.props.data.first_name, 
                        last_name: this.props.data.last_name
                      }
    }
  }

  validateProcess(){
    const form = this.refs.form_1
    this.dataForm = { email: form.values.email, company: form.values.company, first_name: form.values.first_name, last_name: form.values.last_name }

    let url = ""
    let reload = true
    
    if(this.dataForm.email == '' || this.dataForm.company == '')
    {
      Notice.alert("Erreur", "Veuillez remplir les champs obligatoires (*) svp")
    }
    else
    {
      if(this.type == "add")
      {
        url = `addSharedContact(${JSON.stringify(this.dataForm)})`
        reload = true
        flash = "Ajout contact en cours ..."
      }
      else
      {
        url = `editSharedContact(${JSON.stringify(this.dataForm)})`
        reload = false
        flash = "Modification contact en cours ..."
      }
    }
    
    if(url != '')
    {
      const call = ()=>{
                          Notice.info(flash)
                          AccountSharing.waitFor([url], responses=>{
                            if(responses[0].error)
                            {
                              Notice.danger(responses[0].message, { name: responses[0].message })
                            }
                            else
                            {
                              Notice.info(responses[0].message)
                            }
                            EventRegister.emit('refreshPage_contacts', reload)
                          })
                        }
      actionLocker(call)
      this.refs.form_1.dismiss()
    }
  }

  render(){
    return  <ModalForm  ref="form_1"
                        title="Ajout contact"
                        dismiss={()=>this.props.dismiss()}
                        inputs={[
                          {label:'* Couriel', name: 'email', keyboardType: 'email-address', editable: this.input_edit, value: this.dataForm.email},
                          {label:'* Nom de la société', name: 'company', value: this.dataForm.company },
                          {label:'Prénom', name: 'first_name', value: this.dataForm.first_name },
                          {label:'Nom', name: 'last_name', value: this.dataForm.last_name }
                        ]}
                        buttons={[
                          {title: "Valider", action: ()=>this.validateProcess()},
                        ]}
            />
  }
}

class Header extends Component{
  constructor(props){
    super(props)

    this.state =  {openFilter: false, openForm: false, dataForm: {}}

    this.ORstyle = []
    this.ORstyle["landscape"] = {
                                  body: { flexDirection: 'column', width: 100, justifyContent: 'space-around' }
                                }
    this.ORstyle["portrait"] =  {
                                  body: { flexDirection: 'row' }
                                }

    this.closeFilter = this.closeFilter.bind(this)
    this.closeForm = this.closeForm.bind(this)

    this.generateStyles()
  }
  
  UNSAFE_componentWillMount(){
    this.externalOpenModal = EventRegister.on('externalOpenModal', (data) => {
        this.openForm(data)
    })
  }

  componentWillUnmount(){
    EventRegister.rm(this.externalOpenModal)
  }

  openFilter(){
    this.setState({openFilter: true})
  }

  closeFilter(withFilter = "none"){
    const form = this.refs.form_1
    GLOB.dataFilter = { email: form.values.email, company: form.values.company, first_name: form.values.first_name, last_name: form.values.last_name }

    if(withFilter == "reInit")
    {
      GLOB.dataFilter = {email:'', company:'', first_name: '', last_name:''}
    }

    if(withFilter != "none")
    {
      this.props.onFilter()
    }

    this.setState({openFilter: false})
  }

  openForm(data={}){
    this.setState({openForm: true, dataForm: data})
  }

  closeForm(){
    this.setState({openForm: false})
  }

  checkFilterActive(){
    if (GLOB.dataFilter.email != "" || GLOB.dataFilter.company != "" || GLOB.dataFilter.first_name != "" || GLOB.dataFilter.last_name != "") return true
    else return false
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      container:{
        flex:0, 
        alignItems:'center',
        justifyContent:'center',
      }
    })
  }

  render(){ 
    return  <View style={[this.styles.container, Theme.head.shape, this.ORstyle[this.props.orientation].body]}>
              { this.state.openForm && <ContactForm data={this.state.dataForm} dismiss={this.closeForm} />}
              { this.state.openFilter && 
                  <ModalForm  ref="form_1"
                              title="Filtre"
                              dismiss={()=>this.closeFilter("none")}
                              inputs={[
                                {label:'Email :', name: 'email', keyboardType: 'email-address', value: GLOB.dataFilter.email},
                                {label:'Société :', name: 'company', value: GLOB.dataFilter.company},
                                {label:'Prénom :', name: 'first_name', value: GLOB.dataFilter.first_name},
                                {label:'Nom :', name: 'last_name', value: GLOB.dataFilter.last_name}
                              ]}
                              buttons={[
                                {title: "Filtrer", withDismiss: true, action: ()=>this.closeFilter("filter")},
                                {title: "Annuler filtre", withDismiss: true, action: ()=>this.closeFilter("reInit")},
                              ]}
                  />
              }
              <BoxButton title="Ajout" onPress={()=>{this.openForm()}} source={{icon:"user-plus"}}/>
              <BoxButton title="Filtre" blink={!this.state.openFilter && this.checkFilterActive()} onPress={()=>{this.openFilter()}} source={{icon: "filter"}}/>
            </View>
  }
}

class BoxStat extends Component{
  constructor(props){
    super(props)

    this.state = {showDetails: false}

    this.toggleDetails = this.toggleDetails.bind(this)
    this.handleDelete = this.handleDelete.bind(this)

    this.generateStyles()
  }

  toggleDetails(){
    this.setState({showDetails: !this.state.showDetails})
  }

  deleteSharedContact(_id){
    Notice.info("Suppression de contact en cours ...")
    AccountSharing.waitFor([`deleteSharedContact(${_id})`], responses=>{
      if(responses[0].error)
      {
        Notice.danger(responses[0].message, { name: responses[0].message })
      }
      else
      {
        Notice.info(responses[0].message)
        EventRegister.emit('refreshPage_contacts', true)
      }
    })
  }

  handleDelete(_id){
    Notice.alert( 'Suppression de contact', 
                  'Êtes-vous sûr de vouloir supprimer ce contact?',
                  [
                    {text: 'Non', onPress: () =>{}},
                    {text: 'Oui', onPress: () =>{this.deleteSharedContact(_id)}},
                  ],
                )
  }

  handleEdit(){
    EventRegister.emit('externalOpenModal', this.props.data)
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

    return  <TouchableOpacity style={{flex:1, paddingVertical:10}} onPress={()=>this.toggleDetails()} >
              <View style={this.styles.container}>
                <XImage source={{icon:arrow}} style={[{flex:0, width:20, marginRight:8}, this.styles.image]} />
                <View style={{flex:1}}>
                  <XText style={{fontWeight:'bold'}}>{this.props.data.email.toString()}</XText>
                </View>
                <View style={{flex:0, width:70, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                  <ImageButton source={{icon:'edit'}} CStyle={{padding:8}} IStyle={this.styles.image} onPress={()=>this.handleEdit()}/>
                  <ImageButton source={{icon:'close'}} CStyle={{padding:8}} IStyle={this.styles.image} onPress={()=>this.handleDelete(this.props.data.id_idocus)}/>
                </View>
              </View>
              {
                  this.state.showDetails == true && 
                    <View style={this.styles.infos}>
                      <XText style={this.styles.champ}><XText style={this.styles.label}>Date : </XText>{formatDate(this.props.data.date, "DD-MM-YYYY HH:ii")}</XText>
                      <XText style={this.styles.champ}><XText style={this.styles.label}>Email : </XText>{this.props.data.email}</XText>
                      <XText style={this.styles.champ}><XText style={this.styles.label}>Société : </XText>{this.props.data.company}</XText>
                      <XText style={this.styles.champ}><XText style={this.styles.label}>Nom : </XText>{User.fullNameOf(this.props.data)}</XText>
                      <XText style={this.styles.champ}><XText style={this.styles.label}>Nb. de dossiers : </XText>{this.props.data.account_size}</XText>
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
    if(prevProps.visible == true)
    {
      this.setState({show: true})
    }
    else
    {
      if(this.refs.animatedOptions)
        this.refs.animatedOptions.leave(()=>this.setState({show: false}))
    }
  }

  handleOrder(order_by){
    this.refs.animatedOptions.leave()
    this.props.handleOrder(order_by)
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
                    <LinkButton onPress={()=>this.handleOrder(['Email','email'])} title='Email' CStyle={this.styles.list} />
                    <LinkButton onPress={()=>this.handleOrder(['Société','company'])} title='Société' CStyle={this.styles.list} />
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

    this.dontRefreshForm = false
    this.state = {orientation: 'portrait', ready: false, dataList: [], orderBox: false, orderText: null, orderBy: "", direction: ""}

    this.ORstyle = []
    this.ORstyle["landscape"] = {
                                  body: { flexDirection: 'row' }
                                }
    this.ORstyle["portrait"] =  {
                                  body: { flexDirection: 'column' }
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
    this.orderBoxListener = EventRegister.on('clickOrderBox_contacts', (data) => {
        this.toggleOrderBox()
    })

    this.refreshPage = EventRegister.on('refreshPage_contacts', (data=false) => {
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
      this.setState({orderBox: !this.state.orderBox})
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
    AccountSharing.waitFor([`getSharedContacts(${JSON.stringify(GLOB.dataFilter)}, ${this.page}, ${JSON.stringify(this.order)})`], responses => {
      if(responses[0].error)
        Notice.danger(responses[0].message, { name: responses[0].message })
      else
        GLOB.datas = responses[0].contacts || []

      this.limit_page = responses[0].nb_pages || 1
      this.total = responses[0].total || 0
      this.setState({ready: true, dataList: GLOB.datas})
    })
  }

  renderStats(){
    const arrow_direction = this.state.direction? 'V' : 'Λ'

     return  <XScrollView style={{flex:1, padding:3}} >
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
                          title={`Contacts (${this.total})`}
                          renderItems={(data) => <BoxStat data={data} deleteSharedDoc={this.deleteSharedDoc}/> } />
                <Pagination onPageChanged={(page)=>this.changePage(page)} nb_pages={this.limit_page} page={this.page} />
             </XScrollView>
  }

  renderOptions(){
    return  <View style={{flex:1, flexDirection:'row', justifyContent: 'center'}}>
              <OrganizationSwitcher/>
              <ImageButton  source={{uri:"options"}} 
                  CStyle={{flex:0, flexDirection:'column', justifyContent:'center', alignItems:'center', minWidth:40}}
                  IStyle={{flex:0, width:7, height:36}}
                  onPress={()=>EventRegister.emit('clickOrderBox_contacts', true)} />
            </View>
  }

  render() {
      return (
          <Screen style={[{flex:1}, Theme.body]}
                  onChangeOrientation={(orientation)=>this.handleOrientation(orientation)}
                  title="Contacts"
                  name='SharingContacts'
                  options={ this.renderOptions() }
                  navigation={this.props.navigation}
                  >
            <View style={[{flex: 1}, this.ORstyle[this.state.orientation].body]}>
              <Header orientation={this.state.orientation} onFilter={()=>this.refreshDatas(true)}/>
              <View style={{flex: 1}}>
                { this.renderStats() }
                <View style={[{flex: 0}, Theme.head.shape, {padding: 1}]}>
                  <SimpleButton title='<< Dossiers partagés' CStyle={[{flex: 0, margin: 3}, Theme.secondary_button.shape, {paddingVertical: 3}]} TStyle={Theme.secondary_button.text} onPress={()=>CurrentScreen.goBack()} />
                </View>
              </View>
            </View>
            <OrderBox visible={this.state.orderBox} handleOrder={this.handleOrder}/>
          </Screen>
      );
    }
}

export default SharingScreen;
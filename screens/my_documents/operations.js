import React, { Component } from 'react'
import { StyleSheet,View,TouchableOpacity } from 'react-native'
import { EventRegister } from 'react-native-event-listeners'

import { XImage,XText,TabNav,XTextInput,Navigator,SelectInput,Pagination,LineList,BoxButton,ImageButton,LinkButton,SimpleButton,ModalForm,AnimatedBox,XScrollView } from '../../components'

import { Screen } from '../layout'

import { User } from '../../models'

import { UsersFetcher, OperationsFetcher } from "../../requests"

let GLOB = { clientId: 0, dataFilter: {}, clientOptions: [] }

class Header extends Component{
  constructor(props){
    super(props)
    this.state = {ready: false, filter: false, force_pre_assignment: false}

    GLOB.clientId = 0
    GLOB.dataFilter = {}
    GLOB.clientOptions = []

    this.ORstyle = []
    this.ORstyle["landscape"] = {
                                  body: { flexDirection: 'column', width: '25%' },
                                  left: { marginLeft: 0, alignSelf: 'flex-start', marginTop: 0 },
                                  form: { height: 45 }
                                }
    this.ORstyle["portrait"] =  {
                                  body: { flexDirection: 'row' },
                                  left: {},
                                  form: { height: '100%' }
                                }

    this.filterLocked = false
    this.filterCount = 0
    this.filterClock = null
    this.customers = []

    this.renderCustomerSelection = this.renderCustomerSelection.bind(this)
    this.openFilter = this.openFilter.bind(this)
    this.closeFilter = this.closeFilter.bind(this)
    this.formInputs = this.formInputs.bind(this)

    this.generateStyles()
  }

  componentDidMount(){
    const call = ()=>{
      if(User.isUpdating()){
        setTimeout(call, 1000)
      }
      else{
        users = User.getCustomers().sorted("code")

        OperationsFetcher.waitFor([`getCustomersOptions(${JSON.stringify(users.map(usr=>{ return usr.id_idocus}))})`], responses => {
          GLOB.clientOptions = responses[0].options || []

          const filterUsers = users.map((usr) => {
            if(GLOB.clientOptions.find(o => { return o.user_id == usr.id_idocus }))
              return usr
          })

          this.customers = [{value:0, label:"Selectionnez un dossier"}].concat( User.createSelection(arrayCompact(filterUsers, true)) )

          if(this.customers.length == 2){
            GLOB.clientId = this.customers[1].value
            EventRegister.emit('refreshDatas')
          }

          this.setState({ready: true})
        })
      }
    }

    setTimeout(call, 1000)
  }

  openFilter(){
    this.setState({filter: true})
  }

  closeFilter(withFilter="none"){
    const form = this.refs.form_1
    GLOB.dataFilter = {}

    if(isPresent(form.values.start_date) || isPresent(form.values.end_date))
      GLOB.dataFilter['date'] = {
                                  start_date: form.values.start_date,
                                  end_date: form.values.end_date,
                                }

    if(isPresent(form.values.bank_name) || isPresent(form.values.number))
      GLOB.dataFilter['bank_account'] =   {
                                            bank_name : form.values.bank_name,
                                            number : form.values.number,
                                          }

    GLOB.dataFilter['category'] = form.values.category
    GLOB.dataFilter['label'] = form.values.label
    GLOB.dataFilter['pre_assigned'] = form.values.pre_assigned

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

  async handleClientChange(value){
    GLOB.clientId = value
    this.props.onFilter()

    let force_pre_assignment = false
    if(value > 0 && GLOB.clientOptions.find(o => { return o.user_id == value && o.force_pre_assignment }))
      force_pre_assignment = true

    this.setState({ force_pre_assignment: force_pre_assignment })
  }

  formInputs(){
    let year = formatDate(new Date(), 'YYYY')
    let month = formatDate(new Date(), 'MM')
    let day = formatDate(new Date(), 'DD')
    month = parseInt(month) + 2
    if(month > 12){
      month = 1
      year = parseInt(year) + 1
    }
    const max_date = `${year}-${formatNumber(month, '00')}-${day}`

    let start_date = ''
    let end_date = ''
    let service = ''
    let account = ''
    let category = ''
    let label = ''
    let pre_assigned = ''

    try{ start_date = GLOB.dataFilter.date.start_date }catch(e){}
    try{ end_date = GLOB.dataFilter.date.end_date }catch(e){}
    try{ service = GLOB.dataFilter.bank_account.bank_name }catch(e){}
    try{ account = GLOB.dataFilter.bank_account.number }catch(e){}
    try{ category = GLOB.dataFilter.category }catch(e){}
    try{ label = GLOB.dataFilter.label }catch(e){}
    try{ pre_assigned = GLOB.dataFilter.pre_assigned }catch(e){}

    const inputs =  [
                      { label:'Date début >=', name: 'start_date', type: "date", allowBlank: true, maxDate: max_date, value: start_date },
                      { label:'Date fin <=', name: 'end_date', type: "date", allowBlank: true, maxDate: max_date, value: end_date },
                      { label:'Sevice', name: 'bank_name', value: service },
                      { label:'Compte', name: 'number', value: account },
                      { label:'Catégorie', name: 'category', value: category },
                      { label:'Libellé', name: 'label', value: label },
                      { label:'Pré-affectation', name: 'pre_assigned', type: 'select', dataOptions:[{label: '', value: ''}, {label: 'Oui', value: 'pre_assigned'}, {label: 'Non', value: 'not_pre_assigned'}, {label: 'En attente', value: 'is_waiting'}], value: pre_assigned },
                    ]

    return inputs
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      container:{
                  flex:0,
                  backgroundColor:'#E1E2DD',
                  width:'100%'
                },
      left: {
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
      select: {
                flex:0,
                height: 25,
                width:'100%'
              },
      label:{
              flex: 0,
              color:'#707070',
              fontSize:12,
              fontWeight:'bold',
              width:'100%',
              backgroundColor: '#FFF'
            },
      form:{
            flex:1,
            backgroundColor:'#FFF',
            paddingHorizontal:8,

            elevation: 7, //Android Shadow
            
            shadowColor: '#000',                  //===
            shadowOffset: {width: 0, height: 0},  //=== iOs shadow    
            shadowOpacity: 0.8,                   //===
            shadowRadius: 2,                      //===

            height: '100%',
            maxHeight: '100%',
            justifyContent: 'center',
            alignItems:'center'
          }
    })
  }

  renderCustomerSelection(){
    let inputSelection = null

    if(this.customers.length == 2)
      inputSelection = <XText style={this.styles.label} numberOfLines={2}>{this.customers[1].label}</XText>
    else
      inputSelection = <SelectInput textInfo={`Clients (${this.customers.length - 1})`} filterSearch={true} dataOptions={this.customers} CStyle={this.styles.select} onChange={(value) => this.handleClientChange(value)}/>

    return inputSelection
  }

  render(){
    return  <View style={[this.styles.container, Theme.head.shape, { padding: 0 }, this.ORstyle[this.props.orientation].body]}>
              { this.state.filter && 
                <ModalForm  ref='form_1'
                            title="Filtre"
                            dismiss={()=>this.closeFilter("none")}
                            inputs={this.formInputs()}
                            buttons={[
                              {title: "Filtrer", withDismiss: true, action: ()=>this.closeFilter("filter")},
                              {title: "Annuler filtre", withDismiss: true, action: ()=>this.closeFilter("reInit")},
                            ]}
                />
              }
              <View style={[this.styles.left, this.ORstyle[this.props.orientation].left]}>
                <View style={[this.styles.form, this.ORstyle[this.props.orientation].form]}>
                  { this.state.ready && this.renderCustomerSelection() }
                  { !this.state.ready && <XImage loader={true} width={40} height={40} /> }
                  { this.state.force_pre_assignment && this.props.waitingOperations > 0 && <SimpleButton CStyle={[Theme.secondary_button.shape, {flex:0, marginVertical: 5, height: 25, width:'98%'}]} TStyle={Theme.secondary_button.text} title='Forcer la pré-affectation' onPress={()=>{this.props.forcePreAssignment()}}/> }
                </View>
              </View>
              <View style={this.styles.right}>
                <View style={{flex:1, flexDirection:'row', marginLeft: 3, padding: 5}}>
                  <BoxButton title="Filtre" blink={!this.state.filter && this.checkFilterActive()} onPress={()=>{this.openFilter()}} source={{icon: "filter"}} />
                </View>
              </View>
            </View>
  }
}

class OrderBox extends Component{
  constructor(props){
    super(props)
    this.state = {show: false}

    this.generateStyles()
  }

  componentWillReceiveProps(prevProps){
    if(prevProps.visible === true){
      this.setState({show: true})
    }
    else if(prevProps.visible === false){
      if(this.refs.animatedOptions)
        this.refs.animatedOptions.leave(()=>this.setState({show: false}))
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
                    <LinkButton onPress={()=>this.handleOrder(['Sevice','bank_accounts.bank_name'])} title='Sevice' CStyle={this.styles.list} />
                    <LinkButton onPress={()=>this.handleOrder(['Compte','bank_accounts.number'])} title='Compte' CStyle={this.styles.list} />
                    <LinkButton onPress={()=>this.handleOrder(['Catégorie','category'])} title='Catégorie' CStyle={this.styles.list} />
                    <LinkButton onPress={()=>this.handleOrder(['Libellé','label'])} title='Libellé' CStyle={this.styles.list} />
                    <LinkButton onPress={()=>this.handleOrder(['Montant','amount'])} title='Montant' CStyle={this.styles.list} />
                  </View>
              </AnimatedBox>
    }
    else
    {
      return null
    }
  }
}

class BoxOperations extends Component {
  constructor(props){
    super(props)

    this.state = { showDetails: false }

    this.generateStyles()
  }

  handleClick(){
    if(this.state.showDetails)
      this.setState({ showDetails: false })
    else
      this.setState({ showDetails: true })
  }

  generateStyles(){
    this.styles = StyleSheet.create({
        container: {
                      flex:1,
                      flexDirection:'row',
                      alignItems:'center',
                      paddingLeft:'7%',
                      paddingRight:'15%',
                      paddingVertical:10,
                    },
        image:{
                flex:0,
                width:19,
                height:19,
                marginRight:20
              }
    })
  }

  renderDetails(){
    const operation = this.props.data
    return <View style={{flex: 0, paddingHorizontal: 10, paddingBottom: 10, borderColor: '#999', borderTopWidth: 1, marginTop: 2}}>
            <XText style={{flex: 0}}>Date op. : <XText style={{flex:0, fontWeight: 'bold'}}>{formatDate(operation.date, 'DD-MM-YYYY')}</XText></XText>
            <XText style={{flex: 0}}>Service : <XText style={{flex:0, fontWeight: 'bold'}}>{operation.service}</XText></XText>
            <XText style={{flex: 0}}>Compte : <XText style={{flex:0, fontWeight: 'bold'}}>{operation.compte}</XText></XText>
            <XText style={{flex: 0}}>Catégorie : <XText style={{flex:0, fontWeight: 'bold'}}>{operation.category}</XText></XText>
            <XText style={{flex: 0}}>Montant : <XText style={{flex:0, fontWeight: 'bold'}}>{operation.amount + ' ' + operation.unit}</XText></XText>
            <XText style={{flex: 0}}>Pré-affecté : <XText style={{flex:0, fontWeight: 'bold'}}>{operation.pre_assigned}</XText></XText>
           </View>
  }

  render(){
    const arrow = this.state.showDetails ? 'caret-down' : 'caret-right'
    const titleCut = this.state.showDetails ? 10 : 1

    return  <TouchableOpacity style={{flex:1}} onPress={()=>this.handleClick()} >
              <View style={this.styles.container}>
                <XImage source={{icon: arrow}} style={this.styles.image} />
                <XText style={{flex: 0}} numberOfLines={titleCut}>{this.props.data.label.toString()}</XText>
              </View>
              { this.state.showDetails && this.renderDetails() }
            </TouchableOpacity>
  }
}

class OperationsScreen extends Component {
  constructor(props){
    super(props)

    GLOB.dataFilter = {}
    GLOB.clientOptions = []
    GLOB.clientId = 0

    super(props)

    this.state = { orientation: 'portrait', ready: false, datas: [], limitPage: 1, total: 0, waiting_operations_count: 0, orderBox: false, orderText: null, orderBy: "", direction: "" }

    this.ORstyle = []
    this.ORstyle["landscape"] = {
                                  body: { flexDirection: 'row' },
                                }
    this.ORstyle["portrait"] =  {
                                  body: { flexDirection: 'column' },
                                }

    this.order = {}
    this.page = 1

    this.changePage = this.changePage.bind(this)
    this.refreshDatas = this.refreshDatas.bind(this)
    this.refreshDatas = this.refreshDatas.bind(this)
    this.toggleOrderBox = this.toggleOrderBox.bind(this)
    this.handleOrder = this.handleOrder.bind(this)
    this.forcePreAssignment = this.forcePreAssignment.bind(this)
  }

  handleOrientation(orientation){
    this.setState({orientation: orientation}) // exemple use of Orientation changing
  }

  componentWillMount(){
    this.orderBoxListener = EventRegister.on('clickOrderBox', (data) => {
        this.toggleOrderBox()
    })

    this.refreshDataListener = EventRegister.on('refreshDatas', (data) => {
      this.refreshDatas()
    })
  }

  componentWillUnmount(){
    EventRegister.rm(this.orderBoxListener)
    EventRegister.rm(this.refreshDataListener)
  }

  componentDidMount(){
    this.refreshDatas()
  }

  changePage(page=1){
    this.page = page
    this.refreshDatas(false)
  }

  forcePreAssignment(){
    const call = ()=>{
      OperationsFetcher.forcePreAssignment(GLOB.clientId)
      Notice.info('Pré-affectation en cours ...')
      this.setState({ waiting_operations_count: 0 })
    }

    Notice.alert('Pré-affectation', `Voulez vous vraiment forcer la pré-affectation de ${this.state.waiting_operations_count} opérations(s)?`, 
      [
        {text: 'Oui', onPress: () => call() },
        {text: 'Non', style: 'cancel'}
      ]
    )
  }

  toggleOrderBox(){
    if(this.state.datas.length > 0)
      this.setState({orderBox: !this.state.orderBox})
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
    this.setState({orderText: order_text, orderBy: order_by, direction: direction})
  }

  async changeDirectionSort(){
    await this.setState({direction: !this.state.direction})
    this.handleOrder([], this.state.direction)
  }

  refreshDatas(renew = true){
    if(renew)
      this.page = 1

    this.setState({ready: false})

    if(GLOB.clientId > 0)
    {
      OperationsFetcher.waitFor([`getOperations(${this.page}, "${GLOB.clientId}", ${JSON.stringify({order_by: this.order.order_by, direction: this.order.direction})},  ${JSON.stringify(GLOB.dataFilter)})`], responses=>{
          responses.map(r=>{
            if(r.error)
            {
              Notice.danger(r.message, { name: r.message })
              this.setState({ready: true, limitPage: 1, total: 0})
            }
            else
            {
              let datas = r.operations

              this.setState({ready: true, datas: datas, limitPage: r.nb_pages, total: r.total, waiting_operations_count: r.waiting_operations_count})
            }
        })
      })
    }
    else
    {
      this.setState({ ready: true, datas: [], limitPage: 1, total: 0, waiting_operations_count: 0 })
    }
  }

  renderOptions(){
    return <ImageButton source={{uri:"options"}} 
                        CStyle={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'center', minWidth:50}}
                        IStyle={{flex:0, width:7, height:36}}
                        onPress={()=>EventRegister.emit('clickOrderBox', true)} />
  }

  render() {
      const arrow_direction = this.state.direction? 'V' : 'Λ'

      return (
        <Screen style={{flex: 1, flexDirection: 'column'}}
                onChangeOrientation={(orientation)=>this.handleOrientation(orientation)}
                title='Mes opé. bancaires'
                name='Operations'
                withMenu={true}
                options={ this.renderOptions() }
                navigation={this.props.navigation}>
          <View style={[{flex: 1}, this.ORstyle[this.state.orientation].body]}>
            <Header orientation={this.state.orientation} onFilter={()=>this.refreshDatas()} waitingOperations={this.state.waiting_operations_count} forcePreAssignment={()=>{this.forcePreAssignment()}} />
            <XScrollView style={{flex:1, padding:3}} >
              {this.state.orderText && this.state.datas.length > 0 && 
                <View style={{flex:1,flexDirection:'row',paddingVertical:5,alignItems:'center'}}>
                  <XText style={{flex:0}}>Trie par: <XText style={{fontWeight:'bold'}}>{this.state.orderText}</XText></XText>
                  <TouchableOpacity style={{flex:0,width:30,alignItems:'center'}} onPress={()=>this.changeDirectionSort()}>
                    <XText style={{fontSize:14, fontWeight:'bold'}}>{arrow_direction}</XText>
                  </TouchableOpacity>
                </View>
              }
              <XText style={[{flex:0, textAlign:'center', fontSize:16, fontWeight:'bold'}, Theme.lists.title]}>{`${this.state.total} : Opérations`}</XText>
              <Pagination onPageChanged={(page)=>this.changePage(page)} nb_pages={this.state.limitPage} page={this.page} CStyle={{marginBottom: 0}} />
              <LineList datas={this.state.datas}
                        waitingData={!this.state.ready}
                        renderItems={(data) => <BoxOperations data={data} /> } />

              <Pagination onPageChanged={(page)=>this.changePage(page)} nb_pages={this.state.limitPage} page={this.page} />
            </XScrollView>
          </View>
          <OrderBox visible={this.state.orderBox} handleOrder={this.handleOrder}/>
        </Screen>
      )
    }
}

export default OperationsScreen;
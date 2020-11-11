import React, { Component } from 'react'
import { StyleSheet,View,TouchableOpacity } from 'react-native'

import { XImage,XText,TabNav,XTextInput,Navigator,SelectInput,Pagination,LineList,BoxButton,ModalForm,XScrollView } from '../../components'

import { Screen } from '../layout'

import { User, Parameters } from '../../models'

import { UsersFetcher, DocumentsFetcher } from "../../requests"

let GLOB = { clientId: 0, dataFilter: {} }

class Header extends Component{
  constructor(props){
    super(props)
    this.state = {search: "", ready: false, filter: false}

    GLOB.clientId = 0
    GLOB.dataFilter = {}

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
        this.customers = [{value:0, label:"Tous"}].concat(User.createSelection(users))
        this.setState({ready: true})
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

    GLOB.dataFilter['by_all'] = {
                                  position: form.values.position,
                                  position_operation: isPresent(form.values.position)? '0' : ''
                                }
    GLOB.dataFilter['by_pack'] =  {
                                    name: form.values.name,
                                  }
    GLOB.dataFilter['by_piece'] = {
                                    content: form.values.content,
                                    tags: form.values.tags,
                                  }
    GLOB.dataFilter['by_preseizure'] =  {
                                          is_delivered: form.values.is_delivered,
                                          third_party: form.values.third_party,
                                          piece_number: form.values.piece_number,
                                          delivery_tried_at: form.values.delivery_tried_at,
                                          delivery_tried_at_operation: isPresent(form.values.delivery_tried_at)? '0' : '',
                                          date: form.values.date,
                                          date_operation: isPresent(form.values.date)? '0' : '',
                                          amount: form.values.amount,
                                          amount_operation: isPresent(form.values.amount)? '0' : '',
                                        }

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
  }

  formInputs(){
    let name = ''
    let content = ''
    let position = ''
    let tags = ''
    let is_delivered = ''
    let delivery_tried_at = ''
    let date = ''
    let third_party = ''
    let piece_number = ''
    let amount = ''

    try{ name = GLOB.dataFilter.by_pack.name }catch(e){}
    try{ position = GLOB.dataFilter.by_all.position }catch(e){}
    try{ content = GLOB.dataFilter.by_piece.content }catch(e){}
    try{ tags = GLOB.dataFilter.by_piece.tags }catch(e){}
    try{ is_delivered = GLOB.dataFilter.by_preseizure.is_delivered }catch(e){}
    try{ delivery_tried_at = GLOB.dataFilter.by_preseizure.delivery_tried_at }catch(e){}
    try{ date = GLOB.dataFilter.by_preseizure.date }catch(e){}
    try{ third_party = GLOB.dataFilter.by_preseizure.third_party }catch(e){}
    try{ piece_number = GLOB.dataFilter.by_preseizure.piece_number }catch(e){}
    try{ amount = GLOB.dataFilter.by_preseizure.amount }catch(e){}

    let year = formatDate(new Date(), 'YYYY')
    let month = formatDate(new Date(), 'MM')
    let day = formatDate(new Date(), 'DD')
    month = parseInt(month) + 4
    if(month > 12){
      month = 1
      year = parseInt(year) + 1
    }
    const max_date = `${year}-${formatNumber(month, '00')}-${day}`

    const inputs =  [
                      { label:'Nom du lot', name: 'name', value: name },
                      { label:'Contenu', name: 'content', value: content },
                      { label:'N° de pièce iDocus', name: 'position', keyboardType: 'numeric', value: position },
                      { label:'Tags', name: 'tags', value: tags },
                      { separator:'Filtre lié à la pré-affectation' },
                      { label:'Livraison écriture comptable', name: 'is_delivered', type: 'select', dataOptions:[{label: 'Tous', value: ''}, {label: 'Livrée', value: '1'}, {label: 'Non livrée', value: '2'}], value: is_delivered },
                      { label:'Date livraison', name: 'delivery_tried_at', type: 'date', allowBlank: true, value: delivery_tried_at },
                      { label:'Date facture', name: 'date', type: 'date', maxDate: max_date, allowBlank: true, value: date },
                      { label:'Nom de tiers', name: 'third_party', value: third_party },
                      { label:'N° de pièce d\'origine', name: 'piece_number', value: piece_number },
                      { label:'Montant', name: 'amount', keyboardType: 'decimal-pad', value: amount },
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

            // elevation: 7, //Android Shadow
            
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
                            dismiss={()=>this.closeFilter("filter")}
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

class BoxDocs extends Component {
  constructor(props){
    super(props)
    this.generateStyles()
  }

  handleClick(){
    if(this.props.data.type == 'pack')
      CurrentScreen.goTo('Publish', {type: 'pack', pack: this.props.data, filter: GLOB.dataFilter})
    else
      CurrentScreen.goTo('Publish', {type: 'report', report: this.props.data, filter: GLOB.dataFilter})
  }

  generateStyles(){
    this.styles = StyleSheet.create({
        container: {
                      flex:1,
                      flexDirection:'row',
                      alignItems:'center',
                      paddingLeft:'15%',
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

  render(){
    return  <TouchableOpacity style={{flex:1}} onPress={()=>this.handleClick()} >
              <View style={this.styles.container}>
                <XImage source={{icon: "caret-right"}} style={this.styles.image} />
                <XText>{this.props.data.name.toString()}</XText>
              </View>
            </TouchableOpacity>
  }
}

class DataBloc extends Component {
  constructor(props){
    super(props)

    this.state = { ready: false, datas: [], limitPage: 1, total: 0 }

    this.page = 1

    this.type = this.props.type || 'documents'
    this.title = (this.type == 'documents')? 'Document(s)' : 'Opération(s)'

    this.changePage = this.changePage.bind(this)
    this.refreshDatas = this.refreshDatas.bind(this)
  }

  componentDidMount(){
    this.refreshDatas()
  }

  refreshDatas(renew = true){
    if(renew)
      this.page = 1

    this.setState({ready: false})

    let url = `getPacks(${this.page}, "${GLOB.clientId}", ${JSON.stringify(GLOB.dataFilter)})`
    if(this.type != 'documents')
      url = `getReports(${this.page}, "${GLOB.clientId}", ${JSON.stringify(GLOB.dataFilter)})`

    DocumentsFetcher.waitFor([url], responses=>{
        responses.map(r=>{
          if(r.error)
          {
            Notice.danger(r.message, { name: r.message })
            this.setState({ready: true, limitPage: 1, total: 0})
          }
          else
          {
            let datas = []
            if(this.type == 'documents')
              datas = r.packs
            else
              datas = r.reports

            this.setState({ready: true, datas: datas, limitPage: r.nb_pages, total: r.total})
          }
      })
    })
  }

  changePage(page=1){
    this.page = page
    this.refreshDatas(false)
  }

  render(){
    return  <XScrollView style={{flex:1, padding:3}} >
              <XText style={[{flex:0, textAlign:'center', fontSize:16, fontWeight:'bold'}, Theme.lists.title]}>{`${this.state.total} : ${this.title}`}</XText>
              <Pagination onPageChanged={(page)=>this.changePage(page)} nb_pages={this.state.limitPage} page={this.page} CStyle={{marginBottom: 0}} />
              <LineList datas={this.state.datas}
                        waitingData={!this.state.ready}
                        renderItems={(data) => <BoxDocs data={data} /> } />
              <Pagination onPageChanged={(page)=>this.changePage(page)} nb_pages={this.state.limitPage} page={this.page} />
            </XScrollView>
  }
}

class InvoicesScreen extends Component {
  constructor(props){
    super(props)

    this.state = {orientation: 'portrait'}
    this.show_preseizures = (Parameters.getParameter('show_preseizures') == 'false')? false : true

    GLOB.dataFilter = {}
    GLOB.clientId = 0

    this.ORstyle = []
    this.ORstyle["landscape"] = {
                                  body: { flexDirection: 'row' },
                                }
    this.ORstyle["portrait"] =  {
                                  body: { flexDirection: 'column' },
                                }

    this.refreshDatas = this.refreshDatas.bind(this)
  }

  handleOrientation(orientation){
    this.setState({orientation: orientation}) // exemple use of Orientation changing
  }

  refreshDatas(renew = true){
    setTimeout(()=>{
      try{ this.refs.documents.refreshDatas(renew) }catch(e){}
      try{ this.refs.operations.refreshDatas(renew) }catch(e){}
    }, 1)
  }

  render() {
      let headers = [{title: 'Documents'}]
      if(this.show_preseizures){ headers = headers.concat([{title: "Opé. Bancaires"}]) }

      return (
        <Screen style={{flex: 1, flexDirection: 'column'}}
                onChangeOrientation={(orientation)=>this.handleOrientation(orientation)}
                title='Pièces / Pré-affectations'
                name='Invoices'
                withMenu={true}
                navigation={this.props.navigation}>
          <View style={[{flex: 1}, this.ORstyle[this.state.orientation].body]}>
            <Header orientation={this.state.orientation} onFilter={()=>this.refreshDatas()} />
            <TabNav 
              headers={ headers }
            >
              <DataBloc ref='documents' type='documents' />
              { this.show_preseizures && <DataBloc ref='operations' type='operations' /> }
            </TabNav>
          </View>
        </Screen>
      )
    }
}

export default InvoicesScreen;
import React, { Component } from 'react'
import {StyleSheet,View,ScrollView,TouchableOpacity} from 'react-native'
import { EventRegister } from 'react-native-event-listeners'

import { AnimatedBox,XImage,XText,Navigator,LineList,Pagination,ModalForm,BoxButton,LinkButton,ImageButton} from '../../components'

import { Screen } from '../layout'

import {PaperProcess} from "../../requests"

let GLOB = {  datas:[],
              dataFilter: {},
              types: [{value:"", label:"---"},{value:"kit", label:"Kit"},{value:"receipt", label:"Réception"},{value:"scan", label:"Numérisation"},{value:"return", label:"Retour"}],
            }

function getType(value=""){
  let response = "---"
  GLOB.types.map(i => { if(i.value==value){response = i.label} })
  return response
}

class Header extends Component{
  constructor(props){
    super(props)
    this.state = {filter: false}

    this.ORstyle = []
    this.ORstyle["landscape"] = {
                                  body: { flexDirection: 'column', width: 100 },
                                  left: { flexDirection: 'column', paddingLeft:0 }
                                }
    this.ORstyle["portrait"] =  {
                                  body: { flexDirection: 'row' },
                                  left: { flexDirection: 'row' }
                                }

    this.closeFilter = this.closeFilter.bind(this)

    this.generateStyles()
  }

  openFilter(){
    this.setState({filter: true})
  }

  closeFilter(withFilter="none"){
    const form = this.refs.form_1
    GLOB.dataFilter = { 
                        created_at_start: form.values.created_at_start, 
                        created_at_end:form.values.created_at_end, 
                        type:form.values.type,
                        customer_code:form.values.customer_code,
                        customer_company:form.values.customer_company,
                        tracking_number:form.values.tracking_number,
                        pack_name:form.values.pack_name
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

  generateStyles(){
    this.styles = StyleSheet.create({
      container:{
        flex:0,
        flexDirection:'row',
        width:'100%',
      },
      left:{
        flex:2,
        flexDirection:'row',
        alignItems:'center',
        paddingLeft:20,
        justifyContent:'center',
      },
      right:{
        flex:1,
        flexDirection:'row',
        paddingHorizontal:20,
      },
      image:{
        flex:0,
        width:30,
        height:30,
        marginRight:15
      },
      filterbox:{
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center'
      }
    });
  }

  render(){
    return  <View style={[this.styles.container, Theme.head.shape, this.ORstyle[this.props.orientation].body]}>
              { this.state.filter && 
                <ModalForm  ref="form_1"
                            title="Filtre"
                            dismiss={()=>this.closeFilter("none")}
                            inputs={[
                              {label:'Date de début', name: 'created_at_start', type:'date', allowBlank: true, value: GLOB.dataFilter.created_at_start},
                              {label:'Date de fin', name: 'created_at_end', type:'date', allowBlank: true, value: GLOB.dataFilter.created_at_end},
                              {label:'Type', name: 'type', type:'select', dataOptions: GLOB.types, value: GLOB.dataFilter.type},
                              {label:'Code client', name: 'customer_code', value: GLOB.dataFilter.customer_code},
                              {label:'Nom de la société', name: 'customer_company', value: GLOB.dataFilter.customer_company},
                              {label:'N° de suivi', name: 'tracking_number', keyboardType:'numeric', value: GLOB.dataFilter.tracking_number},
                              {label:'Nom du lot', name: 'pack_name', value: GLOB.dataFilter.pack_name},
                            ]}
                            buttons={[
                              {title: "Filtrer", withDismiss: true, action: ()=>this.closeFilter("filter")},
                              {title: "Annuler filtre", withDismiss: true, action: ()=>this.closeFilter("reInit")},
                            ]}
                />
              }
              <View style={[this.styles.left, this.ORstyle[this.props.orientation].left]}>
                <XImage source={{icon:"dashboard"}} color='#C0D838' size={30} style={this.styles.image} />
                <XText style={[{flex:2, fontSize:16,fontWeight:'bold', paddingHorizontal: 5}, Theme.head.text]}>Suivi : {this.props.dataCount}</XText>
              </View>
              <View style={this.styles.right}> 
                <BoxButton title="Filtre" blink={!this.state.filter && this.checkFilterActive()} onPress={()=>{this.openFilter()}} source={{icon: "filter"}}/>
              </View>
            </View>
  }
}

class BoxStat extends Component{
  constructor(props){
    super(props)
    this.state = {showDetails: false}

    this.generateStyles()
  }

 toggleDetails(){
    this.setState({showDetails: !this.state.showDetails})
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
        width:15,
        height:15,
        marginRight:8
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
                <XImage source={{icon: arrow}} size={16} color={Theme.global_text.color} style={this.styles.image} />
                <XText style={{fontSize:12, fontWeight:'bold', flex:1}}>{this.props.data.company}
                  {' ('} 
                    <XText style={{fontSize:9}}>{formatDate(this.props.data.date, "DD-MM-YYYY HH:ii") 
                    + ' | ' + getType(this.props.data.type)}
                    </XText>
                  {')'} 
                </XText>
              </View>
              {
                  this.state.showDetails == true && 
                    <View style={this.styles.infos}>
                      <XText style={this.styles.champ}><XText style={this.styles.label}>Date : </XText>{formatDate(this.props.data.date, "DD-MM-YYYY HH:ii")}</XText>
                      <XText style={this.styles.champ}><XText style={this.styles.label}>Type : </XText>{getType(this.props.data.type)}</XText>
                      <XText style={this.styles.champ}><XText style={this.styles.label}>Code client : </XText>{this.props.data.code}</XText>
                      <XText style={this.styles.champ}><XText style={this.styles.label}>Société : </XText>{this.props.data.company}</XText>
                      <XText style={this.styles.champ}><XText style={this.styles.label}>N°de suivi: </XText>{this.props.data.number}</XText>
                      <XText style={this.styles.champ}><XText style={this.styles.label}>Nom du lot: </XText>{this.props.data.packname}</XText>
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
                    <LinkButton onPress={()=>this.handleOrder(['Type','type'])} title='Type' CStyle={this.styles.list} />
                    <LinkButton onPress={()=>this.handleOrder(['Code client','code'])} title='Code client' CStyle={this.styles.list} />
                    <LinkButton onPress={()=>this.handleOrder(['N°de suivi','number'])} title='N°de suivi' CStyle={this.styles.list} />
                    <LinkButton onPress={()=>this.handleOrder(['Nom de lot','packname'])} title='Nom du lot' CStyle={this.styles.list} />
                  </View>
              </AnimatedBox>
    }
    else
    {
      return null
    }
  }
}

class StatsScreen extends Component {
  constructor(props){
    super(props)

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

  componentWillMount(){
    this.orderBoxListener = EventRegister.on('clickOrderBox', (data) => {
        this.toggleOrderBox()
    })
  }

  componentWillUnmount(){
    EventRegister.rm(this.orderBoxListener)
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

  refreshDatas(renew = true){
    if(renew){
      this.page = 1
    }

    this.setState({ready: false, dataList: []})

    PaperProcess.waitFor([`getStats(${JSON.stringify(GLOB.dataFilter)}, ${this.page}, ${JSON.stringify(this.order)})`], responses=>{
      if(responses[0].error)
      {
        Notice.danger(responses[0].message, { name: responses[0].message })
      }
      else
      {
        GLOB.datas = responses[0].data_stats || []
      }

      this.limit_page = responses[0].nb_pages || 1
      this.total = responses[0].total || 0
      this.setState({ready: true, dataList: GLOB.datas})
    })
  }

  renderStats(){
    const arrow_direction = this.state.direction? 'V' : 'Λ'

    return  <ScrollView style={{flex:1, padding:3}} keyboardShouldPersistTaps='always' >
                {this.state.orderText && this.state.dataList.length > 0 && 
                  <View style={{flex:1,flexDirection:'row',paddingVertical:5,alignItems:'center'}}>
                    <XText style={{flex:0}}>Trie par: <XText style={{fontWeight:'bold'}}>{this.state.orderText}</XText></XText>
                    <TouchableOpacity style={{flex:0,width:30,alignItems:'center'}} onPress={()=>this.changeDirectionSort()}>
                      <XText style={{fontSize:14, fontWeight:'bold'}}>{arrow_direction}</XText>
                    </TouchableOpacity>
                  </View>
                }
                <Pagination onPageChanged={(page)=>this.changePage(page)} nb_pages={this.limit_page} page={this.page} />
                <LineList datas={this.state.dataList}
                          waitingData={!this.state.ready}
                          renderItems={(data) => <BoxStat data={data} /> } />
                <Pagination onPageChanged={(page)=>this.changePage(page)} nb_pages={this.limit_page} page={this.page} />
             </ScrollView>
  }

  renderOptions(){
    return <ImageButton source={{uri:"options"}} 
                        CStyle={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'center', minWidth:50}}
                        IStyle={{flex:0, width:7, height:36}}
                        onPress={()=>EventRegister.emit('clickOrderBox', true)} />
  }

  render() {
      return (
          <Screen style={[{flex:1}, Theme.body]}
                  onChangeOrientation={(orientation)=>this.handleOrientation(orientation)}
                  navigation={this.props.navigation}
                  title="Suivi"
                  name='Stats'
                  withMenu={true}
                  options={ this.renderOptions() }
          >
            <View style={[{flex: 1}, this.ORstyle[this.state.orientation].body]}>
              <Header orientation={this.state.orientation} dataCount={this.total} onFilter={()=>this.refreshDatas()}/>
              { this.renderStats() }
            </View>
            <OrderBox visible={this.state.orderBox} handleOrder={this.handleOrder}/>
          </Screen>
      );
    }
}

export default StatsScreen;
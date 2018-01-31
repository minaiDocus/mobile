import Config from '../../Config'

import React, { Component } from 'react'
import {StyleSheet,Text,View,ScrollView,TouchableOpacity,Modal} from 'react-native'
import { EventRegister } from 'react-native-event-listeners'

import Screen from '../../components/screen'
import AnimatedBox from '../../components/animatedBox'
import {XImage} from '../../components/XComponents'
import Navigator from '../../components/navigator'
import {LineList} from '../../components/lists'
import Pagination from '../../components/pagination'
import ModalForm from '../../components/modalForm'
import {BoxButton, LinkButton, ImageButton} from '../../components/buttons'

import PaperProcess from "../../requests/paper_process"

let GLOB = {  navigation:{},
              datas:[],
              dataFilter: { created_at_start:'', 
                            created_at_end:'', 
                            type:'',
                            customer_code:'',
                            customer_company:'',
                            tracking_number:'',
                            pack_name:''},
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

    this.closeFilter = this.closeFilter.bind(this)

    this.generateStyles()
  }

  openFilter(){
    this.setState({filter: true})
  }

  closeFilter(withFilter="none"){
    if(withFilter == "reInit")
    {
      GLOB.dataFilter = { created_at_start:'', 
                          created_at_end:'', 
                          type:'',
                          customer_code:'',
                          customer_company:'',
                          tracking_number:'',
                          pack_name:''
                        }
    }

    if(withFilter != "none")
    {
      this.props.onFilter()
    }

    this.setState({filter: false})
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      container:{
        flex:0,
        flexDirection:'row',
        backgroundColor:'#E1E2DD',
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
        width:40,
        height:40,
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
    return  <View style={this.styles.container}>
              { this.state.filter && 
                <ModalForm  title="Filtre"
                            getValue={(name)=>{return eval(`${name}`)}}
                            setValue={(name, value)=>{eval(`${name} = "${value}"`)}}
                            inputs={[
                              {label:'Date de début :', name: 'GLOB.dataFilter.created_at_start', type:'date'},
                              {label:'Date de fin :', name: 'GLOB.dataFilter.created_at_end', type:'date'},
                              {label:'Type :', name: 'GLOB.dataFilter.type', type:'select', dataOptions: GLOB.types},
                              {label:'Code client :', name: 'GLOB.dataFilter.customer_code'},
                              {label:'Nom de la société :', name: 'GLOB.dataFilter.customer_company'},
                              {label:'N° de suivi :', name: 'GLOB.dataFilter.tracking_number', keyboardType:'numeric'},
                              {label:'Nom du lot :', name: 'GLOB.dataFilter.pack_name'},
                            ]}
                            buttons={[
                              {title: "Retour", action: ()=>this.closeFilter("none")},
                              {title: "Filtrer", action: ()=>this.closeFilter("filter")},
                              {title: "Annuler filtre", action: ()=>this.closeFilter("reInit")}, 
                            ]}
                />
              }
              <View style={this.styles.left}>
                <XImage source={{uri:"ico_suiv"}} style={this.styles.image} />
                <Text style={{flex:2, fontSize:18,fontWeight:'bold'}}>Suivi : {this.props.dataCount}</Text>
              </View>
              <View style={this.styles.right}> 
                <BoxButton title="Filtre" onPress={()=>{this.openFilter()}} source={{uri:"zoom_x"}} rayon={60}/>
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
    const arrow = (this.state.showDetails)? "arrow_down" : "arrow_up"

    return  <TouchableOpacity style={{flex:1, paddingVertical:10}} onPress={()=>this.toggleDetails()} >
              <View style={this.styles.container}>
                <XImage source={{uri:arrow}} style={this.styles.image} />
                <Text style={{fontSize:12, fontWeight:'bold', flex:1}}>{this.props.data.company}
                  {' ('} 
                    <Text style={{fontSize:9}}>{format_date(this.props.data.date, "DD-MM-YYYY HH:ii") 
                    + ' | ' + getType(this.props.data.type)}
                    </Text>
                  {')'} 
                </Text>
              </View>
              {
                  this.state.showDetails == true && 
                    <View style={this.styles.infos}>
                      <Text style={this.styles.champ}><Text style={this.styles.label}>Date : </Text>{format_date(this.props.data.date, "DD-MM-YYYY HH:ii")}</Text>
                      <Text style={this.styles.champ}><Text style={this.styles.label}>Type : </Text>{getType(this.props.data.type)}</Text>
                      <Text style={this.styles.champ}><Text style={this.styles.label}>Code client : </Text>{this.props.data.code}</Text>
                      <Text style={this.styles.champ}><Text style={this.styles.label}>Société : </Text>{this.props.data.company}</Text>
                      <Text style={this.styles.champ}><Text style={this.styles.label}>N°de suivi: </Text>{this.props.data.number}</Text>
                      <Text style={this.styles.champ}><Text style={this.styles.label}>Nom du lot: </Text>{this.props.data.packname}</Text>
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
                  <Text style={this.styles.title}>Trier par : </Text>
                  <View style={{flex:1, marginTop:5}}>
                    <LinkButton onPress={()=>this.handleOrder(['Date','date'])} title='Date' Pstyle={this.styles.list} />
                    <LinkButton onPress={()=>this.handleOrder(['Type','type'])} title='Type' Pstyle={this.styles.list} />
                    <LinkButton onPress={()=>this.handleOrder(['Code client','code'])} title='Code client' Pstyle={this.styles.list} />
                    <LinkButton onPress={()=>this.handleOrder(['N°de suivi','number'])} title='N°de suivi' Pstyle={this.styles.list} />
                    <LinkButton onPress={()=>this.handleOrder(['Nom de lot','packname'])} title='Nom du lot' Pstyle={this.styles.list} />
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
  static navigationOptions = {
       headerTitle: 'Suivi',
       headerRight: <ImageButton  source={{uri:"options"}} 
                                  Pstyle={{flex:1, paddingVertical:10, flexDirection:'column', alignItems:'center',minWidth:50}}
                                  Istyle={{width:7, height:36}}
                                  onPress={()=>EventRegister.emit('clickOrderBox', true)} />
  }

  constructor(props){
    super(props);
    GLOB.navigation = new Navigator(this.props.navigation)

    this.state = {ready: false, dataList: [], orderBox: false, orderText: null, orderBy: "", direction: ""}

    this.page = this.limit_page = 1
    this.order = {}
    this.total = 0

    this.renderStats = this.renderStats.bind(this)
    this.refreshDatas = this.refreshDatas.bind(this)
    this.toggleOrderBox = this.toggleOrderBox.bind(this)
    this.handleOrder = this.handleOrder.bind(this)
    this.changePage = this.changePage.bind(this)
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

  refreshDatas(renew = true){
    if(renew){
      this.page = 1
    }

    this.setState({ready: false, dataList: []})

    PaperProcess.wait_for(
      [`getStats(${JSON.stringify(GLOB.dataFilter)}, ${this.page}, ${JSON.stringify(this.order)})`],
      (responses)=>{
        if(responses[0].error)
        {
          Notice.danger(responses[0].message, true, responses[0].message)
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

    return  <ScrollView style={{flex:1, padding:3}}>
                {this.state.orderText && this.state.dataList.length > 0 && 
                  <View style={{flex:1,flexDirection:'row',paddingVertical:5,alignItems:'center'}}>
                    <Text style={{flex:0}}>Trie par: <Text style={{fontWeight:'bold'}}>{this.state.orderText}</Text></Text>
                    <TouchableOpacity style={{flex:0,width:30,alignItems:'center'}} onPress={()=>this.changeDirectionSort()}>
                      <Text style={{fontSize:14, fontWeight:'bold'}}>{arrow_direction}</Text>
                    </TouchableOpacity>
                  </View>
                }
                <LineList datas={this.state.dataList} 
                          renderItems={(data) => <BoxStat data={data} /> } />
                <Pagination onPageChanged={(page)=>this.changePage(page)} nb_pages={this.limit_page} page={this.page} />
             </ScrollView>
  }

  render() {
      return (
          <Screen style={{flex: 1, flexDirection: 'column',}}
                  navigation={GLOB.navigation}>
            <Header dataCount={this.total} onFilter={()=>this.refreshDatas()}/>
              {this.state.ready && this.renderStats()}
              {!this.state.ready && <XImage loader={true} width={70} height={70} style={{alignSelf:'center', marginTop:10}} />}
              <OrderBox visible={this.state.orderBox} handleOrder={this.handleOrder}/>
          </Screen>
      );
    }
}

export default StatsScreen;
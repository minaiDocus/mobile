import React, { Component } from 'react'
import Config from '../../Config'
import Screen from '../../components/screen'
import { EventRegister } from 'react-native-event-listeners'
import AnimatedBox from '../../components/animatedBox'
import {StyleSheet,Text,View,ScrollView,TouchableOpacity,Modal} from 'react-native'
import {XImage, XTextInput} from '../../components/XComponents'
import Navigator from '../../components/navigator'
import {LineList} from '../../components/lists'
import {SimpleButton, BoxButton, LinkButton, ImageButton} from '../../components/buttons'
import Pagination from '../../components/pagination'
import SelectInput from '../../components/select'
import DatePicker from '../../components/datePicker'


import Cfetcher from '../../components/dataFetcher'
import request1 from "../../requests/data_loader"

let Fetcher = new Cfetcher(request1)
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

class Inputs extends Component{
  constructor(props){
    super(props);
    this.state = {value: eval(`GLOB.dataFilter.${this.props.name}`)}
  }

  changeValue(value){
    this.setState({value: value});
    eval(`GLOB.dataFilter.${this.props.name} = "${value}"`)
  }

  render(){
    const stylePlus = this.props.style || {};
    const labelStyle = this.props.labelStyle || {};
    const inputStyle = this.props.inputStyle || {}; 

    const input = StyleSheet.create({
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
    });
    const type = this.props.type || 'input';
    return  <View style={[input.container, stylePlus]}>
              <Text style={[input.label, labelStyle]}>{this.props.label}</Text>
              {type == 'input' && <XTextInput {...this.props} value={this.state.value} onChangeText={(value)=>{this.changeValue(value)}} PStyle={[input.input, inputStyle]} />}
              {type == 'select' && <SelectInput selectedItem={this.state.value} Pstyle={{flex:1.3}} style={inputStyle} dataOptions={this.props.dataOptions} onChange={(value) => {this.changeValue(value)}} />}
              {type == 'date' && <DatePicker value={this.state.value} onChange={(date)=>this.changeValue(date)} style={{flex:1.3}} />}
            </View>
  }
}

class BoxFilter extends Component{
  constructor(props){
    super(props)
  }

  dismiss(type){
    this.props.dismiss(type)
  }

  filterProcess(type){
    if(type=="reInit")
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
    this.dismiss(true);
  }

  render(){
    const boxFilter = StyleSheet.create({
     container:{
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'rgba(0,0,0,0.7)',
        paddingVertical:20
      },
      box:{
        flex:0,
        backgroundColor:'#EBEBEB',
        width:'90%',
        borderRadius:10,
        paddingVertical:8
      },
      labels:{
        flex:0,
        width:15,
        height:15,
        marginRight:20
      },
      inputs:{
        flex:0,
        width:15,
        height:15,
        marginRight:20
      },
      head:{
        flex:0,
        height:35,
        backgroundColor:'#EBEBEB',
        borderColor:'#000',
        borderBottomWidth:1,
      },
      body:{
        flex:1,
        backgroundColor:'#fff',
      },
      foot:{
        flex:0,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#EBEBEB',
        borderColor:'#000',
        borderTopWidth:1,
        paddingVertical:7
      },
      buttons:{
        flex:1,
      }
    });
    return  <Modal transparent={true}
                   animationType="slide" 
                   visible={this.props.visible}
                   supportedOrientations={['portrait', 'landscape']}
                   onRequestClose={()=>{}}
            >
              <View style={boxFilter.container} >
                <View style={boxFilter.box}>
                  <View style={boxFilter.head}>
                    <Text style={{flex:1, textAlign:'center',fontSize:24}}>Filtres</Text>
                  </View>
                  <ScrollView style={boxFilter.body}>
                    <Inputs label='Date de début :' name={'created_at_start'} type='date'/>
                    <Inputs label='Date de fin :' name={'created_at_end'} type='date' />
                    <Inputs label='Type :' name={'type'} type='select' dataOptions={GLOB.types}  />
                    <Inputs label='Code client :' name={'customer_code'}/>
                    <Inputs label='Nom de la société :' name={'customer_company'}/>
                    <Inputs label='N° de suivi :' name={'tracking_number'} keyboardType='numeric' />
                    <Inputs label='Nom du lot :' name={'pack_name'}/>
                  </ScrollView>
                  <View style={boxFilter.foot}>
                    <View style={{flex:1, paddingHorizontal:5}}><SimpleButton title='Retour' onPress={()=>this.dismiss(false)} /></View>
                    <View style={{flex:1, paddingHorizontal:5}}><SimpleButton title='Filtrer' onPress={()=>this.filterProcess("filter")} /></View>
                    <View style={{flex:1, paddingHorizontal:5}}><SimpleButton title='Annuler filtre' onPress={()=>this.filterProcess("reInit")} /></View>
                  </View>
                </View>
              </View>
          </Modal>
  }
}

class Header extends Component{
  constructor(props){
    super(props)
    this.state = {filter: false}

    this.closeFilter = this.closeFilter.bind(this)
  }

  openFilter(){
    this.setState({filter: true})
  }

  closeFilter(withFilter){
    this.setState({filter: false});
    if(withFilter == true)
    {
      this.props.onFilter()
    }
  }

  render(){
  const headStyle = StyleSheet.create({
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
  return  <View style={headStyle.container}>
            <BoxFilter visible={this.state.filter} dismiss={this.closeFilter}/>
            <View style={headStyle.left}>
              <XImage source={{uri:"ico_suiv"}} style={headStyle.image} />
              <Text style={{flex:2, fontSize:18,fontWeight:'bold'}}>Suivi : {this.props.dataCount}</Text>
            </View>
            <View style={headStyle.right}> 
              <BoxButton title="Filtre" onPress={()=>{this.openFilter()}} source={{uri:"zoom_x"}} rayon={60}/>
            </View>
          </View>
  }
}

class BoxStat extends Component{
  state = {showDetails: false}

 toggleDetails(){
    this.setState({showDetails: !this.state.showDetails})
  }

  render(){
    const boxStyle = StyleSheet.create({
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
    const arrow = (this.state.showDetails)? "arrow_down" : "arrow_up"

    return  <TouchableOpacity style={{flex:1, paddingVertical:10}} onPress={()=>this.toggleDetails()} >
              <View style={boxStyle.container}>
                <XImage source={{uri:arrow}} style={boxStyle.image} />
                <Text style={{fontSize:12, fontWeight:'bold', flex:1}}>{this.props.data.company} (<Text style={{fontSize:9}}>{format_date(this.props.data.date, "DD-MM-YYYY HH:ii")}</Text>)</Text>
              </View>
              {
                  this.state.showDetails == true && 
                    <View style={boxStyle.infos}>
                      <Text style={boxStyle.champ}><Text style={boxStyle.label}>Date : </Text>{format_date(this.props.data.date, "DD-MM-YYYY HH:ii")}</Text>
                      <Text style={boxStyle.champ}><Text style={boxStyle.label}>Type : </Text>{getType(this.props.data.type)}</Text>
                      <Text style={boxStyle.champ}><Text style={boxStyle.label}>Code client : </Text>{this.props.data.code}</Text>
                      <Text style={boxStyle.champ}><Text style={boxStyle.label}>Société : </Text>{this.props.data.company}</Text>
                      <Text style={boxStyle.champ}><Text style={boxStyle.label}>N°de suivi: </Text>{this.props.data.number}</Text>
                      <Text style={boxStyle.champ}><Text style={boxStyle.label}>Nom du lot: </Text>{this.props.data.packname}</Text>
                    </View>
              }
            </TouchableOpacity>
  }
}

class OrderBox extends Component{
  constructor(props){
    super(props)
    this.state = {show: false}
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

  render(){
    const styles = StyleSheet.create({
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

    if(this.state.show)
    {
      return  <AnimatedBox ref="animatedOptions" type='DownSlide' durationIn={300} durationOut={300} style={styles.container}>
                  <Text style={styles.title}>Trier par : </Text>
                  <View style={{flex:1, marginTop:5}}>
                    <LinkButton onPress={()=>this.handleOrder(['Date','date'])} title='Date' Pstyle={styles.list} />
                    <LinkButton onPress={()=>this.handleOrder(['Type','type'])} title='Type' Pstyle={styles.list} />
                    <LinkButton onPress={()=>this.handleOrder(['Code client','code'])} title='Code client' Pstyle={styles.list} />
                    <LinkButton onPress={()=>this.handleOrder(['N°de suivi','number'])} title='N°de suivi' Pstyle={styles.list} />
                    <LinkButton onPress={()=>this.handleOrder(['Nom de lot','packname'])} title='Nom du lot' Pstyle={styles.list} />
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

    Fetcher.wait_for(
      [`getStats(${JSON.stringify(GLOB.dataFilter)}, ${this.page}, ${JSON.stringify(this.order)})`],
      (responses)=>{
        if(responses[0].error)
        {
          // GLOB.datas = []
          Notice.danger(responses[0].message)
        }
        else
        {
          // const dataFetched = Fetcher.create_temp_realm(responses[0].data_stats, "temp_states", nextPage)
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
          <Screen style={styles.container}
                  navigation={GLOB.navigation}>
            <Header dataCount={this.total} onFilter={()=>this.refreshDatas()}/>
              {this.state.ready && this.renderStats()}
              {!this.state.ready && <XImage loader={true} width={70} height={70} style={{alignSelf:'center', marginTop:10}} />}
              <OrderBox visible={this.state.orderBox} handleOrder={this.handleOrder}/>
          </Screen>
      );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

export default StatsScreen;
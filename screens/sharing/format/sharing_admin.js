import React, { Component } from 'react'
import Config from '../../../Config'
import Screen from '../../../components/screen'
import { EventRegister } from 'react-native-event-listeners'
import AnimatedBox from '../../../components/animatedBox'
import {StyleSheet,Text,View,ScrollView,TouchableOpacity,Modal} from 'react-native'
import {XImage, XTextInput} from '../../../components/XComponents'
import {LineList} from '../../../components/lists'
import {SimpleButton, BoxButton, ImageButton, LinkButton} from '../../../components/buttons'
import SelectInput from '../../../components/select'

import Cfetcher from '../../../components/dataFetcher'
import request1 from "../../../requests/account_sharing"

let Fetcher = new Cfetcher(request1)
let GLOB = {  navigation:{},
              datas:[],
              dataFilter: {account:'', collaborator:''},
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
              {type == 'input' && <XTextInput {...this.props} value={this.state.value} onChangeText={(value)=>{this.changeValue(value)}} style={[input.input, inputStyle]} />}
              {type == 'select' && <SelectInput selectedItem={this.state.value} Pstyle={{flex:1.3}} style={inputStyle} dataOptions={this.props.dataOptions} onChange={(value) => {this.changeValue(value)}} />}
            </View>
  }
}

class BoxFilter extends Component{
  constructor(props){
    super(props);
  }

  dismiss(type){
    this.props.dismiss(type);
  }

  filterProcess(type){
    if(type=="reInit")
    {
      GLOB.dataFilter = { 
                          account:'',
                          collaborator:''
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
                    <Inputs label='Dossier :' name={'account'} />
                    <Inputs label='Client ou contact :' name={'collaborator'}/>
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

    this.state =  {
                    filter: false, 
                    collaborator: 0, 
                    account: 0,
                    optionsCollaborator: [{value:0, label:"Contact ou client"}],
                    optionsAccount: [{value:0, label:"Dossier client"}],
                    loading_add: false
                  }

    this.closeFilter = this.closeFilter.bind(this)
    this.filterAccount = this.filterAccount.bind(this)
    this.filterCollaborator = this.filterCollaborator.bind(this)
  }

  filterAccount(text=""){
    Fetcher.setRequest(request1).wait_for(
      [`getListCustomers("${text}")`],
      (responses)=>{
        if(responses[0].error)
        {
          Notice.info(r.message)
        }
        else
        {
          this.setState({optionsAccount: [{value:0, label:"Dossier client"}].concat(responses[0].dataList)})
        }
    })
  }

  filterCollaborator(text=""){
    Fetcher.setRequest(request1).wait_for(
      [`getListCollaborators("${text}")`],
      (responses)=>{
        if(responses[0].error)
        {
          Notice.info(r.message)
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
                          Fetcher.wait_for(
                            [`addSharedDoc(${JSON.stringify({collaborator_id: this.state.collaborator, account_id: this.state.account})})`],
                            (responses)=>{
                              if(responses[0].error)
                              {
                                Notice.danger(responses[0].message)
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
                          Notice.info("Veuillez renseigner correctement les champs pour le partage de dossier!!")
                        }
                      }
    actionLocker(call)
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
      marginLeft:20,
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
    select:{
      flex:1,
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

      elevation: 7, //Android Shadow
      
      shadowColor: '#000',                  //===
      shadowOffset: {width: 0, height: 0},  //=== iOs shadow    
      shadowOpacity: 0.8,                   //===
      shadowRadius: 2,                      //===

      alignItems:'center'
    }
  })

  let loading_add = null
  if(this.state.loading_add)
  {
    loading_add = {uri:"img_loader"}
  }  

  return  <View style={headStyle.container}>
            <BoxFilter visible={this.state.filter} dismiss={this.closeFilter}/>
            <View style={headStyle.left}>
              <View style={headStyle.form}>
                <SelectInput  filterSearch={true}
                              filterCallback={this.filterCollaborator} 
                              dataOptions={this.state.optionsCollaborator}
                              textInfo="Contact ou Client - (Tapez un therme à rechercher)" 
                              style={{color:'#707070'}} Pstyle={headStyle.select} 
                              onChange={(value) => this.handleClientChange(value, "collaborator")}
                />
                <SelectInput  filterSearch={true}
                              filterCallback={this.filterAccount} 
                              dataOptions={this.state.optionsAccount}
                              textInfo="Dossier client - (Tapez un therme à rechercher)" 
                              style={{color:'#707070'}} 
                              Pstyle={headStyle.select} 
                              onChange={(value) => this.handleClientChange(value, "account")}
                />
                <SimpleButton Pstyle={{flex:0, height:30, width:100, margin:10}} RImage={loading_add} onPress={()=>this.addSharedDoc()} title="Partager" />
            </View>
            </View>
            <View style={headStyle.right}> 
              <BoxButton title="Filtre" onPress={()=>{this.openFilter()}} source={{uri:"zoom_x"}} rayon={60}/>
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
  }

  toggleDetails(){
    this.setState({showDetails: !this.state.showDetails})
  }

  deleteSharedDoc(id_doc){
    Fetcher.wait_for(
      [`deleteSharedDoc(${id_doc})`],
      (responses)=>{
        if(responses[0].error)
        {
          Notice.danger(responses[0].message)
        }
        else
        {
          Notice.info(responses[0].message)
          EventRegister.emit('refreshPage', true)
        }
      })
  }


  acceptSharedDoc(id_doc){
    Fetcher.wait_for(
      [`acceptSharedDoc(${id_doc})`],
      (responses)=>{
        if(responses[0].error)
        {
          Notice.danger(responses[0].message)
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
        height:15
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

    const styleApproved = {
                            opacity: this.props.data.approval? 0.3 : 1
                          }

    const state = this.props.data.approval? 'Partagé' : 'En attente de validation'

    return  <TouchableOpacity style={{flex:1, paddingVertical:10}} onPress={()=>this.toggleDetails()} >
              <View style={boxStyle.container}>
                <XImage source={{uri:arrow}} style={[{marginRight:8}, boxStyle.image]} />
                <Text style={{fontWeight:'bold', width:'70%'}}>{this.props.data.document.toString()}</Text>
                <ImageButton source={{uri:'validate'}} Pstyle={{padding:8}} Istyle={[boxStyle.image, styleApproved]} onPress={()=>this.handleValidate(this.props.data.id_idocus)}/>
                <ImageButton source={{uri:'delete'}} Pstyle={{padding:8}} Istyle={boxStyle.image} onPress={()=>this.handleDelete(this.props.data.id_idocus)}/>
              </View>
              {
                  this.state.showDetails == true && 
                    <View style={boxStyle.infos}>
                      <Text style={boxStyle.champ}><Text style={boxStyle.label}>Date : </Text>{format_date(this.props.data.date, "DD-MM-YYYY HH:ii")}</Text>
                      <Text style={boxStyle.champ}><Text style={boxStyle.label}>Dossier : </Text>{this.props.data.document}</Text>
                      <Text style={boxStyle.champ}><Text style={boxStyle.label}>Client ou Contact : </Text>{this.props.data.client}</Text>
                      <Text style={boxStyle.champ}><Text style={boxStyle.label}>Etat : </Text>{state}</Text>
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
                    <LinkButton onPress={()=>this.handleOrder(['Dossier','document'])} title='Dossier' Pstyle={styles.list} />
                    <LinkButton onPress={()=>this.handleOrder(['Client','client'])} title='Client' Pstyle={styles.list} />
                    <LinkButton onPress={()=>this.handleOrder(['Etat','approval'])} title='Etat' Pstyle={styles.list} />
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
    super(props);
    GLOB.navigation = this.props.navigation

    this.state = {page:1, more_result:false, ready: false, dataList: [], orderBox: false, orderText: null, orderBy: "", direction: ""}

    this.renderStats = this.renderStats.bind(this)
    this.refreshDatas = this.refreshDatas.bind(this)
    this.toggleOrderBox = this.toggleOrderBox.bind(this)
    this.handleOrder = this.handleOrder.bind(this)
    this.nextPage = this.nextPage.bind(this)
  }

  componentWillMount(){
    this.orderBoxListener = EventRegister.on('clickOrderBox', (data) => {
        this.toggleOrderBox()
    })

    this.refreshPage = EventRegister.on('refreshPage', (data=false) => {
        this.refreshDatas(data)
    })
  }

  componentWillUnmount(){
    EventRegister.rm(this.orderBoxListener)
    EventRegister.rm(this.refreshPage)
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

  nextPage(){
    this.refreshDatas()
  }

  handleOrder(orderBy=[], direction = false){ 
    if(orderBy.length > 0) this.toggleOrderBox()

    order_text = orderBy[0] || this.state.orderText
    order_by = orderBy[1] || this.state.orderBy

    this.setState({ready: false})
    GLOB.datas = GLOB.datas.sorted(order_by, direction)
    this.setState({orderText: order_text, ready: true, dataList: GLOB.datas, orderBy:order_by, direction: direction})
  }

  async changeDirectionSort(){
    await this.setState({direction: !this.state.direction})
    this.handleOrder([], this.state.direction)
  }

  refreshDatas(renew=false){
    let nextPage = this.state.page
    if(renew)
    {
      nextPage = 1
    }

    this.setState({ready: false, dataList: []})
    Fetcher.wait_for(
      [`getSharedDocs(${JSON.stringify(GLOB.dataFilter)}, ${nextPage})`],
      (responses)=>{
        let more_result = false
        if(responses[0].error)
        {
          // GLOB.datas = []
          Notice.danger(responses[0].message)
        }
        else
        {
          const dataFetched = Fetcher.create_temp_realm(responses[0].data_shared, "temp_sharing", nextPage)
          if(!(nextPage > 1 && dataFetched.length == 0))
          {
            GLOB.datas = dataFetched
          }

          if(responses[0].more_result)
          {
            more_result = true
            nextPage = nextPage + 1
          }
        }

        this.setState({ready: true, dataList: GLOB.datas, orderText: null, page: nextPage, more_result: more_result})
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
                          title={`Dossiers partagés (${this.state.dataList.length})`}
                          renderItems={(data) => <BoxStat data={data} deleteSharedDoc={this.deleteSharedDoc}/> } />
                {this.state.more_result && <SimpleButton title="+ plus" onPress={this.nextPage} Pstyle={{marginBottom:10}}/>}
             </ScrollView>
  }

  render() {
      return (
          <Screen style={styles.container}
                  navigation={GLOB.navigation}>
            <Header onFilter={()=>this.refreshDatas(true)}/>
              {this.state.ready && this.renderStats()}
              {!this.state.ready && <View style={{flex:1}}><XImage loader={true} width={70} height={70} style={{alignSelf:'center', marginTop:10}} /></View>}
            <SimpleButton title='Contacts >>' Pstyle={{flex:0, maxHeight:30}} onPress={()=>GLOB.navigation.goTo("SharingContacts")} />
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

export default SharingScreen;
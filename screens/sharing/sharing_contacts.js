import React, { Component } from 'react'
import Config from '../../Config'
import Screen from '../../components/screen'
import { EventRegister } from 'react-native-event-listeners'
import AnimatedBox from '../../components/animatedBox'
import Navigator from '../../components/navigator'
import {StyleSheet,Text,View,ScrollView,TouchableOpacity,Modal} from 'react-native'
import {XImage, XTextInput} from '../../components/XComponents'
import {LineList} from '../../components/lists'
import {SimpleButton, BoxButton, ImageButton, LinkButton} from '../../components/buttons'
import SelectInput from '../../components/select'
import User from '../../models/User'

import Cfetcher from '../../components/dataFetcher'
import request1 from "../../requests/account_sharing"

let Fetcher = new Cfetcher(request1)
let GLOB = {  navigation:{},
              datas:[],
              dataFilter: {email:'', company:'', first_name: '', last_name:''},
              dataForm:{}
            }

class Inputs extends Component{
  constructor(props){
    super(props)
    this.dataForm = this.props.dataForm || "GLOB.dataFilter"
    this.state = {value: eval(`${this.dataForm}.${this.props.name}`)}
  }

  changeValue(value){
    this.setState({value: value});
    eval(`${this.dataForm}.${this.props.name} = "${value}"`)
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

class ModalForm extends Component{
  constructor(props){
    super(props)

    this.type = (typeof(this.props.data.id_idocus) !== "undefined" && this.props.data.id_idocus > 0)? 'edit' : 'add'
  }

  validateProcess(){
    let url = ""
    if(GLOB.dataForm.email == '' || GLOB.dataForm.company == '')
    {
      Notice.alert("Erreur", "Veuillez remplir les champs obligatoires (*) svp")
    }
    else
    {
      if(this.type == "add")
        url = `addSharedContact(${JSON.stringify(GLOB.dataForm)})`
      else
        url = `editSharedContact(${JSON.stringify(GLOB.dataForm)})`
    }
    
    if(url != '')
    {
      const call = ()=>{
                          Fetcher.wait_for(
                            [url],
                            (responses)=>{
                              if(responses[0].error)
                              {
                                Notice.danger(responses[0].message)
                              }
                              else
                              {
                                Notice.info(responses[0].message)
                                EventRegister.emit('refreshPage_contacts')
                              }
                            })
                        }
      actionLocker(call)
      this.props.dismiss()
    }
  }

  formContact(){
    let datas = {email:'', company: '', first_name: '', last_name: ''}
    if(typeof(this.props.data.id_idocus) !== "undefined" && this.props.data.id_idocus > 0)
    {
      datas = {
                id_idocus: this.props.data.id_idocus,
                email:this.props.data.email, 
                company: this.props.data.company, 
                first_name: this.props.data.first_name, 
                last_name: this.props.data.last_name
              }
    }

    GLOB.dataForm = datas
    return <ScrollView style={{flex:1, backgroundColor:'#fff'}}>
              <Inputs label='* Couriel :' name={'email'} dataForm="GLOB.dataForm"/>
              <Inputs label='* Nom de la société :' name={'company'} dataForm="GLOB.dataForm"/>
              <Inputs label='Prénom :' name={'first_name'} dataForm="GLOB.dataForm"/>
              <Inputs label='Nom :' name={'last_name'} dataForm="GLOB.dataForm"/>
           </ScrollView>
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
                   visible={true}
                   onRequestClose={()=>{}}
            >
              <View style={boxFilter.container} >
                <View style={boxFilter.box}>
                  <View style={boxFilter.head}>
                    <Text style={{flex:1, textAlign:'center',fontSize:24}}>Création contact</Text>
                  </View>
                  {this.formContact()}
                  <View style={boxFilter.foot}>
                    <View style={{flex:1, paddingHorizontal:10}}><SimpleButton title='Retour' onPress={()=>this.props.dismiss()} /></View>
                    <View style={{flex:1, paddingHorizontal:10}}><SimpleButton title='Valider' onPress={()=>this.validateProcess()} /></View>
                  </View>
                </View>
              </View>
          </Modal>
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
      GLOB.dataFilter = {email:'', company:'', first_name: '', last_name:''}
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
                   visible={true}
                   onRequestClose={()=>{}}
            >
              <View style={boxFilter.container} >
                <View style={boxFilter.box}>
                  <View style={boxFilter.head}>
                    <Text style={{flex:1, textAlign:'center',fontSize:24}}>Filtres</Text>
                  </View>
                  <ScrollView style={boxFilter.body}>
                    <Inputs label='Email :' name={'email'} />
                    <Inputs label='Société :' name={'company'}/>
                    <Inputs label='Prénom :' name={'first_name'}/>
                    <Inputs label='Nom :' name={'last_name'}/>
                  </ScrollView>
                  <View style={boxFilter.foot}>
                    <View style={{flex:1, paddingHorizontal:10}}><SimpleButton title='Retour' onPress={()=>this.dismiss(false)} /></View>
                    <View style={{flex:1, paddingHorizontal:10}}><SimpleButton title='Filtrer' onPress={()=>this.filterProcess("filter")} /></View>
                    <View style={{flex:1, paddingHorizontal:10}}><SimpleButton title='Annuler filtre' onPress={()=>this.filterProcess("reInit")} /></View>
                  </View>
                </View>
              </View>
          </Modal>
  }
}

class Header extends Component{
  constructor(props){
    super(props)

    this.state =  {filter: false, dataModal: {}}

    this.closeFilter = this.closeFilter.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }
  
  componentWillMount(){
    this.externalOpenModal = EventRegister.on('externalOpenModal', (data) => {
        this.openModal(data)
    })
  }

  componentWillUnmount(){
    EventRegister.rm(this.externalOpenModal)
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

  openModal(data={}){
    this.setState({openModal: true, dataModal: data})
  }

  closeModal(){
    this.setState({openModal: false})
  }

  render(){
     const headStyle = StyleSheet.create({
      container:{
        flex:0, 
        flexDirection:'row',
        backgroundColor:'#E1E2DD',
        alignItems:'center',
        justifyContent:'center',
      }
    })
            
  return  <View style={headStyle.container}>
            {this.state.openModal && <ModalForm data={this.state.dataModal} dismiss={this.closeModal} />}
            {this.state.filter && <BoxFilter dismiss={this.closeFilter} />}
            <BoxButton title="Ajout" onPress={()=>{this.openModal()}} source={{uri:"add_contact"}} rayon={60}/>
            <BoxButton title="Filtre" onPress={()=>{this.openFilter()}} source={{uri:"zoom_x"}} rayon={60}/>
          </View>
  }
}

class BoxStat extends Component{
  constructor(props){
    super(props)

    this.state = {showDetails: false}

    this.toggleDetails = this.toggleDetails.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
  }

  toggleDetails(){
    this.setState({showDetails: !this.state.showDetails})
  }

  deleteSharedContact(_id){
    Fetcher.wait_for(
      [`deleteSharedContact(${_id})`],
      (responses)=>{
        if(responses[0].error)
        {
          Notice.danger(responses[0].message)
        }
        else
        {
          Notice.info(responses[0].message)
          EventRegister.emit('refreshPage_contacts')
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

    return  <TouchableOpacity style={{flex:1, paddingVertical:10}} onPress={()=>this.toggleDetails()} >
              <View style={boxStyle.container}>
                <XImage source={{uri:arrow}} style={[{marginRight:8}, boxStyle.image]} />
                <Text style={{fontWeight:'bold', width:'70%'}}>{this.props.data.email.toString()}</Text>
                <ImageButton source={{uri:'edition'}} Pstyle={{padding:8}} Istyle={boxStyle.image} onPress={()=>this.handleEdit()}/>
                <ImageButton source={{uri:'delete'}} Pstyle={{padding:8}} Istyle={boxStyle.image} onPress={()=>this.handleDelete(this.props.data.id_idocus)}/>
              </View>
              {
                  this.state.showDetails == true && 
                    <View style={boxStyle.infos}>
                      <Text style={boxStyle.champ}><Text style={boxStyle.label}>Date : </Text>{format_date(this.props.data.date, "DD-MM-YYYY HH:ii")}</Text>
                      <Text style={boxStyle.champ}><Text style={boxStyle.label}>Email : </Text>{this.props.data.email}</Text>
                      <Text style={boxStyle.champ}><Text style={boxStyle.label}>Société : </Text>{this.props.data.company}</Text>
                      <Text style={boxStyle.champ}><Text style={boxStyle.label}>Nom : </Text>{User.fullName_of(this.props.data)}</Text>
                      <Text style={boxStyle.champ}><Text style={boxStyle.label}>Nb. de dossiers : </Text>{this.props.data.account_size}</Text>
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
                    <LinkButton onPress={()=>this.handleOrder(['Email','email'])} title='Email' Pstyle={styles.list} />
                    <LinkButton onPress={()=>this.handleOrder(['Société','company'])} title='Société' Pstyle={styles.list} />
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
  static navigationOptions = {
       headerTitle: 'Contacts',
       headerRight: <ImageButton  source={{uri:"options"}} 
                          Pstyle={{flex:1, paddingVertical:10, flexDirection:'column', alignItems:'center',minWidth:50}}
                          Istyle={{width:7, height:36}}
                          onPress={()=>EventRegister.emit('clickOrderBox_contacts', true)} />
  }

  constructor(props){
    super(props);
    GLOB.navigation = new Navigator(this.props.navigation)

    this.dontRefreshForm = false
    this.state = {ready: false, dataList: [], orderBox: false, orderText: null, orderBy: "", direction: ""}

    this.renderStats = this.renderStats.bind(this)
    this.refreshDatas = this.refreshDatas.bind(this)
    this.toggleOrderBox = this.toggleOrderBox.bind(this)
    this.handleOrder = this.handleOrder.bind(this)
  }

  componentWillMount(){
    this.orderBoxListener = EventRegister.on('clickOrderBox_contacts', (data) => {
        this.toggleOrderBox()
    })

    this.refreshPage = EventRegister.on('refreshPage_contacts', (data) => {
        this.refreshDatas()
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

  refreshDatas(){
    this.setState({ready: false, dataList: []})
    Fetcher.wait_for(
      [`getSharedContacts(${JSON.stringify(GLOB.dataFilter)})`],
      (responses)=>{
        if(responses[0].error)
        {
          GLOB.datas = []
          Notice.danger(responses[0].message)
        }
        else
        {
          GLOB.datas = Fetcher.create_temp_realm(responses[0].contacts, "temp_sharing_contacts")
        }

        this.setState({ready: true, dataList: GLOB.datas})
      })
  }

  renderStats(){
    const arrow_direction = this.state.direction? 'V' : 'Λ'

     return  <ScrollView style={{flex:1, padding:3}}>
                {this.state.orderText && 
                  <View style={{flex:1,flexDirection:'row',paddingVertical:5,alignItems:'center'}}>
                    <Text style={{flex:0}}>Trie par: <Text style={{fontWeight:'bold'}}>{this.state.orderText}</Text></Text>
                    <TouchableOpacity style={{flex:0,width:30,alignItems:'center'}} onPress={()=>this.changeDirectionSort()}>
                      <Text style={{fontSize:14, fontWeight:'bold'}}>{arrow_direction}</Text>
                    </TouchableOpacity>
                  </View>
                }
                <LineList datas={this.state.dataList}
                          title={`Contacts (${this.state.dataList.length})`}
                          renderItems={(data) => <BoxStat data={data} deleteSharedDoc={this.deleteSharedDoc}/> } />
             </ScrollView>
  }

  render() {
      return (
          <Screen style={styles.container}
                  navigation={GLOB.navigation}>
            <Header onFilter={()=>this.refreshDatas()}/>
              {this.state.ready && this.renderStats()}
              {!this.state.ready && <View style={{flex:1}}><XImage loader={true} width={70} height={70} style={{alignSelf:'center', marginTop:10}} /></View>}
            <SimpleButton title='<< Dossiers partagés' Pstyle={{flex:0, maxHeight:30}} onPress={()=>GLOB.navigation.goBack()} />
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
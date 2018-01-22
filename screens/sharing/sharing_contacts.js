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
import Pagination from '../../components/pagination'
import SelectInput from '../../components/select'
import User from '../../models/User'

import Cfetcher from '../../components/dataFetcher'
import request1 from "../../requests/account_sharing"

let Fetcher = new Cfetcher(request1)
let GLOB =  { navigation:{},
              datas:[],
              dataFilter: {email:'', company:'', first_name: '', last_name:''},
              dataForm:{}
            }

class Inputs extends Component{
  constructor(props){
    super(props)
    this.dataForm = this.props.dataForm || "GLOB.dataFilter"
    this.state = {value: eval(`${this.dataForm}.${this.props.name}`)}

    this.generateStyles()
  }

  changeValue(value){
    this.setState({value: value});
    eval(`${this.dataForm}.${this.props.name} = "${value}"`)
  }

  generateStyles(){
    this.styles = StyleSheet.create({
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
  }

  render(){
    const stylePlus = this.props.style || {};
    const labelStyle = this.props.labelStyle || {};
    const inputStyle = this.props.inputStyle || {}; 
    const type = this.props.type || 'input';
    return  <View style={[this.styles.container, stylePlus]}>
              <Text style={[this.styles.label, labelStyle]}>{this.props.label}</Text>
              {type == 'input' && <XTextInput {...this.props} value={this.state.value} onChangeText={(value)=>{this.changeValue(value)}} PStyle={[this.styles.input, inputStyle]} />}
              {type == 'select' && <SelectInput selectedItem={this.state.value} Pstyle={{flex:1.3}} style={inputStyle} dataOptions={this.props.dataOptions} onChange={(value) => {this.changeValue(value)}} />}
            </View>
  }
}

class ModalForm extends Component{
  constructor(props){
    super(props)

    this.type = (typeof(this.props.data.id_idocus) !== "undefined" && this.props.data.id_idocus > 0)? 'edit' : 'add'

    this.generateStyles()
  }

  validateProcess(){
    let url = ""
    let reload = true
    
    if(GLOB.dataForm.email == '' || GLOB.dataForm.company == '')
    {
      Notice.alert("Erreur", "Veuillez remplir les champs obligatoires (*) svp")
    }
    else
    {
      if(this.type == "add")
      {
        url = `addSharedContact(${JSON.stringify(GLOB.dataForm)})`
        reload = true
        flash = "Ajout contact en cours ..."
      }
      else
      {
        url = `editSharedContact(${JSON.stringify(GLOB.dataForm)})`
        reload = false
        flash = "Modification contact en cours ..."
      }
    }
    
    if(url != '')
    {
      const call = ()=>{
                          Notice.info(flash)
                          Fetcher.wait_for(
                            [url],
                            (responses)=>{
                              if(responses[0].error)
                              {
                                Notice.danger(responses[0].message, true, responses[0].message)
                              }
                              else
                              {
                                Notice.info(responses[0].message)
                              }
                              EventRegister.emit('refreshPage_contacts', reload)
                            })
                        }
      actionLocker(call)
      this.props.dismiss()
    }
  }

  formContact(){
    let edit = true
    let datas = {email:'', company: '', first_name: '', last_name: ''}
    if(typeof(this.props.data.id_idocus) !== "undefined" && this.props.data.id_idocus > 0)
    {
      edit = false
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
              <Inputs label='* Couriel :' name={'email'} dataForm="GLOB.dataForm" editable={edit}/>
              <Inputs label='* Nom de la société :' name={'company'} dataForm="GLOB.dataForm"/>
              <Inputs label='Prénom :' name={'first_name'} dataForm="GLOB.dataForm"/>
              <Inputs label='Nom :' name={'last_name'} dataForm="GLOB.dataForm"/>
           </ScrollView>
  }

  generateStyles(){
    this.styles = StyleSheet.create({
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
  }

  render(){
    return  <Modal transparent={true}
                   animationType="slide" 
                   visible={true}
                   supportedOrientations={['portrait', 'landscape']}
                   onRequestClose={()=>{}}
            >
              <View style={this.styles.container} >
                <View style={this.styles.box}>
                  <View style={this.styles.head}>
                    <Text style={{flex:1, textAlign:'center',fontSize:24}}>Création contact</Text>
                  </View>
                  {this.formContact()}
                  <View style={this.styles.foot}>
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
    super(props)

    this.generateStyles()
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

  generateStyles(){
    this.styles = StyleSheet.create({
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
  }

  render(){
    return  <Modal transparent={true}
                   animationType="slide" 
                   visible={true}
                   supportedOrientations={['portrait', 'landscape']}
                   onRequestClose={()=>{}}
            >
              <View style={this.styles.container} >
                <View style={this.styles.box}>
                  <View style={this.styles.head}>
                    <Text style={{flex:1, textAlign:'center',fontSize:24}}>Filtres</Text>
                  </View>
                  <ScrollView style={this.styles.body}>
                    <Inputs label='Email :' name={'email'} />
                    <Inputs label='Société :' name={'company'}/>
                    <Inputs label='Prénom :' name={'first_name'}/>
                    <Inputs label='Nom :' name={'last_name'}/>
                  </ScrollView>
                  <View style={this.styles.foot}>
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

    this.state =  {filter: false, dataModal: {}}

    this.closeFilter = this.closeFilter.bind(this)
    this.closeModal = this.closeModal.bind(this)

    this.generateStyles()
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

  generateStyles(){
    this.styles = StyleSheet.create({
      container:{
        flex:0, 
        flexDirection:'row',
        backgroundColor:'#E1E2DD',
        alignItems:'center',
        justifyContent:'center',
      }
    })
  }

  render(){ 
    return  <View style={this.styles.container}>
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

    this.generateStyles()
  }

  toggleDetails(){
    this.setState({showDetails: !this.state.showDetails})
  }

  deleteSharedContact(_id){
    Notice.info("Suppression de contact en cours ...")
    Fetcher.wait_for(
      [`deleteSharedContact(${_id})`],
      (responses)=>{
        if(responses[0].error)
        {
          Notice.danger(responses[0].message, true, responses[0].message)
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
  }

  render(){
    const arrow = (this.state.showDetails)? "arrow_down" : "arrow_up"

    return  <TouchableOpacity style={{flex:1, paddingVertical:10}} onPress={()=>this.toggleDetails()} >
              <View style={this.styles.container}>
                <XImage source={{uri:arrow}} style={[{flex:0, width:20, marginRight:8}, this.styles.image]} />
                <View style={{flex:1}}>
                  <Text style={{fontWeight:'bold'}}>{this.props.data.email.toString()}</Text>
                </View>
                <View style={{flex:0, width:70, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                  <ImageButton source={{uri:'edition'}} Pstyle={{padding:8}} Istyle={this.styles.image} onPress={()=>this.handleEdit()}/>
                  <ImageButton source={{uri:'delete'}} Pstyle={{padding:8}} Istyle={this.styles.image} onPress={()=>this.handleDelete(this.props.data.id_idocus)}/>
                </View>
              </View>
              {
                  this.state.showDetails == true && 
                    <View style={this.styles.infos}>
                      <Text style={this.styles.champ}><Text style={this.styles.label}>Date : </Text>{format_date(this.props.data.date, "DD-MM-YYYY HH:ii")}</Text>
                      <Text style={this.styles.champ}><Text style={this.styles.label}>Email : </Text>{this.props.data.email}</Text>
                      <Text style={this.styles.champ}><Text style={this.styles.label}>Société : </Text>{this.props.data.company}</Text>
                      <Text style={this.styles.champ}><Text style={this.styles.label}>Nom : </Text>{User.fullName_of(this.props.data)}</Text>
                      <Text style={this.styles.champ}><Text style={this.styles.label}>Nb. de dossiers : </Text>{this.props.data.account_size}</Text>
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
                    <LinkButton onPress={()=>this.handleOrder(['Email','email'])} title='Email' Pstyle={this.styles.list} />
                    <LinkButton onPress={()=>this.handleOrder(['Société','company'])} title='Société' Pstyle={this.styles.list} />
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
    this.orderBoxListener = EventRegister.on('clickOrderBox_contacts', (data) => {
        this.toggleOrderBox()
    })

    this.refreshPage = EventRegister.on('refreshPage_contacts', (data=false) => {
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
    Fetcher.wait_for(
      [`getSharedContacts(${JSON.stringify(GLOB.dataFilter)}, ${this.page}, ${JSON.stringify(this.order)})`],
      (responses)=>{
        if(responses[0].error)
        {
          Notice.danger(responses[0].message, true, responses[0].message)
        }
        else
        {
          // const dataFetched = Fetcher.create_temp_realm(responses[0].contacts, "temp_sharing_contacts", nextPage)
          GLOB.datas = responses[0].contacts || []
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
                          title={`Contacts (${this.total})`}
                          renderItems={(data) => <BoxStat data={data} deleteSharedDoc={this.deleteSharedDoc}/> } />
                <Pagination onPageChanged={(page)=>this.changePage(page)} nb_pages={this.limit_page} page={this.page} />
             </ScrollView>
  }

  render() {
      return (
          <Screen style={{flex: 1, flexDirection: 'column',}}
                  navigation={GLOB.navigation}>
            <Header onFilter={()=>this.refreshDatas(true)}/>
              {this.state.ready && this.renderStats()}
              {!this.state.ready && <View style={{flex:1}}><XImage loader={true} width={70} height={70} style={{alignSelf:'center', marginTop:10}} /></View>}
            <SimpleButton title='<< Dossiers partagés' Pstyle={{flex:0, maxHeight:30}} onPress={()=>GLOB.navigation.goBack()} />
            <OrderBox visible={this.state.orderBox} handleOrder={this.handleOrder}/>
          </Screen>
      );
    }
}

export default SharingScreen;
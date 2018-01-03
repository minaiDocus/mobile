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
import ScrollableTabView from 'react-native-scrollable-tab-view'

import Cfetcher from '../../../components/dataFetcher'
import request1 from "../../../requests/account_sharing"

let Fetcher = new Cfetcher(request1)
let GLOB = {
              navigation:{},
              dataForm: {email:'', company: '', first_name: '', last_name: ''}
            }

class Inputs extends Component{
  constructor(props){
    super(props);
    this.state = {value: eval(`GLOB.dataForm.${this.props.name}`)}
  }

  changeValue(value){
    this.setState({value: value});
    eval(`GLOB.dataForm.${this.props.name} = "${value}"`)
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

class ModalSharing extends Component{
  constructor(props){
    super(props)
    this.type = this.props.type
  }

  validateProcess(){
    let url = ""
    let message = ""
    if(this.type == "sharing")
    {
      message = "Partage en cours d'envoi ..."
      if(GLOB.dataForm.email == '' || GLOB.dataForm.company == '')
      {
        Notice.alert("Erreur", "Veuillez remplir les champs obligatoires (*) svp!")
      }
      else
      {
        url = `addSharedDocCustomers(${JSON.stringify(GLOB.dataForm)})`
      }
    }
    else
    {
      message = "Demande en cours d'envoi ..."
      if(GLOB.dataForm.code_or_email == '')
      {
        Notice.alert("Erreur", "Veuillez remplir les champs obligatoires (*) svp!")
      }
      else
      {
        url = `addSharingRequestCustomers(${JSON.stringify(GLOB.dataForm)})`
      }
    }

    if(url != '')
    {
      const call = ()=>{
                          Notice.info(message)
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
                                EventRegister.emit('refreshPage')
                              }
                            })
                        }
      actionLocker(call)

      this.props.dismiss()
    }
  }

  formAccess(){
    GLOB.dataForm = {code_or_email: ''}
    return <ScrollView style={{flex:1, backgroundColor:'#fff'}}>
              <Inputs label='* Code ou email du dossier :' name={'code_or_email'}/>
           </ScrollView>
  }

  formSharing(){
    GLOB.dataForm = {email:'', company: '', first_name: '', last_name: ''}
    return <ScrollView style={{flex:1, backgroundColor:'#fff'}}>
              <Inputs label='* Couriel :' name={'email'} />
              <Inputs label='* Nom de la société :' name={'company'}/>
              <Inputs label='Prénom :' name={'first_name'}/>
              <Inputs label='Nom :' name={'last_name'}/>
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

    const boxTitle = this.type == "sharing"? "Partage avec un compte" : "Demande accès dossier"
    const form = ()=>{ 
        if(this.type == "sharing"){return this.formSharing()}
        else{return this.formAccess() }
    }

    return  <Modal transparent={true}
                   animationType="slide" 
                   visible={true}
                   supportedOrientations={['portrait', 'landscape']}
                   onRequestClose={()=>{}}
            >
              <View style={boxFilter.container} >
                <View style={boxFilter.box}>
                  <View style={boxFilter.head}>
                    <Text style={{flex:1, textAlign:'center',fontSize:24}}>{boxTitle}</Text>
                  </View>
                  {form()}
                  <View style={boxFilter.foot}>
                    <View style={{flex:1, paddingHorizontal:10}}><SimpleButton title='Retour' onPress={()=>this.props.dismiss()} /></View>
                    <View style={{flex:1, paddingHorizontal:10}}><SimpleButton title='Valider' onPress={()=>this.validateProcess()} /></View>
                  </View>
                </View>
              </View>
          </Modal>
  }
}

class ViewState extends Component{
  constructor(props){
    super(props)

    this.handleDelete = this.handleDelete.bind(this)
  }

  deleteSharedDoc(id_doc, type='admin'){
    Fetcher.wait_for(
      [`deleteSharedDoc(${id_doc}, "${type}")`],
      (responses)=>{
        if(responses[0].error)
        {
          Notice.danger(responses[0].message)
        }
        else
        {
          Notice.info(responses[0].message)
          EventRegister.emit('refreshPage')
        }
      })
  }

  handleDelete(id_doc){
    Notice.alert( 'Suppression de partage', 
                  'Êtes-vous sûr de vouloir annuler le partage du dossier',
                  [
                    {text: 'Non', onPress: () =>{}},
                    {text: 'Oui', onPress: () =>{this.deleteSharedDoc(id_doc, 'customers')}},
                  ],
                )
  }

  renderDetails(data, index){
    const style = StyleSheet.create({
      infos:{
        flex:1,
        paddingHorizontal:30,
        paddingVertical:5
      },
      image:{
        flex:0,
        width:15,
        height:15
      },
      details:{
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        padding:10,
        borderBottomWidth:1,
        borderColor:'#D6D6D6'
      },
      champ:{
        fontSize:14
      },
      label:{
        fontWeight:"bold",
      }
    });
    const colorStriped = ((index % 2) == 0)? "#F2F2F2" : "#FFF"

    return  <View key={index} style={{flex:1}}>
                <View style={[style.details, {backgroundColor:colorStriped}]}>
                  <XImage source={{uri: 'arrow_up'}} style={style.image} />
                  <Text style={{paddingHorizontal:10, width:'85%'}}>{data.name}</Text>
                  <ImageButton source={{uri:'delete'}} Pstyle={{padding:8}} Istyle={style.image} onPress={()=>this.handleDelete(data.id_idocus)}/>
                </View>
            </View>
  }

  render(){
    const boxState = StyleSheet.create({
      container: {
        flex:1,
        flexDirection:'column',
        borderRadius:10,
        
        elevation: 7, //Android shadow

        shadowColor: '#000',                  //===
        shadowOffset: {width: 0, height: 2},  //=== iOs shadow    
        shadowOpacity: 0.8,                   //===
        shadowRadius: 2,                      //===

        margin:10,
        padding:10,
        backgroundColor:"#E9E9E7"
      },
      icons:{
        flex:0,
        width:40,
        height:40
      },
    });
    const icon = this.props.icon;
    const title = this.props.title;
    const counts = this.props.datas.length;

    const details = this.props.datas.map((dt, index) => {return this.renderDetails(dt, index)});

    return  <ScrollView>
              <View style={boxState.container}>
                <View style={{flex:1, flexDirection:'row'}}>
                  <View style={{flex:4}}>
                    <Text style={{fontSize:16,color:'#463119'}}>{title} <Text style={{color:'#EC5656',fontWeight:'bold'}}>({counts})</Text></Text>
                  </View>
                </View>
                <View style={{flex:1, marginTop:10}}>
                  {details}
                </View>
             </View>
           </ScrollView>
  }
}

class Header extends Component{
  constructor(props){
    super(props)

    this.state =  {
                    openModal: false,
                    typeModal: ""
                  }

    this.openModalSharing = this.openModalSharing.bind(this)
    this.closeModalSharing = this.closeModalSharing.bind(this)
  }

  openModalSharing(type){
    this.setState({openModal: true, typeModal: type})
  }

  closeModalSharing(){
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
              {this.state.openModal && <ModalSharing type={this.state.typeModal} dismiss={this.closeModalSharing} />}
              <BoxButton title="Partage avec un compte" onPress={()=>{this.openModalSharing('sharing')}} source={{uri:"sharing_account"}} rayon={60}/>
              <BoxButton title="Demande accès dossier" onPress={()=>{this.openModalSharing('access')}} source={{uri:"request_access"}} rayon={60}/>
            </View> 
  }
}

class TabNav extends Component{
  constructor(props){
    super(props);
    this.state = {index: 0}
  }

  handleIndexChange(index){
    this.setState({index: index})
  }

  renderTabBar(){
    const tabs = [
      {title: "Partages"},
      {title: "Contacts"},
      {title: "Demandes"},
    ];
    const styles = StyleSheet.create({
        container:{
          flex:0,
          flexDirection:'row',
          width:'100%',
          height:20,
          borderColor:'#DFE0DF',
          borderBottomWidth:1,
          marginTop:10,
        },
        touchable:{
          flex:1,
        },
        title:{
          flex:1,
          fontSize:12,
          fontWeight:'bold',
          textAlign:'center'
        },
        box:{
          flex:1,
          borderTopLeftRadius:10,
          borderTopRightRadius:10,
          marginHorizontal:2,
          backgroundColor:"#BEBEBD",
          borderColor:'#DFE0DF',
          borderWidth:1,
          flexDirection:'row',
          alignItems:'center',
        },
    });
    var indexStyle = "";
    const content = tabs.map((tb, index) => {
          indexStyle = (index == this.state.index)? {backgroundColor:'#E9E9E7',borderColor:'#C0D838'} : {};
          return (
           <TouchableOpacity key={index} onPress={()=>{this.handleIndexChange(index)}} style={styles.touchable}>
            <View style={[styles.box, indexStyle]}>
              <Text style={styles.title}>{tb.title}</Text>
            </View>
          </TouchableOpacity>
      )});

    return <View style={styles.container}>
             {content}
           </View>  
  }

  render(){
    return  <ScrollableTabView tabBarPosition="top" renderTabBar={()=>this.renderTabBar()} page={this.state.index} onChangeTab={(object) => {this.handleIndexChange(object.i)}}>
              <ViewState type={"datas_shared"} title="Liste des dossiers qui me sont partagés" datas={this.props.datas_shared} />
              <ViewState type={"contacts"} title="Liste des contacts avec qui je partage mon compte" datas={this.props.contacts} />
              <ViewState type={"access"} title="Liste des mes demandes d'accès" datas={this.props.access} />
            </ScrollableTabView>
  }
}

class SharingScreen extends Component {
  constructor(props){
    super(props)
    GLOB.navigation = this.props.navigation

    this.state = {ready: false}

    this.data_shared = []
    this.contacts = []
    this.access = []
    
    this.refreshDatas = this.refreshDatas.bind(this)
  }

  componentWillMount(){
    this.refreshPage = EventRegister.on('refreshPage', (data) => {
        this.refreshDatas()
    })
  }

  componentWillUnmount(){
    EventRegister.rm(this.refreshPage)
  }

  componentDidMount(){
    this.refreshDatas()
  }

  refreshDatas(){
    this.setState({ready: false})
    Fetcher.wait_for(
      [`getSharedDocsCustomers()`],
      (responses)=>{
        if(responses[0].error)
        {
          Notice.danger(responses[0].message)
        }
        else
        {
          this.datas_shared = responses[0].data_shared
          this.contacts = responses[0].contacts
          this.access = responses[0].access
        }

        this.setState({ready: true})
      })
  }

  render() {
      return (
          <Screen style={styles.container}
                  navigation={GLOB.navigation}>
            <Header />
            {this.state.ready && <TabNav datas_shared={this.datas_shared} contacts={this.contacts} access={this.access}/>}
            {!this.state.ready && <XImage loader={true} width={70} height={70} style={{alignSelf:'center', marginTop:10}} />}
          </Screen>
      )
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

export default SharingScreen;
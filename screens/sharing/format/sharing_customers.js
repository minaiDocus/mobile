import Config from '../../../Config'

import React, { Component } from 'react'
import {StyleSheet,Text,View,ScrollView,TouchableOpacity,Modal} from 'react-native'
import { EventRegister } from 'react-native-event-listeners'
import ScrollableTabView from 'react-native-scrollable-tab-view'

import {Screen,AnimatedBox,XImage,LineList,SimpleButton,BoxButton,ImageButton,LinkButton,ModalForm} from '../../../components'

import {AccountSharing} from "../../../requests"

let GLOB = {
              navigation:{},
              dataForm: {email:'', company: '', first_name: '', last_name: ''}
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
                          AccountSharing.wait_for(
                            [url],
                            (responses)=>{
                              if(responses[0].error)
                              {
                                Notice.danger(responses[0].message, true, responses[0].message)
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
    return [
              {label: "* Code ou email du dossier :", name: "GLOB.dataForm.code_or_email"}
           ]
  }

  formSharing(){
    GLOB.dataForm = {email:'', company: '', first_name: '', last_name: ''}
    return [
              {label: "* Couriel :", name: "GLOB.dataForm.email", keyboardType: "email-address"},
              {label: "* Nom de la société :", name: "GLOB.dataForm.company"},
              {label: "Prénom :", name: "GLOB.dataForm.first_name"},
              {label: "Nom :", name: "GLOB.dataForm.last_name"}
           ]
  }

  render(){
    const boxTitle = this.type == "sharing"? "Partage avec un compte" : "Demande accès dossier"

    return  <ModalForm  title={boxTitle}
                        getValue={(name)=>{return eval(`${name}`)}}
                        setValue={(name, value)=>{eval(`${name} = "${value}"`)}}
                        inputs={(this.type == "sharing")? this.formSharing() : this.formAccess()}
                        buttons={[
                          {title: "Retour", action: ()=>this.props.dismiss()},
                          {title: "Valider", action: ()=>this.validateProcess()},
                        ]}
            />
  }
}

class ViewState extends Component{
  constructor(props){
    super(props)

    this.handleDelete = this.handleDelete.bind(this)

    this.generateStyles()
  }

  deleteSharedDoc(id_doc, type='admin'){
    Notice.info("Suppression en cours ...")
    AccountSharing.wait_for(
      [`deleteSharedDoc(${id_doc}, "${type}")`],
      (responses)=>{
        if(responses[0].error)
        {
          Notice.danger(responses[0].message, true, responses[0].message)
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
                  <Text style={{paddingHorizontal:10, flex:1}}>{data.name}</Text>
                  <ImageButton source={{uri:'delete'}} Pstyle={{flex:0, width:20, padding:8, alignItems:'center', justifyContent:'center'}} Istyle={style.image} onPress={()=>this.handleDelete(data.id_idocus)}/>
                </View>
            </View>
  }

  generateStyles(){
    this.styles = StyleSheet.create({
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
      }
    });
  }

  render(){
    const icon = this.props.icon;
    const title = this.props.title;
    const counts = this.props.datas.length;

    const details = this.props.datas.map((dt, index) => {return this.renderDetails(dt, index)});

    return  <ScrollView>
              <View style={this.styles.container}>
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

    this.generateStyles()
  }

  openModalSharing(type){
    this.setState({openModal: true, typeModal: type})
  }

  closeModalSharing(){
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

    this.generateStyles()
  }

  handleIndexChange(index){
    this.setState({index: index})
  }

  generateStyles(){
    this.styles = StyleSheet.create({
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
          borderTopLeftRadius:10,
          borderTopRightRadius:10,
          backgroundColor:'rgba(0,0,0,0)', //for fixing bug on ios
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
    })
  }

  renderTabBar(){
    const tabs = [
      {title: "Partages"},
      {title: "Contacts"},
      {title: "Demandes"},
    ]
    var indexStyle = "";
    const content = tabs.map((tb, index) => {
          indexStyle = (index == this.state.index)? {backgroundColor:'#E9E9E7',borderColor:'#C0D838'} : {};
          return (
           <TouchableOpacity key={index} onPress={()=>{this.handleIndexChange(index)}} style={this.styles.touchable}>
            <View style={[this.styles.box, indexStyle]}>
              <Text style={this.styles.title}>{tb.title}</Text>
            </View>
          </TouchableOpacity>
      )});

    return <View style={this.styles.container}>
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

    this.datas_shared = []
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
    AccountSharing.wait_for(
      [`getSharedDocsCustomers()`],
      (responses)=>{
        if(responses[0].error)
        {
          Notice.danger(responses[0].message, true, responses[0].message)
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
          <Screen style={{flex: 1, flexDirection: 'column',}}
                  navigation={GLOB.navigation}>
            <Header />
            {this.state.ready && <TabNav datas_shared={this.datas_shared} contacts={this.contacts} access={this.access}/>}
            {!this.state.ready && <XImage loader={true} width={70} height={70} style={{alignSelf:'center', marginTop:10}} />}
          </Screen>
      )
    }
}

export default SharingScreen;
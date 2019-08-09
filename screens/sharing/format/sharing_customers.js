import React, { Component } from 'react'
import {StyleSheet,View,ScrollView,TouchableOpacity} from 'react-native'
import { EventRegister } from 'react-native-event-listeners'
import ScrollableTabView from 'react-native-scrollable-tab-view'

import { AnimatedBox,XImage,XText,SimpleButton,BoxButton,ImageButton,LinkButton,ModalForm,TabNav } from '../../../components'

import { Screen } from '../../layout'

import {AccountSharing} from "../../../requests"

class ModalSharing extends Component{
  constructor(props){
    super(props)
    this.type = this.props.type
  }

  validateProcess(){
    const form = this.refs.form_1

    let url = ""
    let message = ""
    if(this.type == "sharing")
    {
      message = "Partage en cours d'envoi ..."
      if(!isPresent(form.values.email) || !isPresent(form.values.company))
        Notice.alert("Erreur", "Veuillez remplir les champs obligatoires (*) svp!")
      else
        url = `addSharedDocCustomers(${JSON.stringify(form.values)})`
    }
    else
    {
      message = "Demande en cours d'envoi ..."
      if(!isPresent(form.values.code_or_email))
        Notice.alert("Erreur", "Veuillez remplir les champs obligatoires (*) svp!")
      else
        url = `addSharingRequestCustomers(${JSON.stringify(form.values)})`
    }

    if(url != '')
    {
      const call = ()=>{
                          Notice.info(message)
                          AccountSharing.waitFor([url], responses=>{
                            if(responses[0].error)
                            {
                              Notice.danger(responses[0].message, { name: responses[0].message })
                            }
                            else
                            {
                              Notice.info(responses[0].message)
                              EventRegister.emit('refreshPage')
                            }
                          })
                        }
      actionLocker(call)

      this.refs.form_1.dismiss()
    }
  }

  formAccess(){
    return [
              {label: "* Code ou email du dossier :", name: "code_or_email"}
           ]
  }

  formSharing(){
    return [
              {label: "* Couriel", name: "email", keyboardType: "email-address"},
              {label: "* Nom de la société", name: "company"},
              {label: "Prénom", name: "first_name"},
              {label: "Nom", name: "last_name"}
           ]
  }

  render(){
    const boxTitle = this.type == "sharing"? "Partage avec un compte" : "Demande accès dossier"

    return  <ModalForm  ref="form_1"
                        title={boxTitle}
                        dismiss={()=>this.props.dismiss()}
                        inputs={(this.type == "sharing")? this.formSharing() : this.formAccess()}
                        buttons={[
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
    AccountSharing.waitFor([`deleteSharedDoc(${id_doc}, "${type}")`], responses=>{
      if(responses[0].error)
      {
        Notice.danger(responses[0].message, { name: responses[0].message })
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
        width:19,
        height:19
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
                  <XImage source={{icon: 'caret-right'}} style={style.image} />
                  <XText style={{paddingHorizontal:10, flex:1}}>{data.name}</XText>
                  <ImageButton source={{icon: 'close'}} CStyle={{flex:0, width:20, padding:8, alignItems:'center', justifyContent:'center'}} IStyle={style.image} onPress={()=>this.handleDelete(data.id_idocus)}/>
                </View>
            </View>
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      container: {
        flex:1,
        flexDirection:'column',
        margin:10,
        padding:10
      }
    });
  }

  render(){
    const icon = this.props.icon;
    const title = this.props.title;
    const counts = this.props.datas.length;

    const details = this.props.datas.map((dt, index) => {return this.renderDetails(dt, index)});

    return  <ScrollView>
              <View style={[this.styles.container, Theme.box]}>
                <View style={{flex:1, flexDirection:'row'}}>
                  <View style={{flex:4}}>
                    <XText style={{fontSize:16,color:'#463119'}}>{title} <XText style={{color:'#EC5656',fontWeight:'bold'}}>({counts})</XText></XText>
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
    return  <View style={[this.styles.container, Theme.head.shape, {paddingBottom: 15}]}>
              {this.state.openModal && <ModalSharing type={this.state.typeModal} dismiss={this.closeModalSharing} />}
              <BoxButton title="Partage avec un compte" onPress={()=>{this.openModalSharing('sharing')}} source={{uri:"sharing_account"}} rayon={60}/>
              <BoxButton title="Demande accès dossier" onPress={()=>{this.openModalSharing('access')}} source={{uri:"request_access"}} rayon={60}/>
            </View> 
  }
}

class SharingScreen extends Component {
  constructor(props){
    super(props)

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
    AccountSharing.waitFor(['getSharedDocsCustomers()'], responses=>{
      if(responses[0].error){
        Notice.danger(e.message, { name: e.message })
      }
      else{
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
                  title={this.props.title}
                  name='Sharing'
                  withMenu={true}
                  options={this.props.options}
                  navigation={this.props.navigation}>
            <Header />
            { 
              this.state.ready &&
              <TabNav headers={[{title: "Partages"},
                              {title: "Contacts"},
                              {title: "Demandes"}]}
              >
                <ViewState type={"datas_shared"} title="Liste des dossiers qui me sont partagés" datas={this.datas_shared} />
                <ViewState type={"contacts"} title="Liste des contacts avec qui je partage mon compte" datas={this.contacts} />
                <ViewState type={"access"} title="Liste des mes demandes d'accès" datas={this.access} />
              </TabNav>
            }
            {!this.state.ready && <XImage loader={true} width={70} height={70} style={{alignSelf:'center', marginTop:10}} />}
          </Screen>
      )
    }
}

export default SharingScreen;
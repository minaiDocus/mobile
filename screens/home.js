import React, { Component } from 'react'
import { EventRegister } from 'react-native-event-listeners'
import { StyleSheet, View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'
import ScrollableTabView from 'react-native-scrollable-tab-view'

import { XImage,XText,TabNav,Navigator,BoxButton,ImageButton,LinkButton,ProgressUpload,UINotification,XScrollView} from '../components'

import { Menu } from './menu'
import { Screen } from './layout'

import { User } from '../models'

import { DocumentsFetcher } from '../requests'

let GLOB = { datas: []}

function docs_processed(){
  let result = [] 
  GLOB.datas.forEach((elem)=>{
    if (elem.type == "pack")
      result = result.concat(elem)
  })
  return result
}

function docs_processing(){ 
  let result = []
  GLOB.datas.forEach((elem)=>{
    if (elem.type == "temp_pack")
      result = result.concat(elem)
  })
  return result
}

function docs_errors(){ 
  let result = [] 
  GLOB.datas.forEach((elem)=>{
    if (elem.type == "error")
      result = result.concat(elem)
  })
  return result
}

class Header extends Component{
  constructor(props){
    super(props)

    this.ORstyle = []
    this.ORstyle["landscape"] = {
                                  body: { flexDirection: 'column', width: 100, justifyContent: 'space-around' }
                                }
    this.ORstyle["portrait"] =  {
                                  body: { flexDirection: 'row' }
                                }

    this.generateStyles() //style generation
  }

  generateStyles(){
    this.styles = {
                    minicontainer:{
                                    flex:0,
                                    alignItems:'center',
                                    justifyContent:'center',
                                  },
                  }
  }

  render(){
    return (
              <View style={[this.styles.minicontainer, Theme.head.shape, this.ORstyle[this.props.orientation].body]}>
                <BoxButton onPress={()=>{CurrentScreen.dismissTo('Send')}} source={{icon:"send"}} IStyle={{left: '20%'}} IOptions={{size: 20}} title='Envoi documents' />
                <BoxButton onPress={()=>{CurrentScreen.dismissTo('Invoices')}} source={{icon:"file-o"}} IStyle={{left: '27%'}} IOptions={{size: 20}} title='Mes documents' />
              </View>
            );
  }
}

class ViewState extends Component{
  constructor(props){
    super(props);
    this.state = {infos: -1}

    this.renderLink = this.renderLink.bind(this)
    this.generateStyles() //style generation
  }

  handleClickDocument(index){
    if(this.props.type == "processed")
    { 
      this.goToDocument(index)
    }
    else
    {
      this.toggleInfos(index)
    }
  }

  toggleInfos(index){
    if(this.state.infos == index)
    {
      this.setState({infos: -1})
    }
    else
    {
      this.setState({infos: index})
    }
  }

  goToDocument(index){
    const pack = this.props.datas[index]
    CurrentScreen.goTo('Publish', { type: 'pack', pack: pack, filter:{} })
  }

  generateStyles(){
    this.stylesDetails = StyleSheet.create({
      image:{
              flex:0,
              width:15,
              height:15,
              marginRight:20
            },
      infos:{
              flex:1,
              paddingHorizontal:30,
              paddingVertical:5
            },
      details:{
                flex:1,
                flexDirection:'row',
                paddingHorizontal:15,
                paddingVertical:10,
                borderBottomWidth:1,
                borderColor:'#D6D6D6'
              },
    })

    this.styles = StyleSheet.create({
      container:  {
                    flex:1,
                    flexDirection:'column',
                    margin: 10,
                    padding: 10
                  },
      boxIco: {
                flex:1,
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'center'
             },
      icons:{
              flex:0,
              width:30,
              height:30
            },
    })
  }

  renderLink(index){
    if(this.props.type == "processing" && this.props.datas[index].pack_id > 0)
    {
      return <LinkButton onPress={()=>{this.goToDocument(index)}} title='Voir détails ...' TStyle={{flex:1, textAlign:'right', color:'#003366'}} CStyle={{flex:1, marginTop:10}} />
    }
    else
    {
      return null
    }
  }

  renderDetails(data, index){
    const colorStriped = ((index % 2) == 0)? Theme.color_striped.pair : Theme.color_striped.impair
    const arrow = (this.state.infos == index)? "caret-down" : "caret-right";
    var infos = this.props.infos

    infos = infos.map((info, index) => {
      let value = ''
      if(info.value == "updated_at")
      {
        try{
          value = formatDate(data[info.value])
        }
        catch(e){}
      }
      else
      {
        try{
          value = data[info.value].toString()
        }
        catch(e){}
      }
      return <XText key={index} style={{fontSize:14}}><XText style={{fontWeight:"bold"}}>{info.label} : </XText>{value}</XText>
    })

    return    <TouchableOpacity key={index} style={{flex:1}} onPress={()=>this.handleClickDocument(index)}>
                <View style={[this.stylesDetails.details, {backgroundColor:colorStriped}]}>
                  <XImage source={{icon: arrow}} size={16} color={Theme.global_text.color} style={this.stylesDetails.image} />
                  <XText>{data.name}</XText>
                </View>
                {
                  this.state.infos == index && 
                    <View style={[this.stylesDetails.infos, {backgroundColor:colorStriped}]}>
                      {infos}
                      {this.renderLink(index)}
                    </View>
                }
              </TouchableOpacity>
  }

  render(){
    const icon = this.props.icon;
    const title = this.props.title;
    const counts = this.props.datas.length;

    const details = this.props.datas.map((dt, index) => {return this.renderDetails(dt, index)});

    return  <XScrollView >
              <View style={[this.styles.container, Theme.box]}>
                <View style={{flex:1, flexDirection:'row'}}>
                  <View style={this.styles.boxIco}>
                    <XImage source={{uri:icon}} style={this.styles.icons} />
                  </View>
                  <View style={{flex:4}}>
                    <XText style={{fontSize:16,color:'#463119'}}>{title} <XText style={{color:'#EC5656',fontWeight:'bold'}}>({counts})</XText></XText>
                  </View>
                </View>
                <View style={{flex:1, marginTop:10}}>
                  {this.props.updated && null}
                  {details}
                </View>
             </View>
           </XScrollView>
  }
}

class AppInfos extends Component{
  constructor(props){
    super(props)
    
    this.generateStyles()
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      content : {
                  flex:1,
                  alignItems:'center',
                  justifyContent:'center',
                  backgroundColor:'rgba(0,0,0,0.4)',
                },
      box:{
            flex:0,
            width:200,
            height:130,
            padding:10,
            backgroundColor:'#fff',
            borderRadius:10,
          },
      boxTitle: {
                  flex:0,
                  height:45,
                  borderBottomWidth:1, 
                  borderColor:'#000',
                  marginBottom:10
                },
      title:{
              flex:1, 
              fontWeight:'bold',
              fontSize:24,
              textAlign:'center'
            },
    })
  }

  showInfos(){
    const AppInfos =  <TouchableWithoutFeedback onPress={()=>clearFrontView()}>
                        <View style={this.styles.content}>
                            <View style={this.styles.box}>
                              <View style={this.styles.boxTitle}>
                                <XText style={this.styles.title}>iDocus</XText>
                              </View>
                              <XText>www.idocus.com</XText>
                              <XText>version : {Config.version.toString()}</XText>
                              <XText>IDOCUS © Copyright {Config.cp_year.toString()}</XText>
                            </View>
                        </View>
                      </TouchableWithoutFeedback>
    renderToFrontView(AppInfos, 'fade', ()=>{clearFrontView()})
  }

  render(){
    return <ImageButton   source={{icon: "info-circle"}}
                          IOptions={{size: 20, color: '#000'}}
                          CStyle={{flex:0, flexDirection:'column', justifyContent:'center', alignItems:'center', minWidth:40 }}
                          IStyle={{flex:0, width:20, height:20}}
                          onPress={()=>this.showInfos()} />
  }
}

class HomeScreen extends Component {
  constructor(props){
    super(props)

    GLOB.datas = []
    this.state = {orientation: 'portrait', showInfos: false, updated: false}

    this.ORstyle = []
    this.ORstyle["landscape"] = {
                                  body: { flexDirection: 'row' }
                                }
    this.ORstyle["portrait"] =  {
                                  body: { flexDirection: 'column' }
                                }

    this.refreshDatas = this.refreshDatas.bind(this)
  }

  handleOrientation(orientation){
    this.setState({orientation: orientation}) // exemple use of Orientation changing
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.navigation.state.params.initScreen)
    {
      this.refreshDatas()
      EventRegister.emit("refreshNotifications")
    }
  }

  componentDidMount(){
    this.refreshDatas()
    if(CurrentScreen.getNavigator().getParams("welcome"))
      setTimeout(()=>Notice.info(`Bienvenue ${User.fullNameOf(Master)}`), 1000)
  }

  refreshDatas(){
    this.setState({updated: false})

    DocumentsFetcher.waitFor(['refreshPacks()'], responses=>{
      if(responses[0].error)
        Notice.danger(responses[0].message, { name: responses[0].message })
      else
        GLOB.datas = responses[0].packs || []
      this.setState({updated: true})
    })
  }

  renderOptions(){
    return <View style={{flex:1, flexDirection:'row', justifyContent: 'center'}}>
              <UINotification />
              <AppInfos />
              <ProgressUpload />
           </View>
  }
  
  render() {
    return (
      <Screen style={[{flex:1}, Theme.body]}
              navigation={this.props.navigation}
              onChangeOrientation={(orientation)=>this.handleOrientation(orientation)}
              title='Accueil'
              name='Home'
              withMenu={true}
              noFCMUi={true}
              options={this.renderOptions()}
      >
        <View style={[{flex: 1}, this.ORstyle[this.state.orientation].body]}>
          <Header orientation={this.state.orientation} />
          <TabNav 
            headers={ 
                      [
                        {title: "Traités", icon:"doc_trait"},
                        {title: "En cours", icon:"doc_curr"},
                        {title: "Erreurs", icon:"doc_view"},
                      ]
                    }
          >
            <ViewState updated={this.state.updated} type={"processed"} icon="doc_trait" title="Dernier documents traités" datas={docs_processed()} infos={[]} />
            <ViewState updated={this.state.updated} type={"processing"} icon="doc_curr" title="Dernier documents en cours de traitement" datas={docs_processing()} infos={[{label:"Date", value:"updated_at"}, {label:"Nb pages", value:"page_number"}]} />
            <ViewState updated={this.state.updated} type={"errors"} icon="doc_view" title="Dernières erreurs rencontrées à la livraison de la pré-affectation" datas={docs_errors()} infos={[{label:"Date", value:"updated_at"},  {label:"Nb", value:"page_number"},  {label:"Erreur", value:"message"}]}/>
          </TabNav>
        </View>
      </Screen>
    )
  }
}

export default HomeScreen
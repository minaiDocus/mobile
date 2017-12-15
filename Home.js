import React, { Component } from 'react'
import { EventRegister } from 'react-native-event-listeners'
import Config from './Config'
import Screen from './components/screen'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity} from 'react-native'
import {XImage} from './components/XComponents'
import Navigator from './components/navigator'
import {BoxButton} from './components/buttons'
import Menu from './components/menu'
import ScrollableTabView from 'react-native-scrollable-tab-view'
import User from './models/User'
import Pack from './models/Pack'
import {ProgressUpload} from './components/uploader'

var GLOB = { navigation:{} }

function docs_processed(){ 
  try{memo_processed[0].updated_at}catch(e){memo_processed = null}
  return memo_processed || Pack.find("type = 'pack'").sorted("updated_at", true).slice(0,5) 
}
var memo_processed = docs_processed()

function docs_processing(){ 
  try{memo_processing[0].updated_at}catch(e){memo_processing = null}
  return memo_processing || Pack.find("type = 'temp_pack'").sorted("updated_at", true).slice(0,5) 
}
var memo_processing = docs_processing()

function docs_errors(){ 
  try{memo_errors[0].updated_at}catch(e){memo_errors = null}
  return memo_errors || Pack.find("type = 'error'").sorted("updated_at", true).slice(0,5) 
}
var memo_errors = docs_errors()

class Header extends Component{
  render(){
    return (
              <View style={styles.minicontainer}>
                <BoxButton onPress={()=>{GLOB.navigation.goTo('Send')}} source={{uri:"plane"}} title='Envoi documents' />
                <BoxButton onPress={()=>{GLOB.navigation.goTo('Documents')}} source={{uri:"documents"}} title='Mes documents' />
              </View>
            );
  }
}

class ViewState extends Component{
  constructor(props){
    super(props);
    this.state = {infos: -1}
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
    const id = this.props.datas[index].id
    GLOB.navigation.goTo('Publish', {idPack: id})
  }

  renderDetails(data, index){
    const style = StyleSheet.create({
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
      champ:{
        fontSize:14
      },
      label:{
        fontWeight:"bold",
      }
    });
    const colorStriped = ((index % 2) == 0)? "#F2F2F2" : "#FFF";
    const arrow = (this.state.infos == index)? "arrow_down" : "arrow_up";
    var infos = this.props.infos

    infos = infos.map((info, index) => {
      let value = ''
      if(info.value == "updated_at")
      {
        try{
          value = format_date(eval("data."+info.value))
        }
        catch(e){}
      }
      else
      {
        try{
          value = eval("data."+info.value).toString()
        }
        catch(e){}
      }
      return <Text key={index} style={style.champ}><Text style={style.label}>{info.label} : </Text>{value}</Text>
    })

    return    <TouchableOpacity key={index} style={{flex:1}} onPress={()=>this.handleClickDocument(index)}>
                <View style={[style.details, {backgroundColor:colorStriped}]}>
                  <XImage source={{uri: arrow}} style={style.image} />
                  <Text>{data.name}</Text>
                </View>
                {
                  this.state.infos == index && 
                    <View style={[style.infos, {backgroundColor:colorStriped}]}>
                      {infos}
                    </View>
                }
              </TouchableOpacity>
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
                  <View style={{flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
                    <XImage source={{uri:icon}} style={boxState.icons} />
                  </View>
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

class MenuLoader extends Component{
  constructor(props){
    super(props);
  }
  render(){ 
    return <Menu navigation={GLOB.navigation} /> 
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
      {title: "Traités", icon:"doc_trait"},
      {title: "En cours", icon:"doc_curr"},
      {title: "Erreurs", icon:"doc_view"},
    ];
    const styles = StyleSheet.create({
        container:{
          flex:0,
          flexDirection:'row',
          width:'100%',
          height:50,
          borderColor:'#DFE0DF',
          borderBottomWidth:1,
          marginTop:10,
        },
        icons:{
          flex:0,
          marginLeft:5,
          width:30,
          height:30,
        },
        touchable:{
          flex:1
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
              <XImage source={{uri:tb.icon}} style={styles.icons} />
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
              <ViewState type={"processed"} icon="doc_trait" title="Dernier documents traités" datas={docs_processed()} infos={[]} />
              <ViewState type={"processing"} icon="doc_curr" title="Dernier documents en cours de traitement" datas={docs_processing()} infos={[{label:"Date", value:"updated_at"}, {label:"Nb pages", value:"page_number"}]} />
              <ViewState type={"errors"} icon="doc_view" title="Dernières erreurs rencontrées à la livraison de la pré-affectation" datas={docs_errors()} infos={[{label:"Date", value:"updated_at"},  {label:"Nb", value:"page_number"},  {label:"Erreur", value:"error_message"}]}/>
            </ScrollableTabView>
  }
}

class HomeScreen extends Component {
  static navigationOptions = { headerTitle:'Accueil', headerLeft: <MenuLoader />, headerRight: <ProgressUpload />};

  constructor(props){
    super(props)
    this.master = User.getMaster()
    GLOB.navigation = new Navigator(this.props.navigation)
  }

  componentDidMount(){
    if(GLOB.navigation.getParams("welcome"))
    {
      setTimeout(()=>Notice.info(`Bienvenue ${User.fullName_of(this.master)}`), 1000)
    }
  }
  
  render() {
    return (
        <Screen style={{flex:1}} 
                navigation={GLOB.navigation}>
          <Header />
          <TabNav />
        </Screen>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 5,
  },
  minicontainer:{
    flex:0, 
    flexDirection:'row',
    backgroundColor:'#E1E2DD',
    alignItems:'center',
    justifyContent:'center',
  },
  headeView: {
    flex:1,
    padding:10,
    backgroundColor: "#FF8C00",
  }
});



export default HomeScreen
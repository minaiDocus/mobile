import React, { Component } from 'react'
import Config from './Config'
import Screen from './components/screen'
import {StyleSheet,Text,View,TextInput,ScrollView,TouchableOpacity} from 'react-native'
import XImage from './components/XImage'
import Navigator from './components/navigator'
import SelectInput from './components/select'
import Fetcher from './components/dataFetcher'
import User from './models/User'
import Pack from './models/Pack'
import {LineList} from './components/lists'

var GLOB = { navigation:{} }

function packs(){ 
  try{memo_packs[0].updated_at}catch(e){memo_packs = null}
  return memo_packs || Pack.find("type='pack'").sorted("updated_at", true) 
}
var memo_packs = packs()


class Header extends Component{
  constructor(props){
    super(props)
    users = User.getCustomers().sorted("company")
    this.clients = [{value:0, label:"Tous"}].concat(User.create_Selection(users))
    this.state = {client: 0, name: ""}
  }

  async handleClientChange(value){
    await this.setState({client: value})
    this.dataFilter()
  }

  async handleNameChange(value){
    await (value.length >= 3)? this.setState({name: value}) : this.setState({name: ""})
    this.dataFilter()
  }

  dataFilter(){
    this.props.onFilter(this.state.client, this.state.name)
  }

  render(){
  const headStyle = StyleSheet.create({
    container:{
      flex:0,
      flexDirection:'row',
      backgroundColor:'#E1E2DD',
      width:'100%',
      height:90,
    },
    inputs:{
      flex: 1,
      height:40,
      fontSize:16,
      paddingLeft:11,
      color:'#707070',
    },
    select:{
      flex:0,
      height:35,
    },
    left:{
      flex:1,
      flexDirection:'row',
      alignItems:'center',
      paddingLeft:30,
      justifyContent:'center'
    },
    right:{
      flex:4,
      paddingHorizontal:20,
    },
    image:{
      flex:0,
      width:60,
      height:60
    }
  })

  let inputSelection = ""
  if(this.clients.length == 2)
  {
    inputSelection = <Text style={{color:'#707070',fontSize:16,fontWeight:'bold',marginTop:5,paddingHorizontal:10}}>{this.clients[1].label}</Text>
  }
  else
  {
    inputSelection = <SelectInput dataOptions={this.clients} style={{color:'#707070'}} Pstyle={headStyle.select} onChange={(value) => this.handleClientChange(value)}/>
  }
  

  return ( <View style={headStyle.container}>
              <View style={headStyle.left}>
                <XImage source={{uri:"docs_ico"}} style={headStyle.image} />
              </View>
              <View style={headStyle.right}>
                {inputSelection}
                <View style={{flex:1, flexDirection:'row'}}>
                  <TextInput style={headStyle.inputs} placeholder="Filtre" autoCorrect={false} onChangeText={(value) => this.handleNameChange(value)}/>
                  <XImage source={{uri:"zoom_x"}} style={{flex:0, marginTop:5, width:25, height:25}} />
                </View>
              </View>
           </View>
          );
  }
}

class BoxDocs extends Component{

  handleClick(id){
    GLOB.navigation.goTo('Publish', {idPack: id})
  }

  render(){
    const boxDocs = StyleSheet.create({
      container: {
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        paddingLeft:'15%',
        paddingVertical:10,
      },
      image:{
        flex:0,
        width:15,
        height:15,
        marginRight:20
      }
    })
    return  <TouchableOpacity style={{flex:1}} onPress={()=>this.handleClick(this.props.data.id)} >
              <View style={boxDocs.container}>
                <XImage source={{uri:"arrow_doc"}} style={boxDocs.image} />
                <Text>{this.props.data.name.toString()}</Text>
              </View>
            </TouchableOpacity>
  }
}

class DocumentsScreen extends Component {
  static navigationOptions = {headerTitle: 'Mes documents',}

  constructor(props){
    super(props)
    GLOB.navigation = new Navigator(this.props.navigation)
    this.state = {ready: false, dataList: [] }
    this.dataFilter = this.dataFilter.bind(this)
  }

  componentDidMount(){
    Fetcher.wait_for(
      ['refreshCustomers()', 'refreshPacks()'],
      (responses)=>{
        responses.map(r=>{if(r!=true)Notice.danger(r)})
        this.setState({ready: true, dataList: packs()})
    })
  }

  dataFilter(client_id, name){
    var where = [];
    if(client_id > 0){ where.push(`owner_id = '${client_id}'`)}
    if(name != ""){ where.push(`name CONTAINS[c] '${name}'`)}
    if(where.length > 0)
      this.setState({dataList: packs().filtered(where.join(' AND ')) });
    else
      this.setState({dataList: packs()});
  }

  renderDocuments(){
    return  <ScrollView style={{flex:1, padding:3}}>
              <LineList datas={this.state.dataList}
                        title={`${this.state.dataList.length} / ${packs().length} : Document(s)`} 
                        renderItems={(data) => <BoxDocs data={data} /> } />
            </ScrollView>
  }

  render() {
     
      return (
        <Screen style={styles.container}
                navigation={GLOB.navigation}>
          <Header onFilter={this.dataFilter}/>
          {this.state.ready && this.renderDocuments()}
          {!this.state.ready && <XImage loader={true} style={{alignSelf:'center', marginTop:10}} width={70} height={70} />}
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

export default DocumentsScreen;
import React, { Component } from 'react'
import Config from '../../Config'
import Screen from '../../components/screen'
import {StyleSheet,Text,View,ScrollView,TouchableOpacity} from 'react-native'
import {XImage, XTextInput} from '../../components/XComponents'
import Navigator from '../../components/navigator'
import SelectInput from '../../components/select'
import User from '../../models/User'
import Pack from '../../models/Pack'
import {LineList} from '../../components/lists'

import Cfetcher from '../../components/dataFetcher'
import request1 from "../../requests/data_loader"

let Fetcher = new Cfetcher(request1)
let GLOB = { navigation:{} }

function packs(){ 
  try{memo_packs[0].id_idocus}catch(e){memo_packs = null}
  return memo_packs || Pack.find("type='pack'").sorted("created_at", true) 
}
let memo_packs = packs()


class Header extends Component{
  constructor(props){
    super(props)
    this.state = {client: 0, search: "", ready: false, loading: false}

    this.filterLocked = false
    this.filterCount = 0
    this.filterClock = null

    this.renderCustomerSelection = this.renderCustomerSelection.bind(this)
    this.filterLock = this.filterLock.bind(this)
  }

  componentDidMount(){
    const call = ()=>{
      users = User.getCustomers().sorted("code")
      this.clients = [{value:0, label:"Tous"}].concat(User.create_Selection(users))
      this.setState({ready: true})
    }
    setTimeout(call, 1000)
  }

  async filterLock()
  {
    this.filterCount--
    if(this.filterCount <= 0)
    {
      await this.setState({loading: false})
      this.filterLocked = false
      this.dataFilter()
      clearTimeout(this.filterClock)
    }
    else
    {
      this.filterClock = setTimeout(this.filterLock, 1000)
    }
  }

  async handleClientChange(value){
    await this.setState({client: value})
    this.dataFilter()
  }

  async handleFilterChange(value){
    await this.setState({search: value, loading: true})
    this.filterCount = 2
    if(!this.filterLocked)
    {
      this.filterLocked = true
      this.filterLock()
    }
  }

  dataFilter(){
    this.props.onFilter(this.state.client, this.state.search)
  }

  renderCustomerSelection(){
    let inputSelection = ""
    if(this.clients.length == 2)
    {
      inputSelection = <Text style={{color:'#707070',fontSize:16,fontWeight:'bold',marginTop:5,paddingHorizontal:10}}>{this.clients[1].label}</Text>
    }
    else
    {
      inputSelection = <SelectInput textInfo='Clients' filterSearch={true} dataOptions={this.clients} style={{color:'#707070'}} Pstyle={{flex:0, height:35}} onChange={(value) => this.handleClientChange(value)}/>
    }

    return inputSelection
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
        width:40,
        height:40
      }
    })

    const imageInput = ()=>{
      if(this.props.loadingFilter || this.state.loading)
      {
        return <XImage loader={true} style={{flex:0, marginTop:5}} width={25} height={25} />
      }
      else
      {
        return <XImage source={{uri:"zoom_x"}} style={{flex:0, marginTop:5, width:25, height:25}} />
      }
    }

    return  <View style={headStyle.container}>
                <View style={headStyle.left}>
                  <XImage source={{uri:"ico_docs"}} style={headStyle.image} />
                </View>
                <View style={headStyle.right}>
                  {this.state.ready && this.renderCustomerSelection()}
                  <View style={{flex:1, flexDirection:'row'}}>
                    <XTextInput style={headStyle.inputs} placeholder="Filtre" autoCorrect={false} onChangeText={(value) => this.handleFilterChange(value)}/>
                    {imageInput()}
                  </View>
                </View>
            </View>
  }
}

class BoxDocs extends Component{

  constructor(props){
    super(props)
  }

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
    const id_idocus = this.props.data.id
    return  <TouchableOpacity style={{flex:1}} onPress={()=>this.handleClick(id_idocus)} >
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
    this.state = {ready: false, dataList: [], loadingFilter: false}

    this.dataFilter = this.dataFilter.bind(this)
  }

  //For refreshing Account list
  componentWillMount(){
    Fetcher.wait_for(
      ['refreshCustomers()'],
      (responses)=>{
        responses.map(r=>{if(r!=true)Notice.info(r)})
    })
  }

  componentDidMount(){
    Fetcher.wait_for(
      ['refreshPacks()'],
      (responses)=>{
        responses.map(r=>{if(r!=true)Notice.danger(r)})
        this.setState({ready: true, dataList: packs()})
    })
  }

  dataFilter(client_id=0, text=''){
    this.setState({loadingFilter: true})
    Fetcher.wait_for(
      [`filterPacks("${text}", "${client_id}")`],
      (responses)=>{
        responses.map(r=>{
          if(r.error)
          {
            Notice.danger(r.message, true, "filterDanger")
            this.setState({loadingFilter: false, dataList: packs()})
          }
          else
          {
            let where = ''
            r.packs.forEach((el)=>{
              where += `id_idocus = ${el} OR `
            })
            where += 'id_idocus = -10'
            this.setState({loadingFilter: false, dataList: packs().filtered(where)})
          }
      })
    })
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
          <Header onFilter={this.dataFilter} loadingFilter={this.state.loadingFilter}/>
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
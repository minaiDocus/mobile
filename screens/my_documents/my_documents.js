import React, { Component } from 'react'
import Config from '../../Config'
import Screen from '../../components/screen'
import {StyleSheet,Text,View,ScrollView,TouchableOpacity} from 'react-native'
import {XImage, XTextInput} from '../../components/XComponents'
import Navigator from '../../components/navigator'
import SelectInput from '../../components/select'
import Pagination from '../../components/pagination'
import User from '../../models/User'
import {LineList} from '../../components/lists'

import Cfetcher from '../../components/dataFetcher'
import request1 from "../../requests/data_loader"

let Fetcher = new Cfetcher(request1)
let GLOB = { navigation:{}, filterText: "", clientId: 0 }

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
      inputSelection = <SelectInput textInfo='Clients' filterSearch={true} dataOptions={this.clients} Pstyle={{flex:0, height:35}} onChange={(value) => this.handleClientChange(value)}/>
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
                    <XTextInput TStyle={{paddingLeft:6}} PStyle={headStyle.inputs} placeholder="Filtre" autoCorrect={false} onChangeText={(value) => this.handleFilterChange(value)}/>
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

  handleClick(){
    GLOB.navigation.goTo('Publish', {pack: this.props.data, text: GLOB.filterText})
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

    return  <TouchableOpacity style={{flex:1}} onPress={()=>this.handleClick()} >
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

    this.page = this.limit_page = 1
    this.total = 0

    this.dataFilter = this.dataFilter.bind(this)
    this.changePage = this.changePage.bind(this)
    this.refreshDatas = this.refreshDatas.bind(this)
  }

  //For refreshing Account list
  componentDidMount(){
    Fetcher.wait_for(
      ['refreshCustomers()'],
      (responses)=>{
        responses.map(r=>{if(r!=true)Notice.info(r)})
        this.refreshDatas()
    })
  }

  changePage(page=1){
    this.page = page
    this.refreshDatas(false)
  }

  refreshDatas(renew = true){
    if(renew){
      this.page = 1
    }

    this.setState({ready: false, loadingFilter: true})

    Fetcher.wait_for(
          [`getPacks(${this.page}, "${GLOB.filterText}", "${GLOB.clientId}")`],
          (responses)=>{
            responses.map(r=>{
              if(r.error)
              {
                Notice.danger(r.message, true, "filterDanger")
                this.limit_page = 1
                this.total = 0
                this.setState({ready: true, loadingFilter: false})
              }
              else
              {  
                this.limit_page = r.nb_pages
                this.total = r.total
                this.setState({ready: true, loadingFilter: false, dataList: r.packs})
              }
          })
    })
  }

  dataFilter(client_id=0, text=""){
    GLOB.clientId = client_id
    GLOB.filterText = text
    this.refreshDatas()
  }

  renderDocuments(){
    return  <ScrollView style={{flex:1, padding:3}}>
              <LineList datas={this.state.dataList}
                        title={`${this.total} : Document(s)`} 
                        renderItems={(data) => <BoxDocs data={data} /> } />

              <Pagination onPageChanged={(page)=>this.changePage(page)} nb_pages={this.limit_page} page={this.page} />
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
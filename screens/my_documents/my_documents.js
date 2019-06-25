import React, { Component } from 'react'
import {StyleSheet,View,ScrollView,TouchableOpacity} from 'react-native'

import { XImage,XText,XTextInput,Navigator,SelectInput,Pagination,LineList } from '../../components'

import { Screen } from '../layout'

import { User } from '../../models'

import { UsersFetcher, DocumentsFetcher } from "../../requests"

let GLOB = { filterText: "", clientId: 0 }

class Header extends Component{
  constructor(props){
    super(props)
    this.state = {client: 0, search: "", ready: false, loading: false}

    this.filterLocked = false
    this.filterCount = 0
    this.filterClock = null
    this.customers = []

    this.renderCustomerSelection = this.renderCustomerSelection.bind(this)
    this.filterLock = this.filterLock.bind(this)

    this.generateStyles()
  }

  componentDidMount(){
    const call = ()=>{
      if(User.isUpdating()){
        setTimeout(call, 1000)
      }
      else{
        users = User.getCustomers().sorted("code")
        this.customers = [{value:0, label:"Tous"}].concat(User.createSelection(users))
        this.setState({ready: true})
      }
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

  generateStyles(){
    this.selectStyle =  {
                          label:{
                            color:'#707070',
                            fontSize:16,
                            fontWeight:'bold',
                            marginTop:5,
                            paddingHorizontal:10,
                            backgroundColor: '#FFF'
                          }
                        }
    this.styles = StyleSheet.create({
      container:{
                  flex:0,
                  flexDirection:'row',
                  backgroundColor:'#E1E2DD',
                  width:'100%',
                  height:80,
                },
      inputs: {
                flex: 1,
                height:40,
              },
      left: {
              flex:1,
              flexDirection:'row',
              alignItems:'center',
              paddingLeft:15,
              justifyContent:'center'
            },
      right:{
              flex:4,
              paddingHorizontal:20,
            },
      image:{
              flex:0,
              width:30,
              height:30
            }
    })
  }

  renderCustomerSelection(){
    let inputSelection = ""
    if(this.customers.length == 2)
    {
      inputSelection = <XText style={this.selectStyle.label}>{this.customers[1].label}</XText>
    }
    else
    {
      inputSelection = <SelectInput textInfo={`Clients (${this.customers.length - 1})`} filterSearch={true} dataOptions={this.customers} CStyle={{flex:0, height:35, backgroundColor: '#FFF'}} onChange={(value) => this.handleClientChange(value)}/>
    }

    return inputSelection
  }

  render(){
    const imageInput = ()=>{
      if(this.props.loadingFilter || this.state.loading)
      {
        return <XImage loader={true} style={{flex:0, marginTop:5}} width={18} height={18} />
      }
      else
      {
        return <XImage source={{uri:"zoom_x"}} style={{flex:0, marginTop:5, marginLeft:5, width:18, height:18}} />
      }
    }

    return  <View style={[this.styles.container, Theme.head.shape]}>
                <View style={this.styles.left}>
                  <XImage source={{uri:"ico_docs"}} style={this.styles.image} />
                </View>
                <View style={this.styles.right}>
                  {this.state.ready && this.renderCustomerSelection()}
                  <View style={{flex:1, flexDirection:'row', marginLeft: 3}}>
                    <XTextInput TStyle={{paddingLeft:6}} 
                                CStyle={this.styles.inputs} 
                                placeholder="Filtre" 
                                autoCorrect={false} 
                                onChangeText={(value) => this.handleFilterChange(value)}/>
                    {imageInput()}
                  </View>
                </View>
            </View>
  }
}

class BoxDocs extends Component{
  constructor(props){
    super(props)
    this.generateStyles()
  }

  handleClick(){
    CurrentScreen.goTo('Publish', {pack: this.props.data, text: GLOB.filterText})
  }

  generateStyles(){
    this.styles = StyleSheet.create({
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
  }

  render(){
    return  <TouchableOpacity style={{flex:1}} onPress={()=>this.handleClick()} >
              <View style={this.styles.container}>
                <XImage source={{uri:"arrow_doc"}} style={this.styles.image} />
                <XText>{this.props.data.name.toString()}</XText>
              </View>
            </TouchableOpacity>
  }
}

class DocumentsScreen extends Component {
  constructor(props){
    super(props)

    GLOB.filterText = ""
    GLOB.clientId = 0
    this.state = {ready: false, dataList: [], loadingFilter: false}

    this.page = this.limit_page = 1
    this.total = 0

    this.dataFilter = this.dataFilter.bind(this)
    this.changePage = this.changePage.bind(this)
    this.refreshDatas = this.refreshDatas.bind(this)
  }

  componentDidMount(){
    this.refreshDatas()
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

    DocumentsFetcher.waitFor([`getPacks(${this.page}, "${GLOB.filterText}", "${GLOB.clientId}")`], responses=>{
        responses.map(r=>{
          if(r.error)
          {
            Notice.danger(r.message, { name: r.message })
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
              <XText style={[{flex:0, textAlign:'center', fontSize:16, fontWeight:'bold'}, Theme.lists.title]}>{`${this.total} : Document(s)`} </XText>
              <Pagination onPageChanged={(page)=>this.changePage(page)} nb_pages={this.limit_page} page={this.page} CStyle={{marginBottom: 0}} />
              <LineList datas={this.state.dataList}
                        waitingData={!this.state.ready}
                        renderItems={(data) => <BoxDocs data={data} /> } />

              <Pagination onPageChanged={(page)=>this.changePage(page)} nb_pages={this.limit_page} page={this.page} />
            </ScrollView>
  }

  render() {
      return (
        <Screen style={{flex: 1, flexDirection: 'column'}}
                title='Mes documents'
                navigation={this.props.navigation}>
          <Header onFilter={this.dataFilter} loadingFilter={this.state.loadingFilter}/>
          { this.renderDocuments() }
        </Screen>
      )
    }
}

export default DocumentsScreen;
import React, { Component } from 'react'
import {StyleSheet,View,ScrollView,Modal,TouchableOpacity} from 'react-native'
import { NavigationActions } from 'react-navigation'
import ScrollableTabView from 'react-native-scrollable-tab-view'

import {Screen,Navigator,XImage,XText,PDFView,SimpleButton,ImageButton,BoxList,LineList,Pagination} from '../../components'

import {DocumentsFetcher} from "../../requests"

let GLOB = {Pack:{}, pagesPublished:[], pagesPublishing:[], idZoom:"", navigation:{}, filterText: ""}

class BoxZoom extends Component{
  constructor(props){
    super(props)
    this.state = {nb_pages: 0, current_page: 1}

    this.generateStyles()
  }

  hideModal(){
    this.props.hide();
  }

  nextElement(){
    this.hideModal()
    setTimeout(()=>this.props.nextElement(), 300)
  }

  prevElement(){
    this.hideModal()
    setTimeout(()=>this.props.prevElement(), 300)
  }

  indicator(){
    return <View style={{flex:0, width:'100%', height:'100%', backgroundColor:'#FFF', alignItems:'center', justifyContent:'center'}}>
              <XImage loader={true} width={70} height={70} style={{marginTop:10}} />
           </View>
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      boxZoom:{
                  flex:1,
                  padding:"5%",
                  backgroundColor:'#FFF',
                  flexDirection:'column',
                  justifyContent:'flex-end'
              },
      head: {
              flex:0,
              flexDirection:'row',
              borderBottomWidth:2,
              borderColor:'#DFE0DF',
              paddingBottom:5,
              height:25,
              marginBottom:10
            },
      wrapper:{
                flex:1,
                alignItems:'center',
                marginBottom:10,
                backgroundColor:'#FFF'
              },
      text: {
              flex:0,
              textAlign:'center',
              marginBottom:5,
              color:'#000',
              fontSize:18
            },
      textFoot: {
                  flex:1,
                  padding:5,
                  fontSize:12,
                },
      control:{
                flex:1,
                flexDirection:'row',
                justifyContent:'flex-end',
                alignItems:'center'
              },
      btnNav: {
                flex:0,
                marginHorizontal:10,
                backgroundColor:'#fff'
              }
    })
  }

  render(){
    const src = DocumentsFetcher.renderDocumentUri(this.props.data.large, this.props.data.force_temp_doc)

    return  <Modal transparent={false}
                   animationType="slide" 
                   visible={true}
                   supportedOrientations={['portrait', 'landscape']}
                   onRequestClose={()=>{}}
            >
              <View style={this.styles.boxZoom}>
                <View style={this.styles.head}>
                  <SimpleButton Pstyle={{flex:0}} onPress={()=>this.hideModal()} title="Retour" />
                  <View style={this.styles.control} >
                    <SimpleButton Tstyle={{fontSize:18,fontWeight:'bold',color:'#000'}} Pstyle={[this.styles.btnNav, {marginLeft:0}]} onPress={()=>this.prevElement()} title="<" />
                    <XText style={this.styles.text}>Pièce N°: {GLOB.idZoom + 1} / {this.props.total}</XText>
                    <SimpleButton Tstyle={{fontSize:18,fontWeight:'bold',color:'#000'}} Pstyle={[this.styles.btnNav, {marginRight:0}]} onPress={()=>this.nextElement()} title=">" />
                  </View>
                </View>
                <View style={{flex:1,marginBottom:5, borderColor:'#000', borderWidth:2}}>
                  <PDFView
                    source={src}
                    onLoadComplete={(pageCount, filePath)=>{
                      this.setState({nb_pages: pageCount})
                    }}
                    onPageChanged={(page,pageCount)=>{
                      this.setState({current_page: page})
                    }}
                    onError={(error)=>{
                      Notice.alert("Erreur loading pdf", error)
                    }} />
                </View>
                <View style={{flex:0,flexDirection:'row'}}>
                  <XText style={[this.styles.text, this.styles.textFoot, {textAlign:'left'}]}>{this.state.current_page}</XText>
                  <XText style={[this.styles.text, this.styles.textFoot, {textAlign:'right'}]}>{this.state.nb_pages} page(s)</XText>
                </View>
              </View>
            </Modal>
  }
}

class Header extends Component{
  constructor(props){
    super(props)
    this.generateStyles()
  }

  generateStyles(){
    this.styles = StyleSheet.create({
       minicontainer:{
                      flex:0, 
                      flexDirection:'column',
                      backgroundColor:'#E1E2DD',
                      alignItems:'center',
                      justifyContent:'center',
                      paddingVertical:10,
                    },
        text: {
                fontSize:18,
                fontWeight:"bold"
              },
        filter: {
                  fontSize:10,
                  fontWeight:"bold"
                }
      })
  }

  render(){
    return (
              <View style={this.styles.minicontainer}>
                <XText style={this.styles.text}>{GLOB.Pack.name || "test"}</XText>
                {
                  GLOB.filterText != "" &&
                  <XText style={this.styles.filter}>(Filtre active: <XText style={{color:"#F7230C", fontStyle:'italic'}}>{GLOB.filterText}</XText>)</XText>
                }
              </View>
            );
  }
}

class BoxInfos extends Component{
   constructor(props){
    super(props)

    this.generateStyles()
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      label:{
              flex:1,
              fontWeight:'bold',
              marginLeft:5
            },
      value:{
              flex:1,
              marginLeft:25
            }
    })
  }

  renderItems(data){
    return  <View style={{flex:1, paddingVertical:10}}>
              <XText style={this.styles.label}>{data.label.toString()}</XText>
              <XText style={this.styles.value}>{data.value.toString()}</XText>
            </View>
  }

  render(){
    const infos = [
                    {label: "Nom du documents :", value: GLOB.Pack.name},
                    {label: "Date de mise en ligne :", value: formatDate(GLOB.Pack.created_at)},
                    {label: "Date de modification :", value: formatDate(GLOB.Pack.updated_at)},
                    {label: "Nombre de page :", value: this.props.nb_published || 0},
                    {label: "Nombre de pièce en cours de traitement :", value: this.props.nb_publishing || 0},
                  ]

    return  <ScrollView style={{flex:0, padding:3}}>
              <LineList datas={infos}
                        renderItems={(data) => this.renderItems(data)} />
            </ScrollView>
  }
}

class ImgBox extends Component{
  constructor(props){
    super (props)
    this.generateStyles()
  }

  zoom(){
    GLOB.idZoom = this.props.index
    this.props.toggleZoom()
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      styleTouch: {
                    flex:0,
                    width:95,
                    marginVertical:5,
                    alignItems:'center',
                    justifyContent:'center'
                  },
      styleImg: {
                  flex:0,
                  height:109,
                  width:90,
                },
      styleContainer: {
                        backgroundColor:'#fff',
                        justifyContent:'center',
                        alignItems:'center',
                        height:115,
                        width:97,
                      },
      btnText: {
                flex:1,
                padding:2,
                backgroundColor:'rgba(255,255,255,0.7)',
                justifyContent:'center',
                alignItems:'center'
              },
      options:{
                flex:0,
                flexDirection:'row',
                height:'30%',
                width:'100%',
                backgroundColor:'#000'
              }
    });
  }

  render(){
    let src = {uri: "charge"}
    let local = true
    if(this.props.data.thumb)
    {
      src = DocumentsFetcher.renderDocumentUri(this.props.data.thumb)
      local = false
    }

    return  <TouchableOpacity style={this.styles.styleTouch} onPress={()=>this.zoom()}>
              <XImage type='container' PStyle={this.styles.styleContainer} style={this.styles.styleImg}  source={src} local={local} />
            </TouchableOpacity>
  }
}

class BoxPublish extends Component{
  constructor(props){
    super(props)
    this.state = { zoomActive: false}

    this.toggleZoom = this.toggleZoom.bind(this)
    this.renderResult = this.renderResult.bind(this)
    this.nextElement = this.nextElement.bind(this)
    this.prevElement = this.prevElement.bind(this)
  }

  async toggleZoom(){
    await this.setState({zoomActive: !this.state.zoomActive})
  }

  nextElement(){
    GLOB.idZoom = GLOB.idZoom + 1 
    if(typeof(this.props.datas[GLOB.idZoom]) === 'undefined')
    {
      GLOB.idZoom = 0
    }
    setTimeout(this.toggleZoom, 500)
  }

  prevElement(){
    GLOB.idZoom = GLOB.idZoom - 1 
    if(typeof(this.props.datas[GLOB.idZoom]) === 'undefined')
    {
      GLOB.idZoom = this.props.datas.length - 1
    }
    setTimeout(this.toggleZoom, 500)
  }
  
  renderResult(){
    return <ScrollView style={{flex:0, padding:3}}>
              {this.state.zoomActive && <BoxZoom  hide={this.toggleZoom} 
                                                  nextElement={this.nextElement} 
                                                  prevElement={this.prevElement} 
                                                  data={this.props.datas[GLOB.idZoom]} 
                                                  total={this.props.datas.length}/>
              }
              <XText style={{flex:0,textAlign:'center',fontSize:16,fontWeight:'bold'}}>{this.props.totalCount} {this.props.title}</XText>
              <BoxList datas={this.props.datas}
                       elementWidth={110}
                       renderItems={(data, index) => <ImgBox data={data} index={index} toggleZoom={()=>this.toggleZoom()}/> } />
              <Pagination onPageChanged={(page)=>this.props.onChangePage(page)} nb_pages={this.props.nb_pages || 1} page={this.props.page || 1} />
          </ScrollView>
  }

  render(){
    var rendering = ""
    if(this.props.ready)
    {
      rendering = this.renderResult()
    }
    else
    {
      rendering = <XImage loader={true} width={70} height={70} style={{alignSelf:'center', marginTop:10}} />
    }
    return rendering
  }
}

class TabNav extends Component{
  constructor(props){
    super(props);
    this.state = {index: 0, published_ready: false, publishing_ready: false}

    this.pagePublished = this.limit_pagePublished = 1
    this.totalPublished = 0

    this.refreshDocsPublished = this.refreshDocsPublished.bind(this)
    this.refreshDocsPublishing = this.refreshDocsPublishing.bind(this)

    this.changePagePublished = this.changePagePublished.bind(this)

    this.generateStyles()
  }

  componentDidMount(){
    this.refreshDocsPublished(true, true)
  }

  changePagePublished(page=1){
    this.pagePublished = page
    this.refreshDocsPublished(false)
  }

  refreshDocsPublished(renew = true, load_publishing=false){
    if(renew)
    {
      this.pagePublished = 1
    }

    this.setState({published_ready: false})
    const pack_id = GLOB.Pack.pack_id || GLOB.Pack.id
    DocumentsFetcher.waitFor(
        [`getDocumentsProcessed(${pack_id}, ${this.pagePublished}, "${GLOB.filterText}")`],
        (responses) => {
          if(responses[0].error)
          {
            Notice.danger(responses[0].message, true, responses[0].message)
          }
          else
          {
            GLOB.pagesPublished = [].concat(responses[0].published.map((doc, index)=>{return {id:doc.id, thumb:doc.thumb, large:doc.large, force_temp_doc:false} }))
            this.totalPublished = responses[0].total
            this.limit_pagePublished = responses[0].nb_pages
          }

          if(load_publishing)
          {
            this.refreshDocsPublishing()
          }

          this.setState({published_ready: true})
        })
  }

  refreshDocsPublishing(renew = true){
    if(GLOB.filterText == "" || typeof(GLOB.filterText) === "undefined")
    {
      this.setState({publishing_ready: false})
      const pack_id = GLOB.Pack.pack_id || GLOB.Pack.id
      DocumentsFetcher.waitFor(
          [`getDocumentsProcessing(${pack_id})`],
          (responses) => {
            if(responses[0].error)
            {
              Notice.danger(responses[0].message, true, responses[0].message)
            }
            else
            {
              GLOB.pagesPublishing = [].concat(responses[0].publishing.map((doc, index)=>{return {id:doc.id, thumb:doc.thumb, large:doc.large, force_temp_doc:true} }))
            }

            this.setState({publishing_ready: true})
          })
    }
    else
    {
      this.setState({publishing_ready: true})
    }
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
        }
    })
  }

  renderTabBar(){
    const tabs = [
      {title: "Infos", icon:"information"},
      {title: "En cours", icon:"doc_curr"},
      {title: "Publiés", icon:"doc_trait"},
    ]

    var indexStyle = "";
    const content = tabs.map((tb, index) => {
          indexStyle = (index == this.state.index)? {backgroundColor:'#E9E9E7',borderColor:'#C0D838'} : {};
          return (
           <TouchableOpacity key={index} onPress={()=>{this.handleIndexChange(index)}} style={this.styles.touchable}>
            <View style={[this.styles.box, indexStyle]}>
              <XImage source={{uri:tb.icon}} style={this.styles.icons} />
              <XText style={this.styles.title}>{tb.title}</XText>
            </View>
          </TouchableOpacity>
      )});

    return <View style={this.styles.container}>
             {content}
           </View>  
  }

  render(){
    return  <ScrollableTabView tabBarPosition="top" renderTabBar={()=>this.renderTabBar()} page={this.state.index} onChangeTab={(object) => {this.handleIndexChange(object.i)}}>
              <BoxInfos key={0}
                        nb_published={this.totalPublished}
                        nb_publishing={GLOB.pagesPublishing.length}/>
              <BoxPublish key={1} 
                          datas={GLOB.pagesPublishing}
                          totalCount={GLOB.pagesPublishing.length || 0} 
                          ready={this.state.publishing_ready} 
                          title="piece(s) en cours de traitement"
                          onChangePage={(page)=>{}} 
                          nb_pages={1} 
                          page={1} />
              <BoxPublish key={2} 
                          datas={GLOB.pagesPublished}
                          totalCount={this.totalPublished || 0}  
                          ready={this.state.published_ready} 
                          title="pages(s)" 
                          onChangePage={(page)=>this.changePagePublished(page)} 
                          nb_pages={this.limit_pagePublished} 
                          page={this.pagePublished} />
            </ScrollableTabView>
  }
}

class PublishScreen extends Component {
  static navigationOptions = {headerTitle: <XText class='title_screen'>Mes documents</XText>}

  constructor(props){
    super(props);
    GLOB.navigation = new Navigator(this.props.navigation)
    GLOB.Pack = GLOB.navigation.getParams('pack') || {}
    GLOB.filterText = GLOB.navigation.getParams('text') || ""
    GLOB.pagesPublished = GLOB.pagesPublishing = []
  }  

  render() {
      return (
        <Screen style={{flex: 1, flexDirection: 'column'}}
                navigation={GLOB.navigation}>
          <Header />
          <TabNav />
        </Screen>
      );
    }
}

export default PublishScreen;
import React, { Component } from 'react'
import Config from '../../Config'
import Screen from '../../components/screen'
import Navigator from '../../components/navigator'
import {StyleSheet,Text,View,ScrollView,Modal,TouchableOpacity} from 'react-native'
import {XImage} from '../../components/XComponents'
import { NavigationActions } from 'react-navigation'
import Pdf from 'react-native-pdf'
import {SimpleButton, ImageButton} from '../../components/buttons'
import {BoxList, LineList} from '../../components/lists'
import Pack from '../../models/Pack'
import User from '../../models/User'
import ScrollableTabView from 'react-native-scrollable-tab-view'

import Cfetcher from '../../components/dataFetcher'
import request1 from "../../requests/data_loader"

let Fetcher = new Cfetcher(request1)
let GLOB = {Pack:{}, pagesPublished:[], pagesPublishing:[], idZoom:"", navigation:{}}

function pagesPublished(){}


class BoxZoom extends Component{
  constructor(props){
    super(props);
    this.state = {nb_pages: 0, current_page: 1}
  }

  hideModal(){
    this.props.hide();
  }

  nextElement(){
    this.hideModal()
    this.props.nextElement()
  }

  prevElement(){
    this.hideModal()
    this.props.prevElement()
  }

  indicator(){
    return <View style={{flex:0, width:'100%', height:'100%', backgroundColor:'#FFF', alignItems:'center', justifyContent:'center'}}>
              <XImage loader={true} width={70} height={70} style={{marginTop:10}} />
           </View>
  }

  render(){
    const zoomBox = StyleSheet.create({
      boxZoom:{
          flex:1,
          padding:"5%",
          backgroundColor:'#FFF',
          flexDirection:'column',
          justifyContent:'flex-end'
      },
      head:{
        flex:0,
        flexDirection:'row',
        borderBottomWidth:2,
        borderColor:'#DFE0DF',
        paddingBottom:5,
        height:25,
        marginBottom:10
      },
      wrapper:{
        flex:0,
        alignItems:'center',
        marginBottom:10,
        width:'100%',
        height:'100%',
        backgroundColor:'#FFF'
      },
      pdf:{
        flex:0,
        width:'100%',
        height:'100%',
        backgroundColor:'#000',
      },
      text:{
        flex:0,
        textAlign:'center',
        marginBottom:5,
        color:'#000',
        fontSize:18
      },
      textFoot:{
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
      btnNav:{
        flex:0,
        marginHorizontal:10,
        backgroundColor:'#fff'
      }
    });
    
    const src = Fetcher.request.render_document_uri(this.props.data.large, this.props.data.force_temp_doc)

    return  <Modal transparent={false}
                   animationType="slide" 
                   visible={true}
                   onRequestClose={()=>{}}
            >
              <View style={zoomBox.boxZoom}>
                <View style={zoomBox.head}>
                  <SimpleButton Pstyle={{flex:0}} onPress={()=>this.hideModal()} title="Retour" />
                  <View style={zoomBox.control} >
                    <SimpleButton Tstyle={{fontSize:18,fontWeight:'bold',color:'#000'}} Pstyle={[zoomBox.btnNav, {marginLeft:0}]} onPress={()=>this.prevElement()} title="<" />
                    <Text style={zoomBox.text}>Pièce N°: {GLOB.idZoom + 1} / {this.props.total}</Text>
                    <SimpleButton Tstyle={{fontSize:18,fontWeight:'bold',color:'#000'}} Pstyle={[zoomBox.btnNav, {marginRight:0}]} onPress={()=>this.nextElement()} title=">" />
                  </View>
                </View>
                <View style={{flex:1,marginBottom:5, borderColor:'#000', borderWidth:2}}>
                  <Pdf
                    source={src}
                    activityIndicator={this.indicator()}
                    onLoadComplete={(pageCount, filePath)=>{
                      this.setState({nb_pages: pageCount})
                    }}
                    onPageChanged={(page,pageCount)=>{
                      this.setState({current_page: page})
                    }}
                    onError={(error)=>{
                      Notice.alert("Erreur loading pdf", error)
                    }}
                    style={zoomBox.pdf}/>
                </View>
                <View style={{flex:0,flexDirection:'row'}}>
                  <Text style={[zoomBox.text, zoomBox.textFoot, {textAlign:'left'}]}>{this.state.current_page}</Text>
                  <Text style={[zoomBox.text, zoomBox.textFoot, {textAlign:'right'}]}>{this.state.nb_pages} page(s)</Text>
                </View>
              </View>
            </Modal>
  }
}

class Header extends Component{
  constructor(props){
    super(props);
  }

  render(){
  const styles = StyleSheet.create({
   minicontainer:{
      flex:0, 
      flexDirection:'row',
      backgroundColor:'#E1E2DD',
      alignItems:'center',
      justifyContent:'center',
      paddingVertical:10,
    },
    text:{
      fontSize:18,
      fontWeight:"bold"
    }
  });
  return (
            <View style={styles.minicontainer}>
              <Text style={styles.text}>{GLOB.Pack.name || "test"}</Text>
            </View>
          );
  }
}

class BoxInfos extends Component{
   constructor(props){
    super(props)
  }

  renderItems(data){
    const infoStyle = StyleSheet.create({
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
    return  <View style={{flex:1, paddingVertical:10}}>
              <Text style={infoStyle.label}>{data.label.toString()}</Text>
              <Text style={infoStyle.value}>{data.value.toString()}</Text>
            </View>
  }

  render(){
    const infos = [
                    {label: "Nom du documents :", value: GLOB.Pack.name},
                    {label: "Date de mise en ligne :", value: format_date(GLOB.Pack.created_at)},
                    {label: "Date de modification :", value: format_date(GLOB.Pack.updated_at)},
                    {label: "Nombre de page :", value: GLOB.pagesPublished.length},
                    {label: "Nombre de pièce en cours de traitement :", value: GLOB.pagesPublishing.length},
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
    this.state = {options: false}
  }

  toggleOpt(){
    this.setState({options: !this.state.options})
  }

  zoom(){
    GLOB.idZoom = this.props.index
    this.props.toggleZoom()
    this.toggleOpt()
  }

  render(){
    const imgBox = StyleSheet.create({
      styleTouch: {
          flex:0,
          width:75,
          marginVertical:5,
          alignItems:'center',
          justifyContent:'center' 
        },
      styleImg: {
          flex:0,
          height:89,
          width:70,
        },
      styleContainer:{
          backgroundColor:'#fff',
          justifyContent:'center',
          alignItems:'center',
          height:95,
          width:77,
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

    let src = {uri: "charge"}
    let local = true
    if(this.props.data.thumb)
    {
      src = Fetcher.request.render_document_uri(this.props.data.thumb)
      local = false
    }

    return  <TouchableOpacity style={imgBox.styleTouch} onPress={()=>this.toggleOpt()}>
                <XImage type='container' PStyle={imgBox.styleContainer} style={imgBox.styleImg}  source={src} local={local} >
                  { this.state.options == true &&
                    <View style={imgBox.options}>
                      <ImageButton source={{uri:'zoom_x'}} onPress={()=>{this.zoom()}} Pstyle={imgBox.btnText} Istyle={{width:30,height:30}} />
                    </View>
                  }
                </XImage>
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
    const style = {
        flex:1,
        flexDirection:'row',
        borderRadius:10,
        elevation: 7,
        backgroundColor:"#E9E9E7",
        margin:10,
        padding:5
    }
    return <ScrollView style={{flex:0, padding:3}}>
              {this.state.zoomActive && <BoxZoom  hide={this.toggleZoom} 
                                                  nextElement={this.nextElement} 
                                                  prevElement={this.prevElement} 
                                                  data={this.props.datas[GLOB.idZoom]} 
                                                  total={this.props.datas.length}/>
              }
              <Text style={{flex:0,textAlign:'center',fontSize:16,fontWeight:'bold'}}>{this.props.datas.length} {this.props.title}</Text>
              <BoxList datas={this.props.datas}
                       elementWidth={80}
                       renderItems={(data, index) => <ImgBox data={data} index={index} toggleZoom={()=>this.toggleZoom()}/> } />
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
  }

  componentDidMount(){
    Fetcher.wait_for(
        [`getPackDocuments(${GLOB.Pack.id_idocus})`],
        (responses) => {
          if(responses[0].error)
          {
            Notice.danger(responses[0].message)
          }
          else
          {
            GLOB.pagesPublished = [].concat(responses[0].published.map((doc, index)=>{return {id:index, thumb:doc.thumb, large:doc.large, id_idocus: doc.id, force_temp_doc:false} }))
            GLOB.pagesPublishing = [].concat(responses[0].publishing.map((doc, index)=>{return {id:index, thumb:doc.thumb, large:doc.large, id_idocus: doc.id, force_temp_doc:true} }))
          }

          this.setState({published_ready: true, publishing_ready: true})
        })
  }

  handleIndexChange(index){
    this.setState({index: index})
  }

  renderTabBar(){
    const tabs = [
      {title: "Infos", icon:"information"},
      {title: "En cours", icon:"doc_curr"},
      {title: "Publiés", icon:"doc_trait"},
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
        }
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
              <BoxInfos key={0} />
              <BoxPublish key={1} datas={GLOB.pagesPublishing} ready={this.state.published_ready} title="piece(s) en cours de traitement"/>
              <BoxPublish key={2} datas={GLOB.pagesPublished} ready={this.state.publishing_ready} title="page(s)"/>
            </ScrollableTabView>
  }
}

class PublishScreen extends Component {
  static navigationOptions = {headerTitle: 'Mes documents',}

  constructor(props){
    super(props);
    GLOB.navigation = new Navigator(this.props.navigation)
    GLOB.Pack = Pack.find(`id = ${GLOB.navigation.getParams('idPack')}`)[0] || {};
    GLOB.pagesPublished = GLOB.pagesPublishing = []
  }  

  render() {
      return (
        <Screen style={styles.container}
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
    flexDirection: 'column',
  },
  button: {
    flex:1,
    margin:10
  }
});

export default PublishScreen;
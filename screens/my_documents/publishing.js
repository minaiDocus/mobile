import React, { Component } from 'react'
import {StyleSheet,View,ScrollView,Modal,TouchableOpacity} from 'react-native'
import { NavigationActions } from 'react-navigation'
import { EventRegister } from 'react-native-event-listeners'
import ScrollableTabView from 'react-native-scrollable-tab-view'

import {Screen,Navigator,XImage,XText,PDFView,SimpleButton,ImageButton,BoxList,LineList,Pagination} from '../../components'

import { ModalComptaAnalysis } from '../modals/compta_analytics'

import {DocumentsFetcher, FileUploader} from "../../requests"

let GLOB = {Pack:{}, pagesPublished:[], pagesPublishing:[], idZoom:"", navigation:{}, filterText: "", selectedItems:[], press_action: 'zoom'}

function getImgStampOf(state=''){
  let stamp_img = 'none'

  switch(state){
    case 'awaiting_analytics':
      stamp_img = 'compta_analytics'
      break;
    case 'awaiting_pre_assignment':
      stamp_img = 'preaff_pending'
      break;
    case 'delivery_failed':
      stamp_img = 'preaff_err'
      break;
    case 'delivered':
      stamp_img = 'preaff_deliv'
      break;
    case 'delivery_pending':
      stamp_img = 'preaff_deliv_pending'
      break;
    case 'duplication':
      stamp_img = 'preaff_dupl'
      break;
    case 'piece_ignored':
      stamp_img = 'preaff_ignored'
      break;
    default:
      stamp_img = 'none'
  }

  return stamp_img
}

class BoxZoom extends Component{
  constructor(props){
    super(props)

    exist = GLOB.selectedItems.find(elem => { return elem == this.props.data.id })

    this.state = { nb_pages: 0, current_page: 1, is_selected: exist? true : false }

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

  handleSelection(){
    this.props.selectElement()
    this.setState({ is_selected: !this.state.is_selected })
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
              height:35,
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
      piece_number: {
                      flex:0,
                      textAlign:'center',
                      fontSize:16,
                      borderRadius:5,
                      paddingVertical:2,
                      paddingHorizontal:7,
                      marginHorizontal:3,
                      fontWeight:'bold',
                      color:'#FFF'
                    },
      textFoot: {
                  flex:1,
                  padding:5,
                  fontSize:12,
                },
      stamp:  {
                flex:1,
                alignItems: 'center',
                justifyContent: 'center',
                height:40
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

    const selection_img = this.state.is_selected ? 'no_selection' : 'validate_green'

    let stamp_img = getImgStampOf(this.props.data.state)

    let piece_number = GLOB.idZoom + 1
    let style_number = {backgroundColor:'#BEBEBD'}

    if(isPresent(this.props.data.position)) {
      piece_number = formatNumber(this.props.data.position)
      style_number = {backgroundColor:'#F89406'}
    }

    return  <Modal transparent={false}
                   animationType="slide" 
                   visible={true}
                   supportedOrientations={['portrait', 'landscape']}
                   onRequestClose={()=>{ this.hideModal() }}
            >
              <View style={this.styles.boxZoom}>
                <View style={this.styles.head}>
                  <SimpleButton Pstyle={{flex:0}} onPress={()=>this.hideModal()} title="Retour" />
                  {
                    this.props.selectElement &&
                    <ImageButton  source={{uri:selection_img}} 
                                  Pstyle={{flex:0, flexDirection:'column', alignItems:'center', justifyContent:'center', width:45}}
                                  Istyle={{flex:0, width:18, height:18}}
                                  onPress={()=>{this.handleSelection()}} />
                  }
                  <View style={this.styles.control} >
                    <SimpleButton Tstyle={{fontSize:18,fontWeight:'bold',color:'#000'}} Pstyle={[this.styles.btnNav, {marginLeft:0}]} onPress={()=>this.prevElement()} title="<-" />
                    <XText style={[this.styles.piece_number, style_number]}>{piece_number}</XText>
                    <SimpleButton Tstyle={{fontSize:18,fontWeight:'bold',color:'#000'}} Pstyle={[this.styles.btnNav, {marginRight:0}]} onPress={()=>this.nextElement()} title="->" />
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
                <View style={{flex:0,flexDirection:'row',alignItems:'center', justifyContent:'center'}}>
                  <XText style={[this.styles.text, this.styles.textFoot, {textAlign:'left'}]}>{this.state.current_page}</XText>
                  { stamp_img != 'none' && <XImage source={{uri:stamp_img}} style={this.styles.stamp} /> }
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
                    {label: "Nombre de pièce traitée :", value: this.props.nb_published || 0},
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

    this.state = { is_selected: false }

    this.selectionListener = null

    this.prepareSelection = this.prepareSelection.bind(this)
    this.selectItem = this.selectItem.bind(this)
    this.initWith = this.initWith.bind(this)

    this.generateStyles()
  }

  componentWillReceiveProps(nextProps){
    if(this.props.data.id != nextProps.data.id)
      this.initWith(nextProps)
  }

  componentDidMount(){
    this.initWith(this.props)
  }

  componentWillUnmount(){
    if(this.selectionListener)
    {
      EventRegister.rm(this.selectionListener)
      this.selectionListener = null
    }
  }

  initWith(props){
    if(this.selectionListener)
    {
      EventRegister.rm(this.selectionListener)
      this.selectionListener = null
    }

    if(props.withSelection)
      this.selectionListener = EventRegister.on(`select_element_${props.data.id}`, this.selectItem)

    exist = GLOB.selectedItems.find(elem => { return elem == props.data.id })
    this.setState({ is_selected: exist? true : false })
  }

  pressAction(){
    if(this.props.withSelection && GLOB.press_action == 'selection')
    {
      this.selectItem()

      if(GLOB.selectedItems.length == 0)
        Notice.remove('selection_items_notification', true)
    }
    else
    {
      GLOB.idZoom = this.props.index
      this.props.toggleZoom()
    }
  }

  prepareSelection(){
    if(this.props.withSelection)
    {
      GLOB.press_action = 'selection'
      this.selectItem()
    }
  }

  selectItem(action='toggle'){
    let selectType = action

    if(action == 'toggle')
    {
      if(this.state.is_selected == true)
        selectType = 'out'
      else
        selectType = 'in'
    }

    if(selectType == 'in')
    {
      if(! GLOB.selectedItems.find( elem =>{ return elem == this.props.data.id }))
      {
        GLOB.selectedItems.push(this.props.data.id)
        this.setState({ is_selected: true })
      }
    }
    else
    {
      GLOB.selectedItems = GLOB.selectedItems.filter( elem => { return elem != this.props.data.id } )
      this.setState({ is_selected: false })
    }

    EventRegister.emit('selectionItems')
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
                  backgroundColor:'#FFF'
                },
      styleContainer: {
                        backgroundColor:'#463119',
                        justifyContent:'center',
                        alignItems:'center',
                        height:115,
                        width:97,
                        overflow:'hidden' //For iOS overflow content
                      },
      btnText: {
                flex:1,
                padding:2,
                backgroundColor:'rgba(255,255,255,0.7)',
                justifyContent:'center',
                alignItems:'center'
              },
      stamp:{
                flex:0,
                flexDirection:'row',
                height:'20%',
                width:'100%',
                backgroundColor:'#FFF',
                borderWidth:1,
                borderColor: '#463119',
                transform: [{rotate: '30deg'}],
                alignItems:'center',
                justifyContent: 'center',
                paddingLeft: 10,
                marginLeft: 20,
              },
      stamp_img:{
              flex:0,
              height:'90%',
            },
      positions:  {
                    position: 'absolute',
                    bottom:5,
                    borderRadius:5,
                    backgroundColor:'#F89406',
                    padding:3,
                    marginHorizontal:5,
                    fontSize:7,
                    fontWeight:'bold',
                    color:'#FFF'
                  }
    });
  }

  render(){
    let stamp_img = getImgStampOf(this.props.data.state)

    let src = {uri: "charge"}
    let local = true
    if(this.props.data.thumb)
    {
      src = DocumentsFetcher.renderDocumentUri(this.props.data.thumb, this.props.data.force_temp_doc)
      local = false
    }

    if(this.state.is_selected)
    {
      var styleSelected = { backgroundColor: '#C9DD03' }
    }

    return  <TouchableOpacity style={this.styles.styleTouch} onLongPress={()=>this.prepareSelection()} onPress={()=>this.pressAction()}>
              <XImage type='container' PStyle={[this.styles.styleContainer, styleSelected]} CStyle={{justifyContent:'flex-start'}} style={this.styles.styleImg}  source={src} local={local} >
                { stamp_img != 'none' && <XImage type='container' source={{uri:stamp_img}} PStyle={this.styles.stamp} style={this.styles.stamp_img}/> }
                { isPresent(this.props.data.position) && <XText style={this.styles.positions}>{formatNumber(this.props.data.position, 'xxx')}</XText> }
              </XImage>
            </TouchableOpacity>
  }
}

class BoxPublish extends Component{
  constructor(props){
    super(props)
    this.state = { zoomActive: false }

    this.toggleZoom = this.toggleZoom.bind(this)
    this.nextElement = this.nextElement.bind(this)
    this.prevElement = this.prevElement.bind(this)
    this.selectElement = this.selectElement.bind(this)
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

  selectElement(){
    if(isPresent(GLOB.idZoom) && typeof(this.props.datas[GLOB.idZoom]) !== 'undefined' && isPresent(this.props.datas[GLOB.idZoom].actionOnSelect))
      EventRegister.emit(`select_element_${this.props.datas[GLOB.idZoom].id}`, 'toggle')
  }

  render(){
    return <ScrollView style={{flex:0, padding:3}}>
              {this.state.zoomActive && <BoxZoom  hide={this.toggleZoom} 
                                                  nextElement={this.nextElement} 
                                                  prevElement={this.prevElement}
                                                  selectElement={(isPresent(this.props.datas[GLOB.idZoom].actionOnSelect))? this.selectElement : false} 
                                                  data={this.props.datas[GLOB.idZoom]} 
                                                  total={this.props.datas.length}/>
              }
              <BoxList datas={this.props.datas}
                       title={`${this.props.totalCount} ${this.props.title}`}
                       waitingData={!this.props.ready}
                       noItemText='none'
                       elementWidth={110}
                       renderItems={(data, index) => <ImgBox withSelection={(isPresent(data.actionOnSelect))? true : false} data={data} index={index} toggleZoom={()=>this.toggleZoom()}/> } />
              <Pagination onPageChanged={(page)=>this.props.onChangePage(page)} nb_pages={this.props.nb_pages || 1} page={this.props.page || 1} />
          </ScrollView>
  }
}

class TabNav extends Component{
  constructor(props){
    super(props);
    this.state = {index: 0, published_ready: false, publishing_ready: false}

    this.pagePublished = this.limit_pagePublished = 1
    this.pagePublishing = this.limit_pagePublishing = 1
    this.totalPublished = this.totalPublishing = 0

    this.refreshDocsPublished = this.refreshDocsPublished.bind(this)
    this.refreshDocsPublishing = this.refreshDocsPublishing.bind(this)

    this.changePagePublished = this.changePagePublished.bind(this)
    this.changePagePublishing = this.changePagePublishing.bind(this)

    this.generateStyles()
  }

  componentDidMount(){
    this.refreshDocsPublished(true, true)
  }

  changePagePublished(page=1){
    this.pagePublished = page
    this.refreshDocsPublished(false)
  }

  changePagePublishing(page=1){
    this.pagePublishing = page
    this.refreshDocsPublishing(false)
  }

  refreshDocsPublished(renew = true, load_publishing=false){
    if(renew)
    {
      this.pagePublished = 1
    }

    this.setState({published_ready: false})
    const pack_id = GLOB.Pack.pack_id || GLOB.Pack.id
    DocumentsFetcher.waitFor([`getDocumentsProcessed(${pack_id}, ${this.pagePublished}, "${GLOB.filterText}")`], responses => {
      if(responses[0].error)
      {
        Notice.danger(responses[0].message, { name: responses[0].message })
      }
      else
      {
        GLOB.pagesPublished = [].concat(responses[0].published.map((doc, index)=>{ return Object.assign(doc, {force_temp_doc:false}) }))
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
    if(renew)
    {
      this.pagePublishing = 1
    }

    if(GLOB.filterText == "" || typeof(GLOB.filterText) === "undefined")
    {
      this.setState({publishing_ready: false})
      const pack_id = GLOB.Pack.pack_id || GLOB.Pack.id
      DocumentsFetcher.waitFor([`getDocumentsProcessing(${pack_id}, ${this.pagePublishing})`], responses => {
        if(responses[0].error)
        {
          Notice.danger(responses[0].message, { name: responses[0].message })
        }
        else
        {
          GLOB.pagesPublishing = [].concat(responses[0].publishing.map((doc, index)=>{return Object.assign(doc, {force_temp_doc: true}) }))
          this.totalPublishing = responses[0].total
          this.limit_pagePublishing = responses[0].nb_pages
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
                        nb_publishing={this.totalPublishing}/>
              <BoxPublish key={1}
                          type='publishing' 
                          datas={GLOB.pagesPublishing}
                          totalCount={this.totalPublishing || 0}
                          ready={this.state.publishing_ready}
                          title="piece(s) en cours de traitement"
                          onChangePage={(page)=>{this.changePagePublishing(page)}}
                          nb_pages={this.limit_pagePublishing}
                          page={this.pagePublishing} />
              <BoxPublish key={2}
                          type='published'
                          datas={GLOB.pagesPublished}
                          totalCount={this.totalPublished || 0}
                          ready={this.state.published_ready}
                          title="pièce(s)"
                          onChangePage={(page)=>this.changePagePublished(page)}
                          nb_pages={this.limit_pagePublished}
                          page={this.pagePublished} />
            </ScrollableTabView>
  }
}

class PublishScreen extends Component {
  static navigationOptions = {headerTitle: <XText class='title_screen'>Mes documents</XText>}

  constructor(props){
    super(props)

    this.state = { analysisOpen: false }

    this.handleSelection = this.handleSelection.bind(this)
    this.selectAllItem = this.selectAllItem.bind(this)
    this.unselectAllItem = this.unselectAllItem.bind(this)
    this.openComptaAnalysis = this.openComptaAnalysis.bind(this)

    GLOB.navigation = new Navigator(this.props.navigation)
    GLOB.Pack = GLOB.navigation.getParams('pack') || {}
    GLOB.filterText = GLOB.navigation.getParams('text') || ""
    GLOB.press_action = 'zoom'
    GLOB.pagesPublished = GLOB.pagesPublishing = GLOB.selectedItems = []
  }

  componentWillMount(){
    this.selectionItemsListener = EventRegister.on('selectionItems', this.handleSelection)
  }

  componentWillUnmount(){
    Notice.remove('selection_items_notification', true)
    EventRegister.rm(this.selectionItemsListener)
  }

  openComptaAnalysis(){
    if(GLOB.selectedItems.length > 0)
    {
      this.setState( { analysisOpen: true } )
    }
    else
    {
      Notice.remove('selection_items_notification', true)
      Notice.info('Veuillez selectionnez au moin une pièce', { permanent: false, name: 'no_selection_items' })
    }
  }

  closeComptaAnalysis(data){
    if(isPresent(data))
    {
      FileUploader.waitFor([`setComptaAnalytics('${JSON.stringify(GLOB.selectedItems)}', '${JSON.stringify(data)}')`], responses => {
        if(isPresent(responses[0].error_message))
          Notice.danger({ title: 'Modification analytiques', body: responses[0].error_message }, { permanent: false, name: 'pieces_update_analyis_error', delay: 10000 })
        if(isPresent(responses[0].sending_message))
          Notice.info({ title: 'Modification analytiques', body: responses[0].sending_message }, { permanent: false, name: 'pieces_update_analyis_sending', delay: 10000 })
      })

      this.setState( { analysisOpen: false } )
    }
    else
    {
      this.setState( { analysisOpen: false } )
    }
  }

  selectAllItem(){
    GLOB.press_action = 'selection'
    GLOB.pagesPublished.map(elem => { EventRegister.emit(`select_element_${elem.id}`, 'in') })
  }

  unselectAllItem(){
    GLOB.press_action = 'zoom'
    GLOB.selectedItems.map(elem => { EventRegister.emit(`select_element_${elem}`, 'out') })
    GLOB.selectedItems = []
  }

  handleSelection(){
    const mess_obj =  <View style={{flex:1, flexDirection:'row'}}>
                        <View style={{ flex:1, paddingHorizontal: 10}}>
                          <XText style={{flex:0, height: 25, color:'#FFF', fontWeight:"bold"}}>Séléctions</XText>
                          <XText style={{flex:1, color:'#C0D838', fontSize:10}}>{GLOB.selectedItems.length} pièce(s) séléctionnée(s)</XText>
                        </View>
                        <View style={{flex:1}}>
                          <View style={{flex:1, flexDirection:'row', height: 20, justifyContent:'flex-end'}}>
                            <ImageButton  source={{uri:"validate_green"}} 
                              Pstyle={{flex:0, flexDirection:'column', alignItems:'center', justifyContent:'center', width:35}}
                              Istyle={{flex:0, width:17, height:17}}
                              onPress={()=>{this.selectAllItem()}} />
                            <ImageButton  source={{uri:"no_selection"}} 
                              Pstyle={{flex:0, flexDirection:'column', alignItems:'center', justifyContent:'center', width:35}}
                              Istyle={{flex:0, width:17, height:17}}
                              onPress={()=>{this.unselectAllItem()}} />
                            <ImageButton  source={{uri:"delete_green"}} 
                              Pstyle={{flex:0, flexDirection:'column', alignItems:'center', justifyContent:'center', width:35}}
                              Istyle={{flex:0, width:17, height:17}}
                              onPress={()=>{ Notice.remove('selection_items_notification', true) }} />
                          </View>
                          <View style={{flex:1, flexDirection:'row', height: 35, justifyContent:'flex-end',  marginTop:7}}>
                            <SimpleButton LImage={{uri:"edition"}} 
                              Pstyle={{flex:0, alignItems:'center', justifyContent:'center', backgroundColor:'#C0D838', width:125, height: 35, borderRadius: 2}}
                              Tstyle={{fontSize: 8}}
                              title = 'Modification analytiques'
                              onPress={()=>{this.openComptaAnalysis()}} />
                          </View>
                        </View>
                      </View>
    Notice.info(mess_obj, { permanent: true, name: "selection_items_notification", noClose: true })

    if(GLOB.selectedItems.length == 0)
      GLOB.press_action = 'zoom'
  }

  render() {
      return (
        <Screen style={{flex: 1, flexDirection: 'column'}}
                navigation={GLOB.navigation}>
          <Header />
          <TabNav />
          { this.state.analysisOpen && <ModalComptaAnalysis currentScreen='publishing' withCancel={true} resetOnOpen={true} hide={(data)=>this.closeComptaAnalysis(data)} pieces={GLOB.selectedItems} /> }
        </Screen>
      );
    }
}

export default PublishScreen;
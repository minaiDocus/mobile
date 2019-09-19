import React, { Component } from 'react'
import {StyleSheet,View,ScrollView,TouchableOpacity} from 'react-native'
import { NavigationActions } from 'react-navigation'
import { EventRegister } from 'react-native-event-listeners'
import ScrollableTabView from 'react-native-scrollable-tab-view'

import { XModal,Navigator,XImage,XText,PDFView,SimpleButton,ImageButton,BoxList,LineList,Pagination,TabNav,Swiper,AnimatedBox } from '../../components'

import { ModalComptaAnalysis } from '../modals/compta_analytics'

import { DocumentsFetcher, FileUploader } from "../../requests"

let GLOB = { Pack:{}, pagesPublished:[], pagesPublishing:[], idZoom:"", dataFilter: {}, selectedItems:[], press_action: 'zoom', currPiecePagePublished: 1, currPiecePagePublishing: 1, currPieceTab: 0 }

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

class SwiperPdf extends Component{
  constructor(props){
    super(props)

    this.nextElement = this.nextElement.bind(this)
    this.prevElement = this.prevElement.bind(this)
    this.selectElement = this.selectElement.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }

  nextElement(){
    GLOB.idZoom = GLOB.idZoom + 1 
    if(typeof(this.props.datas[GLOB.idZoom]) === 'undefined')
      GLOB.idZoom = GLOB.idZoom - 1
    else
      this.refs.main_swiper.changePage(GLOB.idZoom)
  }

  prevElement(){
    GLOB.idZoom = GLOB.idZoom - 1 
    if(typeof(this.props.datas[GLOB.idZoom]) === 'undefined')
      GLOB.idZoom = GLOB.idZoom + 1
    else
      this.refs.main_swiper.changePage(GLOB.idZoom)
  }

  selectElement(){
    if(isPresent(GLOB.idZoom) && typeof(this.props.datas[GLOB.idZoom]) !== 'undefined' && isPresent(this.props.datas[GLOB.idZoom].actionOnSelect))
      EventRegister.emit(`select_element_${this.props.datas[GLOB.idZoom].id}`, 'toggle')
  }

  closeModal(){
    this.refs.main_modal.closeModal(()=>this.props.hide())
  }

  renderElement(){
    return this.props.datas.map((e, i)=>{
      return <BoxZoom  key={i}
                       index={i}
                       counts={this.props.datas.length}
                       hide={()=> { this.closeModal() }}
                       nextElement={this.nextElement}
                       prevElement={this.prevElement}
                       selectElement={(isPresent(e.actionOnSelect))? this.selectElement : false} 
                       data={e} />
    })
  }

  render(){
    return  <XModal ref='main_modal'
                    transparent={true}
                    animationType="UpSlide"
                    visible={true}
                    onRequestClose={()=>{ this.closeModal() }}
            >
              <Swiper ref='main_swiper' style={{flex: 1}} index={GLOB.idZoom || 0} onIndexChanged={(index)=>{ GLOB.idZoom = index }}>
                { this.renderElement() }
              </Swiper>
            </XModal>
  }
}

class BoxZoom extends Component{
  constructor(props){
    super(props)

    exist = GLOB.selectedItems.find(elem => { return elem == this.props.data.id })

    this.src = null
    this.state = { nb_pages: 0, current_page: 1, is_selected: exist? true : false }

    this.generateStyles()
  }

  nextElement(){
    this.props.nextElement()
  }

  prevElement(){
    this.props.prevElement()
  }

  handleSelection(){
    this.props.selectElement()
    this.setState({ is_selected: !this.state.is_selected })
  }

  indicator(){
    return  <View style={{flex:0, width:'100%', height:'100%', backgroundColor:'#FFF', alignItems:'center', justifyContent:'center'}}>
              <XImage loader={true} width={40} height={40} style={{marginTop:10}} />
            </View>
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      boxZoom:{
                flex:1,
                flexDirection:'column',
                justifyContent:'flex-end',
                backgroundColor: Theme.modal.shape.backgroundColor || '#fff'
              },
      head: {
              flex:0,
              flexDirection:'row',
              alignItems: 'center',
              borderBottomWidth:2,
              borderColor:'#DFE0DF',
              height: 30,
              paddingHorizontal:"2%",
              width: '100%',
            },
      foot: { 
              flex:0,
              flexDirection:'row',
              alignItems:'center',
              justifyContent:'center',
              padding:"1%",
            },
      body: {
              flex:1,
              marginHorizontal:"3%",
              marginVertical:"2%",
              overflow: 'hidden',
              backgroundColor: '#000',
              borderColor:'#000',
              borderWidth:2
            },
      text: {
              flex:0,
              textAlign:'center',
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
                width: 30,
                height: 20,
                marginHorizontal:10,
              }
    })
  }

  render(){
    if(!this.src)
      this.src = DocumentsFetcher.renderDocumentUri(this.props.data.large, this.props.data.force_temp_doc)

    const selection_img = this.state.is_selected ? 'ban' : 'check'

    let stamp_img = getImgStampOf(this.props.data.state)

    let piece_number = GLOB.idZoom + 1
    let style_number = {backgroundColor:'#BEBEBD'}

    if(isPresent(this.props.data.position)) {
      piece_number = formatNumber(this.props.data.position)
      style_number = {backgroundColor:'#F89406'}
    }

    return  <View style={this.styles.boxZoom}>
              <View style={[this.styles.head, Theme.modal.head]}>
                <SimpleButton CStyle={[{flex:0, width: 50, height: 20}, Theme.primary_button.shape]} TStyle={Theme.primary_button.text} onPress={()=>this.props.hide()} title="Retour" />
                {
                  this.props.selectElement &&
                  <ImageButton  source={{icon:selection_img}} 
                                IOptions={{color: Theme.primary_button.shape.backgroundColor}}
                                CStyle={{flex:0, flexDirection:'column', alignItems:'center', justifyContent:'center', width:45, backgroundColor: 'transparent', marginHorizontal: 5}}
                                IStyle={{flex:0, width:18, height:18}}
                                onPress={()=>{this.handleSelection()}} />
                }
                <View style={this.styles.control} >
                  {
                    this.props.index > 0 && <SimpleButton TStyle={Theme.secondary_button.text} CStyle={[this.styles.btnNav, Theme.secondary_button.shape, {marginLeft:0}]} onPress={()=>this.prevElement()} title="<-" />
                  }
                  <XText style={[this.styles.piece_number, style_number]}>{piece_number}</XText>
                  {
                    this.props.index < (this.props.counts - 1) && <SimpleButton TStyle={Theme.secondary_button.text} CStyle={[this.styles.btnNav, Theme.secondary_button.shape, {marginRight:0}]} onPress={()=>this.nextElement()} title="->" />
                  }
                </View>
              </View>
              <View style={this.styles.body}>
                <PDFView
                  source={this.src}
                  onLoadComplete={(pageCount, filePath)=>{
                    this.setState({nb_pages: pageCount})
                  }}
                  onPageChanged={(page,pageCount)=>{
                    this.setState({current_page: page})
                  }}
                  onError={(error)=>{
                    if(! (/Canceled/i.test(error.toString())) )
                      Notice.alert("Erreur loading pdf", error.toString())
                  }} />
              </View>
              <View style={[this.styles.foot, Theme.modal.foot]}>
                <XText style={[this.styles.text, this.styles.textFoot, {textAlign:'left'}]}>{this.state.current_page}</XText>
                { stamp_img != 'none' && <XImage source={{uri:stamp_img}} style={this.styles.stamp} /> }
                <XText style={[this.styles.text, this.styles.textFoot, {textAlign:'right'}]}>{this.state.nb_pages} page(s)</XText>
              </View>
            </View>
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
                      flexDirection:'row',
                      alignItems:'center',
                      justifyContent:'center',
                    },
        text: {
                fontSize:18,
                fontWeight:"bold"
              },
      })
  }

  render(){
    return  <View style={[this.styles.minicontainer, Theme.head.shape]}>
              <XText style={[this.styles.text, Theme.head.text]}>{GLOB.Pack.name || "test"}</XText>
            </View>
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
                    {label: "Nom du lot :", value: GLOB.Pack.name},
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

    let src = {uri: "logo"}
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
              <XImage type='container' CStyle={[this.styles.styleContainer, styleSelected]} CldStyle={{justifyContent:'flex-start'}} style={this.styles.styleImg} source={src} local={local} >
                { stamp_img != 'none' && <XImage type='container' source={{uri:stamp_img}} CStyle={this.styles.stamp} style={this.styles.stamp_img}/> }
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
  }

  async toggleZoom(){
    await this.setState({zoomActive: !this.state.zoomActive})
  }

  render(){
    return <ScrollView style={{flex:0, padding:3}}>
              {this.state.zoomActive && <SwiperPdf  hide={this.toggleZoom} 
                                                    datas={this.props.datas}
                                        />
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

class CustomTabNav extends Component{
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
  }

  componentDidMount(){
    let renew = true
    if(GLOB.currPiecePagePublished > 1 || GLOB.currPiecePagePublishing > 1){
      this.pagePublished = GLOB.currPiecePagePublished
      this.pagePublishing = GLOB.currPiecePagePublishing
      renew = false
    }

    this.refreshDocsPublished(renew, true)
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
      this.pagePublished = 1

    GLOB.currPiecePagePublished = this.pagePublished
    this.setState({published_ready: false})
    const pack_id = GLOB.Pack.pack_id || GLOB.Pack.id
    DocumentsFetcher.waitFor([`getDocumentsProcessed(${pack_id}, ${this.pagePublished}, ${JSON.stringify(GLOB.dataFilter)})`], responses => {
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
        this.refreshDocsPublishing(renew)
      }

      this.setState({published_ready: true})
    })
  }

  refreshDocsPublishing(renew = true){
    if(renew)
      this.pagePublishing = 1

    GLOB.currPiecePagePublishing = this.pagePublishing
    if(!isPresent(GLOB.dataFilter))
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

  render(){
    return  <TabNav headers={[{title: "Infos", icon:"information"}, {title: "En cours", icon:"doc_curr"}, {title: "Publiés", icon:"doc_trait"}]}
                    initialPage={GLOB.currPieceTab}
                    handleIndexChange={(ind)=>{GLOB.currPieceTab = ind}}>
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
            </TabNav>
  }
}

export class PiecesView extends Component{
  constructor(props){
    super(props)

    this.state = { analysisOpen: false }

    if(this.props.initView){
      GLOB.currPiecePagePublished = 1
      GLOB.currPiecePagePublishing = 1
      GLOB.currPieceTab = 0
    }

    this.handleSelection = this.handleSelection.bind(this)
    this.selectAllItem = this.selectAllItem.bind(this)
    this.unselectAllItem = this.unselectAllItem.bind(this)
    this.openComptaAnalysis = this.openComptaAnalysis.bind(this)

    const navigation = new Navigator(this.props.navigation)
    GLOB.Pack =  navigation.getParams('pack') || {}
    GLOB.dataFilter = navigation.getParams('filter') || {}

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
      FileUploader.waitFor([`setComptaAnalytics(${JSON.stringify(GLOB.selectedItems)}, ${JSON.stringify(data)})`], responses => {
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
                            <ImageButton  source={{icon:"check"}}
                              IOptions={{size: 17, color: '#FFF'}}
                              CStyle={{flex:0, flexDirection:'column', alignItems:'center', justifyContent:'center', width:35}}
                              IStyle={{flex:0, width:17, height:17}}
                              onPress={()=>{this.selectAllItem()}} />
                            <ImageButton  source={{icon:"ban"}}
                              IOptions={{size: 17, color: '#FFF'}}
                              CStyle={{flex:0, flexDirection:'column', alignItems:'center', justifyContent:'center', width:35}}
                              IStyle={{flex:0, width:17, height:17}}
                              onPress={()=>{this.unselectAllItem()}} />
                            <ImageButton  source={{icon:"close"}}
                              IOptions={{size: 17, color: '#FFF'}}
                              CStyle={{flex:0, flexDirection:'column', alignItems:'center', justifyContent:'center', width:35}}
                              IStyle={{flex:0, width:17, height:17}}
                              onPress={()=>{ Notice.remove('selection_items_notification', true) }} />
                          </View>
                          <View style={{flex:1, flexDirection:'row', height: 35, justifyContent:'flex-end',  marginTop:7}}>
                            <SimpleButton LImage={{icon: "edit"}}
                              IOptions={{size: 16}} 
                              CStyle={{flex:0, alignItems:'center', justifyContent:'center', backgroundColor:'#C0D838', width:125, height: 35, borderRadius: 2}}
                              TStyle={{fontSize: 8}}
                              title = 'Modification analytiques'
                              onPress={()=>{this.openComptaAnalysis()}} />
                          </View>
                        </View>
                      </View>
    Notice.info(mess_obj, { permanent: true, name: "selection_items_notification", noClose: true })

    if(GLOB.selectedItems.length == 0)
      GLOB.press_action = 'zoom'
  }

  render(){
    return  <View style={{flex: 1, display: this.props.display}}>
              <Header />
              <CustomTabNav />
              { this.state.analysisOpen && <ModalComptaAnalysis currentScreen='publishing' withCancel={true} resetOnOpen={true} hide={(data)=>this.closeComptaAnalysis(data)} pieces={GLOB.selectedItems} /> }
            </View>
  }
}
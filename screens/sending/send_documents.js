import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity, Platform, ImageStore, Image, Button } from 'react-native'
import CameraRoll from '@react-native-community/cameraroll'
import base64 from 'base-64'
import ImagePicker from 'react-native-image-crop-picker'
import RNFS from 'rn-fetch-blob'
import { NavigationActions } from 'react-navigation'
import { EventRegister } from 'react-native-event-listeners'

import { XModal,XScrollView,Cropper,CropperView,Navigator,XImage,XText,SimpleButton,BoxButton,ImageButton,Swiper,BoxList,ProgressUpload } from '../../components'

import { Screen } from '../layout'

import { Document } from '../../models'

import { UsersFetcher } from "../../requests"

let GLOB = { documents:[], imgToDel:"", idZoom:"" }

class BoxZoom extends Component{
  constructor(props){
    super(props)

    this.state = {ready: false}
    this.imageCounter = this.props.datas.length
    this.currIndex = 0

    this.renderSwiper = this.renderSwiper.bind(this)

    this.generateStyles()
  }

  componentDidMount(){
    setTimeout(()=>{this.setState({ready: true})}, 2000)
  }

  onSwipe(index){
    this.currIndex = index
    GLOB.idZoom = this.props.datas[index].id_64
  }

  hideModal(){
    this.refs.main_modal.closeModal(()=>this.props.hide())
  }

  deleteElement(){
    const call = ()=>{
                      GLOB.imgToDel = GLOB.idZoom
                      this.hideModal()
                      setTimeout(()=>{this.props.deleteElement()}, 1000)
                     }
    actionLocker(call)
  }

  cropElement(){
    this.hideModal()
    setTimeout(()=>{this.props.cropElement(this.currIndex)}, 1000)
  }

  generateStyles(){
    this.swiperStyle = StyleSheet.create({
      boxImage: {
                  flex:1,
                  backgroundColor:'#fff',
                  borderColor:'#fff',
                  borderLeftWidth:2,
                  borderRightWidth:2,
                  marginHorizontal:0
                },
      textInfo: {
                  position: 'absolute',
                  flex:1,
                  left:0,
                  right:0,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: '#EC5656',
                  backgroundColor:'rgba(0,0,0,0.8)'
                }
    })

    this.styles = StyleSheet.create({
        boxZoom:{
                  flex:1,
                  padding:"5%",
                  backgroundColor:'rgba(0,0,0,0.8)',
                  flexDirection:'column',
                },
        boxSwiper:{
                    flex:1,
                    marginBottom:15,
                    borderColor:'#fff',
                    borderWidth:2,
                    overflow: 'hidden'
                  },
        loader: {
                  backgroundColor:'#fff',
                  position:'absolute',
                  flex:1,
                  top:0,
                  bottom:0,
                  left:0,
                  right:0,
                  alignItems:'center',
                  justifyContent:'center'
                }
    })
  }

  renderSwiper(){
    var indexStart = 0

    var embedContent = this.props.datas.map((img, key)=>
      {
        const doc = Document.getById(img.id_64)
        let message = ''
        if(doc)
          message = doc.error || ''
        if(img.id_64 == GLOB.idZoom.toString()){ indexStart = this.currIndex = key; }
        return  <View key={key} style={{flex:1}}>
                  <XImage type='container'
                          CStyle={this.swiperStyle.boxImage}
                          style={{flex:1}}
                          source={{uri: img.path.toString()}}
                          local={false}
                  />
                  { message != '' && <XText style={this.swiperStyle.textInfo}>{message}</XText> }
                </View>
      })

    return <Swiper  style={{flex:1}} 
                    index={indexStart} 
                    onIndexChanged={(index)=>{this.onSwipe(index)}}
                    count={this.props.datas.length}>
            {embedContent}
           </Swiper>
  }

  render(){
    return  <XModal ref='main_modal'
                    transparent={true}
                    animationType="UpSlide"
                    visible={true}
                    onRequestClose={()=>{ this.hideModal() }}
            >
              <View style={this.styles.boxZoom}>
                <View style={this.styles.boxSwiper}>
                  {this.state.ready && this.renderSwiper()}
                  {
                    !this.state.ready && <View style={this.styles.loader}>
                                          <XImage loader={true} />
                                         </View>
                  }
                </View>
                { this.state.ready &&
                  <View style={{flex:0,flexDirection:'row'}}>
                    <SimpleButton CStyle={[{flex:1, marginHorizontal:3}, Theme.primary_button.shape]} TStyle={Theme.primary_button.text} onPress={()=>this.hideModal()} title="Retour" />
                    <SimpleButton CStyle={[{flex:1, marginHorizontal:3}, Theme.primary_button.shape]} TStyle={Theme.primary_button.text} onPress={()=>this.cropElement()} title="Recadrer" />
                    <SimpleButton CStyle={[{flex:1, marginHorizontal:3}, Theme.primary_button.shape]} TStyle={Theme.primary_button.text} onPress={()=>this.deleteElement()} title="Enlever" />
                  </View>
                }
              </View>
            </XModal>
  }
}

class ImgBox extends Component{
  constructor(props){
    super (props)
    this.state = {options: false}

    this.element = this.props.element
    this.selectedElements = []

    this.selectionListener = null
    this.selectItem = this.selectItem.bind(this)

    this.generateStyles()
  }

  UNSAFE_componentWillMount(){
    this.selectionListener = EventRegister.on('select_elements', (event)=>{
      if(isPresent(event.id) && event.id == this.element.id_64)
        this.selectItem(event.type)
    })
  }

  componentWillUnmount(){
    EventRegister.rm(this.selectionListener)
    this.selectionListener = null
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    if(this.element.id_64 != nextProps.element.id_64){
      this.selectItem('out')
      this.element = nextProps.element
    }
  }

  selectItem(type='in'){
    this.setState({options: (type == 'in')? true : false})
    this.props.selection(type)
  }

  toggleOpt(){
    this.selectItem((this.state.options)? 'out' : 'in')
  }

  delete(){
    GLOB.imgToDel = this.element.id_64
    this.props.deleteElement()
    this.selectItem('out')
  }

  zoom(){
    GLOB.idZoom = this.element.id_64
    this.props.toggleZoom()
  }

  crop(){
    this.selectItem('out')
    this.props.cropElement(this.props.index)
  }

  generateStyles(){
    const imgWidth = 120 - 20
    const imgHeight = 113 - 20

    this.styles = StyleSheet.create({
        styleTouch: {
                      flex:0,
                      marginVertical:5,
                      alignItems:'center',
                      width:imgWidth + 7
                    },
        styleImg: {
                    flex:0,
                    width:imgWidth,
                    height:imgHeight,
                  },
        styleContainer:{
                          backgroundColor:'#fff',
                          borderRadius:5,
                          width: imgWidth + 4,
                          height: imgHeight + 4,
                          justifyContent:'center',
                          alignItems:'center',
                        },
        btnText:  {
                    flex:1,
                    backgroundColor:'rgba(255,255,255,0.8)',
                    padding:2,
                    justifyContent:'center',
                    alignItems:'center',
                    borderColor:'#3E2F24'
                  },
        options:{
                  flex:0,
                  flexDirection:'row',
                  height:'30%',
                  width:'100%'
                },
        textInfo: {
                    flex:1,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#EC5656',
                    backgroundColor:'rgba(0,0,0,0.8)'
                  }
      })
  }

  render(){
    const doc = Document.getById(this.element.id_64)
    let message = ''
    if(doc)
      message = doc.error || ''

    let selectedStyle = {}
    if(this.state.options)
      selectedStyle = { borderColor: '#C9DD03', borderWidth: 2 }

    return  <TouchableOpacity style={this.styles.styleTouch} onPress={()=>this.toggleOpt()} onLongPress={()=>this.zoom()}>
                <XImage type='container' CStyle={[this.styles.styleContainer, selectedStyle]} source={{uri:this.element.path.toString()}} style={this.styles.styleImg} local={false}>
                  {
                    this.state.options == false && isPresent(message) &&
                    <View style={this.styles.options}>
                      <XText style={this.styles.textInfo} numberOfLines={2}>{message}</XText>
                    </View>
                  }
                  { this.state.options == true &&
                    <View style={this.styles.options}>
                      <ImageButton source={{uri:'zoom_x'}} onPress={()=>{this.zoom(); this.toggleOpt();}} CStyle={[this.styles.btnText]} IStyle={{width:18,height:18}} />
                      <ImageButton source={{icon:'crop'}} IOptions={{size: 18}} onPress={()=>{this.crop(); this.toggleOpt();}} CStyle={[{borderLeftWidth:1, borderRightWidth: 1}, this.styles.btnText]} IStyle={{width:18,height:18}} />
                      <ImageButton source={{icon:'trash'}} IOptions={{size: 18}} onPress={()=>this.delete()} CStyle={[this.styles.btnText]} IStyle={{width:18,height:18}} />
                    </View>
                  }
                </XImage>
            </TouchableOpacity>       
  }
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
                                    flexDirection:'row',
                                    alignItems:'center',
                                    justifyContent:'center',
                                  },
                  }
  }

  render(){
    return  <View style={[this.styles.minicontainer, Theme.head.shape, this.ORstyle[this.props.orientation].body]}>
                <BoxButton onPress={this.props.takePicture} source={{icon:"camera-retro"}} IOptions={{size: 20}} title="Prendre photo" />
                <BoxButton onPress={this.props.openRoll} source={{icon:"picture-o"}} IOptions={{size: 20}} title="Galerie photos" />
            </View>
  }
}

class SendScreen extends Component {
  constructor(props){
    super(props)

    this.state = { orientation: 'portrait', ready: false, dataList: [], zoomActive: false }

    this.ORstyle = []
    this.ORstyle["landscape"] = {
                                  body: { flexDirection: 'row' }
                                }
    this.ORstyle["portrait"] =  {
                                  body: { flexDirection: 'column' }
                                }

    this.renderImg = this.renderImg.bind(this)
    this.renderError = this.renderError.bind(this)
    this.deleteElement = this.deleteElement.bind(this)
    this.deleteMultiElements = this.deleteMultiElements.bind(this)
    this.toggleZoom = this.toggleZoom.bind(this)
    this.handleSelection = this.handleSelection.bind(this)
    this.selectAllItem   = this.selectAllItem.bind(this)
    this.unselectAllItem   = this.unselectAllItem.bind(this)
    this.saveFileToRoll = this.saveFileToRoll.bind(this)

    if(UploadingFiles)
    {
      Notice.info({title: "Transfert en cours ...", body: "Un transfert est en cours, Veuillez patienter avant de lancer un autre!!"})
    }

    this.generateStyles()
  }

  handleOrientation(orientation){
    this.setState({orientation: orientation}) // exemple use of Orientation changing
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    if(nextProps.navigation.state.params.resetSendScreen)
      this.resetScreen()
  }

  componentWillUnmount(){
    this.resetScreen()
  }

  componentDidMount(){
    this.resetScreen()
    Document.loadAll().then(docs => {
      GLOB.documents = docs
      this.setState({ready: true, dataList: GLOB.documents})
    })
  }
  
  resetScreen(){
    //clearing cache picture
    ImagePicker.clean().catch(e => {})
    Document.clearDocsFileCache()

    GLOB.documents = []
    GLOB.imgToDel = ""
    GLOB.idZoom = ""
    this.selectedItems = []
    this.setState({ dataList: GLOB.documents, zoomActive: false })
  }

  selectAllItem(){
    GLOB.documents.forEach(doc=>{
      EventRegister.emit('select_elements', { id: doc.id_64, type: 'in'})
    })
  }

  unselectAllItem(){
    GLOB.documents.forEach(doc=>{
      EventRegister.emit('select_elements', { id: doc.id_64, type: 'out'})
    })
  }

  handleSelection(state, id_64){
    if(state == 'in' && !this.selectedItems.find(e=>{ return e == id_64 }))
      this.selectedItems.push(id_64)
    else if(state == 'out' && this.selectedItems.find(e=>{ return e == id_64 }))
      this.selectedItems = this.selectedItems.filter(e=>{ return e != id_64 })

    const removeSelection = ()=>{
      setTimeout(()=>{
        this.deleteMultiElements()
      }, 1000)

      Notice.remove('selection_items', true)
    }

    const mess_obj =  <View style={{flex:1, flexDirection:'row'}}>
                        <View style={{ flex:1, paddingHorizontal: 10}}>
                          <XText style={{flex:0, height: 25, color:'#FFF', fontWeight:"bold"}}>Séléctions</XText>
                          <XText style={{flex:1, color:'#C0D838', fontSize:10}}>{this.selectedItems.length} image(s) séléctionnée(s)</XText>
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
                              onPress={()=>{ Notice.remove('selection_items', true) }} />
                          </View>
                          <View style={{flex:1, flexDirection:'row', height: 35, justifyContent:'flex-end',  marginTop:7}}>
                            <SimpleButton LImage={{icon: "trash"}}
                              IOptions={{size: 16}} 
                              CStyle={{flex:0, alignItems:'center', justifyContent:'center', backgroundColor:'#C0D838', width:125, height: 35, borderRadius: 2}}
                              TStyle={{fontSize: 8}}
                              title = 'Enlever'
                              onPress={()=>{removeSelection()}} />
                          </View>
                        </View>
                      </View>

    if(this.selectedItems.length > 0)
      Notice.info(mess_obj, { permanent: true, name: "selection_items", noClose: true })
    else
      Notice.remove('selection_items', true)
  }

  openCamera(){
    const call = ()=>{
                        ImagePicker.openCamera({
                          cropping: false,
                        }).then(image => {
                          let timeout_reached = true

                          this.saveFileToRoll(image).then(img => {
                            if(timeout_reached){ timeout_reached=false; this.renderImg([img]) }
                          }).catch(error=>{
                            if(timeout_reached){ timeout_reached=false; this.renderImg([image]) }
                          })

                          //create a timeout function if saveFileToRoll never resolve
                          setTimeout(()=>{
                            if(timeout_reached){
                              timeout_reached = false
                              this.renderImg([image])
                              this.setState({ ready: true })
                            }
                          }, 5000)
                        }).catch(error => {
                          this.renderError(error)
                        })
                      }
    actionLocker(call)
  }

  openRoll(){
    const call = ()=>{
                        ImagePicker.openPicker({
                          multiple: true,
                          mediaType: 'photo',
                          maxFiles : 10 //For iOS only
                        }).then(images => {
                          this.renderImg(images)
                        }).catch(error => {
                          this.renderError(error)
                        })
                      }
    actionLocker(call)
  }

  openCrop(index){
    const call = ()=>{
                        let _img = GLOB.documents[index]
                        Cropper.openCrop({
                          img: _img,
                          preview: false
                        }).then(image=>{
                          this.renderImg([image], index)
                        }).catch(e=>{})
                      }
    actionLocker(call)
  }

  async renderImg(_img, index=null, launch_crop=false){
    let img = []

    _img.forEach((i)=>{
        if(isPresent(i.filename))
          id_64 = base64.encode(i.filename).toString()
        else
          id_64 = base64.encode(i.path).toString()
        
        Object.assign(i, {id_64: id_64.toString()}, i)
        img.push(i)
    })

    if(index != null)
    {
      const idToDel = [GLOB.documents[index].id_64]
      setTimeout(()=>{ Document.delDocs(idToDel) }, 100)

      GLOB.documents[index] = img[0]
      Document.addDocs(img)
    }
    else
    {
      let imgToAdd = [].concat(img)
      let toAdd = true;
      let listAdd = [];

      imgToAdd.map((j)=>
      {
        toAdd = true;
        GLOB.documents.map((i)=>
        {
          if(i.id_64 == j.id_64)
          {
            toAdd = false;
          }
        });

        if(toAdd==true){ listAdd = listAdd.concat(j) }
      });

      Document.addDocs(listAdd)
      GLOB.documents = GLOB.documents.concat(listAdd)
      index = GLOB.documents.length - 1
    }

    await this.setState({dataList: GLOB.documents})

    if(launch_crop)
      setTimeout(()=>this.openCrop(index), 200)
  }

  async saveFileToRoll(image){
    return new Promise(async (resolve, reject) => {
      await this.setState({ ready: false })

      const getChecksum = async (path) => {
        return await RNFS.fs.hash(path.replace('file://', ''), "md5").catch(e=>{})
      }

      const getFileInfo = (path) => {
        const splited_path = path.split('/')

        let filename  = splited_path[splited_path.length-1]
        let dirname   = path.replace(filename, '')
        let extension = filename.split('.')[1]

        return { filename: filename, dirname: dirname, extension: extension }
      }

      const finish = async (img) => {
        await this.setState({ ready: true })
        resolve(img)
      }

      CameraRoll.getPhotos(
      {
        first: 5,
        assetType: 'Photos'
      }).then(async (r) => {
        try{
          const contentChecksum = await getChecksum(image.path)
          let final_path        = image.path
          let img_to_del        = false
          let found             = false

          const check_pictures = new Promise((success, error) => {
            const pictures = r.edges
            let resolve = false
            let count = pictures.length

            if(pictures.length > 0){
              pictures.forEach(async(p) => {
                let img_path = p.node.image.uri
                const tempChecksum = await getChecksum(img_path)

                if(img_path == image.path)
                {
                  final_path = image.path
                  img_to_del = false
                  found = true
                }
                else if(isPresent(contentChecksum) && isPresent(tempChecksum) && tempChecksum == contentChecksum)
                {
                  final_path = img_path
                  img_to_del = true
                  found = true
                }

                count--
                if((count <= 0 || found) && !resolve){
                  resolve = true
                  success(found)
                }
              })
            }else{
              success(found)
            }
          })

          check_pictures.then(async(f) => {
            if(!found)
            {
              await CameraRoll.saveToCameraRoll(image.path, 'photo').catch(e=>{})
              const object = await CameraRoll.getPhotos({ first: 1, assetType: 'Photos' })
              let lastChecksum = null

              try{
                const obj_uri = object.edges[0].node.image.uri
                lastChecksum = await getChecksum(obj_uri)
              }catch(e){}

              if(isPresent(contentChecksum) && isPresent(lastChecksum) && lastChecksum == contentChecksum)
              {
                final_path = obj_uri
                img_to_del = true
              }
              else
              {
                let picture_dir = RNFS.fs.dirs.DocumentDir
                if(Config.platform == 'android')
                  picture_dir = RNFS.fs.dirs.PictureDir

                const img_info = getFileInfo(image.path)
                const file_dest = `${picture_dir}/image-${contentChecksum.substr(0, 16)}.${img_info.extension}`
                await RNFS.fs.cp(image.path, file_dest)
                             .then(e => { final_path = `file://${file_dest}`; img_to_del = true; })
                             .catch(e=>{})
              }
            }

            RNFS.fs.exists(final_path)
                   .then(i => {
                      if(Config.platform == 'android'){
                        if(img_to_del){ RNFS.fs.unlink(image.path) }
                        image.path = final_path
                      }

                      finish(image)
                    })
                   .catch(e => { finish(image) })
          }).catch(e => { finish(image) })
        }catch(e){ finish(image) }
      }).catch((e) => { finish(image) })
    })
  }

  deleteMultiElements(){
    this.setState({ready: false})

    let next_elements = GLOB.documents.filter(doc => { return !this.selectedItems.includes(doc.id_64) })

    this.selectedItems.forEach(item => {
      setTimeout(()=>{ Document.delDocs([item]) }, 300)
    })

    this.selectedItems = []
    GLOB.documents = next_elements
    this.setState({dataList: next_elements, ready: true})
  }

  deleteElement(){
    this.setState({ready: false})

    let next_elements = GLOB.documents.filter(doc => { return GLOB.imgToDel.toString() != doc.id_64 })

    setTimeout(()=>{ Document.delDocs([GLOB.imgToDel.toString()]) }, 300)

    this.selectedItems = this.selectedItems.filter(e=>{ return e != GLOB.imgToDel.toString() })
    Notice.remove('selection_items', true)

    GLOB.documents = next_elements
    this.setState({dataList: next_elements, ready: true})
  }

  toggleZoom(){
    this.setState({zoomActive: !this.state.zoomActive})
  }

  renderError(err){
    if(err.toString() != "Error: User cancelled image selection")
      Notice.danger(err.toString())
  }

  sendList(){
    if(GLOB.documents.length > 0)
    {
      CurrentScreen.goTo('Sending', {images: GLOB.documents})
    }
    else
    {
      Notice.info({title: "Attention", body: "Aucun document à envoyer!!"})
    }
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      container:  {
                    flex: 1,
                    flexDirection: 'column',
                  },
      button: {
                flex:0,
                margin:3
              }
    })
  }

  renderOptions(){
    return <View style={{flex:1, minWidth:80, flexDirection:'row', minHeight:'100%'}}>
              <ProgressUpload />
           </View>
  }

  render() {
      return (
        <Screen style={[{flex:1}, Theme.body]}
                onChangeOrientation={(orientation)=>this.handleOrientation(orientation)}
                title='Envoi documents'
                name='Send'
                withMenu={true}
                options={ this.renderOptions() }
                navigation={this.props.navigation}>
          <View style={[{flex: 1}, this.ORstyle[this.state.orientation].body]}>
            <Header orientation={this.state.orientation} takePicture={()=>this.openCamera()} openRoll={()=>this.openRoll()} />
            <View style={{flex: 1}}>
              {
                this.state.zoomActive &&
                <BoxZoom  datas={this.state.dataList} 
                          cropElement={(index)=>this.openCrop(index)}
                          deleteElement={this.deleteElement} 
                          hide={this.toggleZoom} />
              }
              <XScrollView style={{flex:1, padding:3}} >
                <BoxList datas={this.state.dataList}
                         title={`${this.state.dataList.length} : Document(s)`}
                         waitingData={!this.state.ready}
                         elementWidth={130 - 20}
                         noItemText="Veuillez selectionner des photos de votre galerie d'images, ou prendre de nouvelles photos pour l'envoi ..."
                         renderItems={(img, index) => <ImgBox element={img} index={index} cropElement={(index)=>this.openCrop(index)} deleteElement={this.deleteElement} toggleZoom={this.toggleZoom} selection={(state)=>{ this.handleSelection(state, img.id_64) }}/> }
                         />
              </XScrollView>
              <View style={[{flex: 0}, Theme.head.shape, {padding: 1}]}>
                <SimpleButton CStyle={[this.styles.button, Theme.secondary_button.shape, {paddingVertical: 3}]} TStyle={Theme.secondary_button.text} onPress={()=>this.sendList()} title="Suivant >>" />
              </View>
            </View>
          </View>
          <CropperView />
        </Screen>
      );
  }
}

export default SendScreen;
import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity, Platform, ImageStore, ImageEditor, Image, Button, CameraRoll } from 'react-native'
import base64 from 'base-64'
import ImagePicker from 'react-native-image-crop-picker'
import RNFS from 'rn-fetch-blob'
import { NavigationActions } from 'react-navigation'

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
                      this.props.deleteElement()
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

    this.generateStyles()
  }

  componentWillReceiveProps(nextProps){
    this.element = nextProps.element
  }

  toggleOpt(){
    this.setState({options: !this.state.options})
  }

  delete(){
    GLOB.imgToDel = this.element.id_64
    this.props.deleteElement()
    this.toggleOpt()
  }

  zoom(){
    GLOB.idZoom = this.element.id_64
    this.props.toggleZoom()
  }

  crop(){
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
                          width: imgWidth + 3,
                          height: imgHeight + 3,
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
    return  <TouchableOpacity style={this.styles.styleTouch} onLongPress={()=>this.toggleOpt()} onPress={()=>this.zoom()}>
                <XImage type='container' CStyle={this.styles.styleContainer} source={{uri:this.element.path.toString()}} style={this.styles.styleImg} local={false}>
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
                      <ImageButton source={{icon:'close'}} IOptions={{size: 18}} onPress={()=>this.delete()} CStyle={[this.styles.btnText]} IStyle={{width:18,height:18}} />
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
    this.toggleZoom = this.toggleZoom.bind(this)
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

  componentWillReceiveProps(nextProps){
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
    this.setState({ dataList: GLOB.documents, zoomActive: false })
  }

  openCamera(){
    const call = ()=>{
                        ImagePicker.openCamera({
                          cropping: false,
                        }).then(image => {
                          this.saveFileToRoll(image).then(img => {
                            this.renderImg([img])
                          }).catch(error=>{
                            this.renderImg([image])
                          })
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
                        })
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
      Document.delDocs([GLOB.documents[index].id_64])
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

      const finish = async (image) => {
        await this.setState({ ready: true })
        resolve(image)
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
              const obj_uri = object.edges[0].node.image.uri

              const lastChecksum = await getChecksum(obj_uri)
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
                const file_dest = `${picture_dir}/idocus-${contentChecksum.substr(0, 16)}.${img_info.extension}`
                await RNFS.fs.cp(image.path, file_dest)
                             .then(e => { final_path = `file://${file_dest}`; img_to_del = true; })
                             .catch(e=>{})
              }
            }

            RNFS.fs.exists(final_path)
                   .then(i => {
                      if(img_to_del){ RNFS.fs.unlink(image.path) }
                      image.path = final_path

                      finish(image)
                    })
                   .catch(e => { finish(image) })
          })
        }catch(e){ finish(image) }
      })
    })
  }

  deleteElement(){
    let imgSave = [] 

    GLOB.documents.map((i)=>
    {
      if(i.id_64 != GLOB.imgToDel.toString())
      {
        imgSave = imgSave.concat(i)
      }
      else
      {
        Document.delDocs([i.id_64])
      }
    })

    GLOB.documents = imgSave
    this.setState({dataList: GLOB.documents})
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
                           renderItems={(img, index) => <ImgBox element={img} index={index} cropElement={(index)=>this.openCrop(index)} deleteElement={this.deleteElement} toggleZoom={this.toggleZoom}/> }
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
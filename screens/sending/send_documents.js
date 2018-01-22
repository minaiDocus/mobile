import React, { Component } from 'react'
import Config from '../../Config'
import base64 from 'base-64'
import Screen from '../../components/screen'
import Navigator from '../../components/navigator'
import {StyleSheet,Text,View,ScrollView,Modal,TouchableOpacity} from 'react-native'
import {XImage} from '../../components/XComponents'
import ImagePicker from 'react-native-image-crop-picker'
import { NavigationActions } from 'react-navigation'
import {SimpleButton, BoxButton, ImageButton} from '../../components/buttons'
import Swiper from '../../components/swiper'
import {BoxList} from '../../components/lists'
import {ProgressUpload} from '../../components/uploader'

import Cfetcher from '../../components/dataFetcher'
import request1 from "../../requests/data_loader"

let Fetcher = new Cfetcher(request1)
let GLOB = {images:[], imgToDel:"", idZoom:"", navigation:{}}

const styles = {
  minicontainer:{
                  flex:0, 
                  flexDirection:'row',
                  backgroundColor:'#E1E2DD',
                  alignItems:'center',
                  justifyContent:'center',
                },
}

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
    GLOB.idZoom = base64.encode(this.props.datas[index].path).toString();
  }

  hideModal(){
    this.props.hide()
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
    const path = base64.decode(GLOB.idZoom).toString()
    this.hideModal()
    setTimeout(()=>{this.props.cropElement(path, this.currIndex)}, 1000)
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
                }
    })

    this.styles = StyleSheet.create({
        boxZoom:{
                  flex:1,
                  padding:"10%",
                  backgroundColor:'rgba(0,0,0,0.8)',
                  flexDirection:'column',
                },
        boxSwiper:{
                    flex:1,
                    marginBottom:15,
                    borderColor:'#fff',
                    borderWidth:2
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
      if(base64.encode(img.path).toString() == GLOB.idZoom.toString()){ indexStart = this.currIndex = key; }
      return <XImage  key={key}
                      type='container'
                      PStyle={this.swiperStyle.boxImage}
                      style={{flex:1}}
                      source={{uri: img.path.toString()}} 
                      local={false}
              />
    })

    return <Swiper  style={{flex:1}} 
                    index={indexStart} 
                    onIndexChanged={(index)=>{this.onSwipe(index)}}
                    count={this.props.datas.length}>
            {embedContent}
           </Swiper>
  }

  render(){
    return  <Modal transparent={true}
                   animationType="slide" 
                   visible={true}
                   supportedOrientations={['portrait', 'landscape']}
                   onRequestClose={()=>{}}
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
                <View style={{flex:0,flexDirection:'row'}}>
                  <SimpleButton Pstyle={{flex:1, marginHorizontal:3}} onPress={()=>this.hideModal()} title="Retour" />
                  <SimpleButton Pstyle={{flex:1, marginHorizontal:3}} onPress={()=>this.cropElement()} title="Recadrer" />
                  <SimpleButton Pstyle={{flex:1, marginHorizontal:3}} onPress={()=>this.deleteElement()} title="Enlever" />
                </View>
              </View>
            </Modal>
  }
}

class ImgBox extends Component{
  constructor(props){
    super (props)
    this.state = {options: false}

    this.generateStyles()
  }

  toggleOpt(){
    this.setState({options: !this.state.options})
  }

  delete(){
    GLOB.imgToDel = base64.encode(this.props.source.uri).toString()
    this.props.deleteElement()
    this.toggleOpt()
  }

  zoom(){
    GLOB.idZoom = base64.encode(this.props.source.uri).toString()
    this.props.toggleZoom()
    this.toggleOpt()
  }

  crop(){
    this.props.cropElement(this.props.source.uri, this.props.index)
    this.toggleOpt() 
  }

  generateStyles(){
    this.styles = StyleSheet.create({
        styleTouch: {
                      flex:0,
                      marginVertical:5,
                      alignItems:'center',
                      width:127
                    },
        styleImg: {
                    flex:0,
                    width:120,
                    height:113,
                  },
        styleContainer:{
                          backgroundColor:'#fff',
                          borderRadius:5,
                          width:126,
                          height:119,
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
                }
      })
  }

  render(){
    return  <TouchableOpacity style={this.styles.styleTouch} onPress={()=>this.toggleOpt()}>
                <XImage type='container' PStyle={this.styles.styleContainer} source={this.props.source} style={this.styles.styleImg} local={false}>
                  { this.state.options == true &&
                    <View style={this.styles.options}>   
                      <ImageButton source={{uri:'zoom_x'}} onPress={()=>{this.zoom()}} Pstyle={[this.styles.btnText]} Istyle={{width:20,height:20}} />
                      <ImageButton source={{uri:'img_crop'}} onPress={()=>this.crop()} Pstyle={[{borderLeftWidth:1, borderRightWidth: 1}, this.styles.btnText]} Istyle={{width:20,height:20}} />
                      <ImageButton source={{uri:'delete'}} onPress={()=>this.delete()} Pstyle={[this.styles.btnText]} Istyle={{width:20,height:20}} />
                    </View>
                  }
                </XImage>
            </TouchableOpacity>
  }
}

class Header extends Component{
  render(){
    return  <View style={styles.minicontainer}>
                <BoxButton onPress={this.props.takePhoto} source={{uri:"camera_icon"}} title="Prendre photo" />
                <BoxButton onPress={this.props.openRoll} source={{uri:"folder"}} title="Galerie photos" />
            </View>
  }
}

class SendScreen extends Component {
  static navigationOptions = {headerTitle: 'Envoi documents', headerRight: <ProgressUpload />}

  constructor(props){
    super(props)
    GLOB.images = []
    GLOB.imgToDel = ""
    GLOB.idZoom = ""
    GLOB.navigation = new Navigator(this.props.navigation)
    this.state = { dataList: [], zoomActive: false}

    this.renderImg = this.renderImg.bind(this)
    this.renderError = this.renderError.bind(this)
    this.deleteElement = this.deleteElement.bind(this)
    this.toggleZoom = this.toggleZoom.bind(this)

    if(UploadingFiles)
    {
      Notice.info({title: "Transfert en cours ...", body: "Un transfert est en cours, Veuillez patienter avant de lancer un autre!!"})
    }

    this.generateStyles()
  }

  componentWillMount(){
    Fetcher.wait_for(
      ['refreshCustomers()'],
      (responses)=>{
        responses.map(r=>{if(r!=true)Notice.danger(r, true, r)})
    })
  }
  
  openCamera(){
    const call = ()=>{
                        ImagePicker.openCamera({
                          width: 300,
                          height: 400,
                          cropping: true
                        })
                        .then(image => {
                          this.renderImg(image);
                        })
                        .catch(error => {
                          this.renderError(error);
                        });
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
                          this.renderImg(images);
                        }).catch(error => {
                          this.renderError(error);
                        });
                      }
    actionLocker(call)
  }

  openCrop(img, index){
    const call = ()=>{
                        ImagePicker.openCropper({
                          path: img,
                          width: 300,
                          height: 400
                        }).then(image => {
                          this.renderImg(image, index)
                        }).catch(error => {
                          this.renderError(error)
                        });
                      }
    actionLocker(call)
  }

  async renderImg(img, index=null){
    if(index != null)
    {
      GLOB.images[index] = img
      await this.setState({dataList: GLOB.images});
    }
    else
    {
      var imgToAdd = [].concat(img);
      var toAdd = true;
      var listAdd = [];

      imgToAdd.map((j)=>
      {
        toAdd = true;
        GLOB.images.map((i)=>
        {
          if(base64.encode(i.path).toString() == base64.encode(j.path).toString())
          {
            toAdd = false;
          }
        });

        if(toAdd==true){ listAdd = listAdd.concat(j); }
      });

      GLOB.images = GLOB.images.concat(listAdd);
      await this.setState({dataList: GLOB.images});
    }
  }

  async deleteElement(){
    var imgSave = []; 
    GLOB.images.map((i)=>
    {
      if(base64.encode(i.path).toString() != GLOB.imgToDel.toString())
      {
        imgSave = imgSave.concat(i);
      }
    });

    GLOB.images = imgSave;
    await this.setState({dataList: GLOB.images})
  }

  toggleZoom(){
    this.setState({zoomActive: !this.state.zoomActive})
  }

  renderError(err){
    if(err.toString() != "Error: User cancelled image selection")
      Notice.danger(err.toString())
  }

  sendList(){
    if(GLOB.images.length > 0)
    {
      GLOB.navigation.goTo('Sending', {images: GLOB.images});
    }
    else
    {
      Notice.info({title: "Attention", body: "Aucun document à envoyer!!"});
    }
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      container:  {
                    flex: 1,
                    flexDirection: 'column',
                  },
      boxPicture:{
                    flex:1,
                    borderRadius:10,
                    
                    elevation: 7, //Android shadow

                    shadowColor: '#000',                  //===
                    shadowOffset: {width: 0, height: 2},  //=== iOs shadow    
                    shadowOpacity: 0.8,                   //===
                    shadowRadius: 2,                      //===

                    backgroundColor:"#E9E9E7",
                    margin:10,
                    padding:5
                  },
      button: {
                flex:1,
                margin:10
              }
    })
  }

  render() {
      if(GLOB.images.length > 0)
      {
        var embedContent =  <ScrollView style={{flex:1, padding:3}}>
                                <Text style={{flex:0,textAlign:'center',fontSize:16,fontWeight:'bold'}}>{GLOB.images.length} : Document(s)</Text>
                                <BoxList datas={this.state.dataList}
                                         elementWidth={130} 
                                         renderItems={(img, index) => <ImgBox index={index} source={{uri: img.path.toString()}} cropElement={(path, index)=>this.openCrop(path, index)} deleteElement={this.deleteElement} toggleZoom={this.toggleZoom}/> } />
                            </ScrollView>
      }
      else
      {
        var embedContent =  <View style={{flex:1, elevation:0}}>{/*For fixing bug Android elevation notification*/}
                              <View style={this.styles.boxPicture}>
                                <Text style={{padding:10}}>Veuillez selectionner des photos de votre galerie d'images, ou prendre de nouvelles photos pour l'envoi ...</Text>
                              </View>
                            </View>

      }
      return (
        <Screen style={this.styles.container}
                navigation={GLOB.navigation}>
          <Header takePhoto={()=>this.openCamera()} openRoll={()=>this.openRoll()} />
          {this.state.zoomActive && <BoxZoom  datas={this.state.dataList} 
                                              cropElement={(path, index)=>this.openCrop(path, index)} 
                                              deleteElement={this.deleteElement} 
                                              hide={this.toggleZoom} />}
          { embedContent }
          <View style={styles.minicontainer}>
            <SimpleButton Pstyle={this.styles.button} onPress={()=>this.sendList()} title="Suivant >>" />
          </View>
        </Screen>
      );
    }
}

export default SendScreen;
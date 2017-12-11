import React, { Component } from 'react'
import Config from './Config'
import Screen from './components/screen'
import Navigator from './components/navigator'
import {StyleSheet,Text,View,ScrollView,Modal,TouchableOpacity} from 'react-native'
import XImage from './components/XImage'
import ImagePicker from 'react-native-image-crop-picker'
import { NavigationActions } from 'react-navigation'
import {SimpleButton, BoxButton, ImageButton} from './components/buttons'
import Swiper from 'react-native-swiper'
import {BoxList} from './components/lists'
import {ProgressUpload} from './components/uploader'

var GLOB = {images:[], imgToDel:"", idZoom:"", navigation:{}}

class ImageSwipe extends Component{
  constructor(props){
    super(props)
    this.state = {ready: false}
  }

  refreshImage(){
    this.setState({ready: true})
  }

  render(){
    const style = {
                    flex:0,
                    width:'100%',
                    height:'100%',
                    backgroundColor:'#fff',
                    borderColor:'#fff',
                    borderWidth:2
                  }

      //Rendering state.ready is there for fixing bug on loading image swipe            
      return <XImage source={this.props.source} 
                    local={false}
                    style={style} 
                    loadingIndicatorSource={{uri:'loader'}} 
                    onLoadEnd={()=>this.refreshImage()}>
              {this.state.ready && <View />}
              {!this.state.ready && <View />}
            </XImage>
  }
}

class BoxZoom extends Component{
  constructor(props){
    super(props)

    this.state = {ready: false}
    this.renderSwiper = this.renderSwiper.bind(this)
  }

  componentDidMount(){
    setTimeout(()=>{this.setState({ready: true})}, 1000)
  }

  onSwipe(index){
    GLOB.idZoom = this.props.datas[index].path.toString();
  }

  hideModal(){
    this.props.hide();
  }

  deleteElement(){
    GLOB.imgToDel = GLOB.idZoom;
    this.hideModal();
    this.props.deleteElement();
  }

  renderSwiper(){
    const swipeStyle = StyleSheet.create({
      wrapper:{
            flex:0,
            width:'100%',
            height:'100%',
            alignItems:'center',
            marginBottom:10,
          }
    })
    var indexStart = 0

    var embedContent = this.props.datas.map((img, key)=>
        {
          if(img.path == GLOB.idZoom){ indexStart = key; }
          return <ImageSwipe key={key} source={{uri: img.path.toString()}} />
        })

      return  <Swiper style={swipeStyle.wrapper} showsButtons={false} showsPagination={true} index={indexStart} onIndexChanged={(index)=>{this.onSwipe(index)}}>
                { embedContent }
              </Swiper>
  }

  render(){
    const zoomBox = StyleSheet.create({
      boxZoom:{
          flex:1,
          padding:"10%",
          backgroundColor:'rgba(0,0,0,0.8)',
          flexDirection:'column',
      }
    })

    return  <Modal transparent={true}
                   animationType="slide" 
                   visible={true}
                   onRequestClose={()=>{}}
            >
              <View style={zoomBox.boxZoom}>
                <View style={{flex:1, marginBottom:15}}>
                  {this.state.ready && this.renderSwiper()}
                  {!this.state.ready && <Text style={{color:'#fff',flex:1,textAlign:'center'}}>Chargment ...</Text>}
                </View>
                <View style={{flex:0,flexDirection:'row'}}>
                  <SimpleButton Pstyle={{flex:1, marginHorizontal:10}} onPress={()=>this.hideModal()} title="Retour" />
                  <SimpleButton Pstyle={{flex:1, marginHorizontal:10}} onPress={()=>this.deleteElement()} title="Enlever" />
                </View>
              </View>
            </Modal>
  }
}

class ImgBox extends Component{
  constructor(props){
    super (props);
    this.state = {options: false};
  }

  toggleOpt(){
    this.setState({options: !this.state.options});
  }

  delete(){
    GLOB.imgToDel = this.props.source.uri;
    this.props.deleteElement();
    this.toggleOpt();
  }

  zoom(){
    GLOB.idZoom = this.props.source.uri;
    this.props.toggleZoom();
    this.toggleOpt(); 
  }

  render(){
    const imgBox = StyleSheet.create({
      styleTouch: {
          flex:0,
          marginVertical:5,
          alignItems:'center',
          width:127
        },
      styleImg: {
          flexDirection:'row',
          borderColor:'#fff',
          borderWidth:3,
          borderRadius:5,
          width:127,
          flex:0,
          height:120,
          alignItems:'flex-end'
        },
      btnText: {
          flex:1,
          backgroundColor:'rgba(255,255,255,0.5)',
          borderColor:"#000",
          padding:2,
          borderWidth:1,
          justifyContent:'center',
          alignItems:'center'
        },
      options:{
          flex:0,
          flexDirection:'row',
          height:'100%',
          width:'100%',
      }
    });

    return  <TouchableOpacity style={imgBox.styleTouch} onPress={()=>this.toggleOpt()}>
                <XImage source={this.props.source} resizeMode='cover' style={imgBox.styleImg} local={false} width={127} height={120} >
                  { this.state.options == true &&
                    <View style={imgBox.options}>   
                      <ImageButton source={{uri:'zoom_x'}} onPress={()=>{this.zoom()}} Pstyle={imgBox.btnText} Istyle={{width:30,height:30}} />
                      <ImageButton source={{uri:'delete'}} onPress={()=>this.delete()} Pstyle={imgBox.btnText} Istyle={{width:30,height:30}} />
                    </View>
                  }
                </XImage>
            </TouchableOpacity>
  }
}

class Header extends Component{
  constructor(props){
    super(props);
  }

  render(){
  return (
            <View style={styles.minicontainer}>
              <BoxButton onPress={this.props.takePhoto} source={{uri:"camera_icon"}} title="Prendre photo" />
              <BoxButton onPress={this.props.openRoll} source={{uri:"folder"}} title="Galerie photos" />
            </View>
          );
  }
}

class SendScreen extends Component {
  static navigationOptions = {headerTitle: 'Envoi documents', headerRight: <ProgressUpload />}

  constructor(props){
    super(props)
    GLOB.images = []
    GLOB.navigation = new Navigator(this.props.navigation)
    this.state = { dataList: [], zoomActive: false}

    this.renderImg = this.renderImg.bind(this)
    this.renderError = this.renderError.bind(this)
    this.deleteElement = this.deleteElement.bind(this)
    this.toggleZoom = this.toggleZoom.bind(this)

    if(UploadingFiles)
    {
      Notice.info("Un transfert est en cours, Veuillez patienter avant de lancer un autre!!")
    }
  }
  
  async openCamera(){
    await ImagePicker.openCamera({
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

  async openRoll(){
    ImagePicker.openPicker({
      multiple: true,
      mediaType: 'photo',
    }).then(images => {
      this.renderImg(images);
    }).catch(error => {
      this.renderError(error);
    });
  }

  async renderImg(img){
    var imgToAdd = [].concat(img);
    var toAdd = true;
    var listAdd = [];

    imgToAdd.map((j)=>
    {
      toAdd = true;
      GLOB.images.map((i)=>
      {
        if(i.path == j.path)
        {
          toAdd = false;
        }
      });

      if(toAdd==true){ listAdd = listAdd.concat(j); }
    });

    GLOB.images = GLOB.images.concat(listAdd);
    await this.setState({dataList: GLOB.images});
  }

  async deleteElement(){
    var imgSave = []; 
    GLOB.images.map((i)=>
    {
      if(i.path != GLOB.imgToDel)
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
      Notice.info("Aucun document à envoyer!!");
    }
  }

  render() {
      if(GLOB.images.length > 0)
      {
        var embedContent =  <ScrollView style={{flex:1, padding:3}}>
                                <Text style={{flex:0,textAlign:'center',fontSize:16,fontWeight:'bold'}}>{GLOB.images.length} : Document(s)</Text>
                                <BoxList datas={this.state.dataList}
                                         elementWidth={127} 
                                         renderItems={(img) => <ImgBox source={{uri: img.path.toString()}} deleteElement={this.deleteElement} toggleZoom={this.toggleZoom}/> } />
                            </ScrollView>
      }
      else
      {
        var embedContent = <View style={styles.boxPicture}>
                              <Text style={{padding:10}}>Veuillez selectionner des photos de votre galerie d'image, ou prendre de nouvelles photos pour l'envoie ...</Text>
                            </View>

      }
      return (
        <Screen style={styles.container}
                navigation={GLOB.navigation}>
          <Header takePhoto={()=>this.openCamera()} openRoll={()=>this.openRoll()} />
          {this.state.zoomActive && <BoxZoom visible={this.state.zoomActive} datas={this.state.dataList} deleteElement={this.deleteElement} hide={this.toggleZoom} />}
          { embedContent }
          <View style={styles.minicontainer}>
            <SimpleButton Pstyle={styles.button} onPress={()=>this.sendList()} title="Suivant >>" />
          </View>
        </Screen>
      );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  minicontainer:{
    flex:0, 
    flexDirection:'row',
    backgroundColor:'#E1E2DD',
    alignItems:'center',
    justifyContent:'center',
  },
  boxPicture:{
      flex:1,
      borderRadius:10,
      elevation: 7,
      backgroundColor:"#E9E9E7",
      margin:10,
      padding:5
  },
  button: {
    flex:1,
    margin:10
  }
});

export default SendScreen;
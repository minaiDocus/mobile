import React, { Component } from 'react'
import base64 from 'base-64'
import {StyleSheet,Text,View,TouchableOpacity} from 'react-native'
import { EventRegister } from 'react-native-event-listeners'
import LinearGradient from 'react-native-linear-gradient'

import {AnimatedBox, XFetcher, LinkButton, BoxInfos} from './index'

export class ProgressUpload extends Component{
  constructor(props){
    super(props)

    this.state = {show: false, value: 0}

    this.dismiss = this.dismiss.bind(this)
    this.uploadProgress = this.uploadProgress.bind(this)
    this.showState = this.showState.bind(this)

    this.generateStyles()
  }

  componentWillMount(){
    EventRegister.on('progressUploadFile', this.uploadProgress)
  }

  componentWillUnmount(){
    EventRegister.rm('progressUploadFile')
  }

  uploadProgress(progressEvent){
    if(!Notice.exist("progressUploadFile"))
    {
      let progress = Math.floor((progressEvent.loaded / progressEvent.total) * 100)
      if(progress >= 99){progress = 99}
      this.setState({value: progress, show: true})
    }
    else
    {
      this.dismiss()
    }
  }

  showState(){
    Notice.info(`Transfert de documents ${this.state.value} %`, true, "progressUploadFile")
    this.dismiss()
  }

  dismiss(){
    if(this.refs.progressUpload && this.state.show)
    {
      this.refs.progressUpload.leave(()=>{
          this.setState({show: false})
      })
    }
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      box:{
            flex:0,
            borderRadius:100,
            alignItems:'center',
            justifyContent:'center',
            borderColor:'#422D14',
            borderWidth:2,
            marginRight:3,
            marginTop:3,
            position:'absolute'
          },
      gradient: {
                  flex:0,
                  height:35,
                  width:35,
                  borderRadius:100,
                  alignItems:'center',
                  justifyContent:'center'
                },
      text: {
              color:"#C0D838",
              fontSize:12,
              fontWeight:'bold'
            }
    })
  }

  render(){
    const colorGrad = ['#422D14', '#422D14', '#C0D838']
    if(this.state.show && this.state.value < 99 && UploadingFiles)
    {
      return <AnimatedBox ref="progressUpload" type="RightSlide" style={this.styles.box}>
                <LinearGradient colors={colorGrad} style={this.styles.gradient}>
                  <TouchableOpacity onPress={this.showState}>
                      <Text style={this.styles.text}>{this.state.value} %</Text>
                  </TouchableOpacity>
                </LinearGradient>
             </AnimatedBox>
    }
    else
    {
      return null
    }
  }
}

export class UploderFiles{
  constructor(){
    this.uploadErrors = []

    this.launchUpload = this.launchUpload.bind(this)
    this.showErrors = this.showErrors.bind(this)
  }

  launchUpload(data=null){
    if(data !== null && typeof(data) !== "undefined")
    {
      const Fetcher = new XFetcher()
      Fetcher.fetch("api/mobile/file_uploader", {method: 'POST', contentType:'multipart/form-data', form_body: data}, false, (result)=>{this.onLoad(result)}, (progressEvent)=>{this.onProgress(progressEvent)}, -1)
      UploadingFiles = true
    }
  }

  onLoad(result){
    if(typeof(result.error) !== "undefined" && result.error == true)
    { 
      this.onError(result)
    }
    else
    {
      this.onComplete(result)
    }
  }

  onProgress(progressEvent){
    EventRegister.emit('progressUploadFile', progressEvent)
    let progress = progressEvent.loaded / progressEvent.total
    if(progress >= 0.99){progress = 0.99}
    if(Notice.exist("progressUploadFile") || progress <= 0.05 || progress >= 0.95)
      Notice.info(`Transfert de documents ${Math.floor(progress * 100)} %`, true, "progressUploadFile")
  }

  onComplete(result){
    EventRegister.emit('completeUploadFile', result)
    Notice.info({title:"Envoi avec succès", body: "Transfert de documents terminée"}, true, "progressUploadFile")
    UploadingFiles = false

    if(typeof(result.success) !== "undefined" && result.success == true)
      saveListImages()
  }

  onError(result){
    Notice.remove("progressUploadFile")
    try{
      if(Array.isArray(result.message))
      {
        this.uploadErrors = result.message
        const mess_obj =  <View style={{flex:1, flexDirection:'row', alignItems:'center'}}>
                            <View style={{flex:2, paddingHorizontal:20}}>
                              <Text style={{flex:1, color:'#FFF', fontWeight:"bold"}}>Erreur envoi</Text>
                              <Text style={{flex:1, color:'#EC5656', fontSize:10}}>Des erreurs ont été détectées lors de l'envoi</Text>
                            </View>
                            <View style={{flex:1}}>
                              <LinkButton onPress={()=>{this.showErrors()}} 
                                          title='Voir détails ...' 
                                          Tstyle={{color:'#EC5656', fontWeight:'bold', paddingLeft:0, textAlign:'center'}} 
                                          Pstyle={{flex:1}} />
                            </View>
                          </View>
        Notice.danger(mess_obj, true, "uploadErrors")
      }
      else
      {
        Notice.danger({title:"Erreur envoi", body: result.message}, true, result.message)
      }
    }catch(e){
      Notice.danger({title:"Erreur envoi", body: "Une erreur s'est produite lors de l'envoi de document!"}, true, "erreur_upload")
    }

    UploadingFiles = false
  }

  showErrors(){
    const call = ()=>{
                        const boxError = <BoxInfos title="Erreurs envoi" dismiss={()=>{clearFrontView()}}>
                                            { 
                                              this.uploadErrors.map((err, index)=>{
                                                return  <View key={index} style={{flex:1, padding:10, borderBottomWidth:1, borderColor:'#A6A6A6'}}>
                                                          <Text style={{fontSize:14}}>- {err.filename}</Text>
                                                          <Text style={{fontSize:12, color:"#EC5656", paddingHorizontal:10}}>{err.errors}</Text>
                                                        </View>
                                              })
                                            }
                                         </BoxInfos>
                        renderToFrontView(boxError, "slide")
                      }
    actionLocker(call)
  }
}
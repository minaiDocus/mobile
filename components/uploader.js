import React, { Component } from 'react'
import base64 from 'base-64'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { EventRegister } from 'react-native-event-listeners'
import LinearGradient from 'react-native-linear-gradient'

import { Document } from '../models'

import { AnimatedBox, XText, XFetcher, LinkButton, BoxInfos, XImage } from './index'

export class ProgressUpload extends Component{
  constructor(props){
    super(props)

    this.state = {show: false, value: 0}

    this.dismiss = this.dismiss.bind(this)
    this.uploadProgress = this.uploadProgress.bind(this)
    this.showState = this.showState.bind(this)

    this.generateStyles()
  }

  UNSAFE_componentWillMount(){
    EventRegister.on('progressUploadFile_UI', this.uploadProgress)
    EventRegister.on('completeUploadFile_UI', this.dismiss)
  }

  componentWillUnmount(){
    EventRegister.rm('progressUploadFile_UI')
    EventRegister.rm('completeUploadFile_UI')
  }

  uploadProgress(progressEvent){
    let progress = Math.floor((progressEvent.loaded / progressEvent.total) * 100)
    if(progress >= 99){progress = 99}

    let _show = this.state.show
    if((progress > 5 && progress <= 10) || (progress > 94 && progress <= 99))
      _show = true

    this.setState({value: progress, show: _show})
  }

  showState(){
    Notice.info(`Transfert de documents ${this.state.value} %`, { permanent: true, name: "progressUploadFile" })
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
            alignItems:'center',
            justifyContent:'center',
            marginRight:5,
            marginTop:-17,
            right: 0,
            position:'absolute',
            zIndex: 20
          },
      gradient: {
                  flex:0,
                  height:40,
                  width:40,
                  borderRadius:100,
                  alignItems:'center',
                  justifyContent:'center'
                },
      text: {
              color:"#C0D838",
              fontSize:12,
              fontWeight:'bold',
              textShadowColor:'#000',
              textShadowOffset:{width: 1, height: 1},
              textShadowRadius:1
            }
    })
  }

  render(){
    // const colorGrad = ['#422D14', '#422D14', '#C0D838']
    const colorGrad = ['#bb0b0b', '#fe1b00', '#f2f2f2']
    if(this.state.show)
    {
      return  <TouchableOpacity style={this.styles.box} onPress={this.showState}>
                <AnimatedBox ref="progressUpload" type="RightSlide" style={{flex: 0, borderColor:'#FFF',
                borderWidth:2, borderRadius:100,}}>
                  <LinearGradient colors={colorGrad} style={this.styles.gradient}>
                    <XText style={this.styles.text}>{this.state.value} %</XText>
                  </LinearGradient>
                </AnimatedBox>
              </TouchableOpacity>
    }
    else
    {
      return null
    }
  }
}

export class UploderFiles{
  constructor(){
    // this.uploadErrors = []
    this.listLastSent = []

    this.launchUpload = this.launchUpload.bind(this)
    this.showErrors = this.showErrors.bind(this)
  }

  launchUpload(data=null){
    if(isPresent(data))
    {
      const Fetcher = new XFetcher()
      Fetcher.fetch(
                      "api/mobile/file_uploader", 
                      { method: 'POST', contentType: 'multipart/form-data', form_body: data },
                      false, 
                      (result)=>{ this.onLoad(result) },
                      (progressEvent)=>{ this.onProgress(progressEvent) },
                       -1
                    )
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
    EventRegister.emit('progressUploadFile_UI', progressEvent)
    let progress = progressEvent.loaded / progressEvent.total
    if(progress >= 0.99){progress = 0.99}

    if((progress > 0.05 && progress <= 0.10) || (progress > 0.94 && progress <= 0.99))
      Notice.info(`Transfert de documents ${Math.floor(progress * 100)} %`, { permanent: true, name: "progressUploadFile" })
  }

  onComplete(result){
    Notice.info({title:"Envoi avec succès", body: "Transfert de documents terminée"}, { permanent: true, name: "progressUploadFile"} )
    Document.syncDocs(Document.sending(), 'sent')
    UploadingFiles = false
    EventRegister.emit('completeUploadFile', result)
    EventRegister.emit('completeUploadFile_UI', result)
  }

  onError(result){
    Notice.remove("progressUploadFile")
    EventRegister.emit('completeUploadFile_UI', result)

    this.listLastSent = Document.sending()

    try{
      if(Array.isArray(result.message))
      {
        const uploadErrors = result.message

        Document.syncDocs(this.listLastSent, 'sent')
        this.listLastSent.map(doc_id => {
          const doc = Document.getById(doc_id) || {}
          uploadErrors.forEach((err)=>{
            if(err.filename == doc.name){
              Document.syncDocs([doc.id], 'error', err.errors)
            }
          })
        })

        const mess_obj =  <View style={{flex:1, flexDirection:'row', alignItems:'center'}}>
                            <View style={{flex:2, paddingHorizontal:20}}>
                              <XText style={{flex:1, color:'#FFF', fontWeight:"bold"}}>Rapport téléversement</XText>
                              <XText style={{flex:1, color:'#EC5656', fontSize:10}}>Des erreurs ont été détectées lors de l'envoi de documents</XText>
                            </View>
                            <View style={{flex:1}}>
                              <LinkButton onPress={()=>{this.showErrors()}} 
                                          title='Voir détails ...'
                                          TStyle={{color:'#EC5656', fontWeight:'bold', paddingLeft:0, textAlign:'center'}} 
                                          CStyle={{flex:1}} />
                            </View>
                          </View>
        Notice.danger(mess_obj, { name: "uploadErrors" })
      }
      else
      {
        Document.syncDocs(this.listLastSent, 'not_sent', result.message)
        Notice.danger({ title: "Erreur envoi", body: result.message }, { name: result.message })
      }
    }catch(e){
      Document.syncDocs(this.listLastSent, 'not_sent', 'erreur envoi')
      Notice.danger({ title: "Erreur envoi", body: "Une erreur s'est produite lors de l'envoi de document!" },  { name: "erreur_upload" })
    }

    UploadingFiles = false
  }

  showErrors(){
    const imgStyles = StyleSheet.create({
      styleImg: {
          flex:0,
          width:54,
          height:54
        },
      styleContainer:{
          backgroundColor:'#fff',
          borderRadius:5,
          marginVertical:10,
          marginHorizontal:5,
          width:60,
          height:60,
          justifyContent:'center',
          alignItems:'center',
      },
    })

    const call = ()=>{
                        const boxError = <BoxInfos title="Rapport téléversement" dismiss={()=>{clearFrontView()}}>
                                            { 
                                              this.listLastSent.map((doc_id, index)=>{
                                                let doc = Document.getById(doc_id)
                                                let message = "Envoi ok"
                                                let color_message = "#228B22"

                                                if(doc.state != 'sent')
                                                {
                                                  message = doc.error
                                                  color_message = "#EC5656"
                                                }

                                                return  <View key={index} style={{flex:1, padding:10, borderBottomWidth:1, borderColor:'#A6A6A6'}}>
                                                          <View style={{flexDirection:'row', flex:1, backgroundColor:'#E1E2DD'}}>
                                                            <View style={{flex:1, justifyContent:'center', alignItems:'center', paddingHorizontal:5}}>
                                                              <XImage type='container' CStyle={imgStyles.styleContainer} style={imgStyles.styleImg} local={false} source={{uri: doc.path.toString()}} />
                                                            </View>
                                                            <View style={{flex:3, padding:10}}>
                                                              <XText style={{fontSize:10}}>- {doc.name}</XText>
                                                              <XText style={{fontSize:12, color:color_message, paddingHorizontal:7}}>{message}</XText>
                                                            </View>
                                                          </View>
                                                        </View>
                                              })
                                            }
                                         </BoxInfos>
                        renderToFrontView(boxError, "UpSlide", ()=>{ clearFrontView() })
                      }
    actionLocker(call)
  }
}
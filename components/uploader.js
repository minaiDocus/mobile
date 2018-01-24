import React, { Component } from 'react'
import base64 from 'base-64'
import Config from "../Config"
import {StyleSheet,Text,View,TouchableOpacity} from 'react-native'
import { EventRegister } from 'react-native-event-listeners'
import AnimatedBox from './animatedBox'
import LinearGradient from 'react-native-linear-gradient'

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
    //add Listener for Uploading Files
    EventRegister.on('progressUploadFile', this.uploadProgress)
  }

  componentWillUnmount(){
    //remove Listener for Uploading Files
    EventRegister.rm('progressUploadFile')
  }

  uploadProgress(progressEvent){
    if(!Notice.exist("progressUploadFile"))
    {
      let progress = Math.floor((progressEvent.loaded / progressEvent.total) * 100)
      if(progress >= 100){progress = 99}
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
    if(this.refs.progressUpload)
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
    if(this.state.show && this.state.value < 100)
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

class UploderFiles{
  constructor(){
    this.launchUpload = this.launchUpload.bind(this)
    // this.test = this.test.bind(this)
  }

  launchUpload(data=null){
    if(data !== null && typeof(data) !== "undefined")
    {
      this.upload({body: data}, this.onProgress)
          .then((res) => this.onComplete(res), (err) => this.onError(err))

      UploadingFiles = true
    }
  }

  upload(opts={}, onProgress){
  url = Config.http_host + "api/mobile/file_uploader"

  return new Promise( (success, error)=>{
          let xhr = new XMLHttpRequest()
          xhr.open('post', url)
          
          if(Config.server == "staging") //if accessing staging server
          {xhr.setRequestHeader("Authorization", "Basic " + base64.encode(Config.user + ":" + Config.pass))}

          for (var k in opts.headers||{})
            xhr.setRequestHeader(k, opts.headers[k])

          xhr.onload = (e) => {
            if (xhr.readyState === 4)
            {
              if (xhr.status === 200)
              {
                try
                {
                  success(JSON.parse(xhr.responseText))
                }
                catch(e)
                {
                  success(handlingHttpErrors(xhr, "uploading file"))
                }
              }
              else
              {
                success(handlingHttpErrors(xhr))
              }
            }
          }

          xhr.onerror = (e) => {
            error(handlingHttpErrors(xhr))
          }

          if (xhr.upload && onProgress)
              xhr.upload.onprogress = onProgress; // event.loaded / event.total * 100 ; //event.lengthComputable

          xhr.send(opts.body);
      });
  }

  onProgress(progressEvent){
    EventRegister.emit('progressUploadFile', progressEvent)

    let progress = progressEvent.loaded / progressEvent.total
    if(progress >= 1){progress = 0.99}

    if(Notice.exist("progressUploadFile") || progress <= 0.05 || progress >= 0.95)
      Notice.info(`Transfert de documents ${Math.floor(progress * 100)} %`, true, "progressUploadFile")
  }

  onComplete(result){
    EventRegister.emit('completeUploadFile', result)
    Notice.info("Transfert de documents terminé", true, "progressUploadFile")
    UploadingFiles = false

    if(typeof(result.success) !== "undefined" && result.success == true)
      saveListImages()
  }

  onError(result){
    EventRegister.emit('errorUploadFile', result)
    Notice.danger("Transfert de fichier avec erreur", true, "progressUploadFile")
    UploadingFiles = false
  }
}

export default UploderFiles
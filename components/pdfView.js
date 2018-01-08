import React, { Component } from 'react'
import {WebView, View, Text, TouchableOpacity, StyleSheet, Platform} from 'react-native'
import {XImage} from './XComponents'
import Pdf from 'react-native-pdf'

class PDFView extends Component{

  constructor(props){
    super(props)

    this.state = {ready: false}

    this.source = this.props.source || null
    this.erreur = ""
    this.pageCount = 0
    this.currPage = 1

    this.loading = this.loading.bind(this)
    this.endLoading = this.endLoading.bind(this)
  }

  componentDidMount(){
    if(this.source == null){
      this.erreur = "URL pdf invalid"
      this.props.onError(this.erreur)
    }
  }

  endLoading(pageCount, filePath){
    this.pageCount = 1
    this.props.onLoadComplete(this.pageCount, filePath)
    setTimeout(()=>this.setState({ready: true}), 1000)
  }

  loading(){
     return <View style={{flex:0, width:'100%', height:'100%', backgroundColor:'#FFF', alignItems:'center', justifyContent:'center'}}>
              <XImage loader={true} width={70} height={70} style={{marginTop:10}} />
            </View> 
  }

  render(){
    const style = {
      flex:1,
      backgroundColor:'#000',
    }

    let readyCss = {}
    if(!this.state.ready){
      readyCss = {opacity: 0, flex:0, width:0, height:0}
    }

    if(Platform.OS == 'ios')
    {
      return  <View style={{flex:1, backgroundColor:'#fff'}}>
                {!this.state.ready && this.loading()}
                <WebView
                  source={this.source}
                  dataDetectorTypes="none"
                  onLoadEnd={(pageCount, filePath)=>{
                    this.endLoading(pageCount, filePath)
                  }}
                  onPageChanged={(page, pageCount)=>{
                    this.props.onPageChanged(page, pageCount)
                  }}
                  onError={(error)=>{
                    this.props.onError(error)
                  }}
                  style={[style, readyCss]}/>
              </View>
    }
    else
    {
      return <Pdf
                source={this.source}
                activityIndicator={this.loading()}
                onLoadComplete={(pageCount, filePath)=>{
                  this.props.onLoadComplete(pageCount, filePath)
                }}
                onPageChanged={(page,pageCount)=>{
                  this.props.onPageChanged(page, pageCount)
                }}
                onError={(error)=>{
                  this.props.onError(error)
                }}
                style={style}/>
    }
  }
}

export default PDFView;
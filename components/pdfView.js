import React, { Component } from 'react'
import {WebView, View, Text, TouchableOpacity, StyleSheet, Platform} from 'react-native'
import {XImage} from './XComponents'
import Pdf from 'react-native-pdf'

class PDFView extends Component{

  constructor(props){
    super(props)

    this.source = this.props.source || null
    this.erreur = ""
    this.pageCount = 0
    this.currPage = 1
    this.loading = this.loading.bind(this)
  }

  componentDidMount(){
    if(this.source == null){
      this.erreur = "URL pdf invalid"
      this.props.onError(this.erreur)
    }
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
    if(Platform.OS == 'ios')
    {
      return <WebView
              source={this.source}
              dataDetectorTypes="none"
              renderLoading={()=>this.loading()}
              onLoadEnd={(pageCount, filePath)=>{
                this.pageCount = 1
                this.props.onLoadComplete(this.pageCount, filePath)
              }}
              onPageChanged={(page, pageCount)=>{
                this.props.onPageChanged(page, pageCount)
              }}
              onError={(error)=>{
                this.props.onError(error)
              }}
              style={style}/>
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
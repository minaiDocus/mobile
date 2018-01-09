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

  handleLayout(){
    this.setState({ready: false})
    setTimeout(()=>this.setState({ready: true}), 1000)
  }

  endLoading(){
    //this.pageCount = 1
    //this.props.onLoadComplete(this.pageCount, "")
    //setTimeout(()=>this.setState({ready: true}), 1000)
  }

  loading(){
     return <View style={{position:'absolute', flex:0, width:'100%', height:'100%', backgroundColor:'#FFF', alignItems:'center', justifyContent:'center'}}>
              <XImage loader={true} width={70} height={70} style={{marginTop:10}} />
            </View> 
  }

  render(){
    const style = {
      flex:1,
      backgroundColor: '#000'
    }

    if(Platform.OS == 'ios')
    {
      return  <View style={{flex:1, backgroundColor:'#fff'}} onLayout={this.handleLayout.bind(this)}>
                  {this.state.ready && <Pdf
                                          source={this.source}
                                          scale={1}
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
                  {!this.state.ready && this.loading()}
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
import React, { Component } from 'react'
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native'
import Pdf from 'react-native-pdf'
import {XImage} from './index'

export class PDFView extends Component{

  constructor(props){
    super(props)

    this.state = {ready: false}

    this.source = this.props.source || null
    this.erreur = ""
    this.pageCount = 0
    this.currPage = 1

    this.loading = this.loading.bind(this)

    this.generateStyles()
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

  generateStyles(){
    this.styles = StyleSheet.create({
      container:  {
                    flex:1,
                    backgroundColor:'#fff'
                  },
      pdfStyle: {
                  flex:1,
                  backgroundColor: '#000'
                },
      loading:{
                position:'absolute',
                flex:0, 
                width:'100%',
                height:'100%',
                backgroundColor:'#FFF',
                alignItems:'center',
                justifyContent:'center'
              }
    })
  }

  loading(){
     return <View style={this.styles.loading}>
              <XImage loader={true} width={70} height={70} style={{marginTop:10}} />
            </View> 
  }

  render(){
    return  <View style={this.styles.container} onLayout={this.handleLayout.bind(this)}>
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
                                        style={this.styles.pdfStyle}/>
                }
                {!this.state.ready && this.loading()}
            </View>
  }
}

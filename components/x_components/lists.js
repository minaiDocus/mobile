import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View } from 'react-native'
import { XText } from '../index'

export class BoxList extends Component{
  static propTypes = {
    datas: PropTypes.array.isRequired,
    renderItems: PropTypes.func.isRequired,
    elementWidth: PropTypes.number.isRequired,
  }

  constructor(props){
    super(props)
    this.childStylePlus = this.props.childrenStyle || {}
    this.stylesPlus = this.props.containerStyle || {}

    this.state = {dimensionReady: false}
    this.renderItems = this.renderItems.bind(this)
    this.onLayout = this.onLayout.bind(this)

    this.generateStyles()
  }

  onLayout(event){
    let {width, height} = event.nativeEvent.layout
    this.width = width - 10
    this.elements = Math.floor(this.width / (this.props.elementWidth+2))
    this.setState({dimensionReady: true})
  }

  generateStyles(){
    this.styles = StyleSheet.create({
        container:  {
                      flex:1,
                      flexDirection:'row',
                      alignItems: 'flex-start',
                      flexWrap:'wrap',
                      borderRadius:10,

                      elevation: 7, //Android Shadow

                      shadowColor: '#000',                    //===
                      shadowOffset: {width: 0, height: 2},  //=== iOs shadow    
                      shadowOpacity: 0.8,                   //===
                      shadowRadius: 2,                      //===

                      backgroundColor:"#E9E9E7",
                      margin:10,
                      padding:5
                    },
        children: {
                    flex:0,
                    flexDirection:'column',
                    alignItems:'center'
                  }
    })
  }

  renderItems(item, key){
    const wd = (this.width) / this.elements
    return <View key={key} style={[this.styles.children, this.stylesPlus, {width:wd}]}>{this.props.renderItems(item, key)}</View>
  }

  render(){
    this.datas = this.props.datas || []
    return <View style={[this.styles.container, this.stylesPlus]} onLayout={this.onLayout} >
              {this.state.dimensionReady && this.datas.map((item, index) => {return this.renderItems(item, index)}) }
           </View> 
  }
}

export class LineList extends Component{
  static propTypes = {
    renderItems: PropTypes.func.isRequired
  }

  constructor(props){
    super(props)
    this.childStylePlus = this.props.childrenStyle || {}
    this.stylesPlus = this.props.containerStyle || {}
    this.renderItems = this.renderItems.bind(this)
    this.generateStyles()
  }

  generateStyles(){
    this.styles = StyleSheet.create({
        container:  {
                      flex:1,
                      flexDirection:'column',
                      borderRadius:10,
                      
                      elevation: 7, //Android Shadow

                      shadowColor: '#000',                  //===
                      shadowOffset: {width: 0, height: 2},  //=== iOs shadow    
                      shadowOpacity: 0.8,                   //===
                      shadowRadius: 2,                      //===

                      backgroundColor:"#E9E9E7",
                      margin:10,
                      padding:5
                  },
        children: {
                    flex:1,
                    flexDirection:'column',
                    borderBottomWidth:1,
                    borderColor:'#D6D6D6'
                  },
        title:{
                flex:1,
                marginTop:10,
                textAlign:'center',
                fontSize:16,
                fontWeight:"bold"
              }
    })
  }

  renderItems(item, key){
    const colorStriped = ((key % 2) == 0)? "#F2F2F2" : "#FFF";
    return <View key={key} style={[this.styles.chindren, this.stylesPlus, {backgroundColor:colorStriped}]}>{this.props.renderItems(item, key)}</View>
  }

  render(){
    this.datas = this.props.datas || []
    return <View style={{flex:1}}>
                {this.props.title && <XText style={this.styles.title}>{this.props.title}</XText>}
                <View style={[this.styles.container, this.stylesPlus]}>
                  {this.datas.length > 0 && this.datas.map((item, index) => {return this.renderItems(item, index)})}
                  {this.datas.length <=0 && <XText style={{padding:10, fontSize:16}}>Aucun résultat trouvé</XText>}
               </View> 
           </View>
  }
}
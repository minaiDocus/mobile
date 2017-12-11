import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {StyleSheet,Text,View,Alert} from 'react-native'

export class BoxList extends Component{
   static propTypes = {
    datas: PropTypes.array.isRequired,
    renderItems: PropTypes.func.isRequired,
    elementWidth: PropTypes.number.isRequired,
  }

  styles = {
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
  }

  childrenStyle = {
      flex:0,
      flexDirection:'column',
      alignItems:'center'
  }

  constructor(props){
    super(props)
    this.childStylePlus = this.props.childrenStyle || {}
    this.stylesPlus = this.props.containerStyle || {}

    this.state = {dimensionReady: false}
    this.renderItems = this.renderItems.bind(this)
    this.onLayout = this.onLayout.bind(this)
  }

  onLayout(event){
    let {width, height} = event.nativeEvent.layout
    this.width = width - 10
    this.elements = Math.floor(this.width / (this.props.elementWidth+2))
    this.setState({dimensionReady: true})
  }

  renderItems(item, key){
    const wd = (this.width) / this.elements
    return <View key={key} style={[this.childrenStyle, this.stylesPlus, {width:wd}]}>{this.props.renderItems(item, key)}</View>
  }

  render(){
    this.datas = this.props.datas
    return <View style={[this.styles, this.stylesPlus]} onLayout={this.onLayout} >
              {this.state.dimensionReady && this.datas.map((item, index) => {return this.renderItems(item, index)}) }
           </View> 
  }
}

export class LineList extends Component{
  static propTypes = {
    renderItems: PropTypes.func.isRequired
  }

  styles = {
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
  }

  childrenStyle = {
      flex:1,
      flexDirection:'column',
      borderBottomWidth:1,
      borderColor:'#D6D6D6'
  }

  constructor(props){
    super(props)
    this.childStylePlus = this.props.childrenStyle || {}
    this.stylesPlus = this.props.containerStyle || {}
    this.renderItems = this.renderItems.bind(this)
  }

  renderItems(item, key){
    const colorStriped = ((key % 2) == 0)? "#F2F2F2" : "#FFF";
    return <View key={key} style={[this.childrenStyle, this.stylesPlus, {backgroundColor:colorStriped}]}>{this.props.renderItems(item, key)}</View>
  }

  render(){
    this.datas = this.props.datas
    return <View style={{flex:1}}>
                {this.props.title && <Text style={{flex:1,marginTop:10,textAlign:'center',fontSize:16,fontWeight:"bold"}}>{this.props.title}</Text>}
                <View style={[this.styles, this.stylesPlus]}>
                  {this.datas.length > 0 && this.datas.map((item, index) => {return this.renderItems(item, index)})}
                  {this.datas.length <=0 && <Text style={{padding:10, fontSize:16}}>Aucun résultat trouvé</Text>}
               </View> 
           </View>
  }
}

export default BoxList
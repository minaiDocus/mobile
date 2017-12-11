import React, { Component } from 'react';
import {Picker, View, Platform, Modal, Text, TouchableOpacity, StyleSheet} from 'react-native';
import XImage from './XImage'

class ModalSelect extends Component{

  constructor(props){
    super(props)

    this.datas = this.props.datas

    this.changeItem = this.changeItem.bind(this)
  }

  changeItem(itemValue){
    let valueText = ''
    this.datas.map((val, key)=>{
      if(val.value == itemValue){valueText=val.label}
    })
    this.props.changeItem(itemValue, valueText)
  }

  render(){
    const modal = StyleSheet.create({
      container: {
        flex:1,
        flexDirection:'column',
        backgroundColor:'rgba(0,0,0,0.7)'
      },
      head:{
        flex:0,
        flexDirection:'row',
        justifyContent:'flex-end',
        backgroundColor:'#E1E2DD',
      },
      body:{
        flex:1,
        backgroundColor:'#FFF'
      },
      touchable:{
        flex:0,
        paddingHorizontal:5,
        margin:3,
        margin:3,
        borderWidth:1,
        borderColor:'#707070'
      }
    })
    return  <Modal transparent={true}
                   animationType="slide" 
                   visible={true}
                   onRequestClose={()=>{}}
            >
              <View style={modal.container}>
                <View style={{flex:2}}></View>
                <View style={modal.head}>
                  <TouchableOpacity style={modal.touchable} onPress={this.props.dismiss}>
                    <Text style={{flex:0, padding:5, right:0}}>OK</Text>
                  </TouchableOpacity>
                </View>
                <View style={modal.body}>
                  <Picker
                        style={{flex:1}}
                        selectedValue={this.props.selectedItem}
                        onValueChange={(itemValue, itemIndex) => this.changeItem(itemValue)}>
                        {this.datas.map((val, key)=>{return <Picker.Item label={val.label} value={val.value} key={key} />})}
                  </Picker>
                </View>
              </View>
            </Modal>
  }
}

class SelectInput extends Component{
  constructor(props){
    super(props);

    this.state = {selectedItem: 0, valueText:this.initValueText(this.props), openModal: false}

    this.showModal = this.showModal.bind(this)
    this.hideModal = this.hideModal.bind(this)
    this.changeItem = this.changeItem.bind(this)
  }

  initValueText(props){
    let initValue = ''
    if(props.dataOptions.length > 0)
    {
      initValue = props.dataOptions[0].label
    }
    return initValue
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.dataOptions != this.props.dataOptions)
    {
      const initValue = this.initValueText(nextProps)
      this.setState({valueText: initValue})
    }
  }

  changeItem(itemValue, valueText=""){
    this.setState({selectedItem: itemValue, valueText: valueText})
    if(this.props.onChange)
    {
      this.props.onChange(itemValue);
    }
  }

  showModal(){
    this.setState({openModal: true})
  }

  hideModal(){
    this.setState({openModal: false})
  }

  render(){
    const styles = {
      flex:1,
      borderColor:'#909090', 
      borderBottomWidth:1,
      marginHorizontal:3,
    }

    let datas = []
    if(this.props.dataOptions)
      datas = this.props.dataOptions


    const stylePlus = this.props.style || {}
    const PStyle = this.props.Pstyle || {}


    if(Platform.OS == 'android')
    {
      return  <View style={[styles].concat(PStyle)}>
                {this.state.openModal && <ModalSelect datas={datas} 
                                                      selectedItem={this.props.selectedItem || this.state.selectedItem} 
                                                      changeItem={this.changeItem}
                                                      dismiss={this.hideModal} />}
                <View style={{flex:1}}>
                  <TouchableOpacity style={{flex:1, flexDirection:'row', alignItems:'center'}} onPress={this.showModal}>
                    <Text style={[{flex:1, paddingLeft:5}].concat(stylePlus)}>{this.state.valueText}</Text>
                    <XImage style={{flex:0, width:15, height:15}} source={{uri:'arrow_down'}} />
                  </TouchableOpacity>
                </View>             
              </View>
    }
    else
    {
      return  <View style={[styles].concat(PStyle)}>
                <Picker
                  style={[{flex:1}].concat(stylePlus)}
                  selectedValue={this.props.selectedItem || this.state.selectedItem}
                  onValueChange={(itemValue, itemIndex) => this.changeItem(itemValue)}>
                  {datas.map((val, key)=>{return <Picker.Item label={val.label} value={val.value} key={key} />})}
                </Picker>
              </View>
    }
  }
}

export default SelectInput;
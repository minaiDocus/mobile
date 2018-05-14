import React, { Component } from 'react'
import {View, Modal, StyleSheet, ScrollView} from 'react-native'

import {SimpleButton, XText, XTextInput, SelectInput, DatePicker, ImageButton} from './index'

class Inputs extends Component{
  constructor(props){
    super(props)

    let defaultValue = null
    if(this.props.setDefaultValue)
    {
      defaultValue = this.props.getValue(this.props.name)
    }

    this.state = {value: defaultValue}

    this.generateStyles()
  }

  changeValue(value){
    this.setState({value: value})
    this.props.setValue(this.props.name, value)
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      container: {
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        marginVertical:7,
        marginHorizontal:8
      },
      input:{
        flex:1.3
      },
      label:{
        flex:1,
        fontSize:14,
        color:'#463119'
      }
    });
  }

  render(){
    const stylePlus = this.props.style || {};
    const labelStyle = this.props.labelStyle || {};
    const inputStyle = this.props.inputStyle || {}; 

    const type = this.props.type || 'input';
    return  <View style={[this.styles.container, stylePlus]}>
              <XText style={[this.styles.label, labelStyle]}>{this.props.label}</XText>
              {type == 'input' && <XTextInput {...this.props} editable={this.props.editable} value={this.state.value} onChangeText={(value)=>{this.changeValue(value)}} PStyle={[this.styles.input, inputStyle]} />}
              {type == 'select' && <SelectInput selectedItem={this.state.value} Pstyle={{flex:1.3}} style={inputStyle} dataOptions={this.props.dataOptions} onChange={(value) => {this.changeValue(value)}} />}
              {type == 'date' && <DatePicker value={this.state.value} onChange={(date)=>this.changeValue(date)} style={{flex:1.3}} />}
            </View>
  }
}

export class ModalForm extends Component{
  constructor(props){
    super(props)
    this.generateStyles()
  }

  generateStyles(){
    this.styles = StyleSheet.create({
     container:{
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'rgba(0,0,0,0.7)',
        paddingVertical:20
      },
      box:{
        flex:0,
        backgroundColor:'#EBEBEB',
        width:'90%',
        borderRadius:10,
        paddingVertical:8
      },
      labels:{
        flex:0,
        width:15,
        height:15,
        marginRight:20
      },
      inputs:{
        flex:0,
        width:15,
        height:15,
        marginRight:20
      },
      head:{
        flex:0,
        minHeight:35,
        paddingHorizontal:10,
        flexDirection:'row',
        backgroundColor:'#EBEBEB',
        borderColor:'#000',
        borderBottomWidth:1,
      },
      body:{
        flex:1,
        backgroundColor:'#FFF',
      },
      foot:{
        flex:0,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#EBEBEB',
        borderColor:'#000',
        borderTopWidth:1,
        paddingVertical:7
      },
      buttons:{
        flex:1,
      }
    });
  }

  renderInputs(){
    const form = this.props.inputs.map((i, key)=>{
      return  <Inputs   key={key}
                        label={i.label} 
                        name={i.name}
                        type={i.type || 'input'}
                        keyboardType={i.keyboardType || 'default'}
                        dataOptions={i.dataOptions || []}
                        setDefaultValue={(i.setDefaultValue == false)? false : true}
                        style={i.style || null}
                        labelStyle={i.labelStyle || null}
                        inputStyle={i.inputStyle || null}
                        editable = {(i.editable == false)? false : true}

                        getValue={this.props.getValue}
                        setValue={this.props.setValue}
              />
    })

    return form
  }

  renderButtons(){
    const buttons = this.props.buttons.map((b, key)=>{
      return  <View key={key} style={{flex:1, paddingHorizontal:5}}>
                 <SimpleButton title={b.title} onPress={()=>b.action()} />
              </View>
    })

    return buttons
  }

  render(){
    return  <Modal transparent={true}
                   animationType="slide" 
                   visible={true}
                   supportedOrientations={['portrait', 'landscape']}
                   onRequestClose={()=>{ this.props.dismiss() }}
            >
              <View style={this.styles.container} >
                <View style={this.styles.box}>
                  <View style={this.styles.head}>
                    <XText style={{flex:1, textAlign:'center',fontSize:24, paddingLeft:25, color: '#463119'}}>{this.props.title}</XText>
                    <ImageButton  source={{uri:"delete"}}
                      Pstyle={{flex:0, flexDirection:'column', alignItems:'center',width:25}}
                      Istyle={{width:10, height:10}}
                      onPress={()=>{this.props.dismiss()}} />
                  </View>
                  <ScrollView style={this.styles.body}>
                    {this.renderInputs()}
                  </ScrollView>
                  <View style={this.styles.foot}>
                    {this.renderButtons()}
                  </View>
                </View>
              </View>
          </Modal>
  }
}
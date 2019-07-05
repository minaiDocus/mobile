import React, { Component } from 'react'
import {View, StyleSheet, ScrollView} from 'react-native'

import {XModal, SimpleButton, XText, XTextInput, SelectInput, DatePicker, ImageButton, RadioButton } from './index'

class Inputs extends Component{
  constructor(props){
    super(props)

    this.state = { value: this.props.defaultValue }

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
    });
  }

  render(){
    const stylePlus = this.props.style || {};
    const labelStyle = this.props.labelStyle || {};
    const inputStyle = this.props.inputStyle || {};
    this.props.setValue(this.props.name, this.state.value)

    const type = this.props.type || 'input';
    return  <View style={[this.styles.container, stylePlus]}>
              <XText style={[{flex: 1}, Theme.modal.label, labelStyle]}>{this.props.label}</XText>
              <View style={{flex: 1.3}}>
                {type == 'input' && <XTextInput {...this.props} editable={this.props.editable} value={this.state.value} onChangeText={(value)=>{this.changeValue(value)}} CStyle={[{flex:1}, inputStyle]} />}
                {type == 'select' && <SelectInput selectedItem={this.state.value} CStyle={{flex:1}} style={inputStyle} dataOptions={this.props.dataOptions} onChange={(value) => {this.changeValue(value)}} />}
                {type == 'date' && <DatePicker value={this.state.value} onChange={(date)=>this.changeValue(date)} style={{flex:1}} />}
                {type == 'radio' && <RadioButton value={this.state.value} dataOptions={this.props.dataOptions} onChange={(value)=>this.changeValue(value)} CStyle={{flex:1}} />}
                {isPresent(this.props.hint) && <XText style={[{flex: 1, paddingVertical: 3, color: '#A6A6A6'}, Theme.textItalic]}>{this.props.hint}</XText>}
              </View>
            </View>
  }
}

export class ModalForm extends Component{
  constructor(props){
    super(props)

    this.values = {}

    this.dismiss = this.dismiss.bind(this)
    this.close = this.close.bind(this)
    this.setValue = this.setValue.bind(this)
    this.generateStyles()
  }

  setValue(key, value=''){
    this.values[key] = value
  }

  dismiss(){
    this.close(this.props.dismiss)
  }

  close(callback=null){
    const call = ()=>{
      try{ callback() }catch(e){}
    }

    try{
      this.refs.main_modal.closeModal(()=>call())
    }catch(e){
      call()
    }
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
        width:'90%',
      },
      head:{
        flex:0,
        minHeight:35,
        paddingHorizontal:10,
        flexDirection:'row',
        alignItems: 'center'
      },
      foot:{
        flex:0,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        paddingVertical:7
      },
      buttons:{
        flex:1,
      }
    });
  }

  renderInputs(){
    const form = this.props.inputs.map((i, key)=>{
      if(isPresent(i.separator))
      {
        return  <View key={key} style={{ flex:1, marginTop: 7, marginHorizontal:5, borderBottomWidth:1, borderColor: '#A6A6A6' }}>
                  <XText style={[{paddingVertical: 5, paddingHorizontal: 3}, Theme.modal.separator]}>{i.separator}</XText>
                </View>
      }
      else
      {
        return  <Inputs   key={key}
                          label={i.label} 
                          name={i.name}
                          type={i.type || 'input'}
                          keyboardType={i.keyboardType || 'default'}
                          dataOptions={i.dataOptions || []}
                          defaultValue={(i.value === '')? '' : i.value}
                          style={i.style || null}
                          labelStyle={i.labelStyle || null}
                          multiline={i.multiline || false}
                          inputStyle={i.inputStyle || null}
                          secureTextEntry={i.secureTextEntry || false}
                          editable={(i.editable == false)? false : true}
                          setValue={(key, value) => this.setValue(key, value) }
                          hint={i.hint}
                    />
      }
    })

    return form
  }

  renderButtons(){
    const buttons = this.props.buttons.map((b, key)=>{
      const action = ()=>{
        if(b.withDismiss){
          try{
            this.refs.main_modal.closeModal( ()=>b.action() )
          }catch(e){
            b.action()
          }
        }else{
          b.action()
        }
      }

      return  <View key={key} style={{flex:1, paddingHorizontal:5}}>
                <SimpleButton title={b.title} CStyle={Theme.primary_button.shape} TStyle={Theme.primary_button.text} onPress={()=>action()} />
              </View>
    })

    return buttons
  }

  render(){
    return  <XModal ref='main_modal'
                    transparent={true}
                    animationType="DownSlide"
                    visible={true}
                    onRequestClose={()=>{ this.dismiss() }}
            >
              <View style={this.styles.container} >
                <View style={[this.styles.box, Theme.modal.shape]}>
                  <View style={[this.styles.head, Theme.modal.head]}>
                    <XText style={[{flex:1}, Theme.modal.title]}>{this.props.title}</XText>
                    <ImageButton  source={{uri:"delete"}}
                      CStyle={{flex:0, flexDirection:'column', alignItems:'center',width:30}}
                      IStyle={{width:15, height:15}}
                      onPress={()=>{this.dismiss()}} />
                  </View>
                  <ScrollView style={{flex: 1}} keyboardShouldPersistTaps={'always'}>
                    {this.renderInputs()}
                  </ScrollView>
                  <View style={[this.styles.foot, Theme.modal.foot]}>
                    {this.renderButtons()}
                  </View>
                </View>
              </View>
            </XModal>
  }
}
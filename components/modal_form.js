import React, { Component } from 'react'
import {View, StyleSheet} from 'react-native'
import { BlurView } from '@react-native-community/blur'

import {XModal, SimpleButton, XText, XTextInput, SelectInput, DatePicker, ImageButton, RadioButton, XScrollView } from './index'

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
              <View style={{flex: 1}}>
                {type == 'input' && <XTextInput {...this.props} placeholder={this.props.label} editable={this.props.editable} value={this.state.value} onChangeText={(value)=>{this.changeValue(value)}} CStyle={[{flex:1}, inputStyle]} />}
                {type == 'select' && <SelectInput placeholder={this.props.label} editable={this.props.editable} selectedItem={this.state.value} CStyle={{flex:1}} style={inputStyle} dataOptions={this.props.dataOptions} onChange={(value) => {this.changeValue(value)}} />}
                {type == 'date' && <DatePicker label={this.props.label} placeholder={'Choisissez une date'} editable={this.props.editable} value={this.state.value} onChange={(date)=>this.changeValue(date)} style={{flex:1}} minDate={this.props.options.minDate} maxDate={this.props.options.maxDate} allowBlank={this.props.options.allowBlank || false} />}
                {type == 'radio' && <RadioButton label={this.props.label} editable={this.props.editable} value={this.state.value} dataOptions={this.props.dataOptions} onChange={(value)=>this.changeValue(value)} CStyle={{flex:1}} />}
                {isPresent(this.props.hint) && <XText style={[{flex: 1, paddingTop: 3, color: '#A6A6A6'}, Theme.textItalic]}>{this.props.hint}</XText>}
              </View>
            </View>
  }
}

export class ModalForm extends Component{
  constructor(props){
    super(props)

    this.flatMode = this.props.flatMode || false

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
        position: 'absolute',
        flex:0,
        width:'90%',
        height:'100%',
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
                          options={i}
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

  renderForm(){
    let c_style = this.props.CStyle || {}
    let s_style = this.props.SStyle || {}
    let h_style = this.props.HStyle || {}
    let f_style = this.props.FStyle || {}

    return <View style={[this.styles.container, c_style]} >
            <BlurView
                style={{position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor: "rgba(0,0,0,0.3)"}}
                blurType="light"
                blurAmount={1}
                blurRadius={2}
            />
            <View style={[this.styles.box, Theme.modal.shape, s_style]}>
              <View style={[this.styles.head, Theme.modal.head, h_style]}>
                { isPresent(this.props.title) && <XText style={[{flex:1}, Theme.modal.title]}>{this.props.title}</XText> }
                {
                  !this.flatMode &&
                  <ImageButton  source={{icon: "window-close"}}
                                CStyle={{flex:0, flexDirection:'column', alignItems:'center',width:30}}
                                IStyle={{width:19, height:19}}
                                onPress={()=>{this.dismiss()}} />
                }
              </View>
              <XScrollView style={{flex: 1}} >
                {this.renderInputs()}
              </XScrollView>
              <View style={[this.styles.foot, Theme.modal.foot, f_style]}>
                {this.renderButtons()}
              </View>
            </View>
          </View>
  }

  render(){
    if(this.flatMode)
    {
      return this.renderForm()
    }
    else
    {
      return  <XModal ref='main_modal'
                      transparent={true}
                      animationType="DownSlide"
                      visible={true}
                      onRequestClose={()=>{ this.dismiss() }}
              >
                { this.renderForm() }
              </XModal>
    }
  }
}
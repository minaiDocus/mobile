import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { ImageButton, XText, XModal, SimpleButton } from '../index'

export class DatePicker extends Component {
  constructor(props){
    super(props)

    let c_date = new Date()
    try{
      c_date = new Date(this.props.value)
    }catch(e){
      c_date = new Date()
    }

    if(this.props.allowBlank && !isPresent(this.props.value))
      c_date = null

    this.state = { pickerShown: false, currentValue: c_date }

    this.next_date = new Date()

    let formated_date = null
    if(c_date)
      formated_date = formatDate(c_date, 'YYYY-MM-DD')

    if(this.props.onChange && formated_date != this.props.value)
      this.props.onChange(formated_date)

    this.label = this.props.label || this.props.placeholder || null
    this.editable = (this.props.editable == false)? false : true

    this.minDate = this.props.minDate || '2010-01-01'
    this.maxDate = this.props.maxDate || formatDate(new Date, 'YYYY-MM-DD')

    this.showPicker       = this.showPicker.bind(this)
    this.handleChangeDate = this.handleChangeDate.bind(this)

    this.generateStyles()
  }

  async closePicker(type='set'){
    this.setState({ pickerShown: false })

    if(type == 'set' && this.editable){
      await this.setState({ currentValue: this.next_date })

      if(this.props.onChange){
        if(this.state.currentValue)
          this.props.onChange(formatDate(this.state.currentValue, 'YYYY-MM-DD'))
        else
          this.props.onChange(null)
      }
    }
  }

  showPicker(){
    if(this.editable){
      this.next_date = this.state.currentValue || new Date()
      this.setState({ pickerShown: true })
    }
  }

  handleChangeDate(event, date){
    if(this.editable){
      this.next_date = date

      if(Config.platform == 'android'){ this.closePicker(event.type) }
    }
  }

  generateStyles(){
    const date_input = Object.assign({height: 30, alignItems: 'flex-start'}, Theme.inputs.shape, {borderTopLeftRadius: 0, borderBottomLeftRadius: 0})

    this.styles = {
                      labelBox:{
                        flex: 0,
                        height: 30,
                        width: '40%',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        borderColor: Theme.inputs.shape.borderColor || '#999',
                        borderWidth: 1,
                        borderRightWidth: 0,
                        borderTopLeftRadius: Theme.inputs.shape.borderRadius,
                        borderBottomLeftRadius: Theme.inputs.shape.borderRadius,
                        paddingLeft: 5,
                        backgroundColor: '#FFF',
                      },
                      dateInput: date_input,
                      dateText: {
                        color: Theme.inputs.text.color,
                        fontSize: Theme.global_text.fontSize || 12
                      },
                      placeholderText:{
                        color: Theme.inputs.text.color,
                        fontSize: Theme.global_text.fontSize || 12
                      }
                  }
  }

  render(){
    let true_value = this.props.placeholder || 'Choisissez une date'
    let txt_style = this.styles.placeholderText
    if (this.state.currentValue !== null){
      txt_style  = this.styles.dateText
      true_value = formatDate(this.state.currentValue, 'DD-MM-YYYY')
    }

    const picker = () => {
      return <DateTimePicker
                  value={this.state.currentValue || new Date()}
                  mode="date"
                  minimumDate={new Date(this.minDate.toString())}
                  maximumDate={new Date(this.maxDate.toString())}
                  display="default"
                  onChange={(event, date) => this.handleChangeDate(event, date)}
              />
    }

    return <View style={{flex: 1, flexDirection: 'row', alignItems:'center', justifyContent:'center'}}>
            { this.label && <View style={this.styles.labelBox}><XText style={[{flex: 0}, Theme.inputs.label]}>{this.label}</XText></View> }
            <TouchableOpacity style={[{flex: 1}, this.styles.dateInput]} onPress={this.showPicker}>
              <XText style={[{flex: 1, width:'100%', paddingTop: (Config.platform == 'android' ? 5 : 6), paddingLeft: 6}, txt_style]}>{true_value}</XText>
            </TouchableOpacity>
            {this.props.allowBlank && this.editable && <ImageButton  source={{icon:"close"}}
                                                    CStyle={{flex:0, flexDirection:'column', alignItems:'center', justifyContent:'center', width:20}}
                                                    IStyle={{flex:0, width:19, height:19}}
                                                    onPress={()=>{this.next_date = null; this.closePicker('set')}} />}
            {
              this.state.pickerShown && Config.platform == 'ios' &&
              <XModal transparent={true}
                      animationType="fade"
                      indication={false}
                      visible={true}
                      onRequestClose={()=>{}} >
                <TouchableOpacity style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.7)'}} onPress={()=>this.closePicker('dismiss')}>
                  <TouchableOpacity style={{flex: 1, backgroundColor: '#FFF', marginVertical: '30%', marginHorizontal: 12, paddingTop: 15, justifyContent: 'center'}} onPress={null}>
                    <View style={{flex: 0}}>
                      { picker() }
                    </View>
                    <View style={{flex:0, paddingHorizontal: 7, paddingVertical:5, flexDirection:'row', width: '100%'}}>
                      <SimpleButton title='Annuler' CStyle={[Theme.primary_button.shape, {flex: 1, marginRight: 7}]} TStyle={Theme.primary_button.text} onPress={()=>this.closePicker('dismiss')} />
                      <SimpleButton title='Ok' CStyle={[Theme.primary_button.shape, {flex: 1}]} TStyle={Theme.primary_button.text} onPress={()=>this.closePicker('set')} />
                    </View>
                  </TouchableOpacity>
                </TouchableOpacity>
              </XModal>
            }
            {
              this.state.pickerShown && Config.platform == 'android' &&
              <View style={{flex: 1}}>{ picker() }</View>
            }
          </View>
  }
}
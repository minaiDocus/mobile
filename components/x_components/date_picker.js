import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { ImageButton, XText } from '../index'

export class DatePicker extends Component {
  constructor(props){
    super(props)

    let c_date = new Date()
    try{
      c_date = new Date(this.props.value.toString())
    }catch{
      c_date = new Date()
    }
    
    if(this.props.allowBlank && !isPresent(this.props.value))
      c_date = null

    this.state = { pickerShown: false, currentValue: c_date }

    if(this.props.onChange)
      this.props.onChange(c_date)

    this.label = this.props.label || this.props.placeholder || null
    this.editable = (this.props.editable == false)? false : true

    this.minDate = this.props.minDate || '2010-01-01'
    this.maxDate = this.props.maxDate || formatDate(new Date, 'YYYY-MM-DD')

    this.showPicker       = this.showPicker.bind(this)
    this.handleChangeDate = this.handleChangeDate.bind(this)

    this.generateStyles()
  }

  showPicker(){
    if(this.editable)
      this.setState({ pickerShown: true })
  }

  handleChangeDate(event, date){
    if(this.editable){
      let next_date = this.state.currentValue
      if(event.type == 'set')
        next_date = date

      this.setState({ pickerShown: false, currentValue: next_date })

      if(this.props.onChange){
        if(next_date)
          this.props.onChange(formatDate(next_date, 'YYYY-MM-DD'))
        else
          this.props.onChange(null)
      }
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

    return <View style={{flex: 1, flexDirection: 'row', alignItems:'center', justifyContent:'center'}}>
            { this.label && <View style={this.styles.labelBox}><XText style={[{flex: 0}, Theme.inputs.label]}>{this.label}</XText></View> }
            <TouchableOpacity style={[{flex: 1}, this.styles.dateInput]} onPress={this.showPicker}>
              <XText style={[{flex: 1, width:'100%', paddingTop: 4, paddingLeft: 5}, txt_style]}>{true_value}</XText>
            </TouchableOpacity>
            {this.props.allowBlank && <ImageButton  source={{icon:"close"}}
                                                    CStyle={{flex:0, flexDirection:'column', alignItems:'center', justifyContent:'center', width:20}}
                                                    IStyle={{flex:0, width:19, height:19}}
                                                    onPress={()=>{this.handleChangeDate({type: 'set'}, null)}} />}
            {
              this.state.pickerShown &&
              <DateTimePicker
                  value={this.state.currentValue || new Date()}
                  mode="date"
                  minimumDate={new Date(this.minDate.toString())}
                  maximumDate={new Date(this.maxDate.toString())}
                  display="default"
                  onChange={(event, date) => this.handleChangeDate(event, date)}
              />
            }
          </View>
  }
}
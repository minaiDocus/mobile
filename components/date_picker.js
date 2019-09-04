import React, { Component } from 'react'
import { View } from 'react-native'
import DatePic from 'react-native-datepicker'
import { ImageButton, XText } from './index'

export class DatePicker extends Component {
  constructor(props){
    super(props)
    
    let c_date = this.props.value || new Date()
    if(this.props.allowBlank && !isPresent(this.props.value))
      c_date = null

    this.state = { date: c_date }

    if(this.props.onChange)
      this.props.onChange(c_date)

    this.label = this.props.label || this.props.placeholder || null

    this.generateStyles()
  }

  handleChangeDate(date){
    this.setState({date: date})
    if(this.props.onChange)
      this.props.onChange(date)
  }

  generateStyles(){
    const date_input = Object.assign({height: 30, paddingLeft: 5, alignItems: 'flex-start'}, Theme.inputs.shape, {borderTopLeftRadius: 0, borderBottomLeftRadius: 0})

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
                      dateIcon: {
                            position: 'absolute',
                            left: 0,
                            top: 4,
                            marginLeft: 0
                          },
                      dateInput: date_input,
                      dateText: {
                        paddingLeft: 36,
                        color: Theme.inputs.text.color,
                        fontSize: Theme.global_text.fontSize || 12
                      },
                      placeholderText:{
                        paddingLeft: 36,
                        color: Theme.inputs.text.color,
                        fontSize: Theme.global_text.fontSize || 12
                      }
                  }
  }

  render(){
    return <View style={{flex: 1, flexDirection: 'row', alignItems:'center', justifyContent:'center'}}>
            { this.label && <View style={this.styles.labelBox}><XText style={[{flex: 0}, Theme.inputs.label]}>{this.label}</XText></View> }
            <DatePic
              date={this.state.date}
              mode="date"
              placeholder='select date'
              format="YYYY-MM-DD"
              minDate={this.props.minDate || "2015-01-01"}
              maxDate={this.props.maxDate || new Date()}
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              customStyles={this.styles}
              style={this.props.style}
              onDateChange={(date) => this.handleChangeDate(date)}
            />
            {this.props.allowBlank && <ImageButton  source={{icon:"close"}}
                                                    CStyle={{flex:0, flexDirection:'column', alignItems:'center', justifyContent:'center', width:20}}
                                                    IStyle={{flex:0, width:19, height:19}}
                                                    onPress={()=>{this.handleChangeDate(null)}} />}
          </View>
  }
}
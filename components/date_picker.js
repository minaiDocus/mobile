import React, { Component } from 'react'
import { View } from 'react-native'
import DatePic from 'react-native-datepicker'
import { ImageButton } from './index'

export class DatePicker extends Component {
  constructor(props){
    super(props)
    
    let c_date = this.props.value || new Date()
    if(this.props.allowBlank && !isPresent(this.props.value))
      c_date = null

    this.state = { date: c_date }

    if(this.props.onChange)
      this.props.onChange(c_date)

    this.generateStyles()
  }

  handleChangeDate(date){
    this.setState({date: date})
    if(this.props.onChange)
      this.props.onChange(date)
  }

  generateStyles(){
    this.styles = {
                      dateIcon: {
                            position: 'absolute',
                            left: 0,
                            top: 4,
                            marginLeft: 0
                          },
                      dateInput: {
                            marginLeft: 36,
                          },
                      dateText: {
                        color: Theme.global_text.color,
                      },
                  }
  }

  render(){
    return <View style={{flex: 1, flexDirection: 'row', alignItems:'center', justifyContent:'center'}}>
            <DatePic
              date={this.state.date}
              mode="date"
              placeholder="select date"
              format="YYYY-MM-DD"
              minDate={this.props.minDate || "2015-01-01"}
              maxDate={this.props.maxDate || new Date()}
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              customStyles={this.styles}
              style={this.props.style}
              onDateChange={(date) => this.handleChangeDate(date)}
            />
            {this.props.allowBlank && <ImageButton  source={{uri:"delete_green"}} 
                                                    CStyle={{flex:0, flexDirection:'column', alignItems:'center', justifyContent:'center', width:20}}
                                                    IStyle={{flex:0, width:15, height:15}}
                                                    onPress={()=>{this.handleChangeDate(null)}} />}
          </View>
  }
}
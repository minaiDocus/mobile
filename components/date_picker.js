import React, { Component } from 'react';
import DatePic from 'react-native-datepicker'

export class DatePicker extends Component {
  constructor(props){
    super(props)
    
    let c_date = this.props.value || new Date()

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
    return (
      <DatePic
        date={this.state.date}
        mode="date"
        placeholder="select date"
        format="YYYY-MM-DD"
        minDate="2015-01-01"
        maxDate={new Date()}
        confirmBtnText="Confirm"
        cancelBtnText="Cancel"
        customStyles={this.styles}
        style={this.props.style}
        onDateChange={(date) => this.handleChangeDate(date)}
      />
    )
  }
}
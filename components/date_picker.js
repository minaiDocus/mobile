import React, { Component } from 'react';
import DatePic from 'react-native-datepicker'

export class DatePicker extends Component {
  constructor(props){
    super(props)
    this.state = {date: this.props.value}

    this.generateStyles()
  }

  handleChangeDate(date){
    this.setState({date: date});
    if(this.props.onChange)
    {
      this.props.onChange(date);
    }  
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
                            marginLeft: 36
                          }
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
import React, { Component } from 'react';
import DatePic from 'react-native-datepicker'

class DatePicker extends Component {
  constructor(props){
    super(props)
    this.state = {date: this.props.value}
  }

  handleChangeDate(date){
    this.setState({date: date});
    if(this.props.onChange)
    {
      this.props.onChange(date);
    }  
  }

  render(){
    const styles = {
                      dateIcon: {
                            position: 'absolute',
                            left: 0,
                            top: 4,
                            marginLeft: 0
                          },
                      dateInput: {
                            marginLeft: 36
                          }
                    };

    return (
      <DatePic
        style={{width: 200}}
        date={this.state.date}
        mode="date"
        placeholder="select date"
        format="YYYY-MM-DD"
        minDate="2015-01-01"
        maxDate={new Date()}
        confirmBtnText="Confirm"
        cancelBtnText="Cancel"
        customStyles={styles}
        style={this.props.style}
        onDateChange={(date) => this.handleChangeDate(date)}
      />
    )
  }
}

export default DatePicker
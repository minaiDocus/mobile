import React, { Component } from 'react'
import {View} from 'react-native'
import { EventRegister } from 'react-native-event-listeners'

import { Navigator,ImageButton,OrganizationSwitcher,XText } from '../../components'

import { User } from '../../models'

import SharingAdmin from './format/sharing_admin'
import SharingCustomers from './format/sharing_customers'

class HeaderOptions extends Component{
  constructor(props){
    super(props)
  }

  render() {
    if(Master.is_prescriber || Master.is_admin)
    {
      return <ImageButton source={{uri:"options"}} 
                          CStyle={{flex:0, flexDirection:'column', justifyContent:'center', alignItems:'center', minWidth:40}}
                          IStyle={{flex:0, width:7, height:36}}
                          onPress={()=>EventRegister.emit('clickOrderBox', true)} />
    }
    else
    {
      return null
    }
  }
}

class SharingScreen extends Component {
  constructor(props){
    super(props)
    Master = User.getMaster()
  }

  renderOptions(){
    return  <View style={{flex:1, flexDirection:'row', justifyContent: 'center'}}>
              <OrganizationSwitcher />
              <HeaderOptions />
            </View>
  }

  render() {
    if(Master.is_prescriber || Master.is_admin)
    {
      return <SharingAdmin navigation={this.props.navigation} title='Partage dossier' options={ this.renderOptions() } />
    }
    else
    {
      return <SharingCustomers navigation={this.props.navigation} title='Partage dossier' options={ this.renderOptions() }/>
    }

  }
}

export default SharingScreen;
import React, { Component } from 'react'
import { EventRegister } from 'react-native-event-listeners'

import {Navigator,ImageButton} from '../../components'

import {User} from '../../models/User'

import SharingAdmin from './format/sharing_admin'
import SharingCustomers from './format/sharing_customers'

let GLOB = { navigation:{} }

class HeaderOptions extends Component{
  constructor(props){
    super(props)
    this.current_user = User.getMaster()
  }

  render() {
    if(this.current_user.is_prescriber || this.current_user.is_admin)
    {
      return <ImageButton source={{uri:"options"}} 
                          Pstyle={{flex:1, paddingVertical:10, flexDirection:'column', alignItems:'center',minWidth:50}}
                          Istyle={{width:7, height:36}}
                          onPress={()=>EventRegister.emit('clickOrderBox', true)} />
    }
    else
    {
      return null
    }
  }
}


class SharingScreen extends Component {
  static navigationOptions = {
       headerTitle: 'Partage dossier',
       headerRight: <HeaderOptions />
  }

  constructor(props){
    super(props)
    GLOB.navigation = new Navigator(this.props.navigation)
    this.current_user = User.getMaster()
  }

  render() {
    if(this.current_user.is_prescriber || this.current_user.is_admin)
    {
      return <SharingAdmin navigation={GLOB.navigation}/>
    }
    else
    {
      return <SharingCustomers navigation={GLOB.navigation}/>
    }

  }
}

export default SharingScreen;
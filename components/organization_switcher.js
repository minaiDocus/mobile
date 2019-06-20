import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { EventRegister } from 'react-native-event-listeners'

import { XImage, SelectInput, ImageButton } from './index'

import { Organization } from '../models'

export class OrganizationSwitcher extends Component{
  static organization

  constructor(props){
    super(props)

    this.state = {ready: false, showList: false, organization_id: 0}
    this.organizations = []

    this.openSelection = this.openSelection.bind(this)
  }

  componentWillMount(){
    this.changingListener = EventRegister.on("OrganizationSwitched", ()=>{this.setState({showList: false, organization_id: OrganizationSwitcher.organization.id})})
  }

  componentWillUnmount(){
    EventRegister.rm(this.changingListener)
  }

  componentDidMount(){
    const loading = () => {
      if(Organization.isUpdating()){
        setTimeout(loading, 1000)
      }
      else
      {
        const organizations = Organization.getAll()
        if(organizations.length > 0)
        {
          this.organizations = organizations.map((org)=>{
            if(org.active) OrganizationSwitcher.organization = realmToJson(org)
            return {value: org.id, label: org.name}
          })
          this.setState({ready: true, organization_id: OrganizationSwitcher.organization.id})
        }
      }
    }
    loading()
  }

  handleChange(value){
    OrganizationSwitcher.organization = realmToJson( Organization.find(`id = ${value}`)[0] )
  }

  handleClose(){
    const organization_active = Organization.getActive()
    if(organization_active.id != OrganizationSwitcher.organization.id)
    {
      Organization.activate(OrganizationSwitcher.organization.id)
      EventRegister.emit("OrganizationSwitched")
    }
  }

  openSelection(){
    this.setState({ showList: true })
  }

  render(){
    if(this.organizations.length > 1 && this.state.ready)
    {
      return  <View style={{flex:0}}>
                <ImageButton  source={{uri:"organization"}} 
                              CStyle={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'center', minWidth:40}}
                              IStyle={{flex:0, width:25, height: 25}}
                              onPress={()=>{ this.openSelection() }} /> 

                <SelectInput  open={this.state.showList}
                              invisible={true}
                              textInfo="Organisations - ( Agir sur l'organisation : )" 
                              filterSearch={true} 
                              dataOptions={this.organizations}
                              selectedItem={this.state.organization_id}
                              onChange={(value)=>this.handleChange(value)}
                              onClose={()=>this.handleClose()}/>
              </View>
    }
    else
    {
      return null
    }
  }
}
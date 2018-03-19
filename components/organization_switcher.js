import React, { Component } from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { EventRegister } from 'react-native-event-listeners'

import { XImage, SelectInput, ImageButton } from './index'

import { Organization } from '../models'

export class OrganizationSwitcher extends Component{
  static organization

  constructor(props){
    super(props)

    this.state = {showList: false, organization_id: 0}

    this.openSelection = this.openSelection.bind(this)
  }

  componentWillMount(){

    this.changingListener = EventRegister.on("OrganizationSwitched", ()=>{this.setState({showList: false, organization_id: OrganizationSwitcher.organization.id})})

    const organizations = Organization.getAll()
    this.organizations = [{value: 1, label: "Test1"}, {value: 2, label: "Test2"}]
    if(organizations.length > 0)
    {
      this.organizations = organizations.map((org)=>{
        if(org.active) OrganizationSwitcher.organization = realmToJson(org)
        this.setState({organization_id: OrganizationSwitcher.organization.id})
        return {value: org.id, label: org.name}
      })
    }
  }

  componentWillUnmount(){
    EventRegister.rm(this.changingListener)
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
    if(this.organizations.length > 1)
    {
      return  <View style={{flex:1}}>
                <ImageButton  source={{uri:"organization"}} 
                              Pstyle={{flex:1, paddingVertical:10, flexDirection:'column', alignItems:'center',minWidth:50}}
                              Istyle={{width:30}}
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
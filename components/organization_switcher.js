import React, { Component } from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { EventRegister } from 'react-native-event-listeners'

import { XImage, SelectInput, ImageButton } from './index'

import { Organization } from '../models'

export class OrganizationSwitcher extends Component{
  static organization

  constructor(props){
    super(props)

    this.state = {showList: false}

    this.openSelection = this.openSelection.bind(this)
  }

  componentWillMount(){
    const organizations = Organization.getAll()
    this.organizations = [{value: 1, label: "Test1"}, {value: 2, label: "Test2"}]
    if(organizations.length > 0)
    {
      this.organizations = organizations.map((org)=>{
        if(org.active) OrganizationSwitcher.organization = realmToJson(org)
        return {value: org.id, label: org.name}
      })
    }
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
                              textInfo="Organisations - ( Agir en tant qu'organisation : )" 
                              filterSearch={true} 
                              dataOptions={this.organizations}
                              selectedItem={OrganizationSwitcher.organization.id}
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
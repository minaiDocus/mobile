import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity  } from 'react-native'
import ScrollableTabView from 'react-native-scrollable-tab-view'

import { XImage, XText } from './index'


export class TabNav extends Component{
  constructor(props){
    super(props)

    this.headers = this.props.headers || []

    this.state = { index: 0 }

    this.generateStyles() //style generation
  }

  handleIndexChange(index){
    this.setState({index: index})
  }

  generateStyles(){
    this.stylesTabBar = StyleSheet.create({
      container:{
                  flex:0,
                  flexDirection:'row',
                  width:'100%',
                  marginTop:10,
                },
      icons:{
              flex:0,
              marginLeft:5,
              width:30,
              height:30,
            },
      box:{
            flex:1,
            marginHorizontal:2,
            flexDirection:'row',
            alignItems:'center',
          },
    })
  }

  renderTabBar(){
    if(this.headers.length > 0)
    {
      let indexSelectedShape = indexSelectedText = indexSelectedIcon = ""
      const content = this.headers.map((tb, index) => {
            indexSelectedShape = (index == this.state.index)? Theme.tabs.selected.shape : {};
            indexSelectedText = (index == this.state.index)? Theme.tabs.selected.text : {};
            indexSelectedIcon = (index == this.state.index)? Theme.tabs.selected.icon : {};

            return (
             <TouchableOpacity key={index} onPress={()=>{this.handleIndexChange(index)}} style={{flex:1}}>
              <View style={[this.stylesTabBar.box, Theme.tabs.shape, indexSelectedShape]}>
                { isPresent(tb.icon) && <XImage source={{uri:tb.icon}} style={[this.stylesTabBar.icons, Theme.tabs.icons, indexSelectedIcon]} /> }
                <XText style={[{flex: 1}, Theme.tabs.title, indexSelectedText]}>{tb.title}</XText>
              </View>
            </TouchableOpacity>
        )})

      return <View style={[this.stylesTabBar.container, Theme.tabs.head_container]}>
               {content}
             </View>
    }
    else
    {
      return null
    }
  }

  render(){
    const CStyle = this.props.CStyle || {}

    return  <ScrollableTabView style={[Theme.tabs.body_container, CStyle, {overflow: 'hidden'}]} tabBarPosition="top" renderTabBar={()=>this.renderTabBar()} page={this.state.index} onChangeTab={(object) => {this.handleIndexChange(object.i)}}>
              { this.props.children }
            </ScrollableTabView>
  }
}
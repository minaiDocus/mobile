import React, { Component } from 'react'
import {View, Text, StyleSheet} from 'react-native'
import ScrollableTabView from 'react-native-scrollable-tab-view'

class Swiper extends Component{
  constructor(props){
    super(props)
    this.state = {index: this.props.index || 0}
  }

  renderTabBar(){
    return <View style={{flex:0, width:0,height:0}} />
  }

  handleIndexChange(index){
    this.setState({index: index})
    this.props.onIndexChanged(index)
  }

  renderPagination(){
    if(this.props.count > 1)
    {
      const page = StyleSheet.create({
        container:{
          position:'absolute',
          flex:0,
          width:'100%',
          paddingBottom:20,
          flexDirection:'row',
          justifyContent:'center',
          alignItems:'center'
        },
        pages:{
          flex:0,
          width:10,
          height:10,
          borderRadius:100,
          margin:2,
          opacity:0.5
        }
      })

      const list = this.props.count
      let pagination = []
      let active = ''
      for(i=0;i<list;i++)
      {
        active = (this.state.index == i)? '#00f' : '#FFFF6B'
        pagination.push(<View key={i} style={[page.pages, {backgroundColor: active}]} />)
      }
      return <View style={page.container}>
              {pagination.map((i)=>{return i})}
             </View> 
    }
    else
    {
      return null
    }
  }

  render(){
    const list = this.props.count
    return  <View style={{flex:1, justifyContent:'flex-end'}}>
              <ScrollableTabView style={this.props.style} renderTabBar={()=>this.renderTabBar()} tabBarPosition="top" initialPage={this.props.index} onChangeTab={(object) => {this.handleIndexChange(object.i)}}>
                {this.props.children}
              </ScrollableTabView>
              {this.renderPagination()}
            </View>
  }
}

export default Swiper
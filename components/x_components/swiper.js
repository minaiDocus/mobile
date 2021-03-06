import React, { Component } from 'react'
import {View, StyleSheet} from 'react-native'
import ScrollableTabView from 'react-native-scrollable-tab-view'

export class Swiper extends Component{
  constructor(props){
    super(props)

    this.state = { index: this.props.index || 0 }

    this.changePage = this.changePage.bind(this)

    this.generateStyles()
  }

  renderTabBar(){
    return <View style={{flex:0, width:0,height:0}} />
  }

  changePage(page=0){
    this.handleIndexChange(page)
  }

  handleIndexChange(index){
    this.setState({index: index})

    if(this.props.onIndexChanged)
      this.props.onIndexChanged(index)
  }

  generateStyles(){
    this.pageStyle = StyleSheet.create({
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
  }

  renderPagination(){
    if(this.props.count > 1)
    {
      const count = this.props.count
      let pagination = []
      let active = ''
      for(i=0;i<count;i++)
      {
        active = (this.state.index == i)? '#00f' : '#FFFF6B'
        pagination.push(<View key={i} style={[this.pageStyle.pages, {backgroundColor: active}]} />)
      }
      return <View style={this.pageStyle.container}>
              {pagination.map((i)=>{return i})}
             </View> 
    }
    else
    {
      return null
    }
  }

  render(){
    return  <View style={{flex:1, justifyContent:'flex-end'}}>
              <ScrollableTabView  style={this.props.style} 
                                  renderTabBar={()=>this.renderTabBar()} 
                                  tabBarPosition="top" 
                                  initialPage={this.props.index || 0}
                                  page={this.state.index || 0}
                                  onChangeTab={(object) => {this.handleIndexChange(object.i)}}>
                {this.props.children}
              </ScrollableTabView>
              { this.renderPagination() }
            </View>
  }
}
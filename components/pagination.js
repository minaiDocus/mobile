import React, { Component } from 'react'
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native'
import {SimpleButton} from './buttons'

class Pagination extends Component{

  constructor(props){
    super(props)

    this.state = {page: this.props.page || 1}
    this.limit_page = this.props.nb_pages

    this.changePage = this.changePage.bind(this)
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.page >= 1){
      this.setState({page: nextProps.page})
    }
    if(nextProps.nb_pages >= 1){
      this.limit_page = nextProps.nb_pages
    }
  }

  changePage(arg_page=1){
    let _page = 1
    let page = this.state.page
    if(arg_page=="prev")
    {
      _page = page - 1
      page = (_page > 1)? _page : 1
    }
    else if(arg_page == "next")
    {
      _page = page + 1
      page = (_page < this.limit_page)? _page : this.limit_page
    }
    else
    {
      page = arg_page
    }
    this.setState({page: page})
    this.props.onPageChanged(page)
  }
  
  renderPages(){
    let numbers = []
    let activeText = {}
    const touchStyle = {
      flex:0, 
      paddingHorizontal:3, 
      height:20, 
      margin:1,
      alignItems:'center',
      justifyContent:'center'
    }

    let start_page = this.state.page - 2
    start_page = (start_page < 1)? 1 : start_page

    let end_page = start_page + 4
    end_page = (end_page > this.limit_page)? this.limit_page : end_page

    for(i=start_page; i<=end_page; i++)
    {
      activeText = {}
      if(this.state.page == i)
      {
        activeText = {fontSize:16, color:'#C0D838', fontWeight:'bold'}
      }

      const page_number = i
      numbers = numbers.concat( <TouchableOpacity key={i} style={touchStyle} onPress={()=>this.changePage(page_number)}>
                                  <Text style={[{fontSize:10, color:'#422D14'}, activeText]}>{i}</Text>
                                </TouchableOpacity>)
    }

    return <View style={{flex:1, justifyContent:'center', flexDirection:'row'}} >
            {start_page > 1 && <View style={touchStyle}><Text>...</Text></View>}
            {numbers.map((n)=>{return n})}
            {end_page < this.limit_page && <View style={touchStyle}><Text>...</Text></View>}
           </View>
  }

  render(){
    return  <View style={{flexDirection:'row', marginBottom:10, marginHorizontal:10}}>
                  { this.state.page > 1 && 
                    <View style={{flex:1, alignItems:"flex-start"}}>
                      <SimpleButton title="<<" onPress={()=>{this.changePage("prev")}} Pstyle={{width:50, paddingVertical:1}}/>
                    </View>
                  }
                  {this.limit_page > 1 && this.renderPages()}
                  { this.state.page < this.limit_page && 
                    <View style={{flex:1, alignItems:"flex-end"}}>
                      <SimpleButton title=">>" onPress={()=>{this.changePage("next")}} Pstyle={{width:50, paddingVertical:1}} />
                    </View>
                  }
            </View>
  }

}

export default Pagination
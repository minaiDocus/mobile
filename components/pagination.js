import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { SimpleButton, XText } from './index'

export class Pagination extends Component{

  constructor(props){
    super(props)

    this.state = {page: (this.props.page || 1), limit_page: this.props.nb_pages}

    this.changePage = this.changePage.bind(this)
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    if(nextProps.page >= 1 || nextProps.nb_pages){
      this.setState({page: (isPresent(nextProps.page)? nextProps.page : this.state.page), limit_page: (isPresent(nextProps.nb_pages)? nextProps.nb_pages : this.state.limit_page)})
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
      page = (_page < this.state.limit_page)? _page : this.state.limit_page
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
      paddingHorizontal:5, 
      height:20, 
      margin:1,
      alignItems:'center',
      justifyContent:'center'
    }

    const step = 2

    let start_page = this.state.page - step
    start_page = (start_page < 1)? 1 : start_page

    let end_page = this.state.page + step
    end_page = (end_page > this.state.limit_page)? this.state.limit_page : end_page

    for(i=start_page; i<=end_page; i++)
    {
      activeText = {}
      if(this.state.page == i)
      {
        activeText = {
                      fontSize:16,
                      color:'#FFF',
                      fontWeight:'bold',
                      textShadowColor:'#000',
                      textShadowOffset:{width: 1, height: 1},
                      textShadowRadius:1,
                      top:-1
                     }
      }

      const page_number = i
      numbers = numbers.concat( <TouchableOpacity key={i} style={touchStyle} onPress={()=>this.changePage(page_number)}>
                                  <XText style={[{fontSize:14, color:'#422D14'}, activeText]}>{i}</XText>
                                </TouchableOpacity>)
    }

    return <View style={{flex:0, justifyContent:'center', flexDirection:'row'}} >
            {start_page > 1 && <View style={touchStyle}><XText>...</XText></View>}
            {numbers.map((n)=>{return n})}
            {end_page < this.state.limit_page && <View style={touchStyle}><XText>...</XText></View>}
           </View>
  }

  render(){
    const CStyle = this.props.CStyle || {}
    return  <View style={[{flex:1, flexDirection:'row', marginBottom:10, marginHorizontal:10}, CStyle]}>
                  { 
                    this.state.page > 1 && 
                     <View style={{flex:1, alignItems:"flex-start"}}>
                       <SimpleButton title="<<" onPress={()=>{this.changePage("prev")}} CStyle={[{width:50, paddingVertical:1}, Theme.secondary_button.shape]} TStyle={Theme.secondary_button.text}/>
                     </View>
                  }
                  {this.state.limit_page > 1 && this.renderPages()}
                  { 
                    this.state.page < this.state.limit_page &&
                    <View style={{flex:1, alignItems:"flex-end"}}>
                      <SimpleButton title=">>" onPress={()=>{this.changePage("next")}} CStyle={[{width:50, paddingVertical:1}, Theme.secondary_button.shape]} TStyle={Theme.secondary_button.text} />
                    </View>
                  }
            </View>
  }
}

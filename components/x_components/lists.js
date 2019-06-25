import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View } from 'react-native'
import { XText, XImage } from '../index'

class Loader extends Component{
  constructor(props){
    super(props)
    this.state = {refresh: true}
    this.forceUnmount = false
    this.unmoutComponent = this.unmountComponent.bind(this)
  }

  componentDidUpdate(){
    this.forceUnmount = false
  }

  unmountComponent(){
    this.forceUnmount = true
    this.setState({refresh: true})
  }

  render(){
    const loaderStyle = {
                          flex:1,
                          top:0,
                          left:0,
                          right:0,
                          bottom:0,
                          borderRadius:10,
                          backgroundColor: "rgba(255,255,255,0.6)",
                          position: 'absolute',
                          flexDirection:'column',
                          alignItems:'center'
                        }
    if(this.state.refresh && !this.forceUnmount)
    {
      return  <View style={loaderStyle}>
                <XImage ref='loader' loader={true} width={70} height={70} style={{alignSelf:'center', marginVertical:10}} />
              </View>
    }
    else
    {
      return null;
    }
  }
}

export class BoxList extends Component{
  static propTypes = {
    datas: PropTypes.array.isRequired,
    renderItems: PropTypes.func.isRequired,
    elementWidth: PropTypes.number.isRequired,
  }

  constructor(props){
    super(props)
    this.childStylePlus = this.props.childrenStyle || {}
    this.stylesPlus = this.props.containerStyle || {}

    this.state = {dimensionReady: false}
    this.newData = true
    this.datas = this.props.datas || []
    this.itemCount = 0

    this.padding = 2

    this.renderItems = this.renderItems.bind(this)
    this.onLayout = this.onLayout.bind(this)
    this.removeLoader = this.removeLoader.bind(this)

    this.generateStyles()
  }

  componentWillReceiveProps(nextProps){
    try
    {
      if(JSON.stringify(this.datas) != JSON.stringify(nextProps.datas))
        this.newData = true
    }catch(e)
    {
      this.newData = true
    }
    this.datas = nextProps.datas || []
  }

  componentDidMount(){
    this.removeLoader()
  }

  componentDidUpdate(){
    this.removeLoader()
  }

  removeLoader(){
    this.newData = false
    this.itemCount = 0
    setTimeout(()=>{
      if(this.refs.loader && !this.props.waitingData)
        this.refs.loader.unmountComponent()
    }, 500)
  }

  onLayout(event){
    let {width, height} = event.nativeEvent.layout
    this.width = width
    this.elements = Math.floor(this.width / (this.props.elementWidth))
    this.setState({dimensionReady: true})
  }

  generateStyles(){
    this.styles = StyleSheet.create({
        container:  {
                      flex:1,
                      flexDirection:'row',
                      alignItems: 'flex-start',
                      flexWrap:'wrap',
                      minWidth: 80,
                      minHeight: 90,
                    },
        children: {
                    flex:0,
                    flexDirection:'column',
                    alignItems:'center',
                  }
    })
  }

  renderItems(item, key){
    const wd = (this.width) / this.elements
    return <View key={key} style={[this.styles.children, this.childStylePlus, {width: (wd - this.padding), padding: this.padding, margin: 0}]}>{this.props.renderItems(item, key)}</View>
  }

  render(){
    this.itemCount = this.datas.length

    let content = <View />
    if(this.props.waitingData || this.newData)
      content = <Loader ref='loader' />
    else if(this.itemCount <= 0 && this.props.noItemText != 'none')
      content = <XText style={{padding: 10}}>{this.props.noItemText || 'Aucun résultat trouvé'}</XText>

    return  <View style={{flex: 1}}>
              {this.props.title != '' && <XText style={[{flex:0}, Theme.lists.title]}>{this.props.title}</XText>}
              <View style={[this.styles.container, Theme.lists.shape, {padding: 0}, this.stylesPlus]} onLayout={this.onLayout} >
                {this.itemCount > 0 && this.state.dimensionReady && this.datas.map((item, index) => {return this.renderItems(item, index)})}
                { content }
              </View>
            </View>
  }
}

export class LineList extends Component{
  static propTypes = {
    renderItems: PropTypes.func.isRequired
  }

  constructor(props){
    super(props)

    this.newData = true
    this.datas = this.props.datas || []
    this.itemCount = 0

    this.childStylePlus = this.props.childrenStyle || {}
    this.stylesPlus = this.props.containerStyle || {}
    this.renderItems = this.renderItems.bind(this)
    this.removeLoader = this.removeLoader.bind(this)
    this.generateStyles()
  }

  componentWillReceiveProps(nextProps){
    try
    {
      if(JSON.stringify(this.datas) != JSON.stringify(nextProps.datas))
        this.newData = true
    }catch(e)
    {
      this.newData = true
    }
    this.datas = nextProps.datas || []
  }


  componentDidMount(){
    this.removeLoader()
  }

  componentDidUpdate(){
    this.removeLoader()
  }

  removeLoader(){
    this.newData = false
    this.itemCount = 0
    setTimeout(()=>{
      if(this.refs.loader && !this.props.waitingData)
        this.refs.loader.unmountComponent()}
    , 500)
  }

  generateStyles(){
    this.styles = StyleSheet.create({
        container:  {
                      flex:1,
                      flexDirection:'column',
                      margin:5,
                      padding:5,
                      minWidth: 80,
                      minHeight: 90
                  },
    title:  {
          flex:0,
          textAlign:'center',
          fontSize:16,
          fontWeight:'bold'
        }
    })
  }

  renderItems(item, key){
    const colorStriped = ((key % 2) == 0)? Theme.color_striped.pair : Theme.color_striped.impair;
    return <View key={key} style={[this.childStylePlus, {backgroundColor: colorStriped}]}>{this.props.renderItems(item, key)}</View>
  }

  render(){
    this.itemCount = this.datas.length

    let content = <View />
    if(this.props.waitingData || this.newData)
      content = <Loader ref='loader' />
    else if(this.itemCount <= 0 && this.props.noItemText != 'none')
      content = <XText style={{padding:10}}>{this.props.noItemText || 'Aucun résultat trouvé'}</XText>

    return <View style={{flex:1}}>
                {isPresent(this.props.title) && <XText style={[this.styles.title, Theme.lists.title]}>{this.props.title}</XText>}
                <View style={[this.styles.container, Theme.lists.shape, this.stylesPlus]}>
                  {this.itemCount > 0 && this.datas.map((item, index) => {return this.renderItems(item, index)})}
                  { content }
               </View> 
           </View>
  }
}
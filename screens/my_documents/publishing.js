import React, { Component } from 'react'
import { View } from 'react-native'
import { SimpleButton, AnimatedBox, Navigator, XText } from '../../components'

import { Parameters } from '../../models'

import { Screen } from '../layout'
import { PiecesView } from './pieces_view'
import { PreseizuresView } from './preseizures_view'

class PublishScreen extends Component{
  constructor(props){
    super(props)

    const navigation = new Navigator(this.props.navigation)
    this.type =  navigation.getParams('type') || 'pack'
    this.show_preseizures = (Parameters.getParameter('show_preseizures') == 'false')? false : true
    this.filter = navigation.getParams('filter') || {}
    this.views = { 
                    pieces: { currentView: 'pieces', nextView: 'preseizures', nextTitle: '<< Pré-affectation >>' },
                    preseizures: { currentView: 'preseizures', nextView: 'pieces', nextTitle: '<< Pièces >>' }
                 }

    if(this.type == 'pack'){
      this.state = { currentView: this.views.pieces.currentView, nextView: this.views.pieces.nextView, nextTitle: this.views.pieces.nextTitle, initView: true }
      this.firstShowPieces = false
      this.firstShowPreseizures = true
    }
    else
    {
      this.state = { currentView: this.views.preseizures.currentView, nextView: this.views.preseizures.nextView, nextTitle: this.views.preseizures.nextTitle, initView: true }
      this.firstShowPieces = true
      this.firstShowPreseizures = false
    }

    this.changeView = this.changeView.bind(this)
  }

  componentDidMount(){
    setTimeout(()=>{
      this.refs.main_animated.start()
    }, 1300)
  }

  changeView(view = null){
    const action = ()=>{
      this.refs.main_animated.leave(async ()=>{
        if(isPresent(view)){
          let initView = false

          if(this.firstShowPreseizures && this.views[view].currentView == 'preseizures'){
            this.firstShowPreseizures = false
            initView = true
          }
          else if(this.firstShowPieces && this.views[view].currentView == 'pieces'){
            this.firstShowPieces = false
            initView = true
          }

          await this.setState({ currentView: this.views[view].currentView, nextView: this.views[view].nextView, nextTitle: this.views[view].nextTitle, initView: initView })
        }
        setTimeout(()=>{
          this.refs.main_animated.start()
        }, 200)
      })
    }

    actionLocker(action)
  }

  renderFilter(){
    if(isPresent(this.filter))
      return  <AnimatedBox type='blink' style={{flex:1, paddingRight: 10, alignItem: 'center', justifyContent: 'center'}}>
                <XText style={[{fontSize:10, fontWeight:"bold"}, Theme.head.text], {color:"#F7230C", marginLeft: 5, textAlign: 'center'}}>Filtre active</XText>
              </AnimatedBox>
    else
      return null
  }

  render(){
    return (
      <Screen style={{flex: 1, flexDirection: 'column'}}
              title='Pièces / Pré-affectations'
              name='Publish'
              options={this.renderFilter()}
              navigation={this.props.navigation}>
        <AnimatedBox ref='main_animated' startOnLoad={false} hideTillStart={true} style={{flex: 1}} type='UpSlide' durationIn={300} durationOut={200}>
          { this.state.currentView == 'pieces' && <PiecesView ref='pieces' initView={this.state.initView} navigation={ this.props.navigation }/> }
          { this.state.currentView == 'preseizures' && <PreseizuresView ref='preseizures' initView={this.state.initView} navigation={ this.props.navigation }/> }
        </AnimatedBox>
        {
          this.show_preseizures && this.type == 'pack' &&
          <View style={[{flex: 0}, Theme.head.shape, {padding: 1}]}>
            <SimpleButton title={this.state.nextTitle} CStyle={[{flex: 0, margin: 3}, Theme.secondary_button.shape, {paddingVertical: 3}]} TStyle={Theme.secondary_button.text} onPress={()=>this.changeView(this.state.nextView)} />
          </View>
        }
      </Screen>
    );
  }
}

export default PublishScreen;
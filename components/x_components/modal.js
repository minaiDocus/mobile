import React, { Component } from 'react'
import { Modal, View } from 'react-native'

import { AnimatedBox, XImage } from '../index'


export class XModal extends Component{
  constructor(props){
    super(props)

    this.state = { view: null, visible: this.props.visible || false }
    this.refreshView = true
    this.animated = null
    this.indication = (this.props.indication === false)? false : true

    this.animationType = this.props.animationType || 'none'
    this.onClose = this.props.onRequestClose || null

    let properties = Object.assign({}, this.props) //clone the props because of deletion

    delete properties.animationType
    delete properties.supportedOrientations
    delete properties.onRequestClose
    delete properties.visible
    delete properties.indication

    this.other_props = properties

    this.closeModal = this.closeModal.bind(this)
    this.prepareView = this.prepareView.bind(this)
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.visible === true)
      this.setState({ visible: true })
    else if(nextProps.visible === false)
      this.setState({ visible: false, view: null })
  }

  closeModal(callback){
    const close = () => {
       try{
          callback()
        }catch(e){}
    }

    if(this.animated)
      this.animated.leave(()=>{ close() })
    else
      close()
  }

  prepareView(){
    if(this.refreshView){
      this.refreshView = false

      setTimeout(async ()=>{
        let view = null
        if(this.animationType == 'none'){
          view = this.props.children
        }
        else{
          view =  <AnimatedBox ref={(self)=>this.animated = self} type={this.animationType || 'UpSlide'} durationIn={200} durationOut={200} style={{flex: 0, width: '100%', height:'100%'}}>
                    { this.props.children }
                  </AnimatedBox>
        }
        await this.setState({view: view})
        this.refreshView = true
      }, 1)
    }
  }

  render(){
    if(this.state.visible) this.prepareView()

    return  <Modal  visible={this.state.visible}
                    animationType='none'
                    supportedOrientations={['portrait', 'landscape']}
                    onRequestClose = {() =>{ if(this.onClose) this.onClose() }}
                    { ...this.other_props }
            >
              {!this.state.view && this.indication && <View style={{flex:0, alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}><XImage loader={true} width={40} height={40} /></View>}
              {this.state.view}
            </Modal>
  }
}

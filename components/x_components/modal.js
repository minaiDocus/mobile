import React, { Component } from 'react'
import { Modal } from 'react-native'

import { AnimatedBox } from '../index'


export class XModal extends Component{
  constructor(props){
    super(props)

    this.state = { visible: this.props.visible || false }

    this.animationType = this.props.animationType || 'none'
    this.onClose = this.props.onRequestClose || null

    let properties = Object.assign({}, this.props) //clone the props because of deletion

    delete properties.animationType
    delete properties.supportedOrientations
    delete properties.onRequestClose
    delete properties.visible

    this.other_props = properties

    this.closeModal = this.closeModal.bind(this)
  }

  componentWillReceiveProps(nextProps){
    if(typeof(nextProps.visible))
      this.setState({ visible: nextProps.visible })
  }

  closeModal(callback){
    const close = () => {
       try{
          callback()
        }catch(e){}
    }

    if(this.refs.main_animated)
      this.refs.main_animated.leave(()=>{ close() })
    else
      close()
  }

  render(){
    return  <Modal  visible={this.state.visible}
                    animationType='none'
                    supportedOrientations={['portrait', 'landscape']}
                    onRequestClose = {() =>{ if(this.onClose) this.onClose() }}
                    { ...this.other_props }
            >
              {this.animationType == 'none' && this.props.children}
              {
                this.animationType != 'none' &&
                <AnimatedBox ref={'main_animated'} type={this.animationType || 'UpSlide'} durationIn={200} durationOut={200} style={{flex: 0, width: '100%', height:'100%'}}>
                  { this.props.children }
                </AnimatedBox>
              }
            </Modal>
  }
}

import React, { Component } from 'react'
import Config from '../Config'
import {View, Animated} from 'react-native'

class AnimatedBox extends Component{
  constructor(props){
    super(props)

    this.state = {ready: false, cssAnim: 0}

    this.animationIn = this.animationIn.bind(this)
    this.animationOut = this.animationOut.bind(this)
    this.initAnimation = this.initAnimation.bind(this)
    this.leave = this.leave.bind(this)
    this.onLayoutOnce = this.onLayoutOnce.bind(this)

    //parameters
    this.startSpace = this.props.startSpace || 0
    this.durationIn = this.props.durationIn || 500
    this.durationOut = this.props.durationOut || 500
    this.type = this.props.type || 'LeftSlide'

    this.callbackIn = this.props.callbackIn || null
  }

  initAnimation(){
    if(this.type == 'LeftSlide') // animation from left to the right
    {
      this.startAnim = (this.width * -1) + (this.startSpace)
      this.endAnim = 0
      this.css = 'left'
    }
    else if(this.type == 'RightSlide') //animation from right to the left
    {
      this.startAnim = (this.width * -1) + (this.startSpace)
      this.endAnim = 0
      this.css = 'right'
    }
    else if(this.type == 'UpSlide') //animation from bottom to top
    {
      this.startAnim = (this.height) + (this.startSpace)
      this.endAnim = 0
      this.css = 'top'
    }
    else if(this.type == 'DownSlide') //animation from top to bottom
    {
      this.startAnim = (this.height * -1) + (this.startSpace)
      this.endAnim = 0
      this.css = 'top'
    }
    else if(this.type == 'fade') //animation from top to bottom
    {
      this.startAnim = 0
      this.endAnim = 1
      this.css = 'opacity'
    }
  }

  async onLayoutOnce(event){
    if(!this.state.ready)
    {
      let {width, height} = event.nativeEvent.layout
      this.width = width
      this.height = height

      this.initAnimation()
      await this.setState({cssAnim: new Animated.Value(this.startAnim), ready: true})
      this.animationIn()
    }
  }

  leave(callbackOut=null){
    this.animationOut(callbackOut)
  }

  animationIn(){
    try{
      Animated.timing(                  // Animate over time
        this.state.cssAnim,            // The animated value to drive
        {
          toValue: this.endAnim,                   // Animate to opacity: 1 (opaque)
          duration: this.durationIn,              // Make it take a while
        }
      ).start(this.callbackIn)
    }
    catch(e){
      this.setState({cssAnim: this.endAnim})
      this.callbackIn
    }
  }

  animationOut(callbackOut){
    try{
      Animated.timing(                  // Animate over time
        this.state.cssAnim,            // The animated value to drive
        {
          toValue: this.startAnim,                   // Animate to opacity: 1 (opaque)
          duration: this.durationOut,              // Make it take a while
        }
      ).start(callbackOut)
    }
    catch(e){
      this.setState({cssAnim: this.startAnim})
      callbackOut
    }
  }

  render(){
    const stylePlus = this.props.style
    let animationStyle = {}
    switch(this.css)
    {
      case 'left': animationStyle = {left: this.state.cssAnim}; break;
      case 'right': animationStyle = {right: this.state.cssAnim}; break;
      case 'top': animationStyle = {top: this.state.cssAnim}; break;
      case 'opacity': animationStyle = {opacity: this.state.cssAnim}; break;
    }

    const opacity = this.state.ready? {opacity:1} : {opacity:0}

    return  <Animated.View style={[stylePlus, animationStyle, opacity]} onLayout={this.onLayoutOnce} >
              {this.props.children}
            </Animated.View>
  }
}

export default AnimatedBox
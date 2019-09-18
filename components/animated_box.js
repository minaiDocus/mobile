import React, { Component } from 'react'
import {View, Animated} from 'react-native'
import {XText} from './index'

export class AnimatedBox extends Component{
  static currentAnimationNumbers=0
  static maxAnimationNumbers=30

  constructor(props){
    super(props)

    this.state = { ready: false, manualMove: false, cssAnim: 0, translateX: 0, translateY: 0, scaleW:0, scaleH: 0, size:{ width:0, height: 0 }, positionXY: { left: 0, top:0 }, transOpacity: (this.props.animateOpacity ? new Animated.Value(0) : new Animated.Value(1)) }

    this.startOnLoad = (this.props.startOnLoad === false)? false : true
    this.hideTillStart = (this.props.hideTillStart)? true : false

    this.lastDx = this.lastDy = 0
    this.moveGotParams = false
    this.isAnimated = false
    this.isLoopAnimation = false
    this.isStarting = false
    this.isLeaving = false
    this.animateOpacity = this.props.animateOpacity || false
    this.isLeaved = true
    this.abortLoop = false

    this.getLayout = false

    this.animations = []

    this.animationIn = this.animationIn.bind(this)
    this.animationOut = this.animationOut.bind(this)
    this.initAnimation = this.initAnimation.bind(this)
    this.leave = this.leave.bind(this)
    this.start = this.start.bind(this)
    this.onLayoutOnce = this.onLayoutOnce.bind(this)
    this.forceAnimation = this.props.forceAnimation || false

    this.startAnim = this.props.startAnim || null
    this.endAnim = this.props.endAnim || null

    //parameters
    this.current_position = { x: 0, y: 0 }
    this.durationIn = this.props.durationIn || 500
    this.durationOut = this.props.durationOut || 500
    this.type = this.props.type || 'LeftSlide'

    this.callbackIn = this.props.callbackIn || null
  }

  componentWillReceiveProps(nextProps){
    if(typeof(nextProps.type) !== "undefined") this.type = nextProps.type
    if(typeof(nextProps.callbackIn) !== "undefined") this.callbackIn = nextProps.callbackIn
    if(typeof(nextProps.startAnim) !== "undefined") this.startAnim = nextProps.startAnim
    if(typeof(nextProps.endAnim) !== "undefined") this.endAnim = nextProps.endAnim
    if(typeof(nextProps.durationIn) !== "undefined") this.durationIn = nextProps.durationIn
    if(typeof(nextProps.durationOut) !== "undefined") this.durationOut = nextProps.durationOut
  }

  initAnimation(){
    this.lastDx = this.lastDy = 0
    this.moveGotParams = false
    this.isLoopAnimation = false

    if(this.type == 'LeftSlide') // animation from left to the right
    {
      this.startAnim = (this.startAnim !== null)? this.startAnim : (this.current_position.x - this.width)
      this.endAnim = 0
      this.css = 'left'
    }
    else if(this.type == 'RightSlide') //animation from right to the left
    {
      this.startAnim = (this.startAnim !== null)? this.startAnim : (this.current_position.x + this.width)
      this.endAnim = 0
      this.css = 'left'
    }
    else if(this.type == 'UpSlide') //animation from bottom to top
    {
      this.startAnim = (this.startAnim !== null)? this.startAnim : (this.current_position.y + this.height)
      this.endAnim = 0
      this.css = 'top'
    }
    else if(this.type == 'DownSlide') //animation from top to bottom
    {
      this.startAnim = (this.startAnim !== null)? this.startAnim : (this.current_position.y - this.height)
      this.endAnim = 0
      this.css = 'top'
    }
    else if(this.type == 'fade')
    {
      this.startAnim = (this.startAnim !== null)? this.startAnim : 0
      this.endAnim = 1
      this.css = 'opacity'
    }
    else if(this.type == 'blink')
    {
      this.startAnim = (this.startAnim !== null)? this.startAnim : 0
      this.endAnim = 1
      this.css = 'opacity'
      this.forceAnimation = true
      this.isLoopAnimation = true
      this.callbackIn = ()=>{this.animationOut(this.animationIn)}
    }
    else if(this.type == 'HorizontalGliss') //loop animation from left to right 
    {
      this.startAnim = (this.startAnim !== null)? this.startAnim : this.props.startAnim
      this.endAnim = (this.endAnim !== null)? this.endAnim : this.props.endAnim
      this.css = 'left'
      this.forceAnimation = true
      this.isLoopAnimation = true
      this.callbackIn = ()=>{this.animationOut(this.animationIn)}
    }
    else if(this.type == 'VerticalGliss') //loop animation from Top to Bottom 
    {
      this.startAnim = (this.startAnim !== null)? this.startAnim : this.props.startAnim
      this.endAnim = (this.endAnim !== null)? this.endAnim : this.props.endAnim
      this.css = 'top'
      this.forceAnimation = true
      this.isLoopAnimation = true
      this.callbackIn = ()=>{this.animationOut(this.animationIn)}
    }
    else if(this.type == 'transform') //move the element to porition { x: A, y: B } OR/AND scale to { w: A, h: B}
    {
      this.startX = (this.props.startPosition && this.props.startPosition.x)? this.props.startPosition.x : this.current_position.x
      this.startY = (this.props.startPosition && this.props.startPosition.y)? this.props.startPosition.y : this.current_position.y

      this.endX = (this.props.endPosition && this.props.endPosition.x)? this.props.endPosition.x : 0
      this.endY = (this.props.endPosition && this.props.endPosition.y)? this.props.endPosition.y : 0

      this.startW = (this.props.startPosition && this.props.startPosition.w)? this.props.startPosition.w : this.width
      this.startH = (this.props.startPosition && this.props.startPosition.h)? this.props.startPosition.h : this.height

      this.endW = (this.props.endPosition && this.props.endPosition.w)? this.props.endPosition.w : this.width
      this.endH = (this.props.endPosition && this.props.endPosition.h)? this.props.endPosition.h : this.height

      this.css = 'translation'
    }
  }

  async onLayoutOnce(event){
    if(!this.getLayout)
    {
      this.getLayout = true

      let {x, y, width, height} = event.nativeEvent.layout
      this.width = width
      this.height = height

      if(this.current_position === undefined)
        this.current_position = { x: x, y: y }

      if(this.startOnLoad)
        this.start()
      else if(!this.hideTillStart)
        this.setState({ ready: true })
    }
  }

  start(callbackIn=null){
    if(!this.isLeaved){
      setTimeout(()=>{ try{callbackIn()}catch(e){} }, 1)
    }
    else{
      setTimeout(async ()=>{
        if(!this.isStarting)
        {
          this.isStarting = true
          this.abortLoop = false

          if(AnimatedBox.currentAnimationNumbers > AnimatedBox.maxAnimationNumbers && !this.forceAnimation)
          {
            const waitForStrat = ()=>{
              const self = this
              setTimeout(()=>{
                this.isStarting = false
                self.start(callbackIn)
              }, 50)
            }

            waitForStrat()
          }
          else
          {
            await this.reset()
            this.animationIn(callbackIn)
          }
        }
     }, 10)
    }
  }

  async reset(){
    this.initAnimation()

    if(this.type == 'transform')
    {
      await this.setState({
        translateX: new Animated.Value(this.startX),
        translateY: new Animated.Value(this.startY),
        scaleW: new Animated.Value(this.startW),
        scaleH: new Animated.Value(this.startH),
        manualMove: false, ready: true
      })
    }
    else
    {
      let sValue = this.startAnim
      if(this.state.manualMove)
      {
        if(this.css == 'left')
          sValue = this.current_position.x || this.startAnim
        else if(this.css == 'top')
          sValue = this.current_position.y || this.startAnim
      }
      await this.setState({cssAnim: new Animated.Value(sValue), manualMove: false, ready: true})
    }
  }

  leave(callbackOut=null){
    if(this.isLeaved){
      setTimeout(()=>{ try{callbackOut()}catch(e){} }, 1)
    }
    else{
      setTimeout(async ()=>{
        if(!this.isLeaving)
        {
          this.isLeaving = true
          this.abortLoop = false

          if(AnimatedBox.currentAnimationNumbers > AnimatedBox.maxAnimationNumbers && !this.forceAnimation)
          {
            const waitForLeave = ()=>{
              const self = this
              setTimeout(()=>{
                this.isLeaving = false
                self.leave(callbackOut)
              }, 50)
            }

            waitForLeave()
          }
          else
          {
            this.moveGotParams = false

            if(this.type == 'transform'){
              await this.setState({
                translateX: new Animated.Value(this.endX),
                translateY: new Animated.Value(this.endY),
                scaleW: new Animated.Value(this.endW),
                scaleH: new Animated.Value(this.endH),
                manualMove: false, ready: true
              })
            }
            else{
              let sValue = this.endAnim
              if(this.state.manualMove)
              {
                if(this.css == 'left')
                  sValue = this.current_position.x || this.endAnim
                else if(this.css == 'top')
                  sValue = this.current_position.y || this.endAnim
              }
              await this.setState({cssAnim: new Animated.Value(sValue), manualMove: false, ready: true})
            }

            this.animationOut(callbackOut)
          }
        }
      }, 10)
    }
  }

  stop(){
    if(this.isLoopAnimation)
    {
      // Animated.timing(this.state.cssAnim).stop()
      this.abortLoop = true
      this.isStarting = false
      this.isLeaving = false
      this.isLeaved = true
    }
  }

  move(options={}){
    let movementX = (!this.moveGotParams)? (options.startX || this.current_position.x) : this.current_position.x
    let movementY = (!this.moveGotParams)? (options.startY || this.current_position.y) : this.current_position.y
    let startOpacity = (!this.moveGotParams)? (options.startOpacity || this.state.transOpacity) : this.state.transOpacity
    let movementXDirection = 'left'
    let movementYDirection = 'bottom'

    if(!this.moveGotParams)
      this.moveGotParams = true

    if(options.x !== undefined)
    {
      movementX = options.x
    }
    else if(options.dx !== undefined)
    {
      if(options.dx > 0)
        movementXDirection = 'left'
      else
        movementXDirection = 'right'

      let testX = movementX
      testX = testX + (options.dx - this.lastDx)
      if(testX >= options.limitX[0] && testX <= options.limitX[1])
      {
        movementX = testX
        this.lastDx = options.dx
      }
    }

    if(options.y !== undefined)
    {
      movementY = options.y
    }
    else if(options.dy !== undefined)
    {
      if(options.dy > 0)
        movementYDirection = 'bottom'
      else
        movementYDirection = 'top'

      let testY = movementY
      testY = testY + (options.dy - this.lastDy)
      if(testY >= options.limitX[0] && testY <= options.limitX[1])
      {
        movementY = testY
        this.lastDy = options.dy
      }
    }

    if(options.animateOpacity === undefined)
    {
      opacity = 1
    }
    else
    {
      let startOp = options.animateOpacity.start

      opacity = ((Math.abs(movementX) * 100) / Math.abs(startOp))

      if(startOp < 0)
        opacity = 100 - opacity

      opacity = opacity / 100
    }

    this.current_position.x = movementX
    this.current_position.y = movementY

    this.setState({ manualMove: true, ready: true, positionXY: { left: movementX, top: movementY }, transOpacity: new Animated.Value(opacity) })
  }

  animationIn(callbackIn=null){
    if(!this.isAnimated){
      this.isAnimated = true
      if(!this.forceAnimation) AnimatedBox.currentAnimationNumbers += 1

      const final_callback = () => {
        if(!this.forceAnimation) AnimatedBox.currentAnimationNumbers -= 1
        this.isStarting = false
        this.isLeaved = false
        this.isAnimated = false

        if(!this.isLoopAnimation || (!this.abortLoop && this.isLoopAnimation))
        {
          try
          {
            callbackIn()
          }
          catch(e)
          { 
            try{ this.callbackIn() }
            catch(e){} 
          }
        }
      }

      this.animations = this.simpleAnimationIn()

      if(this.type == 'transform')
        this.animations = this.transformAnimationIn()

      try{
        Animated.parallel(this.animations, { stopTogether: false }).start(()=>{ final_callback() })
      }
      catch(e){
        final_callback()
      }
    }
  }

  animationOut(callbackOut=null){
    if(!this.isAnimated){
      this.isAnimated = true
      if(!this.forceAnimation) AnimatedBox.currentAnimationNumbers += 1

      const final_callback = () => {
        if(!this.forceAnimation) AnimatedBox.currentAnimationNumbers -= 1
        this.isLeaving = false
        this.isLeaved = true
        this.isAnimated = false

        if(!this.isLoopAnimation || (!this.abortLoop && this.isLoopAnimation))
        {
          try{ callbackOut() }
          catch(e){}
        }
      }

      this.animations = this.simpleAnimationOut()
      if(this.type == 'transform')
        this.animations = this.transformAnimationOut()

      try{
        Animated.parallel(this.animations, { stopTogether: false }).start(()=>{ final_callback() })
      }
      catch(e){
        final_callback()
      }
    }
  }

  transformAnimationIn(){
    let anims = []

    anims.push(
      Animated.timing(
       this.state.translateX,
       {
         toValue: this.endX,
         duration: this.durationIn,
       })
    )
    if(this.startY != this.endY)
    {
      anims.push(
        Animated.timing(
         this.state.translateY,
         {
           toValue: this.endY,
           duration: this.durationIn
         })
      )
    }
    if(this.startW != this.endW)
    {
      anims.push(
        Animated.timing(
         this.state.scaleW,
         {
           toValue: this.endW,
           duration: this.durationIn
         })
      )
    }
    if(this.startH != this.endH)
    {
      anims.push(
        Animated.timing(
         this.state.scaleH,
         {
           toValue: this.endH,
           duration: this.durationIn
         })
      )
    }

    return anims
  }

  transformAnimationOut(){
    let anims = []

    anims.push(
      Animated.timing(
       this.state.translateX,
       {
         toValue: this.startX,
         duration: this.durationIn,
       })
    )

    if(this.startY != this.endY)
    {
      anims.push(
        Animated.timing(
         this.state.translateY,
         {
           toValue: this.startY,
           duration: this.durationIn
         })
      )
    }
    if(this.startW != this.endW)
    {
      anims.push(
        Animated.timing(
         this.state.scaleW,
         {
           toValue: this.startW,
           duration: this.durationIn
         })
      )
    }
    if(this.startH != this.endH)
    {
      anims.push(
        Animated.timing(
         this.state.scaleH,
         {
           toValue: this.startH,
           duration: this.durationIn
         })
      )
    }

    return anims
  }

  simpleAnimationIn(){
    let anim = [
                Animated.timing(                 // Animate over time
                  this.state.cssAnim,            // The animated value to drive
                  {
                    toValue: this.endAnim,
                    duration: this.durationIn,              // Make it take a while
                  }
                  )
                ]

    if(this.css != 'opacity' && this.animateOpacity){
      anim.push(  
                  Animated.timing(                
                    this.state.transOpacity,
                    {
                      toValue: 1,
                      duration: this.durationIn,
                    })
                )
    }

    return anim
  }

  simpleAnimationOut(){
    let anim = [
                Animated.timing(                  // Animate over time
                  this.state.cssAnim,            // The animated value to drive
                  {
                    toValue: this.startAnim,
                    duration: this.durationOut,              // Make it take a while
                  }
                )
               ]

    if(this.css != 'opacity' && this.animateOpacity){
      anim.push(  
                  Animated.timing(                
                    this.state.transOpacity,
                    {
                      toValue: 0,
                      duration: this.durationOut,
                    })
                )
    }

    return anim
  }

  render(){
    const stylePlus = this.props.style
    let animationStyle = []

    if(this.state.manualMove)
    {
      animationStyle = [this.state.positionXY, { opacity: this.state.transOpacity }]
    }
    else
    {
      switch(this.css)
      {
        case 'left': animationStyle = [{left: this.state.cssAnim}]; break;
        case 'top': animationStyle = [{top: this.state.cssAnim}]; break;
        case 'opacity': animationStyle = [{opacity: this.state.cssAnim}]; break;
        case 'translation': animationStyle = [{top: this.state.translateY, left: this.state.translateX, maxWidth: this.state.scaleW, maxHeight: this.state.scaleH}]; break;
      }

      if(this.css != 'opacity' && this.animateOpacity)
        animationStyle.push({ opacity: this.state.transOpacity })
    }

    const visibility = this.state.ready? {opacity:1} : {opacity:0}
    const final_style = [stylePlus, visibility, animationStyle]

    return  <Animated.View style={final_style} onLayout={this.onLayoutOnce}>
              {this.props.children}
            </Animated.View>
  }
}
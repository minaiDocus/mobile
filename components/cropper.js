import React, { Component } from 'react'
import {View, PanResponder, Animated, Image, StyleSheet, Platform, Modal, ImageEditor, ImageStore} from 'react-native'
import {SimpleButton, ImageButton} from './buttons'

import { EventRegister } from 'react-native-event-listeners'

export class Cropper {
  static cropListener = null;
  static callback;

  static openCrop(options={}, callback){
    if(Cropper.cropListener == null)
    {
      Cropper.cropListener = EventRegister.on("validateCrop", (image)=>{
        Cropper.callback(image)
        EventRegister.rm(Cropper.cropListener)
        Cropper.cropListener = null
      })
    }

    Cropper.callback = callback
    EventRegister.emit("openCropper", options)
  }
}

class CropperGrill extends Component{
  constructor(props){
    super(props)

    this.state = {widthGrill: this.props.width, heightGrill: this.props.height}

    this.generateStyles()
  }

  componentWillReceiveProps(nextProps){
    this.setState({widthGrill: nextProps.width, heightGrill: nextProps.height})
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      content:{
                flex:0,
                flexDirection:'column',
                backgroundColor:'rgba(255,255,255,0.3)',
              },
      grill: {
                  flex:1,
                  borderWidth:this.props.borderGrill,
                  borderColor:'#FFF'
              },
      coin: {
              backgroundColor:'rgba(150,150,255, 0.2)'
            }
    })
  }

  renderGrill(number=1){
    let grill = []
    for(num=0; num<number; num++)
    {
      grill.push(<View key={num} style={this.styles.grill} {...this.props.panResponder.panHandlers}/>)
    }
    return grill.map((elem)=>{return elem})
  }

  render(){
    return <View style={[this.styles.content, {width: this.state.widthGrill, height: this.state.heightGrill}]}>
              <View style={{flex:1, flexDirection:'row'}}>
                <View style={[this.styles.grill, this.styles.coin]} {...this.props.topLeftPan.panHandlers}/>
                {this.renderGrill(1)}
                <View style={[this.styles.grill, this.styles.coin]} {...this.props.topRightPan.panHandlers}/>
              </View>
              <View style={{flex:1, flexDirection:'row'}}>
                {this.renderGrill(3)}
              </View>
              <View style={{flex:1, flexDirection:'row'}}>
                <View style={[this.styles.grill, this.styles.coin]} {...this.props.bottomLeftPan.panHandlers}/>
                {this.renderGrill(1)}
                <View style={[this.styles.grill, this.styles.coin]} {...this.props.bottomRightPan.panHandlers}/>
              </View>
           </View>
  }
}

export class CropperView extends Component{
  constructor(props){
    super(props)

    this.minWidthCrop = 150
    this.minHeightCrop = 150

    this.state = {open: false, widthCrop: this.minWidthCrop, heightCrop: this.minHeightCrop, url_output: null, remake: false}

    this.createPanResponder = this.createPanResponder.bind(this)
    this.restartResponder = this.restartResponder.bind(this)
    this.initialize = this.initialize.bind(this)
    this.initializePAN = this.initializePAN.bind(this)
    this.processCropping = this.processCropping.bind(this)
    this.createFinaleImage = this.createFinaleImage.bind(this)
    this.moveXY = this.moveXY.bind(this)
    this.scaleTopLeft = this.scaleTopLeft.bind(this)
    this.scaleTopRight = this.scaleTopRight.bind(this)
    this.scaleBottomLeft = this.scaleBottomLeft.bind(this)
    this.scaleBottomRight = this.scaleBottomRight.bind(this)
    this.scaleAll = this.scaleAll.bind(this)
    this.updateShape = this.updateShape.bind(this)
  }

  componentWillMount(){
    this.openCropListener = EventRegister.on("openCropper", (options)=>{
      this.initialize(options)
    })
  }

  componentWillUnmount(){
    EventRegister.rm(this.openCropListener)
  }

  handleLayoutContent(event){
    if(!this.state.remake)
    {
      let {x, y, width, height} = event.nativeEvent.layout
      this.contentSize = {x: x, y: y, width: width, height: height}
      
      this.calculateWorkingImage()
      this.initPositionCropper()
    }
  }

  closeCropper(){
    this.setState({open: false})
  }

  restartResponder(){
    this.moveType = null
    this.lastDistanceX = this.lastDistanceY = this.lastGestureScaleX = this.lastGestureScaleY = 0
    this.lastGestureAx = this.lastGestureAy = this.lastGestureBx = this.lastGestureBy = 0  
  }

  initialize(options){
    this.contentSize = {x: 0, y: 0, width: 0, height: 0}
    this.working_image = {x: 0, y: 0, lx: 0, ly: 0, width: 0, height: 0}
    this.final_image = {width: 0, height: 0, path: null, filename: null, mime: null}

    this.moveType = null
    this.padding = 15
    this.borderGrill = 0.5

    this.original_image = options.img
    
    this.source = this.original_image.path.toString()
    
    this.pointA = {x:0, y:0}
    this.lastPointA = {x:0, y:0}
    this.lastGestureAx = 0
    this.lastGestureAy = 0
 
    this.pointB = {x:0, y:0}
    this.lastPointB = {x:0, y:0}
    this.lastGestureBx = 0
    this.lastGestureBy = 0

    this.lastGestureScaleX = this.lastGestureScaleY = 0
    this.lastDistanceX = this.lastDistanceY = 0

    this.animatedTranslateX = new Animated.Value(this.pointA.x)
    this.animatedTranslateY = new Animated.Value(this.pointA.y)

    this.initializePAN()
    
    Image.getSize(this.source,
      (width, height)=>{
        this.original_image.width = width
        this.original_image.height = height
        this.setState({open: true, url_output: null, remake: false})
      },
      (_faillure)=>{
        Notice.alert("Erreur", "Erreur lors du chargement de l'image veuillez réessayer!!")
      }
    )
  }

  createPanResponder(_move_function){
    return PanResponder.create({
              onStartShouldSetPanResponder: (evt, gestureState) => true,
              onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
              onMoveShouldSetPanResponder: (evt, gestureState) => true,
              onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
              onPanResponderTerminationRequest: (evt, gestureState) => false,
              onPanResponderGrant: (evt, gestureState) => {this.restartResponder()},
              onPanResponderMove: (evt, gestureState) => { _move_function(evt, gestureState) },
              onPanResponderRelease: (evt, gestureState) => {this.restartResponder()},
              onPanResponderTerminate: (evt, gestureState)=> {}
          })
  }

  initializePAN(){
    this.topLeftPan = this.createPanResponder(this.scaleTopLeft)
    this.topRightPan = this.createPanResponder(this.scaleTopRight)

    this.bottomLeftPan = this.createPanResponder(this.scaleBottomLeft)
    this.bottomRightPan = this.createPanResponder(this.scaleBottomRight)

    this.boxPanResponder = this.createPanResponder(this.moveXY)
  }

  calculateWorkingImage(){
    if(Platform.OS == "ios" || ((this.contentSize.width <= this.contentSize.height) && (this.original_image.width >= this.original_image.height)) || ((this.contentSize.width > this.contentSize.height) && (this.original_image.width > this.original_image.height)) )
    { 
      this.working_image.width = this.contentSize.width
      this.working_image.height = (this.original_image.height / this.original_image.width) * this.working_image.width
    }
    else
    {
      this.working_image.height = this.contentSize.height
      this.working_image.width = (this.original_image.width / this.original_image.height) * this.working_image.height
    }

    this.working_image.x = (this.padding + (this.contentSize.width / 2)) - (this.working_image.width / 2)
    this.working_image.y = (this.padding + (this.contentSize.height / 2)) - (this.working_image.height / 2)

    this.working_image.lx = this.working_image.x + this.working_image.width
    this.working_image.ly = this.working_image.y + this.working_image.height

    this.minWidthCrop = this.working_image.width * 0.3
    this.minHeightCrop = this.working_image.height * 0.3

    if(typeof(this.original_image.cropWithRotation) !== "undefined")
    {
      this.cropWithRotation = this.original_image.cropWithRotation
    }
    else
    {
      this.cropWithRotation = false
      if(this.original_image.width < this.original_image.height && Platform.OS != 'ios')
      {
        this.cropWithRotation = true
      }
    }
  }

  initPositionCropper(){
    this.pointA.x = this.working_image.x
    this.pointA.y = this.working_image.y
    this.lastPointA.x = this.working_image.x
    this.lastPointA.y = this.working_image.y

    this.pointB.x = this.pointA.x + this.minWidthCrop
    this.pointB.y = this.pointA.y + this.minHeightCrop
    this.lastPointB.x = this.pointB.x
    this.lastPointB.y = this.pointB.y

    this.updateShape()
  }

  performMouvement(evt, gestureState, movement){
    const {changedTouches} = evt.nativeEvent
    if (changedTouches.length <= 1)
    {
      movement(evt, gestureState)
    }
    else
    {
      this.moveType = "scale"
      this.scaleAll(changedTouches, gestureState)
    }
  }

  moveXY(evt, gestureState){
    const movement = (evt, gestureState)=>{
      if(this.moveType == null || this.moveType == "translation")
      {
        this.moveType = "translation"
        const distanceX = (this.lastGestureAx === 0) ? 0 : gestureState.dx - this.lastGestureAx
        const distanceY = (this.lastGestureAy === 0) ? 0 : gestureState.dy - this.lastGestureAy

        this.pointA.x += distanceX 
        this.pointA.y += distanceY 

        this.lastGestureAx = gestureState.dx
        this.lastGestureAy = gestureState.dy

        this.updateShape(true)
      }
    }

    this.performMouvement(evt, gestureState, movement)
  }

  scaleTopLeft(evt, gestureState){
    const movement = (evt, gestureState)=>{
      this.moveType = "scale"
      if(this.moveType == null || this.moveType == "scale")
      {
          this.pointA.x += (this.lastGestureAx == 0) ? 0 : gestureState.dx - this.lastGestureAx
          this.pointA.y += (this.lastGestureAy == 0) ? 0 : gestureState.dy - this.lastGestureAy

          this.lastGestureAx = gestureState.dx
          this.lastGestureAy = gestureState.dy

          this.updateShape()
      }
    }

    this.performMouvement(evt, gestureState, movement)
  }

  scaleTopRight(evt, gestureState){
    const movement = (evt, gestureState)=>{
      this.moveType = "scale"
      if(this.moveType == null || this.moveType == "scale")
      {
        this.pointA.y += (this.lastGestureAy == 0) ? 0 : gestureState.dy - this.lastGestureAy
        this.pointB.x += (this.lastGestureBx == 0) ? 0 : gestureState.dx - this.lastGestureBx

        this.lastGestureAy = gestureState.dy
        this.lastGestureBx = gestureState.dx

        this.updateShape()
      }
    }

    this.performMouvement(evt, gestureState, movement)
  }

  scaleBottomLeft(evt, gestureState){
    const movement = (evt, gestureState)=>{
      this.moveType = "scale"
      if(this.moveType == null || this.moveType == "scale")
      {
        this.pointA.x += (this.lastGestureAx == 0) ? 0 : gestureState.dx - this.lastGestureAx
        this.pointB.y += (this.lastGestureBy == 0) ? 0 : gestureState.dy - this.lastGestureBy

        this.lastGestureAx = gestureState.dx
        this.lastGestureBy = gestureState.dy

        this.updateShape()
      }
    }

    this.performMouvement(evt, gestureState, movement)
  }

  scaleBottomRight(evt, gestureState){
    const movement = (evt, gestureState)=>{
      this.moveType = "scale"
      if(this.moveType == null || this.moveType == "scale")
      {
        this.pointB.x += (this.lastGestureBx == 0) ? 0 : gestureState.dx - this.lastGestureBx
        this.pointB.y += (this.lastGestureBy == 0) ? 0 : gestureState.dy - this.lastGestureBy

        this.lastGestureBx = gestureState.dx
        this.lastGestureBy = gestureState.dy

        this.updateShape()
      }
    }

    this.performMouvement(evt, gestureState, movement)
  }

  scaleAll(changedTouches, gestureState){
    if(this.moveType == null || this.moveType == "scale")
    {
      const distanceX = Math.abs(changedTouches[0].pageX - changedTouches[1].pageX)
      const distanceY = Math.abs(changedTouches[0].pageY - changedTouches[1].pageY)

      // const distanceX = gestureState.dx
      // const distanceY = gestureState.dy

      let scaleX = distanceX - this.lastGestureScaleX
      let scaleY = distanceY - this.lastGestureScaleY

      // scaleX = (this.lastDistanceX < distanceX)? scaleX : scaleX * -1
      // scaleY = (this.lastDistanceY < distanceY)? scaleY : scaleY * -1

      // const moveX = (scaleX < this.lastGestureScaleX)? (cumulatedX * -1) / 2 : (cumulatedX) / 2 
      // const moveY = (scaleY < this.lastGestureScaleY)? (cumulatedY * -1) / 2 : (cumulatedY) / 2 
      const moveX = (this.lastGestureScaleX == 0) ? 0 : scaleX / 2
      const moveY = (this.lastGestureScaleY == 0) ? 0 : scaleY / 2

      this.pointA.x -= moveX
      this.pointA.y -= moveY

      this.pointB.x += moveX
      this.pointB.y += moveY

      this.lastGestureScaleX = distanceX
      this.lastGestureScaleY = distanceY

      // this.lastDistanceX = distanceX
      // this.lastDistanceY = distanceY

      this.updateShape()
    }
  }

  async updateShape(translate_only=false){
    if(this.pointA.x < this.working_image.x)
      this.pointA.x = this.working_image.x
    if(this.pointA.y < this.working_image.y)
      this.pointA.y = this.working_image.y
    
    if(translate_only)
    {
      this.pointB.x = this.pointA.x + this.state.widthCrop
      this.pointB.y = this.pointA.y + this.state.heightCrop
      
      if(this.pointB.x > this.working_image.lx)
      {
        this.pointB.x = this.working_image.lx
        this.pointA.x = this.pointB.x - this.state.widthCrop
      }
      if(this.pointB.y > this.working_image.ly)
      {
        this.pointB.y = this.working_image.ly
        this.pointA.y = this.pointB.y - this.state.heightCrop
      }
    }
    else
    {
      if(this.pointB.x > this.working_image.lx)
        this.pointB.x = this.working_image.lx
      if(this.pointB.y > this.working_image.ly)
        this.pointB.y = this.working_image.ly

      const currWidth = Math.abs(this.pointB.x - this.pointA.x)
      if(currWidth < this.minWidthCrop)
      {
        if(this.lastPointA.x != this.pointA.x && this.lastPointB.x == this.pointB.x){
          this.pointA.x = this.pointB.x - this.minWidthCrop
        }
        else if(this.lastPointA.x == this.pointA.x && this.lastPointB.x != this.pointB.x){
          this.pointB.x = this.pointA.x + this.minWidthCrop
        }
        else{
          this.pointA.x = this.lastPointA.x
          this.pointB.x = this.pointA.x + this.minWidthCrop
        }
      }

      const currHeight = Math.abs(this.pointB.y - this.pointA.y)
      if(currHeight < this.minHeightCrop)
      {
        if(this.lastPointA.y != this.pointA.y && this.lastPointB.y == this.pointB.y){
          this.pointA.y = this.pointB.y - this.minHeightCrop
        }
        else if(this.lastPointA.y == this.pointA.y && this.lastPointB.y != this.pointB.y){
          this.pointB.y = this.pointA.y + this.minHeightCrop
        }
        else{
          this.pointA.y = this.lastPointA.y
          this.pointB.y = this.pointA.y + this.minHeightCrop
        }
      }
      
      await this.setState({
            widthCrop: this.pointB.x - this.pointA.x, 
            heightCrop: this.pointB.y - this.pointA.y
        })
    }

    this.lastPointA.x = this.pointA.x
    this.lastPointA.y = this.pointA.y

    this.lastPointB.x = this.pointB.x
    this.lastPointB.y = this.pointB.y

    await this.animatedTranslateX.setValue(this.pointA.x)
    await this.animatedTranslateY.setValue(this.pointA.y)
  }

  rotatePlane(Xorg, Yorg, widthOrg, heightOrg){
    const Xend = Xorg + widthOrg
    return {x: Yorg, y: (this.original_image.width - Xend), w: heightOrg, h: widthOrg}
  }

  remakeCrop(){
    if(Platform.OS == "ios") ImageStore.removeImageForTag(this.state.url_output) //deleting unused image
    this.setState({url_output: null, remake: true})
  }

  processCropping(){
    let cropX = ((this.pointA.x - this.working_image.x) * this.original_image.width) / this.working_image.width
    let cropY = ((this.pointA.y - this.working_image.y) * this.original_image.height) / this.working_image.height

    let cropWidth = (this.state.widthCrop * this.original_image.width) / this.working_image.width 
    let cropHeight = (this.state.heightCrop * this.original_image.height) / this.working_image.height 

    if(this.cropWithRotation)
    {
      let {x, y, w, h} = this.rotatePlane(cropX, cropY, cropWidth, cropHeight)
      cropX = x
      cropY= y
      cropWidth = w
      cropHeight = h
    }

    const cropData =  {
                        offset: {x: (cropX - this.borderGrill), y: (cropY - this.borderGrill)},
                        size: {width: (cropWidth + this.borderGrill), height: (cropHeight + this.borderGrill)},
                      }

    ImageEditor.cropImage ( this.source, 
                            cropData,
                            (_success)=>{this.createFinaleImage(_success, cropWidth, cropHeight)},
                            (_faillure)=>{Notice.alert("Erreur", _faillure.toString())}
                          )
  }

  createFinaleImage(_url, width, height){
    const filename = _url.split("/").slice(-1)[0]
    this.final_image = {width: width, height: height, path: _url, filename: filename, mime: this.original_image.mime, cropWithRotation: this.cropWithRotation}
    this.setState({url_output: _url})
  }

  validateCropping(){
    EventRegister.emit("validateCrop", this.final_image)
    this.closeCropper()
  }

  renderResult(){
    return  <View style={{flex:1}}>
              <View style={{flex:1, backgroundColor:'#000'}} >
                <View style={{flex:1, padding:10}}>
                  <Image style={{flex:1}} 
                         source={{uri: this.state.url_output}}
                         resizeMode='contain' 
                  />
                </View>
              </View>
              <View style={{flex:0,flexDirection:'row', padding:10, height:40}}>
                <ImageButton Pstyle={{flex:1, marginHorizontal:3, alignItems:'center'}} onPress={()=>this.remakeCrop()} source={{uri: "remake"}} />
                <ImageButton Pstyle={{flex:1, marginHorizontal:3, alignItems:'center'}} onPress={()=>this.validateCropping()} source={{uri: "validate"}} />
              </View>
            </View>
  }

  renderCropper(){
    const animatedMove = {
        transform: [{
          translateX: this.animatedTranslateX
        }, {
          translateY: this.animatedTranslateY
        }]
    }

    return  <View style={{flex:1}}>
              <View style={{flex:1, backgroundColor:'#000'}}>
                <View style={{flex:1, padding: this.padding}} {...this.boxPanResponder.panHandlers}>
                  <View onLayout={(event)=>this.handleLayoutContent(event)} style={{flex:1}}>
                    <Image style={{flex:1}} 
                           source={{uri: this.source}}
                           resizeMode='contain' 
                    />
                  </View>
                </View>
                <Animated.View style={[{position: 'absolute'}, animatedMove]}>
                  <CropperGrill panResponder={this.boxPanResponder} 
                                topLeftPan={this.topLeftPan} 
                                topRightPan={this.topRightPan} 
                                bottomLeftPan={this.bottomLeftPan} 
                                bottomRightPan={this.bottomRightPan} 
                                width={this.state.widthCrop} 
                                height={this.state.heightCrop}
                                borderGrill={this.borderGrill}
                                />
                </Animated.View>
              </View>
              <View style={{flex:0,flexDirection:'row',padding:10, height:40}}>
                <ImageButton Pstyle={{flex:1, marginHorizontal:3, alignItems:'center'}}  onPress={()=>this.closeCropper()} source={{uri: "back"}} />
                <ImageButton Pstyle={{flex:1, marginHorizontal:3, alignItems:'center'}}  onPress={()=>this.processCropping()} source={{uri: "img_crop"}} />
              </View>
            </View>
  }

  render(){
    if(this.state.open)
      return  <Modal  transparent={false}
                      animationType="fade" 
                      visible={true}
                      supportedOrientations={['portrait', 'landscape']}
                      onRequestClose={()=>{}}
              >
                {this.state.url_output == null && this.renderCropper()}
                {this.state.url_output != null && this.renderResult()}
              </Modal> 
    else
      return null
  }
}
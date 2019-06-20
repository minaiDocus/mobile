import React, { Component } from 'react'
import {Picker, View, Platform, Modal, TouchableOpacity, StyleSheet, FlatList} from 'react-native'
import {ImageButton, AnimatedBox, XImage, XText, XTextInput} from '../index'

class ModalSelect extends Component{

  constructor(props){
    super(props)

    this.state = {loading: false, textFilter: "", datas: this.props.datas, selectedItem: this.props.selectedItem}

    this.filterType = 'simple'
    this.filterLocked = false
    this.filterCount = 0
    this.filterClock = null

    this.changeItem = this.changeItem.bind(this)
    this.renderContent = this.renderContent.bind(this)
    this.renderSearch = this.renderSearch.bind(this)
    this.handleFilterChange = this.handleFilterChange.bind(this)
    this.filterLock = this.filterLock.bind(this)

    this.generateStyles()
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.datas != this.state.datas)
    {
      if(this.filterType == 'advance'){
        this.setState({datas: nextProps.datas, loading: false})
      }
    }
  }

  filterLock()
  {
    this.filterCount--
    if(this.filterCount <= 0)
    {
      this.filterLocked = false
      this.props.filterCallback(this.state.textFilter)
      setTimeout(()=>{this.setState({loading: false})}, 4000)
      clearTimeout(this.filterClock)
    }
    else
    {
      this.filterClock = setTimeout(this.filterLock, 1000)
    }
  }

  async handleFilterChange(value){
    if(this.props.filterCallback != null)
    {
      this.filterType = 'advance'
      await this.setState({textFilter: value, loading: true})
      this.filterCount = 2
      if(!this.filterLocked)
      {
        this.filterLocked = true
        this.filterLock()
      }
    }
    else
    {
      this.filterType = 'simple'
      const regEx = new RegExp(value, 'i')
      let filterDatas = this.props.datas.map((dt)=>{
        if(regEx.test(dt.label.toString()))
        {
          return dt
        }
      })
      filterDatas = arrayCompact(filterDatas)
      await this.setState({datas: filterDatas})
    }
  }

  changeItem(itemValue, dismiss = false){
    let valueText = ''
    this.state.datas.some((val, key)=>{
      if(val.value == itemValue)
        return valueText = val.label
    })
    if(dismiss)
    {
      this.dismiss(true, itemValue, valueText)
    }
    else
    {
      this.props.changeItem(itemValue, valueText)
      this.setState({selectedItem: itemValue})
    }
  }

  renderSearch(){
    const CStyle = {
      flex: 1,
      height:40,
      paddingLeft:11
    }
    const TStyle = {
      fontSize:16
    }

    let liveChange = true
    if(this.props.filterCallback != null)
    {
      liveChange = false
    }
    
    const icon = this.state.loading? 'loader' : 'zoom_x'
    return <View style={{flex:1, flexDirection:'row', maxWidth:200}}>
              <XTextInput CStyle={CStyle} TStyle={TStyle} placeholder="Filtre" autoCorrect={false} liveChange={liveChange} onChangeText={(value) => this.handleFilterChange(value)}/>
              <XImage source={{uri:icon}} style={{flex:0, marginTop:5, width:25, height:25}} />
            </View>
  }

  renderContent(){
    if(Platform.OS == 'android')
    {
      const boxstyle = StyleSheet.create({
        container:{
          flex:1,
          backgroundColor:'#fff'
        },
        touchable:{
          flex:1,
          borderColor:'#D6D6D6',
          marginVertical:5,
          marginHorizontal:10,
          borderBottomWidth:1
        }
      })
      const renderItems = (dt)=>{
        let styleItem = { color:'#707070' }
        if(this.state.selectedItem == dt.value) styleItem = [{flex: 1, paddingLeft:5, backgroundColor: '#707070', color:'#fff'}, Theme.textBold]

        return  <TouchableOpacity style={boxstyle.touchable} onPress={()=>this.changeItem(dt.value, true)}>
                  <XText style={styleItem}>{dt.label}</XText>
                </TouchableOpacity>
      }

      return <FlatList style={boxstyle.container}
                       data={this.state.datas}
                       keyExtractor={(item, index) => index}
                       renderItem={({item})=> renderItems(item)}
             />
    }
    else
    {
      return  <Picker
                    style={{flex:1}}
                    selectedValue={this.state.selectedItem}
                    onValueChange={(itemValue, itemIndex) => this.changeItem(itemValue)}>
                    {this.state.datas.map((val, key)=>{return <Picker.Item label={val.label} value={val.value} key={key} />})}
              </Picker>
    }
  }

  dismiss(hasChanged=false, itemValue='', valueText=''){
    this.refs.animatedSelect.leave(() => {
      if(hasChanged)
        this.props.changeItem(itemValue, valueText)
      this.props.dismiss()
    })
  }

  generateStyles(){
    this.modal = StyleSheet.create({
      container: {
        flex:1,
        flexDirection:'column',
        backgroundColor:'rgba(0,0,0,0.5)'
      },
      head:{
        flex:0,
        height:40,
        flexDirection:'row',
        backgroundColor:'#E1E2DD',
        borderColor:'#9E9E9E',

        elevation: 4,

        shadowColor: '#000',                  //===
        shadowOffset: {width: 0, height: 2},  //=== iOs shadow    
        shadowOpacity: 0.8,                   //===
        shadowRadius: 2,                      //===

        borderBottomWidth:1
      },
      infos:{
        flex:0,
        padding:3,
        backgroundColor:'#FFF0BC',
        borderBottomWidth:1,
        borderColor:'#9E9E9E'
      },
      body:{
        flex:1,
        backgroundColor:'#FFF'
      },
      touchable:{
        flex:0,
        height:35,
        width:30,
        marginVertical:2,
        marginRight:5,
        paddingHorizontal:5,
        borderWidth:1,
        borderColor:'#707070',
      }
    })
  }

  render(){
    return  <Modal transparent={true}
                   animationType="fade" 
                   visible={true}
                   supportedOrientations={['portrait', 'landscape']}
                   onRequestClose={()=>{ this.dismiss() }}
            >
              <View style={this.modal.container}>
                <TouchableOpacity onPress={()=>this.dismiss()} style={{flex:1}} />
                <AnimatedBox ref="animatedSelect" type='UpSlide' style={{flex:1}} durationIn={300} durationOut={200}>
                  <View style={this.modal.head}>
                    <View style={{flex:2}}>
                      {this.props.filterSearch && this.renderSearch()}
                    </View>
                    <View style={{flex:1, alignItems: 'flex-end'}}>
                      <ImageButton source={{uri:'validate'}} onPress={()=>this.dismiss()} CStyle={this.modal.touchable} IStyle={{flex:1, width:20}} />
                    </View>
                  </View>
                  
                  { 
                    this.props.textInfo != '' && this.props.textInfo != null && 
                    <View style={this.modal.infos}>
                      <XText>{this.props.textInfo}</XText>
                    </View>
                  }

                  <View style={this.modal.body}>
                    {this.renderContent()}
                  </View>
                </AnimatedBox>
              </View>
            </Modal>
  }
}

export class SelectInput extends Component{
  constructor(props){
    super(props);

    this.state = {
                    selectedItem: "", 
                    valueText:"", 
                    openModal: this.props.open || false,
                    startTextAnim:0,
                    endTextAnim:0,
                    durationAnim:2000,
                    ready: false,
                    dataOptions: this.props.dataOptions || []
                  }
    this.layoutWidth = 0
    this.invisible = this.props.invisible || false

    this.showModal = this.showModal.bind(this)
    this.hideModal = this.hideModal.bind(this)
    this.changeItem = this.changeItem.bind(this)
    this.initValue = this.initValue.bind(this)
    this.getWidthLayout = this.getWidthLayout.bind(this)
  }

  componentDidMount(){
    this.initValue(this.state.dataOptions, this.props.selectedItem)
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.dataOptions != this.props.dataOptions || typeof(nextProps.selectedItem) !== "undefined" && nextProps.selectedItem != this.state.selectedItem)
    {
      let initVal = ""
      if(typeof(nextProps.selectedItem) !== "undefined") initVal = nextProps.selectedItem

      this.initValue(nextProps.dataOptions, initVal)
    }

    if(typeof(nextProps.open) !== "undefined")
    {
      if(nextProps.open) this.showModal()
      else this.hideModal()
    }
  }

  async getWidthLayout(event){
    if(!this.state.ready)
    {
      let {width, height} = event.nativeEvent.layout
      this.layoutWidth = width
      this.getCoordAnimation()
      await this.setState({ready: true})
    }
  }

  getCoordAnimation(){
    if(this.layoutWidth > 0)
    {
      const textWidth = (this.state.valueText.length * 8)
      const layout = this.layoutWidth

      if(layout > textWidth)
      {
        this.setState({startTextAnim:0, endTextAnim:0})
      }
      else
      {
        const start = -1 * (textWidth / 3)
        const duration = Math.abs(start * 100) / 2

        this.setState({startTextAnim:start, endTextAnim:0, durationAnim: duration})
        this.refs.animatedText.start()
      }
    }
  }

  async initValue(datas, value=""){
    let options = this.clearOptions(datas)
    let initValue = value || ""
    let textValue = ''
    if(options.length > 0)
    {
      if(initValue=="" && options[0].value != "")
        initValue = options[0].value

      options.map((val, key)=>{
        if(val.value == initValue || val.value == ""){textValue=val.label}  
      })
    }
    
    await this.setState({selectedItem: initValue, valueText: textValue, dataOptions: options})
    this.getCoordAnimation()
  }

  async changeItem(itemValue, valueText=""){
    if(this.props.onChange) this.props.onChange(itemValue)
    await this.setState({selectedItem: itemValue, valueText: valueText})
    this.getCoordAnimation()
  }

  showModal(){
    this.setState({openModal: true})
  }

  hideModal(){
    if(this.props.onClose) this.props.onClose()
    this.setState({openModal: false})
  }

  clearOptions(options){
    if(options.length > 1)
    {
      let arrReturn = []
      options.forEach((elem)=>{
        try{
          if(typeof(elem.value) != 'undefined' && typeof(elem.label) != 'undefined')
          {
            arrReturn.push(elem)
          }
        }catch(e){}
      })
      return arrReturn
    } 
    else
    {
      return options
    }
  }

  render(){
    const styles = {
      flex:1,
      borderColor:'#909090', 
      borderBottomWidth:1,
      marginHorizontal:3,
    }

    const selectStyle = {
      flex:1,
      paddingLeft:5,
      marginRight:5,
      maxHeight:20,
      overflow:'hidden'
    }

    const stylePlus = this.props.style || {}
    const CStyle = this.props.CStyle || {}

    const parentStyle = (this.invisible)? {flex:0,width:0,height:0} : [styles].concat(CStyle)

    return  <View style={parentStyle}>
              {
                this.state.openModal && <ModalSelect  datas={this.state.dataOptions || []}
                                                      filterSearch={this.props.filterSearch || false} 
                                                      filterCallback={this.props.filterCallback || null}
                                                      selectedItem={this.state.selectedItem}
                                                      textInfo={this.props.textInfo || null} 
                                                      changeItem={this.changeItem}
                                                      onFilter={this.props.onFilter || null}
                                                      dismiss={this.hideModal} />
              }
              {
                this.invisible == false &&
                <View style={{flex:1}}>
                  <TouchableOpacity style={{flex:1, flexDirection:'row', alignItems:'center'}} onPress={this.showModal}>
                    <View style={selectStyle} onLayout={this.getWidthLayout}> 
                      <AnimatedBox  ref='animatedText'
                                    style={{width: 500}} 
                                    type="HorizontalGliss"
                                    durationIn={this.state.durationAnim}
                                    durationOut={this.state.durationAnim}
                                    startAnim={this.state.startTextAnim}
                                    endAnim={this.state.endTextAnim}
                                    startOnLoad={false}
                                    >
                        <XText style={[{color:'#606060'}, stylePlus]}>{this.state.valueText}</XText>
                      </AnimatedBox>
                    </View>
                    <XText style={{flex:0, fontSize:10, fontWeight:'bold'}}>V</XText>
                  </TouchableOpacity>
                </View>          
              }   
            </View>
  }
}
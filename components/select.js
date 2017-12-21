import React, { Component } from 'react';
import {Picker, View, Platform, Modal, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {XImage, XTextInput} from './XComponents'
import {ImageButton} from './buttons'
import AnimatedBox from './animatedBox'

class ModalSelect extends Component{

  constructor(props){
    super(props)

    this.state = {datas: this.props.datas, selectedItem: this.props.selectedItem}

    this.changeItem = this.changeItem.bind(this)
    this.renderContent = this.renderContent.bind(this)
    this.renderSearch = this.renderSearch.bind(this)
    this.handleFilterChange = this.handleFilterChange.bind(this)
  }

  async handleFilterChange(value){
    if(this.props.onFilter != null)
    {
      this.props.onFilter(value)
    }
    else
    {
      if(value.length >= 3)
      {
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
      else
      {
        await this.setState({datas: this.props.datas})
      }
    }
  }

  changeItem(itemValue){
    this.setState({selectedItem: itemValue})
    let valueText = ''
    this.props.datas.map((val, key)=>{
      if(val.value == itemValue){valueText=val.label}
    })
    this.props.changeItem(itemValue, valueText)
  }

  renderSearch(){
    const style = {
      flex: 1,
      height:40,
      fontSize:16,
      paddingLeft:11,
      color:'#707070',
    }
    return <View style={{flex:1, flexDirection:'row', maxWidth:200}}>
              <XTextInput style={style} placeholder="Filtre" autoCorrect={false} onChangeText={(value) => this.handleFilterChange(value)}/>
              <XImage source={{uri:"zoom_x"}} style={{flex:0, marginTop:5, width:25, height:25}} />
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
      const renderItems = this.state.datas.map((dt, index)=>{
        const colorItem = (this.state.selectedItem == dt.value)? '#A91101' : '#707070'
        return <TouchableOpacity key={index} style={boxstyle.touchable} onPress={()=>this.changeItem(dt.value)}>
                  <Text style={{color: colorItem}}>{dt.label}</Text>
               </TouchableOpacity>
      })
      return <ScrollView style={boxstyle.container}>
               {renderItems}
             </ScrollView>
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

  dismiss(){
    this.refs.animatedSelect.leave(this.props.dismiss)
  }

  render(){
    const modal = StyleSheet.create({
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
    return  <Modal transparent={true}
                   animationType="fade" 
                   visible={true}
                   onRequestClose={()=>{}}
            >
              <View style={modal.container}>
                <TouchableOpacity onPress={()=>this.dismiss()} style={{flex:1}} />
                <AnimatedBox ref="animatedSelect" type='UpSlide' style={{flex:1}} durationIn={300} durationOut={200}>
                  <View style={modal.head}>
                    <View style={{flex:2}}>
                      {this.props.filterSearch && this.renderSearch()}
                    </View>
                    <View style={{flex:1, alignItems: 'flex-end'}}>
                      <ImageButton source={{uri:'validate'}} onPress={()=>this.dismiss()} Pstyle={modal.touchable} Istyle={{flex:1, width:20}} />
                    </View>
                  </View>
                  
                  { 
                    this.props.textInfo != '' && this.props.textInfo != null && 
                    <View style={modal.infos}>
                      <Text>{this.props.textInfo}</Text>
                    </View>
                  }

                  <View style={modal.body}>
                    {this.renderContent()}
                  </View>
                </AnimatedBox>
              </View>
            </Modal>
  }
}

class SelectInput extends Component{
  constructor(props){
    super(props);

    this.state = {
                    selectedItem: "", 
                    valueText:"", 
                    openModal: false,
                    ready: false,
                    cssAnim: 0
                  }
    this.layoutWidth = 0

    this.showModal = this.showModal.bind(this)
    this.hideModal = this.hideModal.bind(this)
    this.changeItem = this.changeItem.bind(this)
    this.initValue = this.initValue.bind(this)
    this.getWidthLayout = this.getWidthLayout.bind(this)
    this.animateText = this.animateText.bind(this)
  }

  componentDidMount(){
    this.initValue(this.props.dataOptions, this.props.selectedItem)
    this.cssAnim = 0
    this.animateText()
  }

  componentWillUnmount(){
    clearTimeout(this.animation)
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.dataOptions != this.props.dataOptions)
    {
      this.initValue(nextProps.dataOptions)
    }
  }

  async getWidthLayout(event){
    if(!this.state.ready)
    {
      let {width, height} = event.nativeEvent.layout
      this.layoutWidth = width
      await this.setState({ready: true})
    }
  }

  async animateText(){
    const textWidth = (this.state.valueText.length * 8)
    const layout = this.layoutWidth
    let endAnim = 0
    if(layout < textWidth && textWidth > 0)
    {
      endAnim = (textWidth / 3) * -1

      if(this.cssAnim >= 0)
      { 
        this.down = true
      }

      if(this.down)
      {
        this.cssAnim = this.cssAnim - 3
        if(this.cssAnim <= endAnim)
        {
          this.down = false
        }
      }
      else
      {
        this.cssAnim = this.cssAnim + 3
        if(this.cssAnim >= 0)
        {
          this.down = true
        }
      }

      await this.setState({cssAnim: this.cssAnim})
    }
    else
    {
      await this.setState({cssAnim: 0})
    }
    this.animation = setTimeout(this.animateText, 80)
  }

  initValue(datas, value=""){
    let initValue = value || ""
    let textValue = ''
    if(datas.length > 0)
    {
      if(initValue=="" && datas[0].value != "")
      {
        initValue = datas[0].value
      }

      datas.map((val, key)=>{
        if(val.value == initValue || val.value == ""){textValue=val.label}  
      })
    }
    this.setState({selectedItem: initValue, valueText: textValue})
  }

  changeItem(itemValue, valueText=""){
    this.setState({selectedItem: itemValue, valueText: valueText})
    if(this.props.onChange)
    {
      this.props.onChange(itemValue);
    }
  }

  showModal(){
    this.setState({openModal: true})
  }

  hideModal(){
    this.setState({openModal: false})
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
    }

    let datas = []
    if(this.props.dataOptions)
      datas = this.props.dataOptions


    const stylePlus = this.props.style || {}
    const PStyle = this.props.Pstyle || {}

    return  <View style={[styles].concat(PStyle)}>
              {this.state.openModal && <ModalSelect datas={datas}
                                                    filterSearch={this.props.filterSearch || false} 
                                                    selectedItem={this.state.selectedItem}
                                                    textInfo={this.props.textInfo || null} 
                                                    changeItem={this.changeItem}
                                                    onFilter={this.props.onFilter || null}
                                                    dismiss={this.hideModal} />}
              <View style={{flex:1}}>
                <TouchableOpacity style={{flex:1, flexDirection:'row', alignItems:'center'}} onPress={this.showModal}>
                  <View style={selectStyle} onLayout={this.getWidthLayout}> 
                    <View style={{width: 500, left: this.state.cssAnim}} >
                      <Text style={stylePlus}>{this.state.valueText}</Text>
                    </View>
                  </View>
                  <Text style={{flex:0, fontSize:10, fontWeight:'bold'}}>V</Text>
                </TouchableOpacity>
              </View>             
            </View>
  }
}

export default SelectInput;
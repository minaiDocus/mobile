import React, { Component } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'

import ScrollableTabView from 'react-native-scrollable-tab-view'

import { XModal, SimpleButton, XImage, XText, XTextInput, SelectInput, TabNav, XScrollView } from '../../components'

import { FileUploader } from "../../requests"

function setNoResult(){
  return  [
            {analysis: '', references: [{ventilation: 0, axis1: '', axis2: '', axis3: ''}, {ventilation: 0, axis1: '', axis2: '', axis3: ''}, {ventilation: 0, axis1: '', axis2: '', axis3: ''}]},
            {analysis: '', references: [{ventilation: 0, axis1: '', axis2: '', axis3: ''}, {ventilation: 0, axis1: '', axis2: '', axis3: ''}, {ventilation: 0, axis1: '', axis2: '', axis3: ''}]},
            {analysis: '', references: [{ventilation: 0, axis1: '', axis2: '', axis3: ''}, {ventilation: 0, axis1: '', axis2: '', axis3: ''}, {ventilation: 0, axis1: '', axis2: '', axis3: ''}]},
          ]
}

let ANALYTIC_CURRENT_SCREEN = ''

let RESULT_ANALYTIC = setNoResult()

let ANALYTICS = []
//exemple
// [{ name: '', axis1:{name: '', sections:[{name: '', value:''}, ...]}, axis2:{name: '', sections:[{name: '', value:''}, ...]}, axis3:{name: '', sections:[{name: '', value:''}, ...]} }, ... ]


class AnalysisView extends Component{
  constructor(props){
    super(props)

    this.state = {ready: false, total_ventilation: 0, axis_index: 0}

    this.handleChangeAnalysis = this.handleChangeAnalysis.bind(this)
    this.handleChangeVentilation = this.handleChangeVentilation.bind(this)
    this.handleChangeAxis = this.handleChangeAxis.bind(this)
    this.renderAxis = this.renderAxis.bind(this)
    this.renderAxisGroup = this.renderAxisGroup.bind(this)
    this.totalVentilation = this.totalVentilation.bind(this)

    this.generateStyles()
  }

  componentDidMount(){
    setTimeout(()=>{ this.setState({ready: true, total_ventilation: this.totalVentilation()}) }, 1000)
  }

  async handleChangeAnalysis(value){
    await this.setState({ready: false})
    RESULT_ANALYTIC[this.props.index].analysis = value
    RESULT_ANALYTIC[this.props.index].references = setNoResult()[0].references
    this.setState({ready: true, total_ventilation: 0})
  }

  handleChangeVentilation(group_index, value){
    RESULT_ANALYTIC[this.props.index].references[group_index].ventilation = value

    this.setState({total_ventilation: this.totalVentilation()})
  }

  handleChangeAxis(index, group_index, value){
    if(index == 0) RESULT_ANALYTIC[this.props.index].references[group_index].axis1 = value
    if(index == 1) RESULT_ANALYTIC[this.props.index].references[group_index].axis2 = value
    if(index == 2) RESULT_ANALYTIC[this.props.index].references[group_index].axis3 = value
  }

  handleIndexChange(index){
    this.setState({axis_index: index})
  }

  totalVentilation(){
    let total_ventilation = 0
    RESULT_ANALYTIC[this.props.index].references.map( r => total_ventilation += parseInt(r.ventilation))
    return total_ventilation
  }

  generateStyles(){
    this.styles = StyleSheet.create({
      container: {
                  flex:1,
                  flexDirection:'row',
                  alignItems:'center',
                  marginVertical:7,
                  marginHorizontal:8
                },
      input:{
              flex:1.3
            },
      axis_group: {
                    flex:0,
                    marginVertical:5,
                    marginHorizontal:5,
                    borderColor:'#BEBEBD',
                    backgroundColor:"#FFF",
                    borderWidth:1,
                  }
    })

    this.stylesTabBar = StyleSheet.create({
      container:{
                  flex:0,
                  flexDirection:'row',
                  width:'100%',
                  height:20,
                  borderColor:'#DFE0DF',
                  borderBottomWidth:1,
                  marginTop:10,
                },
      icons:{
              flex:0,
              marginLeft:5,
              width:30,
              height:30,
            },
      title:{
              flex:1,
              fontSize:12,
              fontWeight:'bold',
              textAlign:'center'
            },
      box:{
            flex:1,
            marginHorizontal:2,
            backgroundColor: "#CFCFCD",
            borderColor:'#DFE0DF',
            borderWidth:1,
            flexDirection:'row',
            alignItems:'center',
          },
    })
  }

  renderTabBar(){
    const tabs = [
      {title: "1"},
      {title: "2"},
      {title: "3"},
    ]

    let indexStyle = ""
    const content = tabs.map((tb, index) => {
          indexStyle = (index == this.state.axis_index)? {backgroundColor:(Theme.primary_button.shape.backgroundColor || '#C0D838'), borderWidth:0} : {}
          indexStyleText = (index == this.state.axis_index)? {color:(Theme.primary_button.text.color || '#FFF')} : {}
          return (
           <TouchableOpacity key={index} onPress={()=>{this.handleIndexChange(index)}} style={{flex:1}}>
            <View style={[this.stylesTabBar.box, indexStyle]}>
              <XText style={[this.stylesTabBar.title, indexStyleText]}>{tb.title}</XText>
            </View>
          </TouchableOpacity>
      )})

    return <View style={this.stylesTabBar.container}>
             {content}
           </View>
  }

  renderAxisGroup(index, analysis_name, analytics_data, axis1_options, axis2_options, axis3_options){
    return  <View key={index} style={this.styles.axis_group}>
              <View style={[this.styles.container, {flex:0, height:35}]}>
                <XTextInput label='Ventilation' selectTextOnFocus={true} defaultValue={RESULT_ANALYTIC[this.props.index].references[index].ventilation.toString()} keyboardType='numeric' onChangeText={(value)=>{this.handleChangeVentilation(index, value)}} CStyle={[this.styles.input, {height:35}]} />
              </View>
              {axis1_options.length > 0 &&
                <View style={[this.styles.container, {flex:0, height:35}]}>
                  <SelectInput label='Axe 1' textInfo={`Axe 1 (${analytics_data.axis1.name})`} selectedItem={RESULT_ANALYTIC[this.props.index].references[index].axis1} dataOptions={axis1_options} CStyle={this.styles.input} style={{color:'#707070'}} onChange={(value)=>this.handleChangeAxis(0, index, value)}/>
                </View>
              }
              {axis2_options.length > 0 &&
                <View style={[this.styles.container, {flex:0, height:35}]}>
                  <SelectInput label='Axe 2' textInfo={`Axe 2 (${analytics_data.axis2.name})`} selectedItem={RESULT_ANALYTIC[this.props.index].references[index].axis2} dataOptions={axis2_options} CStyle={this.styles.input} style={{color:'#707070'}} onChange={(value)=>this.handleChangeAxis(1, index, value)}/>
                </View>
              }
              {axis3_options.length > 0 &&
                <View style={[this.styles.container, {flex:0, height:35}]}>
                  <SelectInput label='Axe 3' textInfo={`Axe 3 (${analytics_data.axis3.name})`} selectedItem={RESULT_ANALYTIC[this.props.index].references[index].axis3} dataOptions={axis3_options} CStyle={this.styles.input} style={{color:'#707070'}} onChange={(value)=>this.handleChangeAxis(2, index, value)}/>
                </View>
              }
            </View>
  }

  renderAxis(){
    const analysis_name = RESULT_ANALYTIC[this.props.index].analysis

    let axis1_options = axis2_options = axis3_options = []
    let analytics_data = { name: '', axis1: {name: '', sections:[]}, axis2: {name:'', sections:[]}, axis3:{name:'', sections:[]} }

    if(isPresent(analysis_name))
    {
      analytics_data = ANALYTICS.find( elem => { return elem.name == analysis_name } )

      if(isPresent(analytics_data.axis1.name))
        axis1_options = [{ label: 'Séléctionnez une section', value: '' }].concat( analytics_data.axis1.sections.map( a => { return { label: a.name, value: a.code } } ) )

      if(isPresent(analytics_data.axis2.name))
        axis2_options = [{ label: 'Séléctionnez une section', value: '' }].concat( analytics_data.axis2.sections.map( a => { return { label: a.name, value: a.code } } ) )

      if(isPresent(analytics_data.axis3.name))
        axis3_options = [{ label: 'Séléctionnez une section', value: '' }].concat( analytics_data.axis3.sections.map( a => { return { label: a.name, value: a.code } } ) )
    }

    return  <View style={{flex:0, height:250}}>
              { 
                analysis_name != '' &&
                <ScrollableTabView tabBarPosition="top" renderTabBar={()=>this.renderTabBar()} page={this.state.axis_index} onChangeTab={(object) => {this.handleIndexChange(object.i)}}>
                  { this.renderAxisGroup(0, analysis_name, analytics_data, axis1_options, axis2_options, axis3_options) }
                  { this.renderAxisGroup(1, analysis_name, analytics_data, axis1_options, axis2_options, axis3_options) }
                  { this.renderAxisGroup(2, analysis_name, analytics_data, axis1_options, axis2_options, axis3_options) }
                </ScrollableTabView>
              }
            </View>
  }

  render(){
    const ventilStyle = (this.state.total_ventilation != 100)? '#ff0921' : '#22780f'
    let analysis_options = [{label: 'Selectionnez une analyse', value: ''}].concat( ANALYTICS.map( a => { return { label: a.name, value: a.name } } ) )

    return  <XScrollView style={{flex:1}} >
              <XText style={{flex:0, color:ventilStyle}}>(Total ventilation actuelle : {this.state.total_ventilation}%)</XText>
              <View style={this.styles.container}>
                <SelectInput label='Analyse' textInfo='Analyse' selectedItem={RESULT_ANALYTIC[this.props.index].analysis} dataOptions={analysis_options} CStyle={this.styles.input} style={{color:'#707070'}} onChange={(value)=>this.handleChangeAnalysis(value)}/>
              </View>
              {this.state.ready && this.renderAxis()}
            </XScrollView>
  }
}

export class ModalComptaAnalysis extends Component{
  constructor(props){
    super(props)

    this.state = { ready: false }

    this.customer = this.props.customer || null
    this.journal  = this.props.journal  || ''
    this.pieces   = this.props.pieces   || []

    if(ANALYTIC_CURRENT_SCREEN != this.props.currentScreen)
      RESULT_ANALYTIC = setNoResult()

    ANALYTIC_CURRENT_SCREEN = this.props.currentScreen

    if(this.props.resetOnOpen)
      RESULT_ANALYTIC = setNoResult()

    this.hideModal = this.hideModal.bind(this)

    this.generateStyles()
  }

  static exist(){
    let exist = false
    RESULT_ANALYTIC.map(a => { 
      if(a.analysis != '')
        exist = true
    })
    return exist
  }

  static reset(){
    RESULT_ANALYTIC = setNoResult()
    return RESULT_ANALYTIC
  }

  componentDidMount(){
    if( this.pieces.length > 0 || ( isPresent(this.customer) && isPresent(this.journal) ) )
    {
      FileUploader.waitFor([`getComptaAnalytics(${this.customer}, '${this.journal}', ${JSON.stringify(this.pieces)})`], responses => {
        if(responses[0].error){
          this.setAnalytics()
        }
        else{
          this.setAnalytics((isPresent(responses[0].data))? JSON.parse(responses[0].data) : {}, (isPresent(responses[0].defaults))? JSON.parse(responses[0].defaults) : {})
        }
        this.setState({ready: true})
      })
    }
    else
    {
      this.setAnalytics()
      this.setState({ready: true})
    }
  }

  setAnalytics(data={}, defaults={}){
    if(!isPresent(data) || JSON.stringify(data) == '{}' )
    {
      RESULT_ANALYTIC = setNoResult()
      ANALYTICS = []
    }
    else
    {
      ANALYTICS = []
      let temp_analytic   = []
      data.map((analysis, index)=>{
        temp_analytic = { name: '', axis1: { name: '', sections:[] }, axis2: { name: '', sections:[] }, axis3: { name: '', sections:[] } }

        temp_analytic.name = analysis.name

        if(isPresent(analysis.axis1))
        {
          temp_analytic.axis1.name  = analysis.axis1.name
          temp_analytic.axis1.sections = [].concat( analysis.axis1.sections.map(s => { return { name: s.description, code: s.code } } ) )
        }

        if(isPresent(analysis.axis2))
        {
          temp_analytic.axis2.name  = analysis.axis2.name
          temp_analytic.axis2.sections = [].concat( analysis.axis2.sections.map(s => { return { name: s.description, code: s.code } } ) )
        }

        if(isPresent(analysis.axis3))
        {
          temp_analytic.axis3.name  = analysis.axis3.name
          temp_analytic.axis3.sections = [].concat( analysis.axis3.sections.map(s => { return { name: s.description, code: s.code } } ) )
        }

        ANALYTICS.push(temp_analytic)
      })

      if(JSON.stringify(defaults) != '{}' && (isPresent(defaults.a1_name) || isPresent(defaults.a2_name) || isPresent(defaults.a3_name)) && !ModalComptaAnalysis.exist())
      {
        RESULT_ANALYTIC = [
                            {
                              analysis: defaults.a1_name || '',
                              references: [
                                {ventilation: defaults.a1_references[0].ventilation, axis1: defaults.a1_references[0].axis1, axis2: defaults.a1_references[0].axis2, axis3: defaults.a1_references[0].axis3},
                                {ventilation: defaults.a1_references[1].ventilation, axis1: defaults.a1_references[1].axis1, axis2: defaults.a1_references[1].axis2, axis3: defaults.a1_references[1].axis3},
                                {ventilation: defaults.a1_references[2].ventilation, axis1: defaults.a1_references[2].axis1, axis2: defaults.a1_references[2].axis2, axis3: defaults.a1_references[2].axis3}
                              ]
                            },
                            {
                              analysis: defaults.a2_name || '',
                              references: [
                                {ventilation: defaults.a2_references[0].ventilation, axis1: defaults.a2_references[0].axis1, axis2: defaults.a2_references[0].axis2, axis3: defaults.a2_references[0].axis3},
                                {ventilation: defaults.a2_references[1].ventilation, axis1: defaults.a2_references[1].axis1, axis2: defaults.a2_references[1].axis2, axis3: defaults.a2_references[1].axis3},
                                {ventilation: defaults.a2_references[2].ventilation, axis1: defaults.a2_references[2].axis1, axis2: defaults.a2_references[2].axis2, axis3: defaults.a2_references[2].axis3}
                              ]
                            },
                            {
                              analysis: defaults.a3_name || '',
                              references: [
                                {ventilation: defaults.a3_references[0].ventilation, axis1: defaults.a3_references[0].axis1, axis2: defaults.a3_references[0].axis2, axis3: defaults.a3_references[0].axis3},
                                {ventilation: defaults.a3_references[1].ventilation, axis1: defaults.a3_references[1].axis1, axis2: defaults.a3_references[1].axis2, axis3: defaults.a3_references[1].axis3},
                                {ventilation: defaults.a3_references[2].ventilation, axis1: defaults.a3_references[2].axis1, axis2: defaults.a3_references[2].axis2, axis3: defaults.a3_references[2].axis3}
                              ]
                            },
                          ]
      }
    }
  }

  hideModal(cancel=false){
    if(cancel)
    {
      this.refs.main_modal.closeModal(()=>this.props.hide(''))
      RESULT_ANALYTIC = setNoResult()
    }
    else
    {
      let error_message = ''
      RESULT_ANALYTIC.map((a, i)=>{
        if(a.analysis != '')
        {
          let counter = a.references.length
          let total_ventilation = 0
          a.references.map( r => {
            total_ventilation += parseInt(r.ventilation)
            if(!isPresent(r.axis1) && !isPresent(r.axis2) && !isPresent(r.axis3))
              counter--
          })
          if(counter <= 0)
            error_message = `Vous devez choisir au moin une section pour l'analyse ${i+1}`

          if(total_ventilation != 100)
            error_message = `La ventilation analytique doit être égale à 100% pour l'analyse ${i+1}`
        }
      })

      if(error_message != '')
        Notice.alert(error_message)
      else
        this.refs.main_modal.closeModal(()=>this.props.hide(RESULT_ANALYTIC))
    }
  }

  generateStyles(){
    this.styles = StyleSheet.create({
        box:    {
                  flex:1,
                  padding:"3%",
                  backgroundColor:'rgba(0,0,0,0.8)',
                  flexDirection:'column',
                },
        content:  {
                    flex:1,
                    backgroundColor:'#fff',
                  },
        formbox:   {
                  flex:1,
                  marginVertical:8,
                }
    })
  }

  render(){
    return  <XModal ref='main_modal'
                    transparent={true}
                    animationType="DownSlide"
                    visible={true}
                    onRequestClose={()=>{ this.hideModal(this.props.withCancel || false) }}
            >
              <View style={this.styles.box}>
                <View style={[this.styles.content, Theme.modal.shape]}>
                  <View style={{flex:1, padding: 5}}>
                    <XText style={{flex:0, minHeight:25, textAlign:'center', fontSize:18, color: '#463119'}}>Compta Analytique</XText>
                    <XText style={{flex:0}}>Ventilation à 100% par analyse uniquement.</XText>
                    <View style={this.styles.formbox}>
                      {this.state.ready &&
                        <TabNav headers={[{title: "Analyse 1"}, {title: "Analyse 2"}, {title: "Analyse 3"}]}
                                CStyle={{ backgroundColor: 'transparent' }}
                                BStyle={{text: {color: '#999'}, selectedHead: {backgroundColor: '#DDD'} }}
                        >
                          <AnalysisView index={0}/>
                          <AnalysisView index={1}/>
                          <AnalysisView index={2}/>
                        </TabNav>
                      }
                      {!this.state.ready && <XImage loader={true} style={{flex:1, width:40, height:40, alignSelf:'center'}} />}
                    </View>
                  </View>
                  <View style={[{flex:0, flexDirection:'row', paddingVertical:7, paddingHorizontal:5 }, Theme.modal.foot]}>
                    <SimpleButton CStyle={[{flex:0, width: (!this.props.withCancel? '100%' : '50%')}, Theme.primary_button.shape]} TStyle={Theme.primary_button.text} onPress={()=>this.hideModal()} title="Valider" />
                    {this.props.withCancel && <SimpleButton CStyle={[{flex:0, width: '47%', marginLeft: '3%'}, Theme.primary_button.shape]} TStyle={Theme.primary_button.text} onPress={()=>this.hideModal(true)} title="Annuler" /> }
                  </View>
                </View>
              </View>
            </XModal>
  }
}

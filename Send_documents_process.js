import React, { Component } from 'react'
import Config from './Config'
import Screen from './components/screen'
import Navigator from './components/navigator';
import {StyleSheet,Text,View,ScrollView,ListView,TouchableOpacity,Picker} from 'react-native'
import {XImage} from './components/XComponents'
import { NavigationActions } from 'react-navigation'
import * as Progress from 'react-native-progress';
import {SimpleButton} from './components/buttons'
import SelectInput from './components/select'
import User from './models/User'
import { EventRegister } from 'react-native-event-listeners'
import Fetcher from './components/dataFetcher';
import UploderFiles from './components/uploader'

var GLOB = {navigation:{}, dataList:[], customer: '', period: '', journal: '', file_upload_params: []}

function loadData(){
  const auth_token = User.getMaster().auth_token
  const file_code = User.find(`id_idocus = ${GLOB.customer}`)[0].code

  const data = new FormData()
  data.append('auth_token', auth_token)
  data.append('file_code', file_code)
  data.append('file_account_book_type', GLOB.journal)
  data.append('file_prev_period_offset', GLOB.period)
  GLOB.dataList.forEach((doc) => {
      const path = doc.path.toString()
      const name = path.split("/").slice(-1)[0]
      data.append('files[]', {
      uri: path,
      type: doc.mime.toString(), // or photo.type
      name: name
    });  
  });
  return data
}

class ImgBox extends Component{
  render(){
    const imgBox = StyleSheet.create({
      styleImg: {
          flex:0,
          width:80,
          height:80
        },
      styleContainer:{
          backgroundColor:'#fff',
          borderRadius:5,
          marginVertical:10,
          marginHorizontal:5,
          width:86,
          height:86,
          justifyContent:'center',
          alignItems:'center',
      },
    });
    return  <View style={{flex:0}}>
              <XImage type='container' PStyle={imgBox.styleContainer} style={imgBox.styleImg} local={false} source={this.props.source} />
            </View>
  }
}

class Header extends Component{
  constructor(props){
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = { dataList: this.ds.cloneWithRows(GLOB.dataList), };
  }

  render(){
    const boxPicture = {
      flex:0,
      flexDirection:'row',
    };

    const dataList = this.state.dataList;
    return  <View style={styles.minicontainer}>
              <ScrollView style={{flex:1}}>
                <ListView horizontal={true}
                          contentContainerStyle={boxPicture}
                          dataSource={dataList}
                          renderRow={(img) => <ImgBox source={ {uri: img.path.toString()} } /> } />
              </ScrollView>
            </View>
  }
}


class Body extends Component{
  constructor(props){
    super(props)

    this.state = {ready: false, journalsOptions: [], periodsOptions: []}

    this.master = User.getMaster()
    GLOB.journal = GLOB.periods = GLOB.customer = ""

    this.renderForm = this.renderForm.bind(this)
    this.renderLoading = this.renderLoading.bind(this)
    this.refreshWarning = this.refreshWarning.bind(this)
  }

  componentDidMount(){
    Fetcher.wait_for(
      ["refreshFormParams()"],
      (responses) => {
        if(responses[0].error)
        {
          Notice.danger(responses[0].message)
        }
        else
        {
          users = User.find_by_list_of("code", responses[0].userList)

          this.clients = [{value:"", label:"Choisir un client"}].concat(User.create_Selection(users))
          GLOB.file_upload_params = responses[0].data

          GLOB.journal = GLOB.period = GLOB.customer = ""
        }
        this.setState({ready: true, period_start: "", period_expired: ""})
      })
  }

  refreshWarning(message){
    if(message)
    {
      this.setState({period_start: message.period, period_expired: message.date})
    }
    else
    {
      this.setState({period_start: "", period_expired: ""})
    }
  }

  async handleChangeCustomer(value){
    GLOB.journal = GLOB.period = ""
    let opt_period = []
    let opt_journal = []
    let user_code = value != ""? User.find(`id_idocus = ${value}`)[0].code : ""
    if(user_code != "" && typeof(user_code != "undefined"))
    {
      opt_journal = [].concat(GLOB.file_upload_params[user_code].journals.map((journal, index) => { return {value: journal.split(" ")[0].toString(), label: journal.toString()}}))
      opt_period = [].concat(GLOB.file_upload_params[user_code].periods.map((prd, index) => { return {value: prd[1].toString(), label: prd[0].toString()}}))
      this.refreshWarning(GLOB.file_upload_params[user_code].message)
    }
    await this.setState({journalsOptions: opt_journal, periodsOptions: opt_period})
    if(opt_journal.length > 0) GLOB.journal = opt_journal[0].value || ""
    if(opt_period.length > 0) GLOB.period =  opt_period[0].value || ""
    GLOB.customer = value.toString()
  }

  handleChangeJournal(value){
    GLOB.journal = value.toString()
  }

  handleChangePeriod(value){
    GLOB.period = value.toString()
  }

  renderForm(){
  const bodyStyle = StyleSheet.create({
        inputs:{
          flex: 1,
          marginVertical:5,
          paddingHorizontal:10,
          fontSize:16,
        },
        select:{
          flex:0,
          height:40,
          borderColor:'#909090',
          marginVertical:5
        },
        progressBar:{
          marginVertical:15,
        },
        warning:{
          marginVertical:5,
          backgroundColor:'#F89744',
          padding:5,
        },
        warntitle:{
          fontWeight:"bold",
          fontSize:16,
          color:'#fff',
          borderBottomWidth:1,
          borderColor:'#fff',
          marginBottom:5
        }
  })
  const valueProgress = this.props.progress
  const colorBar = (valueProgress < 1)? "blue" : "#C0D838"

  return  <View style={{flex:1}}>
            {this.clients && <SelectInput textInfo='Clients' filterSearch={true} dataOptions={this.clients} Pstyle={bodyStyle.select} style={{color:'#707070'}} onChange={(value)=>this.handleChangeCustomer(value)}/>}
            <SelectInput textInfo='Journal comptable' dataOptions={this.state.journalsOptions} Pstyle={bodyStyle.select} style={{color:'#707070'}} onChange={(value)=>this.handleChangeJournal(value)}/>
            <SelectInput textInfo='Période comptable' dataOptions={this.state.periodsOptions} Pstyle={bodyStyle.select} style={{color:'#707070'}} onChange={(value)=>this.handleChangePeriod(value)}/>
            {this.state.period_start != "" && 
              <View style={bodyStyle.warning}>
                <Text style={bodyStyle.warntitle} >
                  Attention :
                </Text>
                <Text>
                  Pour des raisons de clôture de période comptable,
                  vous ne pouvez plus affecter de documents à la période {this.state.period_start} 
                  après le {this.state.period_expired}.
                </Text>
              </View>
            }

            {valueProgress > 0 &&
              <View style={bodyStyle.progressBar}>
                <Progress.Bar progress={valueProgress} width={null} height={10} color={colorBar} unfilledColor={"#fff"} borderColor={"#909090"} borderWidth={2} />
                <Text style={{flex:1, textAlign:'center', color:colorBar}}>{(valueProgress < 1)? "Téléversement en cours ..." : "Téléversement terminé"}</Text>
              </View>
            }
          </View>
  }

  renderLoading(){
    const style = {
      flex:1,
      width:60,
      height:60,
      alignSelf:'center'
    }
    return <XImage loader={true} style={style} />
  }

  render(){
    const bodyStyle = StyleSheet.create({
       container:{
          flex:1,
          flexDirection:'column',
          borderRadius:10,
         
          elevation: 7, //Android shadow

          shadowColor: '#000',                  //===
          shadowOffset: {width: 0, height: 2},  //=== iOs shadow    
          shadowOpacity: 0.8,                   //===
          shadowRadius: 2,                      //===
          
          backgroundColor:"#E9E9E7",
          margin:10,
          paddingHorizontal:20,
          paddingVertical:10
        },
    });
    return  <View style={{flex:1, padding:3}}>
              <Text style={{flex:0,textAlign:'center',fontSize:16,fontWeight:'bold'}}>{GLOB.dataList.length} : Document(s)</Text>
              <View style={bodyStyle.container}>
                {this.state.ready && this.renderForm()}
                {!this.state.ready && this.renderLoading()}
              </View>
            </View>
  }
}

class Footer extends Component{
  constructor(props){
    super(props)
    this.state = {sending: false}
  }

  sendingDocs(){
    const call = ()=> {
                        if(GLOB.period != "" && GLOB.journal != "" && GLOB.customer != "")
                        {
                          this.setState({sending: true})
                          CronTask.addTask(UploderFiles)
                          CronTask.task.launchUpload(loadData())
                        }
                        else
                        {
                          Notice.alert("Attention", "Veuillez renseigner correctement les champs avant l'envoi")
                        }
                      }
    actionLocker(call)
  }

  leaveScreen(){
    GLOB.navigation.goBack();
  }

  render(){
    return  <View style={styles.minicontainer}>
              <SimpleButton Pstyle={styles.button} onPress={()=>{this.leaveScreen()}} title="<< Precedent" />
              {this.props.sending == false && <SimpleButton Pstyle={styles.button} onPress={()=>{this.sendingDocs()}} title="Envoyer" />}
            </View>
  }
}

class SendScreen extends Component {
  static navigationOptions = {headerTitle: 'Envoi documents',}

  constructor(props){
    super(props)
    GLOB.navigation = new Navigator(this.props.navigation)
    GLOB.dataList = GLOB.navigation.getParams('images')
    this.state = {progress: 0, sending: false}

    this.uploadProgress = this.uploadProgress.bind(this)
    this.uploadComplete = this.uploadComplete.bind(this)
    this.uploadError = this.uploadError.bind(this)
  }

  componentWillMount(){
    //add Listener for Uploading Files
    EventRegister.on('progressUploadFile', this.uploadProgress)
    EventRegister.on('completeUploadFile', this.uploadComplete)
    EventRegister.on('errorUploadFile', this.uploadError)
  }

  componentWillUnmount(){
    GLOB.navigation.screenClose()

    //remove Listener for Uploading Files
    EventRegister.rm('progressUploadFile')
    EventRegister.rm('completeUploadFile')
    EventRegister.rm('errorUploadFile')
  }

  uploadProgress(progressEvent){
    if(this.refs._baseScroll)
    {
      const progress = progressEvent.loaded / progressEvent.total
      this.refs._baseScroll.scrollToEnd({animated: true})
      this.setState({progress: progress, sending: true})
    }
  }

  uploadComplete(result){
    if(this.refs._baseScroll)
    {
      //handle complete
      if(result.error)
      {//handle error from Complete
        Notice.alert("Envoi", result.message)
      }
      this.refs._baseScroll.scrollToEnd({animated: true})
    }
  }

  uploadError(result){
    Notice.alert("Envoi", result)
  }

  render() {
      return  <Screen style={styles.container}
                      navigation={GLOB.navigation}>
                <Header />
                <ScrollView ref="_baseScroll" style={{flex:1, flexDirection:'column'}}>
                  <Body progress={this.state.progress} />
                </ScrollView>
                <Footer sending={this.state.sending}/>
              </Screen>
    }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  minicontainer:{
    flex:0, 
    flexDirection:'row',
    backgroundColor:'#E1E2DD'
  },
  button: {
    flex:1,
    margin:10
  }
});

export default SendScreen;
import React, { Component } from 'react'
import {ScrollView, Text, Alert, View, StyleSheet, TouchableOpacity, Image} from 'react-native'

//Test modules
import SplashScreen from 'react-native-splash-screen'
import { EventRegister } from 'react-native-event-listeners'
import Pdf from 'react-native-pdf'
// import ImagePicker from 'react-native-image-crop-picker'
import Swiper from 'react-native-swiper'
import * as Progress from 'react-native-progress'
import DatePic from 'react-native-datepicker'

import Realm from 'realm'
const PackSchema = {
                      name: 'Pack',
                      primaryKey: 'id',
                      properties: {
                        id: 'int',
                        id_idocus: 'int',
                        created_at: 'date', 
                        updated_at: 'date', 
                        name: 'string',
                        owner_id: 'int',
                        page_number: 'int?',
                        message: 'string?',
                        error_message: 'string?',
                        type: 'string'
                      }
                   }


import LinearGradient from 'react-native-linear-gradient'
class BoxButton extends Component{
  constructor(props){
    super(props)
  }


  render(){
    const rayon = this.props.rayon || 60
    const boxStyle = StyleSheet.create({
      touchable:{
        flex:1,
        margin:10,
        flexDirection:'column',
        alignItems:'center'
      },
      boxControl:{
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
        flex:0,
        backgroundColor:'#C0D838',
        width:rayon,
        height:rayon,
        marginBottom:5,
        borderRadius:100
      },
      icons:{
        flex:0,
        width:"60%",
        height:"60%"
      },
      text:{
        flex:0,
        minWidth:65,
        fontWeight:'bold',
        color:'#fff',
        backgroundColor:'#AEAEAE',
        textAlign:'center',
        paddingHorizontal:10,
        paddingVertical:5,
        borderRadius:5
      }, 
    });

    return  <TouchableOpacity onPress={this.props.onPress} style={boxStyle.touchable}>
              <LinearGradient colors={['#fff', '#C0D838', '#000']} style={boxStyle.boxControl}>
                <Image source={this.props.source} style={boxStyle.icons} resizeMode="contain" />
              </LinearGradient>
              <Text style={boxStyle.text}>{this.props.title}</Text>
            </TouchableOpacity>
  }
}

import ScrollableTabView from 'react-native-scrollable-tab-view'
const TabBar = ()=>{
    const tabs = [
      {title: "Traités"},
      {title: "En cours"},
      {title: "Erreurs"},
    ];
    const styles = StyleSheet.create({
        container:{
          flex:0,
          flexDirection:'row',
          width:'100%',
          height:50,
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
        touchable:{
          flex:1
        },
        title:{
          flex:1,
          fontSize:12,
          fontWeight:'bold',
          textAlign:'center'
        },
        box:{
          flex:1,
          borderTopLeftRadius:10,
          borderTopRightRadius:10,
          marginHorizontal:2,
          backgroundColor:"#BEBEBD",
          borderColor:'#DFE0DF',
          borderWidth:1,
          flexDirection:'row',
          alignItems:'center',
        },
    });
    var indexStyle = "";
    const content = tabs.map((tb, index) => {
          return (
            <View key={index} style={[styles.box, indexStyle]}>
              <Text style={styles.title}>{tb.title}</Text>
            </View>
      )});

    return <View style={styles.container}>
             {content}
           </View>  
}


class ListenerTest extends Component{

  constructor(props){
    super(props)
  }

  componentWillMount(){
    this.listener = EventRegister.on("testListener", ()=>{Alert.alert("Listing works!!")})
  }

  componentWillUnMount(){
    this.listener = EventRegister.rm("testListener")
  }

  render(){
    return null
  }
}


class AppTester extends Component{

  componentDidMount(){
    SplashScreen.hide()
    EventRegister.emit("testListener", null)

    this.realm = new Realm({schema:[PackSchema]})

  }


  async openCamera(){
    await ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true
    })
    .then(image => {
      Alert.alert("Image", image.path.toString())
    })
    .catch(error => {
      Alert.alert("Image", error.toString())
    });
  }

  render(){
    const styles = {
                  dateIcon: {
                        position: 'absolute',
                        left: 0,
                        top: 4,
                        marginLeft: 0
                      },
                  dateInput: {
                        marginLeft: 36
                      }
                };

    return <ScrollView>
              <Text>Initialisation du test</Text>
              <ListenerTest />
              <ScrollableTabView tabBarPosition="top" renderTabBar={()=>TabBar()}>
                <View key={0} style={{flex:1}}><Text style={{color:'#000'}}>Test</Text></View>
                <View key={2} style={{flex:1}}><Text style={{color:'#000'}}>Test2</Text></View>
                <View key={3} style={{flex:1}}><Text style={{color:'#000'}}>Test3</Text></View>
              </ScrollableTabView>  
              <Pdf
                    source={null}
                    onLoadComplete={(pageCount, filePath)=>{
                      Alert.alert("Test", filePath)
                    }}
                    onError={(error)=>{
                      Alert.alert("Erreur loading pdf", error)
                    }}
              />
              <BoxButton onPress={()=>this.openCamera()} source={{uri:"camera_icon"}} title="Prendre photo" />
              <Swiper style={{flex:0,width:'100%',height:50,alignItems:'center',marginBottom:10,}} showsButtons={false} showsPagination={true} index={0}>
                <Image key={0} source={{uri:""}} />
                <Image key={1} source={{uri:""}} />
                <Image key={2} source={{uri:""}} />
              </Swiper>
              <Progress.Bar progress={0.5} width={100} height={10} color={'blue'} unfilledColor={"#fff"} borderColor={"#909090"} borderWidth={2} />

              <DatePic
                  style={{width: 200}}
                  date={new Date()}
                  mode="date"
                  placeholder="select date"
                  format="YYYY-MM-DD"
                  minDate="2015-01-01"
                  maxDate={new Date()}
                  confirmBtnText="Confirm"
                  cancelBtnText="Cancel"
                  customStyles={styles}
                />
           </ScrollView>
  }
}

export default AppTester


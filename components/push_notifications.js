import React, { Component } from 'react'
import { StyleSheet, Text, View, Modal, ScrollView, TouchableOpacity, Platform} from 'react-native'
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm'
import { EventRegister } from 'react-native-event-listeners'

import {ImageButton, RealmControl} from './index'

import {User} from '../models'

import {FireBaseNotification} from '../requests'

/* SIMPLE USAGE >>
    // this shall be called regardless of app state: running, background or not running. Won't be called when app is killed by user in iOS
    FCM.on(FCMEvent.Notification, async (notif) => {
        // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
        if(notif.local_notification){
          //this is a local notification
        }
        if(notif.opened_from_tray){
          //iOS: app is open/resumed because user clicked banner
          //Android: app is open/resumed because user clicked banner or tapped app icon
        }
        // await someAsyncCall();

        if(Platform.OS ==='ios'){
          //optional
          //iOS requires developers to call completionHandler to end notification process. If you do not call it your background remote notifications could be throttled, to read more about it see https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623013-application.
          //This library handles it for you automatically with default behavior (for remote notification, finish with NoData; for WillPresent, finish depend on "show_in_foreground"). However if you want to return different result, follow the following code to override
          //notif._notificationType is available for iOS platfrom
          switch(notif._notificationType){
            case NotificationType.Remote:
              notif.finish(RemoteNotificationResult.NewData) //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
              break;
            case NotificationType.NotificationResponse:
              notif.finish();
              break;
            case NotificationType.WillPresent:
              notif.finish(WillPresentNotificationResult.All) //other types available: WillPresentNotificationResult.None
              break;
          }
        }
    });
    FCM.on(FCMEvent.RefreshToken, (token) => {
        console.log(token)
        // fcm token may not be available on first load, catch it here
    });
<< END USAGE */
/*
class Example extends Component {
    componentDidMount() {
        // iOS: show permission prompt for the first call. later just check permission in user settings
        // Android: check permission in user settings
        FCM.requestPermissions().then(()=>console.log('granted')).catch(()=>console.log('notification permission rejected'));
        
        FCM.getFCMToken().then(token => {
            console.log(token)
            // store fcm token in your server
        });
        
        this.notificationListener = FCM.on(FCMEvent.Notification, async (notif) => {
            // optional, do some component related stuff
        });
        
        // initial notification contains the notification that launchs the app. If user launchs app by clicking banner, the banner notification info will be here rather than through FCM.on event
        // sometimes Android kills activity when app goes to background, and when resume it broadcasts notification before JS is run. You can use FCM.getInitialNotification() to capture those missed events.
        // initial notification will be triggered all the time even when open app by icon so send some action identifier when you send notification
        FCM.getInitialNotification().then(notif => {
           console.log(notif)
        });
    }

    componentWillUnmount() {
        // stop listening for events
        this.notificationListener.remove();
    }

    otherMethods(){

        FCM.subscribeToTopic('/topics/foo-bar');
        FCM.unsubscribeFromTopic('/topics/foo-bar');
        FCM.presentLocalNotification({
            id: "UNIQ_ID_STRING",                               // (optional for instant notification)
            title: "My Notification Title",                     // as FCM payload
            body: "My Notification Message",                    // as FCM payload (required)
            sound: "default",                                   // as FCM payload
            priority: "high",                                   // as FCM payload
            click_action: "ACTION",                             // as FCM payload
            badge: 10,                                          // as FCM payload IOS only, set 0 to clear badges
            number: 10,                                         // Android only
            ticker: "My Notification Ticker",                   // Android only
            auto_cancel: true,                                  // Android only (default true)
            large_icon: "ic_launcher",                           // Android only
            icon: "ic_launcher",                                // as FCM payload, you can relace this with custom icon you put in mipmap
            big_text: "Show when notification is expanded",     // Android only
            sub_text: "This is a subText",                      // Android only
            color: "red",                                       // Android only
            vibrate: 300,                                       // Android only default: 300, no vibration if you pass 0
            wake_screen: true,                                  // Android only, wake up screen when notification arrives
            group: "group",                                     // Android only
            picture: "https://google.png",                      // Android only bigPicture style
            ongoing: true,                                      // Android only
            my_custom_data:'my_custom_field_value',             // extra data you want to throw
            lights: true,                                       // Android only, LED blinking (default false)
            show_in_foreground                                  // notification when app is in foreground (local & remote)
        });

        FCM.scheduleLocalNotification({
            fire_date: new Date().getTime(),      //RN's converter is used, accept epoch time and whatever that converter supports
            id: "UNIQ_ID_STRING",    //REQUIRED! this is what you use to lookup and delete notification. In android notification with same ID will override each other
            body: "from future past",
            repeat_interval: "week" //day, hour
        })

        FCM.getScheduledLocalNotifications().then(notif=>console.log(notif));

        //these clears notification from notification center/tray
        FCM.removeAllDeliveredNotifications()
        FCM.removeDeliveredNotification("UNIQ_ID_STRING")

        //these removes future local notifications
        FCM.cancelAllLocalNotifications()
        FCM.cancelLocalNotification("UNIQ_ID_STRING")

        FCM.setBadgeNumber(1);                                       // iOS and supporting android.
        FCM.getBadgeNumber().then(number=>console.log(number));     // iOS and supporting android.
        FCM.send('984XXXXXXXXX', {
          my_custom_data_1: 'my_custom_field_value_1',
          my_custom_data_2: 'my_custom_field_value_2'
        });

        FCM.deleteInstanceId()
            .then( () => {
              //Deleted instance id successfully
              //This will reset Instance ID and revokes all tokens.
            })
            .catch(error => {
              //Error while deleting instance id
            });
    }
}
*/
class ListNotification extends Component{
    constructor(props){
      super(props)
      this.generateStyles() //style generation
    }


    generateStyles(){
			this.styles = StyleSheet.create({
	       	container:{
						          flex:1,
						          flexDirection:'row',
						          alignItems:'center',
						          justifyContent:'center',
						          backgroundColor:'rgba(0,0,0,0.7)',
						          paddingVertical:20
						        },
	        box:{
			          flex:0,
			          backgroundColor:'#EBEBEB',
			          width:'90%',
			          borderRadius:10,
			          paddingVertical:8
			        },
	        labels:{
					          flex:0,
					          width:15,
					          height:15,
					          marginRight:20
					        },
	        inputs:{
					          flex:0,
					          width:15,
					          height:15,
					          marginRight:20
					        },
	        head:{
				          flex:0,
				          height:35,
				          paddingHorizontal:10,
				          flexDirection:'row',
				          backgroundColor:'#EBEBEB',
				          borderColor:'#000',
				          borderBottomWidth:1,
				        },
	        body:{
				          flex:1,
				          backgroundColor:'#fff',
				          padding:10
				        },
	        foot:{
				          flex:0,
				          flexDirection:'row',
				          alignItems:'center',
				          justifyContent:'center',
				          backgroundColor:'#EBEBEB',
				          borderColor:'#000',
				          borderTopWidth:1,
				          paddingVertical:7
				        },
	        boxNotif:{
					          	flex:1,
					          	borderColor:'#DDDDDD',
					          	borderBottomWidth:2,
					          	marginBottom:10,
					          	backgroundColor:'#FFF'
					        	},

	      })
    }

    renderDetails(){
      //order datas
      if(this.props.datas.length > 0)
      {
        const datas = this.props.datas.sorted("created_at", true).slice(0,50)
	    	const details = datas.map((data, index)=>{
	    		return  <View key={index} style={this.styles.boxNotif}>
	    							 <Text style={{color:'#0064B1', fontWeight:'bold', marginBottom:4}}>
	    							 	{data.title || "-"}
	    							 	{
	    							 		data.is_read == false && 
	    							 		<Text style={{fontSize: 9, color:'#62AF05', fontStyle:'italic'}}> (Nouveau)</Text>
	    							 	}
	    							 </Text>
	    							 <Text style={{color:'#3F4545'}}>{data.message || "-"}</Text>
	    							 <Text style={{color:'#97938B', fontSize:9, marginTop:7}}>{format_date(data.created_at)}</Text>
	    						</View>
	    	})
	    	return details
    	}
    	else
    	{
				return 	<View style={this.styles.boxNotif}>
						  		<Text>Vous n'avez aucun message pour l'instant</Text>
								</View>
    	}
    }

    render(){
      return  <Modal transparent={true}
                     animationType="slide" 
                     visible={true}
                     supportedOrientations={['portrait', 'landscape']}
                     onRequestClose={()=>{}}
              >
                <View style={this.styles.container} >
                  <View style={this.styles.box}>
                    <View style={this.styles.head}>
                       <Text style={{flex:1, textAlign:'center',fontSize:24, paddingLeft:25}}>Notifications</Text>
                       <ImageButton  source={{uri:"delete"}} 
			                  Pstyle={{flex:0, flexDirection:'column', alignItems:'center',width:25}}
			                  Istyle={{width:10, height:10}}
			                  onPress={()=>{this.props.dismiss()}} />
                    </View>
                    <ScrollView style={this.styles.body}>
                      {this.renderDetails()}
                    </ScrollView>
                  </View>
                </View>
            </Modal>
  }
}

export class UINotification extends Component{
    constructor(props){
        super(props)
        this.state = {newNotifCount: 0, openListNotifications: false, datas: []}

        this.master = User.getMaster()

        this.toggleListNotifications = this.toggleListNotifications.bind(this)
        this.refreshData = this.refreshData.bind(this)
        this.revokeToken = this.revokeToken.bind(this)
        this.releaseNewNotif = this.releaseNewNotif.bind(this)
        this.addNotifToRealm = this.addNotifToRealm.bind(this)

        this.generateStyles() //style generation
    }

    componentWillMount(){
        this.newNotificationListener = EventRegister.on('newNotification', (notif) => {
          this.addNotification(notif)
        })
        this.refreshNotificationsListener = EventRegister.on('refreshNotifications', ()=>{
          //resend token to server
          FireBaseNotification.registerFirebaseToken(this.master.firebase_token, Platform.OS)
          this.refreshData()
        })
        this.revokeTokenListener = EventRegister.on('revokeFCMtoken', ()=>{
          this.revokeToken()
        })
        this.openNotificationsListener = EventRegister.on('openNotifications',()=>{
          this.toggleListNotifications()
        })
    }

    componentWillUnmount(){
        EventRegister.rm(this.newNotificationListener)
        EventRegister.rm(this.refreshNotificationsListener)
        EventRegister.rm(this.revokeTokenListener)
        EventRegister.rm(this.openNotificationsListener)
    }

    componentDidMount(){
      setTimeout(()=>this.refreshData(), 1500)
    }

    revokeToken(){
      FCM.deleteInstanceId()
        .then( () => {
          //Deleted instance id successfully
          //This will reset Instance ID and revokes all tokens.
        })
        .catch(error => {
          //Error while deleting instance id
        });
    }

    toggleListNotifications(){
        if(this.state.openListNotifications)
        {
          this.releaseNewNotif()
        }
        this.setState({openListNotifications: !this.state.openListNotifications})
    }

    releaseNewNotif(){
      let _allNotif = []
      let allNotifications = this.state.datas
      allNotifications.map((notif) => {
        let tmp = RealmControl.realmToJson(notif)
        tmp.is_read = true
        _allNotif.push(tmp)
      })

      this.addNotifToRealm(_allNotif)

      FireBaseNotification.releaseNewNotifications()
    }

    addNotification(notif){
    	let notification = []
      
      let message = ""
      if(typeof(notif.message) !== "undefined" && notif.message != ""){
        message = JSON.parse(notif.message)
      }

      if(!(typeof(notif.opened_from_tray) !== "undefined" && notif.opened_from_tray))
      { 
        const mess_obj =  <View style={{flex:1, flexDirection:'row', alignItems:'center'}}>
                            <View style={{flex:1, paddingHorizontal:20}}>
                              <Text style={{flex:1, color:'#FFF', fontWeight:"bold"}}>Nouvelle notification</Text>
                              <Text style={{flex:1, color:'#C0D838', fontSize:10}}>Vous avez un nouveau message!!</Text>
                            </View>
                            <ImageButton  source={{uri:"notification_green"}} 
                              Pstyle={{flex:0, flexDirection:'column', alignItems:'center', width:30}}
                              Istyle={{width:20, height:20}}
                              onPress={()=>{EventRegister.emit("openNotifications")}} />
                          </View>
        Notice.info(mess_obj, false, "push_notification_alert", 10000)
      }

    	if(typeof(message) != "undefined" && message.to_be_added == true)
    	{
        let sendDate = format_date((notif["google.sent_time"] || new Date()), "YYYY-MM-DDTHH:ii:ss")
    		notification = [{ 
    											"id": notif["google.message_id"] || sendDate,
    											"title": message.title,
    											"message": message.body,
    											"created_at": sendDate,
    											"is_read": false
    										}]
	    	this.addNotifToRealm(notification)
    	}
    	else
    	{
    		this.refreshData()
    	}
    }

    refreshData(){
      FireBaseNotification.wait_for(
      ['getNotifications()'],
      (responses)=>{
          if(responses[0].error)
          {
            Notice.danger(responses[0].message, true, responses[0].message)
          }
          else
          {
            let datas = responses[0].notifications || []
            this.addNotifToRealm(datas)
          }
      })
    }

    addNotifToRealm(datas){
      if(datas.length > 0)
      {
        //schema of notifications (Realm)
        const notif_schema =  {
                                id: 'string',
                                title: 'string?',
                                message: 'string?',
                                created_at: 'string?',
                                is_read: 'bool',
                              }

        const result = RealmControl.create_temp_realm(datas, "notifications", notif_schema)
        let nb_new = 0
        result.map((r)=>{if(r.is_read == false) nb_new++})

        this.setState({datas: result, newNotifCount: nb_new})
      }
    }

    generateStyles(){
    	this.styles = StyleSheet.create({
    		bellText: {
    			position:'absolute',
    			right:0,
    			width:20,
    			height:20,
          margin:2,
    			borderRadius:100,
    			backgroundColor:'#cc1b41',
    			justifyContent:'center',
    			alignItems:'center'
    		}
    	})
    }

    render(){
        return <TouchableOpacity style={{flex:1, paddingVertical:10}} onPress={()=>{this.toggleListNotifications()}}>
                {this.state.openListNotifications && <ListNotification datas={this.state.datas} dismiss={this.toggleListNotifications} />}
                  <ImageButton  source={{uri:"notification"}} 
                  Pstyle={{flex:1, flexDirection:'column', alignItems:'center',minWidth:30}}
                  Istyle={{width:20, height:20}}
                  onPress={()=>{this.toggleListNotifications()}} />
                  {
                  	this.state.newNotifCount > 0 && 
	                  <View style={this.styles.bellText}>
	                    <Text style={{backgroundColor:'rgba(0,0,0,0)', textAlign:'center', fontSize:9, color:"#FFF"}}>{this.state.newNotifCount}</Text>
	                  </View>
                	}
                </TouchableOpacity>
    }
}

export class FCMinit extends Component{
    constructor(props){
        super(props)

        this.master = User.getMaster()

        this.handleMessages = this.handleMessages.bind(this)
        this.handleToken = this.handleToken.bind(this)
    }

    componentDidMount(){
        // iOS: show permission prompt for the first call. later just check permission in user settings
        // Android: check permission in user settings
        FCM.requestPermissions()
            .then(()=>{/*NOTIFICATIONS ENABLED*/})
            .catch(()=>{
              Notice.info({title: "Notifications désactivés", body: "Vous pouvez activer les notifications dans les paramètres applications pour être informer des activités iDocus à tout moment"}, false, "notif_block", 10000)
            })
        
        FCM.getFCMToken().then(token => {
            //getting firebase notifications token
            this.handleToken(token)
        });
        
        this.notificationListener = FCM.on(FCMEvent.Notification, async (notif) => {
            //optional, do some component related stuff
            this.handleMessages(notif)
        });

        this.refreshToken = FCM.on(FCMEvent.RefreshToken, (token) => {
        // fcm token may not be available on first load, catch it here 
            this.handleToken(token)
        });
        
        // initial notification contains the notification that launchs the app. If user launchs app by clicking banner, the banner notification info will be here rather than through FCM.on event
        // sometimes Android kills activity when app goes to background, and when resume it broadcasts notification before JS is run. You can use FCM.getInitialNotification() to capture those missed events.
        // initial notification will be triggered all the time even when open app by icon so send some action identifier when you send notification
        FCM.getInitialNotification().then(notif => {
           this.handleMessages(notif)
        });
    }

    handleMessages(notif){
      if(typeof(notif) !== "undefined" && notif != null)
      {
        if(typeof(notif.message) != "undefined")
        {
          EventRegister.emit('newNotification', notif)
          if(typeof(notif.opened_from_tray) !== "undefined" && notif.opened_from_tray)
          {
            setTimeout(()=>{EventRegister.emit("openNotifications")}, 1500)
            FCM.removeAllDeliveredNotifications() //clear all notification from center/tray when one of them has been taped
          }
        }
      }
    }

    handleToken(token = ""){
        if(typeof(token) !== "undefined" && token != null && token != "")
        {
          //send token to server
          let _tmp_master = RealmControl.realmToJson(this.master)
          const master_id = _tmp_master.id
          _tmp_master.authentication_token = this.master.auth_token
          _tmp_master.firebase_token = token
          User.create_or_update(master_id, _tmp_master, true)

          FireBaseNotification.registerFirebaseToken(token, Platform.OS)
        }
    }

    componentWillUnmount(){
        // stop listening for events
        this.notificationListener.remove()
        this.refreshToken.remove()
    }

    render(){
        return null
    }
}

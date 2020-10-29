import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity} from 'react-native'
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm'
import { EventRegister } from 'react-native-event-listeners'

import { ImageButton, BoxInfos, XText } from './index'

import { User, Notification } from '../models'

import { FireBaseNotification } from '../requests'

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

export class UINotification extends Component{
    constructor(props){
      super(props)
      this.state = {newNotifCount: 0, datas: [], showList: false}

      this.visible = (this.props.visible === false)? false : true

      this.listNotifView = null

      this.toggleListNotifications = this.toggleListNotifications.bind(this)
      this.refreshData = this.refreshData.bind(this)
      this.releaseNewNotif = this.releaseNewNotif.bind(this)
      this.addNotifToRealm = this.addNotifToRealm.bind(this)

      this.generateStyles() //style generation
    }

    UNSAFE_componentWillMount(){
      this.refreshNotificationsListener = EventRegister.on('refreshNotifications', ()=>{
        this.refreshData()
      })

      this.addNotifToRealmListener = EventRegister.on('addNotifToRealm', (notifs)=>{
        this.addNotifToRealm(notifs)
      })

      this.openNotifsListener = EventRegister.on('openNotifications', ()=>{
        this.toggleListNotifications()
      })
    }

    componentWillUnmount(){
        EventRegister.rm(this.refreshNotificationsListener)
        EventRegister.rm(this.addNotifToRealmListener)
        EventRegister.rm(this.openNotifsListener)
    }

    componentDidUpdate(){
      if(this.state.showList && this.listNotifView)
        renderToFrontView(this.listNotifView, "UpSlide", ()=>{this.toggleListNotifications()})
    }

    componentDidMount(){
      setTimeout(()=>this.refreshData(), 1500)
    }

    releaseNewNotif(){
      setTimeout(()=>{
        let _allNotif = []
        let allNotifications = this.state.datas
        allNotifications.map((notif) => {
          let tmp = realmToJson(notif)
          tmp.is_read = true
          _allNotif.push(tmp)
        })

        this.addNotifToRealm(_allNotif)

        FireBaseNotification.releaseNewNotifications()
      }, 1)
    }

    refreshData(){
      FireBaseNotification.waitFor(['getNotifications()'], responses=>{
        if(responses[0].error)
        {
          Notice.danger(responses[0].message, { name: responses[0].message })
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
        const result = Notification.add(datas)
        let nb_new = 0
        result.map((r)=>{if(r.is_read == false) nb_new++})

        this.setState({datas: result, newNotifCount: nb_new})
      }
    }

    toggleListNotifications(){
      if(this.state.showList)
      {
        this.listNotifView = null
        this.releaseNewNotif()
        clearFrontView()
      }

      this.setState({showList: !this.state.showList})
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
              			backgroundColor:'rgba(139,0,0, 0.8)',
              			justifyContent:'center',
              			alignItems:'center'
              		},
        boxNotif: {
                    flex:1,
                    borderColor:'#DDDDDD',
                    borderBottomWidth:2,
                    marginBottom:10,
                    backgroundColor:'#FFF'
                  },
    	})
    }

    renderListNotifications(){
      this.listNotifView =  <BoxInfos title={"Notifications"} dismiss={()=>{this.toggleListNotifications()}}>
                              {this.renderDetails()}
                            </BoxInfos>
    }

    renderDetails(){
      if(this.state.datas.length > 0)
      {
        const datas = this.state.datas.sorted("created_at", true).slice(0,50)
        const details = datas.map((data, index)=>{
          return  <View key={index} style={this.styles.boxNotif}>
                     <XText style={{color:'#0064B1', fontWeight:'bold', marginBottom:4}}>
                      {data.title || "-"}
                      {
                        data.is_read == false && 
                        <XText style={{fontSize: 9, color:'#62AF05', fontStyle:'italic'}}> (Nouveau)</XText>
                      }
                     </XText>
                     <XText style={{color:'#3F4545'}}>{data.message || "-"}</XText>
                     <XText style={{color:'#97938B', fontSize:9, marginTop:7}}>{formatDate(data.created_at)}</XText>
                  </View>
        })
        return details
      }
      else
      {
        return  <View style={this.styles.boxNotif}>
                  <XText>Vous n'avez aucun message pour l'instant</XText>
                </View>
      }
    }

    render(){
        if(this.state.showList)
          this.renderListNotifications()

        let view = <View style={{flex: 0, width: 0, height: 0}} />
        if(this.visible)
          view =  <TouchableOpacity style={{flex:0}} onPress={()=>{this.toggleListNotifications()}}>
                    <ImageButton  source={{icon: "bell"}}
                                  CStyle={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'center', minWidth:30}}
                                  IStyle={{flex:0, width:20, height:20}}
                                  IOptions={{color: '#000'}}
                                  onPress={()=>{this.toggleListNotifications()}} />
                    {
                      this.state.newNotifCount > 0 &&
                      <View style={this.styles.bellText}>
                        <XText style={{textAlign:'center', fontSize:9, color:"#FFF", textShadowColor:'#000', textShadowOffset:{width: 1, height: 1}, textShadowRadius:1}}>{this.state.newNotifCount}</XText>
                      </View>
                    }
                  </TouchableOpacity>

        return view
    }
}

export class FCMinit extends Component{
    constructor(props){
      super(props)

      this.notifTimer = null

      this.handleMessages = this.handleMessages.bind(this)
      this.handleToken = this.handleToken.bind(this)
      this.addNotification = this.addNotification.bind(this)
    }

    UNSAFE_componentWillMount(){
      this.revokeTokenListener = EventRegister.on('revokeFCMtoken', ()=>{
        this.revokeToken()
      })
    }

    componentDidMount(){
      if(FCMinitCheker)
        this.initializeFCM()

      this.notificationListener = AppFcm.on(FCMEvent.Notification, async (notif) => {
          //optional, do some component related stuff
          this.handleMessages(notif)
      })

      this.refreshToken = AppFcm.on(FCMEvent.RefreshToken, (token) => {
        // fcm token may not be available on first load, catch it here
        // if(isPresent(Master.firebase_token))
        //   FireBaseNotification.registerFirebaseToken(Master.firebase_token) //resend token to server
        // else
        this.handleToken(token)
      })
    }

    componentWillUnmount(){
      // stop listening for events
      this.notificationListener.remove()
      this.refreshToken.remove()
      EventRegister.rm(this.revokeTokenListener)
    }

    initializeFCM(){
      FCMinitCheker = false

      AppFcm = FCM

      // iOS: show permission prompt for the first call. later just check permission in user settings
      // Android: check permission in user settings
      AppFcm.requestPermissions()
          .then(()=>{/*NOTIFICATIONS ENABLED*/})
          .catch(()=>{
            Notice.info({ title: "Notifications désactivés", body: "Vous pouvez activer les notifications dans les paramètres applications pour être informer des activités iDocus à tout moment" }, { permanent: false, name: "notif_block", delay: 10000 })
          });

      if(!isPresent(Master.firebase_token)){
        AppFcm.getFCMToken().then((token) => { /*getting firebase notifications token */ this.handleToken(token) })
      }
      else{
        this.handleToken(Master.firebase_token)
      }
      // initial notification contains the notification that launchs the app. If user launchs app by clicking banner, the banner notification info will be here rather than through FCM.on event
      // sometimes Android kills activity when app goes to background, and when resume it broadcasts notification before JS is run. You can use FCM.getInitialNotification() to capture those missed events.
      // initial notification will be triggered all the time even when open app by icon so send some action identifier when you send notification
      AppFcm.getInitialNotification().then(notif => {
         this.handleMessages(notif)
      });
    }

    revokeToken(){
      FCMinitCheker = true

      AppFcm.deleteInstanceId()
          .then(() => {
            //Deleted instance id successfully
            //This will reset Instance ID and revokes all tokens.
          })
          .catch(error => {
            //Error while deleting instance id
          });
    }

    handleMessages(notif){
      if(isPresent(notif))
      {
        if(typeof(notif.message) != "undefined")
        {
          this.addNotification(notif)

          if(typeof(notif.opened_from_tray) !== "undefined" && notif.opened_from_tray)
          {
            const openNotif = ()=>{
              EventRegister.emit("openNotifications")
              clearInterval(this.notifTimer)
              this.notifTimer = null
            }

            this.notifTimer = setInterval(openNotif, 1500)
            AppFcm.removeAllDeliveredNotifications() //clear all notification from center/tray when one of them has been taped
          }
        }
      }
    }

    handleToken(token = ""){
      if(isPresent(token))
      {
        //send token to server
        let _tmp_master = Master
        _tmp_master.authentication_token = Master.auth_token
        _tmp_master.firebase_token = token
        User.createOrUpdate(_tmp_master.id, _tmp_master, true)
        Master = realmToJson(User.getMaster()) //reload master

        FireBaseNotification.registerFirebaseToken(token)
      }
    }

    addNotification(notif){
      let notification = []

      let message = ""
      if(isPresent(notif.message)){
        message = JSON.parse(notif.message)
      }

      if(!(typeof(notif.opened_from_tray) !== "undefined" && notif.opened_from_tray))
      {
        const mess_obj =  <View style={{flex:1, flexDirection:'row', alignItems:'center'}}>
                            <View style={{flex:1, paddingHorizontal:20}}>
                              <XText style={{flex:1, color:'#FFF', fontWeight:"bold"}}>Nouvelle notification</XText>
                              <XText style={{flex:1, color:'#C0D838', fontSize:10}}>Vous avez un nouveau message!!</XText>
                            </View>
                            <ImageButton  source={{icon:"bell"}}
                              IOptions={{color: '#FFF'}}
                              CStyle={{flex:0, flexDirection:'column', alignItems:'center', justifyContent:'center', width:30}}
                              IStyle={{flex:0, width:20, height:20}}
                              onPress={()=>{EventRegister.emit("openNotifications")}} />
                          </View>
        Notice.info(mess_obj, { permanent: true, name: "push_notification_alert" })
      }

      if(isPresent(message) && message.to_be_added == true)
      {
        let sendDate = formatDate((notif["google.sent_time"] || new Date()), "YYYY-MM-DDTHH:ii:ss")
        notification = [{
                          "id": notif["google.message_id"] || sendDate,
                          "title": message.title,
                          "message": message.body,
                          "created_at": sendDate,
                          "is_read": false
                        }]

        EventRegister.emit('addNotifToRealm', notification)
      }
      else
      {
        EventRegister.emit('refreshNotifications')
      }
    }

    render(){
      return <View style={{flex: 0, width: 0, height: 0}} />
    }
}

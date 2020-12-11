import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity} from 'react-native'

import messaging from '@react-native-firebase/messaging'
import { EventRegister } from 'react-native-event-listeners'

import { ImageButton, BoxInfos, XText } from './index'

import { User, Notification } from '../models'

import { FireBaseNotification } from '../requests'

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
        AutoFCMNotif = false
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
          if(!responses[0].uniq_request)
            Notice.danger(responses[0].message, { name: responses[0].message })
        }
        else
        {
          let datas = responses[0].notifications || []
          this.addNotifToRealm(datas)
        }
      }, true)
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
        Notice.remove('push_notification_alert', true)
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

      this.initiateNotificationListeners = this.initiateNotificationListeners.bind(this)
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

      this.initiateNotificationListeners()

      this.refreshToken = messaging().onTokenRefresh(token => {
        this.handleToken(token)
      })

      // this.notificationListener = AppFcm.on(FCMEvent.Notification, async (notif) => {
      //     //optional, do some component related stuff
      //     this.handleMessages(notif)
      // })

      // this.refreshToken = AppFcm.on(FCMEvent.RefreshToken, (token) => {
      //   // fcm token may not be available on first load, catch it here
      //   // if(isPresent(Master.firebase_token))
      //   //   FireBaseNotification.registerFirebaseToken(Master.firebase_token) //resend token to server
      //   // else
      //   this.handleToken(token)
      // })
    }

    componentWillUnmount(){
      // stop listening for events
      this.notificationForegroundListener = null
      this.notificationBackgroundListener = null
      this.refreshToken = null
      EventRegister.rm(this.revokeTokenListener)
    }

    async initializeFCM(){
      FCMinitCheker = false
      // AppFcm = FCM

      // iOS: show permission prompt for the first call. later just check permission in user settings
      // Android: check permission in user settings
      const authStatus = await messaging().requestPermission()
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        Notice.info({ title: "Notifications désactivés", body: "Vous pouvez activer les notifications dans les paramètres applications pour être informer des activités iDocus à tout moment" }, { permanent: false, name: "notif_block", delay: 10000 })
      }

      // AppFcm.requestPermissions()
      //     .then(()=>{/*NOTIFICATIONS ENABLED*/})
      //     .catch(()=>{
      //       Notice.info({ title: "Notifications désactivés", body: "Vous pouvez activer les notifications dans les paramètres applications pour être informer des activités iDocus à tout moment" }, { permanent: false, name: "notif_block", delay: 10000 })
      //     });


      // getting firebase cloud messaging token
      if(!isPresent(Master.firebase_token)){
        messaging()
          .getToken()
          .then(token => {
            return this.handleToken(token)
          })
      }
      else{
        this.handleToken(Master.firebase_token)
      }

      // if(!isPresent(Master.firebase_token)){
      //   AppFcm.getFCMToken().then((token) => { getting firebase notifications token  this.handleToken(token) })
      // }
      // else{
      //   this.handleToken(Master.firebase_token)
      // }
      // initial notification contains the notification that launchs the app. If user launchs app by clicking banner, the banner notification info will be here rather than through FCM.on event
      // sometimes Android kills activity when app goes to background, and when resume it broadcasts notification before JS is run. You can use FCM.getInitialNotification() to capture those missed events.
      // initial notification will be triggered all the time even when open app by icon so send some action identifier when you send notification
      messaging().getInitialNotification().then(notif => {
         this.handleMessages(notif, 'foreground')
      });
    }

    initiateNotificationListeners(){
      //Foreground Notifications
      this.notificationForegroundListener = messaging().onMessage(async notif => {
        //optional, do some component related stuff
        this.handleMessages(notif, 'foreground')
      })

      //Background an Quit notifications
      this.notificationBackgroundListener = messaging().setBackgroundMessageHandler(async notif => {
        this.handleMessages(notif, 'background')
      })
    }

    revokeToken(){
      FCMinitCheker = true

      messaging().deleteToken()

      // AppFcm.deleteInstanceId()
      //     .then(() => {
      //       //Deleted instance id successfully
      //       //This will reset Instance ID and revokes all tokens.
      //     })
      //     .catch(error => {
      //       //Error while deleting instance id
      //     });
    }

    handleMessages(notif, type='foreground'){
      if(isPresent(notif) && isPresent(notif.notification))
        this.addNotification(notif, type)
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

    addNotification(notif, type='foreground'){
      let message = ""
      if(isPresent(notif.notification)){
        if(isPresent(notif.data)){
          try{
            message = JSON.parse(notif.data.toString())
          }catch(e){
            message = notif.data
          }
        }
        else
        {
          try{
            message = JSON.parse(notif.notification.toString())
          }catch(e){
            message = notif.notification
          }
        }
      }

      if(type == 'foreground'){
        const mess_obj =  <View style={{flex:1, flexDirection:'row', alignItems:'center'}}>
                            <View style={{flex:1, paddingHorizontal:20}}>
                              <XText style={{flex:1, color:'#FFF', fontWeight:"bold"}}>Nouvelle notification</XText>
                              <XText style={{flex:1, color:'#C0D838', fontSize:10}}>Vous avez un nouveau message!! : {message.title}</XText>
                            </View>
                            <ImageButton  source={{icon:"bell"}}
                              IOptions={{color: '#FFF'}}
                              CStyle={{flex:0, flexDirection:'column', alignItems:'center', justifyContent:'center', width:30}}
                              IStyle={{flex:0, width:20, height:20}}
                              onPress={()=>{EventRegister.emit("openNotifications")}} />
                          </View>
        Notice.info(mess_obj, { permanent: true, name: "push_notification_alert" })
      }

      if(isPresent(message) && (message.to_be_added == true || message.to_be_added == 'true'))
      {
        let notification = []
        let sendDate = formatDate((notif["sentTime"] || new Date()), "YYYY-MM-DDTHH:ii:ss")
        notification = [{
                          "id": notif["messageId"] || sendDate,
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

      if(type == 'background' && AutoFCMNotif == false)
      {
        AutoFCMNotif = true

        const openNotif = ()=>{
          EventRegister.emit("openNotifications")
          clearInterval(this.notifTimer)
          this.notifTimer = null
        }

        this.notifTimer = setInterval(openNotif, 1500)
        // messaging().removeAllDeliveredNotifications() //clear all notification from center/tray when one of them has been taped
      }
    }

    render(){
      return <View style={{flex: 0, width: 0, height: 0}} />
    }
}

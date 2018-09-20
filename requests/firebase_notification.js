import {Requester} from './index'

class firebase_notification extends Requester{
  getNotifications(){
    return this.requestURI("api/mobile/firebase_notification/get_notifications", {method: 'POST'})
  }

  releaseNewNotifications(){
    return this.requestURI("api/mobile/firebase_notification/release_new_notifications", {method: 'POST'})
  }

  registerFirebaseToken(token = ""){
    if(token != "" && token != null && typeof(token) !== "undefined")
    {
      return this.requestURI("api/mobile/firebase_notification/register_firebase_token", {method: 'POST', params:{firebase_token: token, platform: Config.platform, version: Config.version}})
    }
    else
    {
      return new Promise(resolve => resolve(true) )
    }
  }
}

export const FireBaseNotification = new firebase_notification()
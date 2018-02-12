import {Requester} from './index'
import Config from '../Config'

class firebase_notification extends Requester{
  async getNotifications(){
    let response = ""

    this.requestURI("api/mobile/firebase_notification/get_notifications", {method: 'POST'}, (r) => {
      if(r.error){ 
        //handling errors
        response = r
      }
      else
      {
        response = r
      }
    })
    while(response == "")
    {
      await this.sleep(300)
    }

    return response
  }

  async releaseNewNotifications(){
    let response = ""
    
    this.requestURI("api/mobile/firebase_notification/release_new_notifications", {method: 'POST'}, (r) => {
      if(r.error){ 
        //handling errors
        response = r
      }
      else
      {
        response = r
      }
    })
    while(response == "")
    {
      await this.sleep(300)
    }

    return response
  }

  async registerFirebaseToken(token = "", platform='', version=''){
    let response = ""

    if(token != "" && token != null && typeof(token) !== "undefined")
    {
      this.requestURI("api/mobile/firebase_notification/register_firebase_token", {method: 'POST', params:{firebase_token: token, platform: platform, version: version}}, (r) => {
        if(r.error){ 
          //handling errors
          response = r
        }
        else
        {
          response = r
        }
      })
      while(response == "")
      {
        await this.sleep(300)
      }
    }
    return response
  }
}

export const FireBaseNotification = new firebase_notification()
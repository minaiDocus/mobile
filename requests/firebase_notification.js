import Requester from './activeRequest'
import Config from '../Config'
import User from '../models/User'

export default class firebase_notification extends Requester{

  async getNotifications(){
    this.synchronious_response = ""

    this.requestURI("api/mobile/firebase_notification/get_notifications", {method: 'POST'}, (r) => {
      if(r.error){ 
        //handling errors
        this.synchronious_response = r
      }
      else
      {
        this.synchronious_response = r
      }
    })
    while(this.synchronious_response == "")
    {
      await this.sleep(300)
    }
  }

  async releaseNewNotifications(){
    this.synchronious_response = ""

    this.requestURI("api/mobile/firebase_notification/release_new_notifications", {method: 'POST'}, (r) => {
      if(r.error){ 
        //handling errors
        this.synchronious_response = r
      }
      else
      {
        this.synchronious_response = r
      }
    })
    while(this.synchronious_response == "")
    {
      await this.sleep(300)
    }
  }

  async registerFirebaseToken(token = "", platform=''){
    if(token != "" && token != null && typeof(token) !== "undefined")
    {
      this.synchronious_response = ""
      this.requestURI("api/mobile/firebase_notification/register_firebase_token", {method: 'POST', params:{firebase_token: token, platform: platform}}, (r) => {
        if(r.error){ 
          //handling errors
          this.synchronious_response = r
        }
        else
        {
          this.synchronious_response = r
        }
      })
      while(this.synchronious_response == "")
      {
        await this.sleep(300)
      }
    }
  }
}
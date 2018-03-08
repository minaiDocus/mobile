import {Requester} from './index'
import {User} from '../models'

class remote_auhtentication extends Requester{
  async pingServer(version, platform, callback=()=>{}){
    let response = ""
    this.requestURI("api/mobile/remote_authentication/ping", {method: 'POST', params:{version, platform}}, (r) => {
      if(r.error){ 
        //handling errors
        response = r
        callback(r)
      }
      else
      {
        response = r
        callback(r)
      }
    })
    while(response == "")
    {
      await this.sleep(300)
    }
    return response
  }

  logIn(options, callback=()=>{}){
    this.requestURI("api/mobile/remote_authentication/request_connexion",  {method: 'POST', params: options}, (r) => {
      if(r.error)
      {
        callback('error', r.message)
      }
      else
      {
        User.deleteAll()
        User.createOrUpdate(1, r.user, true)
        callback('success', '')
      }
    })
  }

  logOut(){
    User.deleteAll()
  }
}

export const RemoteAuthentication = new remote_auhtentication()
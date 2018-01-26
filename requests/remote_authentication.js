import Requester from './activeRequest'
import User from '../models/User'

class remote_auhtentication extends Requester{
  async ping_server(version, platform, callback=()=>{}){
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
        User.create_or_update(1, r.user, true)
        callback('success', '')
      }
    })
  }

  logOut(){
    User.deleteAll()
  }
}

export default new remote_auhtentication()
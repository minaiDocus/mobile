import Requester from './activeRequest'
import User from '../models/User'

export default class remote_auhtentication extends Requester{
  async ping_server(version, platform, callback=()=>{}){
    this.synchronious_response = ""
    this.requestURI("api/mobile/remote_authentication/ping", {method: 'POST', params:{version, platform}}, (r) => {
      if(r.error){ 
        //handling errors
        this.synchronious_response = r
        callback(r)
      }
      else
      {
        this.synchronious_response = r
        callback(r)
      }
    })
    while(this.synchronious_response == "")
    {
      await this.sleep(300)
    }
  }

  remoteAUTH(options, callback=()=>{}){
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
}
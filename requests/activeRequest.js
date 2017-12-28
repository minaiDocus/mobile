import Config from '../Config'
import base64 from 'base-64'
import User from '../models/User'

export default class Requester {
  responseFetching = ""
  synchronious_response = ""

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  requestURI(uri, options, callback){
    this.responseFetching = ""
    const url = Config.http_host + uri
    const method = options.method || 'GET'
    var request = new XMLHttpRequest()

    request.open(method, url)
    request.setRequestHeader("Content-Type", "application/json")

    if(Config.server == "staging") //if accessing staging server
    {request.setRequestHeader("Authorization", "Basic " + base64.encode(Config.user + ":" + Config.pass))}

    //Aborting query if too long (For fixing bug http request on iOS)
    const aborting = (callback) => {
        if(this.responseFetching == "")
        {
          request.abort()
          this.responseFetching = {error: true, message: "Impossible de se connecter au serveur!!"}
          callback(this.responseFetching)
        }
    }

    if(method == 'POST')
    {
      const parameters = {}
      const auth_token = {auth_token: User.getMaster().auth_token}
      Object.assign(parameters, auth_token, options.params)
      setTimeout(()=>{
        aborting(callback)
      }, 15000)
      request.send(JSON.stringify(parameters)) 
    }
    else 
    {
      setTimeout(()=>{
        aborting(callback)
      }, 15000)
      request.send()
    }

    request.onload = (e) => {
      if (request.readyState === 4)
      {
        if(request.status != 200)
          this.responseFetching = handlingHttpErrors(request)
        else
          this.responseFetching = JSON.parse(request.responseText)

        callback(this.responseFetching)  
      }
    }

    request.onerror = (e) => {
      this.responseFetching = handlingHttpErrors(request)
      callback(this.responseFetching)
    }
  }
}
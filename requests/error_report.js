import Config from '../Config'
import {Platform} from 'react-native'
import base64 from 'base-64'
import User from '../models/User'

class error_report {
  sendErrorReport(title="", error="", report={}){
    let timer = null
    const timeout = 60000 //Request timeout = 60 seconds
    const url = Config.http_host + "api/mobile/error_report/send_error_report"
    let request = new XMLHttpRequest()

    request.open('POST', url)
    request.setRequestHeader("Content-Type", "application/json")

    if(Config.server == "staging") //if accessing staging server
    {request.setRequestHeader("Authorization", "Basic " + base64.encode(Config.user + ":" + Config.pass))}

    //Aborting query if too long (For fixing bug http request on iOS)
    const aborting = () => {
      clearTimeout(timer)
      request.abort()
    }

    const master = User.getMaster()
    const auth_token = {auth_token: master.auth_token}
    const params =  {
                      title: title, 
                      error: error, 
                      user_id: master.id || "not connected",
                      user_token: master.auth_token || "not connected",
                      platform: Platform.OS,
                      report: report
                    }

    const parameters = {}
    Object.assign(parameters, auth_token, params)
    timer = setTimeout(()=>{
      aborting()
    }, timeout)
    request.send(JSON.stringify(parameters))
  }
}

export default new error_report()
import Config from '../Config'
import {Platform} from 'react-native'

import XFetcher from '../components/XFetcher'

import User from '../models/User'

class error_report {
  sendErrorReport(title="", error="", report={}){
    const master = User.getMaster()
    const params =  {
                      title: title, 
                      error: error, 
                      user_id: master.id || "not connected",
                      user_token: master.auth_token || "not connected",
                      platform: Platform.OS,
                      report: report
                    }
    const Fetcher = new XFetcher()                
    Fetcher.fetch("api/mobile/error_report/send_error_report", {method: 'POST', params: params}, false)
  }
}

export default new error_report()
import {XFetcher} from '../components'

class error_report {
  sendErrorReport(title="", error="", report={}){
    const params =  {
                      title: title, 
                      error: error, 
                      user_id: Master.id_idocus || "not connected",
                      user_token: Master.auth_token || "not connected",
                      platform: Config.platform,
                      version: Config.version,
                      report: report
                    }
    const Fetcher = new XFetcher()                
    Fetcher.fetch("api/mobile/error_report/send_error_report", {method: 'POST', params: params}, false)
  }
}

export const ErrorReport = new error_report()
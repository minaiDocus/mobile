import {Requester} from './index'

class file_uploader extends Requester{
  refreshFormUsers(){
    return this.requestURI("api/mobile/file_uploader/load_file_upload_users", {method: 'POST'})
  }

  refreshFormParams(user_id){
    return this.requestURI("api/mobile/file_uploader/load_file_upload_params", {method: 'POST', params: {user_id}})
  }

  getComptaAnalytics(user_id){
    return this.requestURI("api/mobile/file_uploader/load_user_analytics", {method: 'POST', params: {user_id}})
  }
}

export const FileUploader = new file_uploader()
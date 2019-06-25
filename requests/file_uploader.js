import {Requester} from './index'

class file_uploader extends Requester{
  refreshFormUsers(){
    return this.requestURI("api/mobile/file_uploader/load_file_upload_users", {method: 'POST'})
  }

  refreshFormParams(user_id){
    return this.requestURI("api/mobile/file_uploader/load_file_upload_params", {method: 'POST', params: {user_id}})
  }

  getComptaAnalytics(user_id=null, journal='', pieces=[]){
    return this.requestURI("api/mobile/file_uploader/load_user_analytics", {method: 'POST', params: { user_id: user_id, journal: journal, pieces: JSON.parse(pieces) } })
  }

  setComptaAnalytics(pieces=[], analytics=[]){
    return this.requestURI("api/mobile/file_uploader/set_pieces_analytics", {method: 'POST', params: { file_compta_analysis: JSON.parse(analytics), pieces: JSON.parse(pieces) } })
  }
}

export const FileUploader = new file_uploader()
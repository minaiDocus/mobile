import {Requester} from './index'

class file_uploader extends Requester{
  refreshFormParams(){
    return this.requestURI("api/mobile/file_uploader/load_file_upload_params", {method: 'POST'})
  }
}

export const FileUploader = new file_uploader()
import Requester from './activeRequest'

export default class file_uploader extends Requester{
  async refreshFormParams(){
    this.synchronious_response = ""
    this.requestURI("api/mobile/file_uploader/load_file_upload_params", {method: 'POST'}, (r) => {
      if(r.error){ 
        //handling errors
        this.synchronious_response = r
      }
      else
      {
        this.synchronious_response = r
      }
    })
    while(this.synchronious_response == "")
    {
      await this.sleep(300)
    }
  }
}
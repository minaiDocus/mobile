import Requester from './activeRequest'

class file_uploader extends Requester{
  async refreshFormParams(){
    let response = ""
    this.requestURI("api/mobile/file_uploader/load_file_upload_params", {method: 'POST'}, (r) => {
      if(r.error){ 
        //handling errors
        response = r
      }
      else
      {
        response = r
      }
    })
    while(response == "")
    {
      await this.sleep(300)
    }

    return response
  }
}

export default new file_uploader()
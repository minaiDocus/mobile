import Requester from './activeRequest'
import Config from '../Config'
import base64 from 'base-64'
import User from '../models/User'

export default class data_loader extends Requester{

  render_document_uri(data, forcing_temp = false){
    let forcing=""  
    if(forcing_temp)
    {
      forcing="&force_temp_document=true"
    }
    const uri = encodeURI(`${Config.http_host}api/mobile/data_loader/render_image_documents/?auth_token=${User.getMaster().auth_token}&id=${data.id}&style=${data.style}&${data.filter}${forcing}`)
    let src = ''
    if(Config.server == "staging") //if accessing staging server
    {
      src = {
              uri: uri,
              cached: false,
              headers:  {
                          Authorization: "Basic " + base64.encode(Config.user + ":" + Config.pass)
                        }
            }
    }
    else
    {
      src = {uri: uri, cached: true}
    }

    return src
  }

  async getStats(dataFilters={}, page=1, order={}){
    this.synchronious_response = ""

    this.requestURI("api/mobile/data_loader/load_stats", {method: 'POST', params:{paper_process_contains: dataFilters, page: page, order: order}}, (r) => {
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

  async getDocumentsProcessed(pack_id, page=1, text=""){
    this.synchronious_response = ""
    this.requestURI("api/mobile/data_loader/load_documents_processed", {method: 'POST', params:{id: pack_id, page: page, filter: text}}, (r) => {
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

  async getDocumentsProcessing(pack_id){
    this.synchronious_response = ""
    this.requestURI("api/mobile/data_loader/load_documents_processing", {method: 'POST', params:{id: pack_id}}, (r) => {
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


  async refreshPacks(){
    this.synchronious_response = ""
    this.requestURI("api/mobile/data_loader/load_packs", {method: 'POST'}, (r) => {
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

  async refreshCustomers(){
    this.synchronious_response = ""
    this.requestURI("api/mobile/data_loader/load_customers", {method: 'POST'}, (r) => {
      if(r.error){ 
        //handling errors
        this.synchronious_response = r.message
      }
      else
      {
        User.deleteCustomers()
        r.customers.map((usr, index)=>{
          User.create_or_update((index +  2), usr)
        })
        this.synchronious_response = true
      }
    })
    while(this.synchronious_response == "")
    {
      await this.sleep(300)
    }
  }

  async getPacks(page=1, text="", owner_id=0){
    if(owner_id <= 0)
    {
      owner_id = 'all'
    }

    this.synchronious_response = ""
    this.requestURI("api/mobile/data_loader/get_packs", {method: 'POST', params: {page: page, view: owner_id, filter: text}}, (r) => {
      this.synchronious_response = r
    })
    while(this.synchronious_response == "")
    {
      await this.sleep(300)
    }
  }
}
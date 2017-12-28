import Requester from './activeRequest'
import Config from '../Config'
import base64 from 'base-64'
import User from '../models/User'
import Pack from '../models/Pack'

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
              headers:  {
                          Authorization: "Basic " + base64.encode(Config.user + ":" + Config.pass)
                        }
            }
    }
    else
    {
      src = {uri: uri}
    }

    return src
  }

  async getStats(dataFilters={}, page=1){
    this.synchronious_response = ""

    this.requestURI("api/mobile/data_loader/load_stats", {method: 'POST', params:{paper_process_contains: dataFilters, page: page}}, (r) => {
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

  async getPackDocuments(pack_id){
    this.synchronious_response = ""
    this.requestURI("api/mobile/data_loader/load_packs_documents", {method: 'POST', params:{id: pack_id}}, (r) => {
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
        this.synchronious_response = r.message
      }
      else
      {
        Pack.deleteAll()
        r.packs.map((pack, index)=>{
          Pack.create_or_update((index+1), pack)
        })
        this.synchronious_response = true
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

  async filterPacks(text="", owner_id=0){
    if(owner_id <= 0)
    {
      owner_id = 'all'
    }

    this.synchronious_response = ""
    this.requestURI("api/mobile/data_loader/filter_packs", {method: 'POST', params: {page:1, view: owner_id, filter: text}}, (r) => {
      this.synchronious_response = r
    })
    while(this.synchronious_response == "")
    {
      await this.sleep(300)
    }
  }
}
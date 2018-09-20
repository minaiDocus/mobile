import {Requester} from './index'
import base64 from 'base-64'
import {User} from '../models'

class documents_fetcher extends Requester{

  renderDocumentUri(data, forcing_temp = false){
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
              cached: true,
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

  getStats(dataFilters={}, page=1, order={}){
    return this.requestURI("api/mobile/data_loader/load_stats", {method: 'POST', params:{paper_process_contains: dataFilters, page: page, order: order}})
  }

  getDocumentsProcessed(pack_id, page=1, text=""){
    return this.requestURI("api/mobile/data_loader/load_documents_processed", {method: 'POST', params:{id: pack_id, page: page, filter: text}})
  }

  getDocumentsProcessing(pack_id){
    return this.requestURI("api/mobile/data_loader/load_documents_processing", {method: 'POST', params:{id: pack_id}})
  }


  refreshPacks(){
    return this.requestURI("api/mobile/data_loader/load_packs", {method: 'POST'})
  }

  getPacks(page=1, text="", owner_id=0){
    if(owner_id <= 0)
    {
      owner_id = 'all'
    }

    return this.requestURI("api/mobile/data_loader/get_packs", {method: 'POST', params: {page: page, view: owner_id, filter: text}})
  }
}

export const DocumentsFetcher = new documents_fetcher()
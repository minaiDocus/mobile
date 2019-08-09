import {Requester} from './index'
import base64 from 'base-64'

class documents_fetcher extends Requester{

  renderDocumentUri(data={}, forcing_temp = false){
    let forcing=""  
    if(forcing_temp)
      forcing="&force_temp_document=true"

    const uri = encodeURI(`${Config.http_host}api/mobile/data_loader/render_image_documents/?auth_token=${Master.auth_token}&id=${data.id}&style=${data.style}&${data.filter}${forcing}`)
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
    return this.requestURI("api/mobile/data_loader/load_stats", {method: 'POST', params: {paper_process_contains: dataFilters, page: page, order: order}})
  }

  getDocumentsProcessed(pack_id, page=1, filters={}){
    return this.requestURI("api/mobile/data_loader/load_documents_processed", {method: 'POST', params: {id: pack_id, page: page, filter: filters}})
  }

  getDocumentsProcessing(pack_id, page=1){
    return this.requestURI("api/mobile/data_loader/load_documents_processing", {method: 'POST', params: {id: pack_id, page: page}})
  }

  refreshPacks(){
    return this.requestURI("api/mobile/data_loader/load_packs", {method: 'POST'})
  }

  getPacks(page=1, owner_id=0, filters={}){
    if(owner_id <= 0)
      owner_id = 'all'

    return this.requestURI("api/mobile/data_loader/get_packs", {method: 'POST', params: {page: page, view: owner_id, filter: filters}})
  }

  getReports(page=1, owner_id=0, filters={}){
    if(owner_id <= 0)
      owner_id = 'all'

    return this.requestURI("api/mobile/data_loader/get_reports", {method: 'POST', params: {page: page, view: owner_id, filter: filters}})
  }

  getPreseizures(pack_or_report_id, type='pack', page=1, filters={}){
    return this.requestURI("api/mobile/data_loader/load_preseizures", {method: 'POST', params: {id: pack_or_report_id, page: page, filter: filters, type: type}})
  }

  getPreseizureDetails(id){
    return this.requestURI("api/mobile/data_loader/get_preseizure_details", {method: 'POST', params: {id: id}})
  }

  // ids = must be preseizure ids array (can be null if id is set)
  // id  = must be pack or report id (for multiple sending by pack or report) 
  // type = pack (preseizures from pieces) or report (preseizures from operations)
  deliverPreseizure(ids=null, id=null, type='report'){
    return this.requestURI("api/mobile/data_loader/deliver", {method: 'POST', params: {ids: ids, id: id, type: type}})
  }

  editPreseizures(ids, datas={}){
    return this.requestURI("api/mobile/data_loader/edit_preseizures", {method: 'POST', params: {ids: ids, datas: datas}})
  }

  setPreseizureEntry(id, params={}){
    return this.requestURI("api/mobile/data_loader/edit_entry", {method: 'POST', params: {id: id, datas: params}})
  }

  setPreseizureAccount(id, params={}){
    return this.requestURI("api/mobile/data_loader/edit_account", {method: 'POST', params: {id: id, datas: params}})
  }
}

export const DocumentsFetcher = new documents_fetcher()
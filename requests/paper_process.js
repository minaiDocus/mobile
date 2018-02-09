import Config from '../Config'
import {Requester} from './index'

class paper_process extends Requester{
  async getStats(dataFilters={}, page=1, order={}){
    let response = ""
    this.requestURI("api/mobile/data_loader/load_stats", {method: 'POST', params:{paper_process_contains: dataFilters, page: page, order: order}}, (r) => {
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

export const PaperProcess = new paper_process()
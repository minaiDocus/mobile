import {Requester} from './index'

class paper_process extends Requester{
  getStats(dataFilters={}, page=1, order={}){
    return this.requestURI("api/mobile/data_loader/load_stats", {method: 'POST', params:{paper_process_contains: dataFilters, page: page, order: order}})
  }
}

export const PaperProcess = new paper_process()
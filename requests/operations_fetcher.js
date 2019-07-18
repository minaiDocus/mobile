import {Requester} from './index'

class operations_fetcher extends Requester{
  getOperations(page=1, user_id=0, order={}, filters={}){
    return this.requestURI("api/mobile/operations/get_operations", {method: 'POST', params: {page: page, user_id: user_id, order: order, filter: filters}})
  }

  getCustomersOptions(user_ids){
    return this.requestURI("api/mobile/operations/get_customers_options", {method: 'POST', params: {user_ids: user_ids}})
  }

  forcePreAssignment(user_id=0){
    return this.requestURI("api/mobile/operations/force_pre_assignment", {method: 'POST', params:{user_id: user_id}})
  }
}

export const OperationsFetcher = new operations_fetcher()
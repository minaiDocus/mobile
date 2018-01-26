import Requester from './activeRequest'
import Config from '../Config'
import User from '../models/User'

class users_fetcher extends Requester{
  async refreshCustomers(){
    let response = ""
    this.requestURI("api/mobile/data_loader/load_customers", {method: 'POST'}, (r) => {
      if(r.error){ 
        //handling errors
        response = r.message
      }
      else
      {
        User.deleteCustomers()
        r.customers.map((usr, index)=>{
          User.create_or_update((index +  2), usr)
        })
        response = true
      }
    })
    while(response == "")
    {
      await this.sleep(300)
    }
    return response 
  }
}

export default new users_fetcher()
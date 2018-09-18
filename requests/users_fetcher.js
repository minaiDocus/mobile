import {Requester} from './index'
import {User, Organization} from '../models'

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
          User.createOrUpdate((index +  2), usr)
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

  async refreshOrganizations(){
    let response = ""
    this.requestURI("api/mobile/data_loader/load_user_organizations", {method: 'POST'}, (r) => {
      if(r.error){ 
        //handling errors
        response = r.message
      }
      else
      {
        let id_to_activate = 0
        const active = Organization.getActive()
        if(active != null)
          id_to_activate = active.id

        Organization.deleteAll()
        Organization.add(r.organizations)

        if(Organization.find(`id=${id_to_activate}`)[0]) Organization.activate(id_to_activate)

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

export const UsersFetcher = new users_fetcher()
import {Requester} from './index'
import {User, Organization} from '../models'

class users_fetcher extends Requester{
  refreshCustomers(){
    if(User.needUpdate())
    {
      User.updating()
      return  this.requestURI("api/mobile/data_loader/load_customers", {method: 'POST'},
              {
                onResolve: (r)=>{
                  User.deleteCustomers()
                  r.customers.map((usr, index)=>{
                    User.createOrUpdate((index +  2), usr)
                  })
                  User.updating(false)
                },
                onReject: (r) => { User.updating(false) }
              })
    }
    else
    {
      return new Promise(resolve => resolve(true))
    }
  }

  refreshOrganizations(){
    if(Organization.needUpdate())
    {
      Organization.updating()
      return  this.requestURI("api/mobile/data_loader/load_user_organizations", {method: 'POST'},
              {
                onResolve: (r)=>{
                  let id_to_activate = 0
                  const active = Organization.getActive()
                  if(active != null) id_to_activate = active.id

                  Organization.deleteAll()
                  Organization.add(r.organizations)

                  if(Organization.find(`id=${id_to_activate}`)[0]) Organization.activate(id_to_activate)
                  Organization.updating(false)
                },
                onReject: (r)=> { Organization.updating(false) }
              })
    }
    else
    {
      return new Promise(resolve => resolve(true))
    }
  }
}

export const UsersFetcher = new users_fetcher()
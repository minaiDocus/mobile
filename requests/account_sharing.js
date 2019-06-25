import { Organization } from '../models'
import { Requester } from './index'

class account_sharing extends Requester{

  waitingForOrganization(url, params){
    return new Promise((resolve, reject)=>{
      const loading = ()=>{
        if(Organization.isUpdating())
        {
          setTimeout(loading, 1000)
        }
        else
        {
          new_params = {}
          Object.assign(new_params, params, { organization_id: this.organizationId() })
          this.requestURI(url, {method: 'POST', params: new_params}).then(r => resolve(r)).catch(e => reject(e))
        }
      }
      loading()
    })
  }

  organizationId(){
    try{return Organization.getActive().id}
    catch(e){return 0}
  }

  getSharedDocsCustomers(){
    return this.requestURI("api/mobile/account_sharing/load_shared_docs_customers", {method: 'POST'})
  }

  addSharedDocCustomers(params){
    return this.requestURI("api/mobile/account_sharing/add_shared_docs_customers", {user: params})
  }

  addSharingRequestCustomers(params){
    return this.requestURI("api/mobile/account_sharing/add_sharing_request_customers", {account_sharing_request: params})
  }

  getSharedContacts(dataFilters={}, page=1, order={}){
    const params =  {
                      guest_collaborator_contains:  dataFilters,
                      page:                         page,
                      order:                        order
                    }

    return this.waitingForOrganization("api/mobile/account_sharing/load_shared_contacts", params)
  }

  getSharedDocs(dataFilters={}, page=1, order={}){
    const params =  {
                      account_sharing_contains:   dataFilters,
                      page:                       page,
                      order:                      order
                    } 

    return this.waitingForOrganization("api/mobile/account_sharing/load_shared_docs", params)
  }

  getListCollaborators(text=""){
    return this.waitingForOrganization("api/mobile/account_sharing/get_list_collaborators", {q: text})
  }

  getListCustomers(text=""){
    return this.waitingForOrganization("api/mobile/account_sharing/get_list_customers", {q: text})
  }

  addSharedDoc(account_sharing){
    return this.waitingForOrganization("api/mobile/account_sharing/add_shared_docs", {account_sharing})
  }

  addSharedContact(dataForm){
    return this.waitingForOrganization("api/mobile/account_sharing/add_shared_contacts", {user: dataForm})
  }

  editSharedContact(dataForm){
    return this.waitingForOrganization("api/mobile/account_sharing/edit_shared_contacts", {id: dataForm.id_idocus, user: dataForm})
  }

  acceptSharedDoc(id_doc){
    return this.waitingForOrganization("api/mobile/account_sharing/accept_shared_docs", {id: id_doc})
  }

  deleteSharedDoc(id_doc, type = 'admin'){
    return this.waitingForOrganization("api/mobile/account_sharing/delete_shared_docs", {id: id_doc, type: type})
  }

  deleteSharedContact(id){
    return this.waitingForOrganization("api/mobile/account_sharing/delete_shared_contacts", {id: id})
  }
}

export const AccountSharing = new account_sharing()
import { Organization } from '../models'
import { Requester } from './index'

class account_sharing extends Requester{

  organizationId(){
    try{return Organization.getActive().id}
    catch(e){return 0}
  }

  getSharedDocsCustomers(){
    return this.requestURI("api/mobile/account_sharing/load_shared_docs_customers", {method: 'POST'})
  }

  getSharedContacts(dataFilters={}, page=1, order={}){
    const params =  {
                      organization_id:              this.organizationId(),
                      guest_collaborator_contains:  dataFilters,
                      page:                         page,
                      order:                        order
                    }

    return this.requestURI("api/mobile/account_sharing/load_shared_contacts", {method: 'POST', params})
  }

  addSharedDocCustomers(params){
    return this.requestURI("api/mobile/account_sharing/add_shared_docs_customers", {method: 'POST', params:{user: params}})
  }

  addSharingRequestCustomers(params){
    return this.requestURI("api/mobile/account_sharing/add_sharing_request_customers", {method: 'POST', params:{account_sharing_request: params}})
  }

  getSharedDocs(dataFilters={}, page=1, order={}){
    const params =  {
                      organization_id:            this.organizationId(), 
                      account_sharing_contains:   dataFilters,
                      page:                       page,
                      order:                      order
                    } 

    return this.requestURI("api/mobile/account_sharing/load_shared_docs", {method: 'POST', params})
  }

  getListCollaborators(text=""){
    return this.requestURI("api/mobile/account_sharing/get_list_collaborators", {method: 'POST', params:{organization_id: this.organizationId(), q: text}})
  }

  getListCustomers(text=""){
    return this.requestURI("api/mobile/account_sharing/get_list_customers", {method: 'POST', params:{organization_id: this.organizationId(), q: text}})
  }

  addSharedDoc(account_sharing){
    return this.requestURI("api/mobile/account_sharing/add_shared_docs", {method: 'POST', params:{organization_id: this.organizationId(), account_sharing}})
  }

  addSharedContact(dataForm){
    return this.requestURI("api/mobile/account_sharing/add_shared_contacts", {method: 'POST', params:{organization_id: this.organizationId(), user: dataForm}})
  }

  editSharedContact(dataForm){
    return this.requestURI("api/mobile/account_sharing/edit_shared_contacts", {method: 'POST', params:{organization_id: this.organizationId(), id: dataForm.id_idocus, user: dataForm}})
  }

  acceptSharedDoc(id_doc){
    return this.requestURI("api/mobile/account_sharing/accept_shared_docs", {method: 'POST', params:{organization_id: this.organizationId(), id: id_doc}})
  }

  deleteSharedDoc(id_doc, type = 'admin'){
    return this.requestURI("api/mobile/account_sharing/delete_shared_docs", {method: 'POST', params:{organization_id: this.organizationId(), id: id_doc, type: type}})
  }

  deleteSharedContact(id){
    return this.requestURI("api/mobile/account_sharing/delete_shared_contacts", {method: 'POST', params:{organization_id: this.organizationId(), id: id}})
  }
}

export const AccountSharing = new account_sharing()
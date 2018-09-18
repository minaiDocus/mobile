import { Organization } from '../models'
import { Requester } from './index'

class account_sharing extends Requester{

  organizationId(){
    try{return Organization.getActive().id}
    catch(e){return 0}
  }

  async getSharedDocsCustomers(){
    let response = ""

    this.requestURI("api/mobile/account_sharing/load_shared_docs_customers", {method: 'POST'}, (r) => {
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

  async getSharedContacts(dataFilters={}, page=1, order={}){
    let response = ""

    const params =  {
                      organization_id:              this.organizationId(),
                      guest_collaborator_contains:  dataFilters,
                      page:                         page,
                      order:                        order
                    }

    this.requestURI("api/mobile/account_sharing/load_shared_contacts", {method: 'POST', params}, (r) => {
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

  async addSharedDocCustomers(params){
    let response = ""

    this.requestURI("api/mobile/account_sharing/add_shared_docs_customers", {method: 'POST', params:{user: params}}, (r) => {
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

  async addSharingRequestCustomers(params){
    let response = ""

    this.requestURI("api/mobile/account_sharing/add_sharing_request_customers", {method: 'POST', params:{account_sharing_request: params}}, (r) => {
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

  async getSharedDocs(dataFilters={}, page=1, order={}){
    let response = ""

    const params =  {
                      organization_id:            this.organizationId(), 
                      account_sharing_contains:   dataFilters,
                      page:                       page,
                      order:                      order
                    } 

    this.requestURI("api/mobile/account_sharing/load_shared_docs", {method: 'POST', params}, (r) => {
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

  async getListCollaborators(text=""){
    let response = ""

    this.requestURI("api/mobile/account_sharing/get_list_collaborators", {method: 'POST', params:{organization_id: this.organizationId(), q: text}}, (r) => {
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

  async getListCustomers(text=""){
    let response = ""

    this.requestURI("api/mobile/account_sharing/get_list_customers", {method: 'POST', params:{organization_id: this.organizationId(), q: text}}, (r) => {
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

  async addSharedDoc(account_sharing){
    let response = ""

    this.requestURI("api/mobile/account_sharing/add_shared_docs", {method: 'POST', params:{organization_id: this.organizationId(), account_sharing}}, (r) => {
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

  async addSharedContact(dataForm){
    let response = ""

    this.requestURI("api/mobile/account_sharing/add_shared_contacts", {method: 'POST', params:{organization_id: this.organizationId(), user: dataForm}}, (r) => {
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

  async editSharedContact(dataForm){
    let response = ""

    this.requestURI("api/mobile/account_sharing/edit_shared_contacts", {method: 'POST', params:{organization_id: this.organizationId(), id: dataForm.id_idocus, user: dataForm}}, (r) => {
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

  async acceptSharedDoc(id_doc){
    let response = ""

    this.requestURI("api/mobile/account_sharing/accept_shared_docs", {method: 'POST', params:{organization_id: this.organizationId(), id: id_doc}}, (r) => {
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

  async deleteSharedDoc(id_doc, type = 'admin'){
    let response = ""

    this.requestURI("api/mobile/account_sharing/delete_shared_docs", {method: 'POST', params:{organization_id: this.organizationId(), id: id_doc, type: type}}, (r) => {
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

  async deleteSharedContact(id){
    let response = ""

    this.requestURI("api/mobile/account_sharing/delete_shared_contacts", {method: 'POST', params:{organization_id: this.organizationId(), id: id}}, (r) => {
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

export const AccountSharing = new account_sharing()
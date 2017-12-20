import Requester from './activeRequest'

export default class account_sharing extends Requester{
  async getSharedDocsCustomers(){
    this.synchronious_response = ""

    this.requestURI("api/mobile/account_sharing/load_shared_docs_customers", {method: 'POST'}, (r) => {
      if(r.error){ 
        //handling errors
        this.synchronious_response = r
      }
      else
      {
        this.synchronious_response = r
      }
    })
    while(this.synchronious_response == "")
    {
      await this.sleep(300)
    }
  }

  async getSharedContacts(dataFilters={}){
    this.synchronious_response = ""

    this.requestURI("api/mobile/account_sharing/load_shared_contacts", {method: 'POST', params:{guest_collaborator_contains: dataFilters}}, (r) => {
      if(r.error){ 
        //handling errors
        this.synchronious_response = r
      }
      else
      {
        this.synchronious_response = r
      }
    })
    while(this.synchronious_response == "")
    {
      await this.sleep(300)
    }
  }

  async addSharedDocCustomers(params){
    this.synchronious_response = ""

    this.requestURI("api/mobile/account_sharing/add_shared_docs_customers", {method: 'POST', params:{user: params}}, (r) => {
      if(r.error){ 
        //handling errors
        this.synchronious_response = r
      }
      else
      {
        this.synchronious_response = r
      }
    })
    while(this.synchronious_response == "")
    {
      await this.sleep(300)
    }
  }

  async addSharingRequestCustomers(params){
    this.synchronious_response = ""

    this.requestURI("api/mobile/account_sharing/add_sharing_request_customers", {method: 'POST', params:{account_sharing_request: params}}, (r) => {
      if(r.error){ 
        //handling errors
        this.synchronious_response = r
      }
      else
      {
        this.synchronious_response = r
      }
    })
    while(this.synchronious_response == "")
    {
      await this.sleep(300)
    }
  }

  async getSharedDocs(dataFilters={}){
    this.synchronious_response = ""

    this.requestURI("api/mobile/account_sharing/load_shared_docs", {method: 'POST', params:{account_sharing_contains: dataFilters}}, (r) => {
      if(r.error){ 
        //handling errors
        this.synchronious_response = r
      }
      else
      {
        this.synchronious_response = r
      }
    })
    while(this.synchronious_response == "")
    {
      await this.sleep(300)
    }
  }

  async get_list_collaborators(){
    this.synchronious_response = ""

    this.requestURI("api/mobile/account_sharing/get_list_collaborators", {method: 'POST'}, (r) => {
      if(r.error){ 
        //handling errors
       this.synchronious_response = r
      }
      else
      {
        this.synchronious_response = r
      }
    })
    while(this.synchronious_response == "")
    {
      await this.sleep(300)
    }
  }

  async addSharedDoc(account_sharing){
    this.synchronious_response = ""

    this.requestURI("api/mobile/account_sharing/add_shared_docs", {method: 'POST', params:{account_sharing}}, (r) => {
      if(r.error){ 
        //handling errors
        this.synchronious_response = r
      }
      else
      {
        this.synchronious_response = r
      }
    })
    while(this.synchronious_response == "")
    {
      await this.sleep(300)
    }
  }

  async addSharedContact(dataForm){
    this.synchronious_response = ""

    this.requestURI("api/mobile/account_sharing/add_shared_contacts", {method: 'POST', params:{user: dataForm}}, (r) => {
      if(r.error){ 
        //handling errors
        this.synchronious_response = r
      }
      else
      {
        this.synchronious_response = r
      }
    })
    while(this.synchronious_response == "")
    {
      await this.sleep(300)
    }
  }

    async editSharedContact(dataForm){
    this.synchronious_response = ""

    this.requestURI("api/mobile/account_sharing/edit_shared_contacts", {method: 'POST', params:{id: dataForm.id_idocus, user: dataForm}}, (r) => {
      if(r.error){ 
        //handling errors
        this.synchronious_response = r
      }
      else
      {
        this.synchronious_response = r
      }
    })
    while(this.synchronious_response == "")
    {
      await this.sleep(300)
    }
  }

  async acceptSharedDoc(id_doc){
    this.synchronious_response = ""

    this.requestURI("api/mobile/account_sharing/accept_shared_docs", {method: 'POST', params:{id: id_doc}}, (r) => {
      if(r.error){ 
        //handling errors
        this.synchronious_response = r
      }
      else
      {
        this.synchronious_response = r
      }
    })
    while(this.synchronious_response == "")
    {
      await this.sleep(300)
    }
  }

  async deleteSharedDoc(id_doc, type = 'admin'){
    this.synchronious_response = ""

    this.requestURI("api/mobile/account_sharing/delete_shared_docs", {method: 'POST', params:{id: id_doc, type: type}}, (r) => {
      if(r.error){ 
        //handling errors
        this.synchronious_response = r
      }
      else
      {
        this.synchronious_response = r
      }
    })
    while(this.synchronious_response == "")
    {
      await this.sleep(300)
    }
  }

  async deleteSharedContact(id){
    this.synchronious_response = ""

    this.requestURI("api/mobile/account_sharing/delete_shared_contacts", {method: 'POST', params:{id: id}}, (r) => {
      if(r.error){ 
        //handling errors
        this.synchronious_response = r
      }
      else
      {
        this.synchronious_response = r
      }
    })
    while(this.synchronious_response == "")
    {
      await this.sleep(300)
    }
  }
}
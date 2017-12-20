class account_sharing_document{
  synchronious_response = r
   getSharedDocsCustomers(){
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
  }
}
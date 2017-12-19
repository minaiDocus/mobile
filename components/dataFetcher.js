import Config from '../Config'
import base64 from 'base-64'
import Realm from 'realm'
import User from '../models/User'
import Pack from '../models/Pack'

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extract_structure_json(data){
  var temp = JSON.stringify(data).toString()
  temp = temp.replace(/[{}"]/ig, "")
  var tab = temp.split(",")
  
  var object = ""
  tab.map(item => { 
    var parse = item.split(":")
    var key = parse[0]
    var value = parse[1]
    var type = "string"

    if(value == "true" || value == "false" ){type = "bool"}
    if(/^[0-9]+$/.test(value)){type = "int"} 

    if(key!='id'){object += `"${key}":"${type}", ` }
  })

  return JSON.parse(`{${object} "id":"int"}`)
}

class Fetcher {

  responseFetching = ""
  synchronious_response = ""

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
      await sleep(300)
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
      await sleep(300)
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
      await sleep(300)
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
      await sleep(300)
    }
  }

  async deleteSharedDoc(id_doc){
    this.synchronious_response = ""

    this.requestURI("api/mobile/account_sharing/delete_shared_docs", {method: 'POST', params:{id: id_doc}}, (r) => {
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
      await sleep(300)
    }
  }

  async getStats(dataFilters={}){
    this.synchronious_response = ""

    this.requestURI("api/mobile/data_loader/load_stats", {method: 'POST', params:{paper_process_contains: dataFilters}}, (r) => {
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
      await sleep(300)
    }
  }

  async getPackDocuments(pack_id){
    this.synchronious_response = ""
    this.requestURI("api/mobile/data_loader/load_packs_documents", {method: 'POST', params:{id: pack_id}}, (r) => {
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
      await sleep(300)
    }
  }


  async refreshFormParams(){
    this.synchronious_response = ""
    this.requestURI("api/mobile/file_uploader/load_file_upload_params", {method: 'POST'}, (r) => {
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
      await sleep(300)
    }
  }

  async ping_server(callback=()=>{}){
    this.synchronious_response = ""
    this.requestURI("api/mobile/remote_authentication/ping", {method: 'POST'}, (r) => {
      if(r.error){ 
        //handling errors
        this.synchronious_response = r.message
        callback(r.message)
      }
      else
      {
        this.synchronious_response = r.message
        callback(r.message)
      }
    })
    while(this.synchronious_response == "")
    {
      await sleep(300)
    }
  }

  async refreshPacks(){
    this.synchronious_response = ""
    this.requestURI("api/mobile/data_loader/load_packs", {method: 'POST'}, (r) => {
      if(r.error){ 
        //handling errors
        this.synchronious_response = r.message
      }
      else
      {
        Pack.deleteAll()
        r.packs.map((pack, index)=>{
          Pack.create_or_update((index+1), pack)
        })
        this.synchronious_response = true
      }
    })
    while(this.synchronious_response == "")
    {
      await sleep(300)
    }
  }

  async refreshCustomers(){
    this.synchronious_response = ""
    this.requestURI("api/mobile/data_loader/load_customers", {method: 'POST'}, (r) => {
      if(r.error){ 
        //handling errors
        this.synchronious_response = r.message
      }
      else
      {
        User.deleteCustomers()
        r.customers.map((usr, index)=>{
          User.create_or_update((index +  2), usr)
        })
        this.synchronious_response = true
      }
    })
    while(this.synchronious_response == "")
    {
      await sleep(300)
    }
  }

  async filterPacks(text="", owner_id=0){
    if(owner_id <= 0)
    {
      owner_id = 'all'
    }

    this.synchronious_response = ""
    this.requestURI("api/mobile/data_loader/filter_packs", {method: 'POST', params: {page:1, view: owner_id, filter: text}}, (r) => {
      this.synchronious_response = r
    })
    while(this.synchronious_response == "")
    {
      await sleep(300)
    }
  }

  remoteAUTH(options, callback=()=>{}){
    this.requestURI("api/mobile/remote_authentication/request_connexion",  {method: 'POST', params: options}, (r) => {
      if(r.error)
      {
        callback('error', r.message)
      }
      else
      {
        User.deleteAll()
        User.create_or_update(1, r.user, true)
        callback('success', '')
      }
    })
  }

  render_document_uri(data, forcing_temp = false){
    let forcing=""  
    if(forcing_temp)
    {
      forcing="&force_temp_document=true"
    }
    const uri = encodeURI(`${Config.http_host}api/mobile/data_loader/render_image_documents/?auth_token=${User.getMaster().auth_token}&id=${data.id}&style=${data.style}&${data.filter}${forcing}`)
    let src = ''
    if(/https/i.test(Config.http_host)) //if accessing https server
    {
      src = {
              uri: uri,
              headers:  {
                          Authorization: "Basic " + base64.encode(Config.user + ":" + Config.pass)
                        }
            }
    }
    else
    {
      src = {uri: uri}
    }

    return src
  }

  clearAll(){
    User.deleteAll()
    Pack.deleteAll()
  }

  create_temp_realm(datas, realm_schema="_temp", name="temp"){
      if(!Array.isArray(datas)){datas = [datas]}
      if(datas.length > 0)
      {
      const properties = extract_structure_json(datas[0])

      const temp_schema = {   name: name,
                              primaryKey: 'id',
                              properties
                           }

      const realm = new Realm({path: realm_schema+'.realm', schema: [temp_schema], inMemory: true})
      realm.write(()=>{
          realm.delete(realm.objects(name)) //erase datas

          datas.map((value, key)=>{ 
            Object.assign(value, {id: key}, value)
            realm.create(name, value, true); 
          })
        });

      return realm.objects(name)
    }
    else
    {
      return []
    }
  }

  requestURI(uri, options, callback){
    this.responseFetching = ""
    const url = Config.http_host + uri
    const method = options.method || 'GET'
    var request = new XMLHttpRequest()

    request.open(method, url)
    request.setRequestHeader("Content-Type", "application/json")

    if (/https/i.test(Config.http_host)) //if accessing https server
    {request.setRequestHeader("Authorization", "Basic " + base64.encode(Config.user + ":" + Config.pass))}

    //Aborting query if too long (For fixing bug http request on iOS)
    const aborting = (callback) => {
        if(this.responseFetching == "")
        {
          request.abort()
          this.responseFetching = {error: true, message: "Impossible de se connecter au serveur!!"}
          callback(this.responseFetching)
        }
    }


    if(method == 'POST')
    {
      const parameters = {}
      const auth_token = {auth_token: User.getMaster().auth_token}
      Object.assign(parameters, auth_token, options.params)
      setTimeout(()=>{
        aborting(callback)
      }, 15000)
      request.send(JSON.stringify(parameters)) 
    }
    else 
    {
      setTimeout(()=>{
        aborting(callback)
      }, 15000)
      request.send()
    }

    request.onload = (e) => {
      if (request.readyState === 4)
      {
        if(request.status != 200)
          this.responseFetching = handlingHttpErrors(request)
        else
          this.responseFetching = JSON.parse(request.responseText)

        callback(this.responseFetching)  
      }
    }

    request.onerror = (e) => {
      this.responseFetching = handlingHttpErrors(request)
      callback(this.responseFetching)
    }
  }

  async wait_for(func=[], callback){
    let responses = []
    for(var i=0; i<func.length;i++)
    {
      await eval('this.'+func[i])
      responses = responses.concat(this.synchronious_response)
    }

    callback(responses)
  }
}

export default new Fetcher();
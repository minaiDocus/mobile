import Config from '../Config'
import base64 from 'base-64'
import Realm from 'realm'
import User from '../models/User'
import Pack from '../models/Pack'

class Fetcher{
  constructor(name=""){
    // const class_name = require(name)
    if(name!=""){this.request = new name}
  }

  clearAll(){
    User.deleteAll()
    Pack.deleteAll()
  }

  setRequest(name){
    // const class_name = require(name)
    this.request = new name
    return this
  }

  extract_structure_json(data={}){
    try{
      var temp = JSON.stringify(data).toString()
      temp = temp.replace(/[{}"]/ig, "")
      var tab = temp.split(",")
      
      var object = ""
      tab.map(item => { 
        var parse = item.split(":")
        var key = parse[0]
        var value = parse[1]
        var type = "string?"

        if(value == "true" || value == "false" ){type = "bool?"}
        // if(/^[0-9]+$/.test(value)){type = "int"} 

        if(key!='id'){object += `"${key}":"${type}", ` }
      })

      return JSON.parse(`{${object} "id":"int"}`)
    }
    catch(e){
      return null
    }
  }

  create_temp_realm(datas, realm_schema="_temp", page=1, name="temp"){
    if(!Array.isArray(datas)){datas = [datas]}
    if(datas.length > 0)
    {
      const properties = this.extract_structure_json(datas[0])
      if(properties != null)
      {
        const temp_schema = {   name: name,
                                primaryKey: 'id',
                                properties
                             }

        const realm = new Realm({path: realm_schema+'.realm', schema: [temp_schema], inMemory: true})
        realm.write(()=>{
            if(page == 1){realm.delete(realm.objects(name))} //erase datas

            datas.map((value, key)=>{
              let _id = 0
              try
              {_id = parseInt(value.id_idocus)}
              catch(e)
              {_id = key}
              
              Object.assign(value, {id: _id}, value)
              realm.create(name, value, true)
            })
          });

        return realm.objects(name)
      }
      else
      {
        return []
      }
    }
    else
    {
      return []
    }
  }

  async wait_for(func=[], callback){
    let responses = []
    for(var i=0; i<func.length;i++)
    {
      await eval('this.request.'+func[i])
      responses = responses.concat(this.request.synchronious_response)
    }

    callback(responses)
  }
}

export default Fetcher;
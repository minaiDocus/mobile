import Config from '../Config'
import Realm from 'realm'

export class ActiveRecord {
  constructor(realmName, schema, objectName){
    this.objectName = objectName
    this._realm = new Realm({path: realmName + '.realm', schema:[schema], encryptionKey: Config.keydb})
  }

  // erase_old_db(db_name){
  //   let path = Realm.defaultPath
  //   let object = new ActiveXObject("Scripting.FileSystemObject")
  //   let f = object.GetFile('');
  //   f.Delete();
  // }

  deleteAll() {
    if(this.objectName.length > 0)
    {
      this._realm.write(()=>{
        this._realm.delete(this._realm.objects(this.objectName))
      })
    }
  }
  
  delete(obj){
    if(this.objectName.length > 0)
    {
      this._realm.write(()=>{
        this._realm.delete(obj)
      })
    }
  }

  insert(datas){
    if(datas.length > 0 && this.objectName.length > 0)
    {
      this._realm.write(()=>{
        datas.map((value, key)=>{ this._realm.create(this.objectName, value, true); })
      })
    }
  }

  find(where=""){    
    if(this.objectName.length > 0)
    {
      if(where.length == 0) {  return this._realm.objects(this.objectName) }
      else {  return this._realm.objects(this.objectName).filtered(where) }
    }
    return null
  }
}


export class TempRecord {
  realm_name = "_temp"
  schema = ""
  name = "temp"

  constructor(_schema="", realm_name="_temp"){
    this.schema = _schema
    this.realm_name = realm_name
  }

  extractStructureJson(data={}){
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

  insert(datas){
    if(!Array.isArray(datas)){datas = [datas]}
    if(datas.length > 0)
    {
      let properties = this.schema
      if(properties==null)
      {
        properties = this.extractStructureJson(datas[0])
      }

      if(properties != null)
      {
        const temp_schema = {   name: this.name,
                                primaryKey: 'id',
                                properties
                             }

        const Realm_module = require("realm")

        const realm = new Realm_module({path: this.realm_name+'.realm', schema: [temp_schema], inMemory: false})
        realm.write(()=>{
            datas.map((value, key)=>{
              let _id = 0
              let tmp = {}

              if(temp_schema.properties.id == "int")
              {
                try
                {
                  _id = parseInt(value.id)
                  if(_id<=0)
                  {
                    _id = 5000 + key
                  }
                }
                catch(e)
                {_id = 5000 + key}
                
                value.id = _id
              }
              else
              {
                value.id = value.id.toString()
              }

              realm.create(this.name, value, true)
            })
          });

        return realm.objects(this.name)
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

  find(where=""){
    if(this.schema != null)
    {
      const temp_schema = {   
                            name: this.name,
                            primaryKey: 'id',
                            properties : this.schema
                          }

      const Realm_module = require("realm")
      const realm = new Realm_module({path: this.realm_name+'.realm', schema: [temp_schema], inMemory: false})

      if(where != "") return realm.objects(this.name).filtered(where) || []
      else return realm.objects(this.name) || []
    }
    else
    {
      return []
    }
  }
}
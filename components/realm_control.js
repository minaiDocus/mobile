import Config from '../Config'

class realm_control {

  static registerTempSchema(newSchema){
    let _tmp = []
    let toAdd = true

    TempSchemasLists.forEach((schema)=>{
      if(schema.name == newSchema.name)
      {
        _tmp.push(newSchema)
        toAdd = false
      }
      else
      {
        _tmp.push(schema)
      }
    })

    if(toAdd)
      _tmp.push(newSchema)

    TempSchemasLists = _tmp
  } 

  static extract_structure_json(data={}){
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

  create_temp_realm(datas, realm_name="_temp", schema=null, name="temp"){
    if(!Array.isArray(datas)){datas = [datas]}
    if(datas.length > 0)
    {
      let properties = schema
      if(properties==null)
      {
        properties = realm_control.extract_structure_json(datas[0])
      }

      if(properties != null)
      {
        const temp_schema = {   name: name,
                                primaryKey: 'id',
                                properties
                             }

        const Realm_module = require("realm")

        realm_control.registerTempSchema({name: realm_name, schema: temp_schema}) 

        const realm = new Realm_module({path: realm_name+'.realm', schema: [temp_schema], inMemory: false})
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

  get_temp_realm(realm_name, name="temp"){
    let _schema = null
    TempSchemasLists.forEach((schema)=>{
      if(schema.name == realm_name)
      {
        _schema = schema.schema;
      }
    })
    if(_schema != null){
      const Realm_module = require("realm")
      const realm = new Realm_module({path: realm_name+'.realm', schema: [_schema], inMemory: false})
      return realm.objects(name)
    }
    else
    {
      return []
    }
  }

  realmToJson(object){
    let Json_result = {}
    Json_result = JSON.stringify(object)
    Json_result = JSON.parse(Json_result)
    return Json_result
  }
}

export const RealmControl = new realm_control()
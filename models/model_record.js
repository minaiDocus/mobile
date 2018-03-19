import Config from '../Config'
import Realm from 'realm'

export class ActiveRecord {
  constructor(realmName, schema, objectName){
    this.objectName = objectName

    const properties = schema
    const _schema = {   
                        name: objectName,
                        primaryKey: 'id',
                        properties
                    }

    this._realm = new Realm({path: realmName + '.realm', schema:[_schema], encryptionKey: Config.keydb})
  }
  
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
  name = "temp"

  constructor(_schema, realm_name="_temp"){
    this.schema = _schema
    this.realm_name = realm_name

    const properties = this.schema
    const temp_schema = {   
                          name: this.name,
                          primaryKey: 'id',
                          properties
                        }

    this.realm = new Realm({path: this.realm_name+'.realm', schema: [temp_schema], inMemory: true})
  }

  insert(datas){
    if(!Array.isArray(datas)) datas = [datas]

    if(datas.length > 0)
    {
      this.realm.write(()=>{
          datas.map((value, key)=>{
            let _id = 0
            let tmp = {}

            if(this.schema.id == "int")
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

            this.realm.create(this.name, value, true)
          })
        })

      return this.realm.objects(this.name)
    }
    else
    {
      return []
    }
  }

  find(where=""){
    if(this.schema != null)
    {
      if(where != "") return this.realm.objects(this.name).filtered(where) || []
      else return this.realm.objects(this.name) || []
    }
    else
    {
      return []
    }
  }

  deleteAll(){
    if(this.schema != null)
    {
      this.realm.write(()=>{
        this.realm.delete(this.realm.objects(this.name))
      })
      return true
    }
    else
    {
      return false
    }
  }
}
import Config from '../Config'
import Realm from 'realm'

const UserSchema = {
                      name: 'User',
                      primaryKey: 'id',
                      properties: {
                        id: 'int',
                        id_idocus: 'int',
                        last_name: 'string',
                        first_name: 'string',
                        code: 'string',
                        email: 'string',
                        is_admin: 'bool',
                        company: 'string',
                        is_prescriber: 'bool',
                        organization_id: 'int',
                        auth_token: 'string?',
                        master:'bool'
                      }
                    }


class RealmData {
  static realm = new Realm({path: 'datas00.realm', schema:[UserSchema], encryptionKey: Config.keydb})

  constructor(objectName){
    this.objectName = objectName 
  }

  deleteAll() {
    if(this.objectName.length > 0)
    {
      RealmData.realm.write(()=>{
        RealmData.realm.delete(RealmData.realm.objects(this.objectName));
      });
    }
  }
  
  delete(obj){
    if(this.objectName.length > 0)
    {
      RealmData.realm.write(()=>{
        RealmData.realm.delete(obj);
      });
    }
  }

  insert(datas){
    if(datas.length > 0 && this.objectName.length > 0)
    {
      RealmData.realm.write(()=>{
        datas.map((value, key)=>{ RealmData.realm.create(this.objectName, value, true); })
      });
    }
  }

  find(where=""){    
    if(this.objectName.length > 0)
    {
      if(where.length == 0){  return RealmData.realm.objects(this.objectName) }
      if(where.length > 0){  return RealmData.realm.objects(this.objectName).filtered(where) }
    }
    return null
  }
}

export default RealmData;
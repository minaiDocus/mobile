import Config from '../Config'
import Realm from 'realm'

class ActiveRecord {
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
        this._realm.delete(this._realm.objects(this.objectName));
      });
    }
  }
  
  delete(obj){
    if(this.objectName.length > 0)
    {
      this._realm.write(()=>{
        this._realm.delete(obj);
      });
    }
  }

  insert(datas){
    if(datas.length > 0 && this.objectName.length > 0)
    {
      this._realm.write(()=>{
        datas.map((value, key)=>{ this._realm.create(this.objectName, value, true); })
      });
    }
  }

  find(where=""){    
    if(this.objectName.length > 0)
    {
      if(where.length == 0){  return this._realm.objects(this.objectName) }
      if(where.length > 0){  return this._realm.objects(this.objectName).filtered(where) }
    }
    return null
  }
}

export default ActiveRecord;
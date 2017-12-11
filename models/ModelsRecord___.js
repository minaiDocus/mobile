class ModelsRecord {
  constructor(Realm, ObjectName){
    this.objectName = ObjectName
    this.realm = Realm
  }

  deleteAll() {
    if(this.objectName.length > 0)
    {
      this.realm.write(()=>{
        this.realm.delete(this.realm.objects(this.objectName));
      });
    }
  }
  
  delete(){
    if(this.objectName.length > 0)
    {
      this.realm.write(()=>{
        this.realm.delete(this);
      });
    }
  }

  insert(datas){
    if(datas.length > 0 && this.objectName.length > 0)
    {
      this.realm.write(()=>{
        datas.map((value, key)=>{ this.realm.create(this.objectName, value, true); })
      });
    }
  }

  find(where=""){    
    if(this.objectName.length > 0)
    {
      if(where.length == 0){  return this.realm.objects(this.objectName) }
      if(where.length > 0){  return this.realm.objects(this.objectName).filtered(where) }
    }
    return null
  }
}
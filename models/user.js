import { ActiveRecord } from './index'

const _db_name = "user_00"
const _schema = {
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
                  firebase_token: 'string?',
                  master:'bool'
                }

class user extends ActiveRecord {
  static isUpdating = false;
  static updatedAt = 0;

  constructor(){
    //REALM FILE && REALM SCHEMA && REALM NAME
    super(_db_name, _schema, 'User')
  }

  fullNameOf(usr){
    return [usr.first_name, usr.last_name].join(" ").trim()
  }

  createSelection(users){
    return users.map((usr) => { 
              let label = [usr.code, usr.company, this.fullNameOf(usr)].join(" - ").trim()
              label = label.replace(/^(- )+|( -)+$/g, '');
              return {value:usr.id_idocus, label:`${label}`} 
            })
  }

  createOrUpdate(index, params, master=false){
    const auth_tk = master? params.authentication_token : ""
    const firebase_token = master? params.firebase_token : ""
    const data =   {  
                      id: index,
                      id_idocus: params.id, 
                      first_name: params.first_name, 
                      last_name: params.last_name,
                      code: params.code, 
                      email: params.email,
                      is_admin: params.is_admin,
                      is_prescriber: params.is_prescriber,
                      organization_id: params.organization_id,
                      company: params.company,
                      auth_token: auth_tk,
                      firebase_token: firebase_token, 
                      master: master
                    }
    this.insert([data])
  }

  findByListOf(test, arr)
  {
    return arr.map((val) => {
              return this.find(`${test} = '${val}'`)[0] || ""
            })
  }

  getMaster(){
    return this.find("master = true")[0] || ""
  }

  getCustomers(){
    return this.find("master = false") || []
  }

  deleteCustomers(){
    customers = this.getCustomers()
    this.delete(customers)
  }

  isUpdating(){
    return user.isUpdating
  }

  updating(val=true){
    if(val == false)
      user.updatedAt = (new Date().getTime()) * 0.001 //millisecond to second
    user.isUpdating = val
  }

  needUpdate(){
    now = (new Date().getTime()) * 0.001 //millisecond to second
    diffTime = now - user.updatedAt
    return (diffTime >= 300) ? true : false
  }
}

export const User = new user()

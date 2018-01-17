import ActiveRealm from './activeRecord'

const _db_name = "user_00"
const _schema = {
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
                        firebase_token: 'string?',
                        master:'bool'
                      }
                    }

class User extends ActiveRealm{
  constructor(){
    //REALM FILE && REALM NAME && REALM SCHEMA
    super(_db_name, _schema, 'User')
  }

  fullName_of(usr){
    return [usr.first_name, usr.last_name].join(" ").trim()
  }

  create_Selection(users){
    return users.map((usr) => { 
              let label = [usr.code, usr.company, this.fullName_of(usr)].join(" - ").trim()
              label = label.replace(/^(- )+|( -)+$/g, '');
              return {value:usr.id_idocus, label:`${label}`} 
            })
  }

  create_or_update(index, params, master=false){
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

  find_by_list_of(test, arr)
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
}

export default new User();
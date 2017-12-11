import RealmData from '../components/realmData'

class User extends RealmData{
  constructor(){
    super('User')
  }

  fullName_of(usr){
    return `${usr.first_name} ${usr.last_name}`
  }

  create_Selection(users){
    return users.map((usr) => { 
              return {value:usr.id_idocus, label:`${usr.code} - ${usr.company}`} 
            })
  }

  create_or_update(index, params, master=false){
    const auth_tk = master? params.authentication_token : ""
    const data =   {  
                      id: index,
                      id_idocus: params.id, 
                      first_name: params.first_name, 
                      last_name: params.last_name,
                      code: params.code, 
                      email: params.email,
                      is_prescriber: params.is_prescriber,
                      organization_id: params.organization_id,
                      company: params.company,
                      auth_token: auth_tk, 
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
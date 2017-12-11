import RealmData from '../components/realmData'

class Pack extends RealmData{
  constructor(){
    super('Pack')
  }

  create_or_update(index, params){
    const data =   {  id: index,
                      id_idocus: params.id, 
                      created_at: new Date(params.created_at), 
                      updated_at: new Date(params.updated_at), 
                      name: params.name,
                      owner_id: params.owner_id,
                      page_number: params.page_number,
                      error_message: params.error_message,
                      message: params.message, 
                      type: params.type, 
                    }
    this.insert([data])
  }
}

export default new Pack();
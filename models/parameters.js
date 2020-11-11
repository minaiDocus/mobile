import { ActiveRecord } from './index'

const _db_name = "parameters_00"
const _schema = {
                  id: 'int',
                  key: 'string',
                  value: 'string?',
                }

class _parameters extends ActiveRecord {
  constructor(){
    //REALM FILE && REALM SCHEMA && REALM NAME
    super(_db_name, _schema, 'Parameters')
  }

  setParameter(key, value=''){
    if(isPresent(key)){
      const param = this.find(`key = '${key}'`)[0] || {}

      const data =   {
                        id: param.id || null,
                        key: key.toString(),
                        value: value.toString()
                      }

      this.insert([data])
    }
  }

  getParameter(key='-'){
    let value = null

    try{
      value = this.find(`key = '${key}'`)[0]['value'] || null
    }catch(e){ value = null }

    return value
  }

  getAllParameters(){
    return this.find() || []
  }

  clearParameters(){
    const params = this.find() || null

    if(params)
    {
      params.forEach((p)=>{
        this.delete(p)
      })
    }
  }
}

export const Parameters = new _parameters()

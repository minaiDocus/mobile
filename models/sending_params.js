import { ActiveRecord } from './index'

const _db_name = "sending_params_00"
const _schema = {
                  id: 'int',
                  customer: 'string?',
                  period: 'string?',
                  journal: 'string?',
                  analysis: 'string?',
                }

class _sending_params extends ActiveRecord {
  constructor(){
    //REALM FILE && REALM SCHEMA && REALM NAME
    super(_db_name, _schema, 'SendingParams')
  }

  setParameters(params={}){
    const sending_params = this.find()[0] || {}

    const data =   {
                      id: sending_params.id || 1,
                      customer: params.customer.toString() || null,
                      period: params.period.toString() || null,
                      journal: params.journal.toString() || null,
                      analysis: JSON.stringify(params.analysis || {}) || null
                    }
    this.insert([data])
  }

  getParameters(){
    const params = this.find()[0] || {}

    let saved_analysis = JSON.parse(params.analysis || '{}')
    saved_analysis = isPresent(saved_analysis)? saved_analysis : null

    return { customer: (params.customer || null), period: (params.period || null), journal: (params.journal || null), analysis: saved_analysis }
  }

  clearParameters(){
    const params = this.find()[0] || null
    if(params) this.delete(params)
  }
}

export const SendingParams = new _sending_params()

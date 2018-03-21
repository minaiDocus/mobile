import { TempRecord } from './index'

const _name = "ImagesSent"
const _schema = {
                  id: 'string',
                  name: 'string',
                  path: 'string?',
                  send_at: 'date?',
                  pending: 'bool',
                  is_sent: 'bool',
                }

class image_sent extends TempRecord {
  static ListImages

  constructor(){
    super(_schema, _name)
    image_sent.ListImages = []
  }

  stateOfPending(state=false){
    const to_update = this.find("pending = true").map((img)=>{
        const obj = realmToJson(img)
        obj.send_at = new Date()
        obj.is_sent = state
        obj.pending = false
        return obj
    })
    
    if(to_update.length > 0) this.insert(to_update)
  }

  getImage(where){
    let obj = null

    try{
      obj = this.find(where)[0] || null
    }catch(e){}

    if(obj == null) return null
    else return realmToJson(obj)
  }
}

export const ImageSent = new image_sent()

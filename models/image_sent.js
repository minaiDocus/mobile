import { TempRecord } from './index'

const _name = "ImagesSent"
const _schema = {
                  id: 'string',
                  name: 'string',
                  path: 'string?',
                  send_at: 'date?',
                  is_sent: 'bool',
                }

class image_sent extends TempRecord {
  static ListImages

  constructor(){
    super(_schema, _name)
    image_sent.ListImages = []
  }

  sendingFailedFor(where){
    this.find(where).map( (img)=>{ 
      const obj = realmToJson(img)
      obj.send_at = new Date()
      obj.is_sent = false
      this.insert([obj])
    })
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

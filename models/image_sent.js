import { TempRecord } from './index'

const _name = "ImagesSent"
const _schema = {
                  id: 'string',
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

  saveListImages(){
    const result = this.insert(image_sent.ListImages)
    if(result.length > 0)
    {
      this.prepareListImages([])
    }
  }

  prepareListImages(lists, append=false){
    if(append)
      image_sent.ListImages = image_sent.ListImages.concat(lists)
    else
      image_sent.ListImages = lists
  }

  getImage(id){
    let obj = null

    try{
      obj = this.find(`id="${id}"`)[0] || null
    }catch(e){}

    if(obj == null) return null
    else return realmToJson(obj)
  }
}

export const ImageSent = new image_sent()

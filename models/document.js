import { ActiveRecord } from './index'
import { ImageStore } from 'react-native'
import fetch_blob from 'react-native-fetch-blob'
import RNFS from 'react-native-fs'

const _db_name = "documents_00"
const _schema = {
                  id: 'string',
                  data_blob: 'string?',
                  name: 'string',
                  path: 'string?',
                  size: 'int',
                  modificationDate: 'string',
                  mime: 'string',
                  width: 'int',
                  height: 'int',
                  send_at: 'string',
                  state: 'string',
                  error: 'string?'
                }

class _document extends ActiveRecord {
  static ListImages

  constructor(){
    //REALM FILE && REALM SCHEMA && REALM NAME
    super(_db_name, _schema, 'Documents')
  }

  createBase64File(doc, success, faillure){
    const fname = doc.path.toString().split("/").slice(-1)[0]
    const dir = doc.path.replace("file://", '').replace(fname, '')
    RNFS.mkdir(dir)
    .finally((r)=>{
      RNFS.writeFile(doc.path.replace("file://", ''), doc.data_blob, 'base64')
      .then((r)=> success(doc.path))
      .catch((error) => {
        faillure(JSON.stringify(error))
      })
    })
  }

  clearDocsFileCache(){
    this.getAll().map(doc => {
      RNFS.unlink(doc.path.replace("file://", '')).catch(e=>{})
    })
  }

  loadAll(){
    return new Promise(resolve=>{
      this.delDocs(this.sent().concat(this.error()))

      let docs = this.find('state = "new" OR state = "not_sent"') || []
      let counter = 0
      let loadedDocs = []

      const handleLoad = (doc, success=true)=>{
        if(success)
        {
          loadedDocs =  loadedDocs.concat({
                          id_64: doc.id,
                          size: doc.size,
                          path: doc.path.toString(),
                          modificationDate: doc.modificationDate.toString(),
                          mime: doc.mime,
                          width: doc.width,
                          height: doc.height,
                          filename: doc.name
                        })
        }
        counter += 1
        if(counter >= docs.length)
          resolve(loadedDocs)
        else
          loadDoc(docs[counter])
      }

      const loadDoc = (doc)=>{
        this.createBase64File(doc,
          (uri)=>{ handleLoad(doc) },
          (faillure)=> { handleLoad(doc, false) })
      }

      if(docs.length > 0)
        loadDoc(docs[0])
      else
        resolve(loadedDocs)
    })
  }

  addDocs(lists){
    // console.log(dirs.DocumentDir) // /data/user/0/com.bigjpg/files
    // console.log(dirs.CacheDir)    // /data/user/0/com.bigjpg/cache
    // console.log(dirs.DCIMDir)     // /storage/emulated/0/DCIM
    // console.log(dirs.DownloadDir) // /storage/emulated/0/Download
    // console.log(dirs.PictureDir)  // /storage/emulated/0/Pictures
    // const dirs = fetch_blob.fs.dirs
    // const file_path = dirs.CacheDir //recreate file to cache
    let counter = 0

    const getBase64 = (img)=>{
      const name = img.filename || img.path.toString().split("/").slice(-1)[0]
      ImageStore.getBase64ForTag(img.path, (base64)=>{
        this.createOrUpdate(img.id_64.toString(),
                            {
                              data_blob: base64,
                              name: name,
                              path: img.path,
                              size: img.size || 0,
                              modificationDate: img.modificationDate || 0,
                              mime: img.mime || '',
                              width: img.width,
                              height: img.height,
                              send_at: '',
                              state: 'new',
                              error: ''
                            })
        counter += 1
        if(counter < lists.length)
          getBase64(lists[counter])
      },
      (failed)=>{
        counter += 1
        if(counter < lists.length)
          getBase64(lists[counter])
      })
    }

    if(lists.length > 0)
      getBase64(lists[0])
  }

  createOrUpdate(id, params){
    const doc = this.getById(id) || {}

    let modificationDate = ''
    if(params.modificationDate)
      params.modificationDate.toString()
    else if(doc.modificationDate)
      doc.modificationDate.toString()

    const data =   {
                      id: id,
                      data_blob: params.data_blob || doc.data_blob || '',
                      name: params.name || doc.name || '',
                      path: params.path || doc.path || '',
                      size: params.size || doc.size || 0,
                      modificationDate: modificationDate || '',
                      mime: params.mime || doc.mime || '',
                      width: params.width || doc.width || 0,
                      height: params.height || doc.height || 0,
                      send_at: params.send_at || doc.send_at || '',
                      state: params.state || doc.state || '',
                      error: params.error || doc.error || ''
                    }
    this.insert([data])
  }

  sending(){
    return this.find('state = "sending"').map(doc => { return doc.id }) || []
  }

  sent(){
    return this.find('state = "sent"').map(doc => { return doc.id }) || []
  }

  error(){
    return this.find('state = "error"').map(doc => { return doc.id }) || []
  }

  not_sent(){
    return this.find('state = "not_sent"').map(doc => { return doc.id }) || []
  }

  delDocs(ids){
    ids.map(doc_id=>{
      const doc = this.find(`id = "${doc_id}"`)[0] || null
      if(doc)
      {
        RNFS.unlink(doc.path.toString().replace("file://", '')).catch(e=>{})
        this.delete(doc)
      }
    })
  }

  syncDocs(ids, state, message=''){
    ids.map(doc_id => {
      this.createOrUpdate(doc_id, {state: state, send_at: new Date().toString(), error: message})
    })
  }

  getAll(){
    return this.find() || []
  }

  getById(id=''){
    let obj = null

    try{
      obj = this.find(`id = "${id}"`)[0] || null
    }catch(e){}

    if(obj == null) return null
    else return realmToJson(obj)
  }
}

export const Document = new _document()

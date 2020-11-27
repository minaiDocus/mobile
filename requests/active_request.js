import {XFetcher} from '../components'

export class Requester {
  requestURI(uri, options={}, callback={}){
    return new Promise((resolve, reject) => {
      const Fetcher = new XFetcher()

      Fetcher.fetch(uri, options, true, (r)=>{
        if(r.error)
        {
          if(callback.onReject != undefined)
            callback.onReject(r)
          reject(r)
        }
        else
        {
          if(callback.onResolve != undefined)
            callback.onResolve(r)
          resolve(r)
        }
      })
    })
  }

  async waitFor(func=[], callback, uniq_request=false){
    let slf = this
    setTimeout(()=>{
      let responses = []
      let promises = []
      let i = 0

      const handleResponses = (r)=>{
        responses = responses.concat(r)
        i++
        if(i < func.length)
          launchRequests(func[i])
        else
          callback(responses)
      }

      const releaseRequest = (f)=>{
        RemoteRequests = RemoteRequests.filter( k => { return k.toString() != f.toString() })
      }

      const launchRequests = (f)=>{
        let reqFound = false
        if( RemoteRequests.find( k => { return k.toString() == f.toString() }) ){
          reqFound = true
        }
        else{
          RemoteRequests.push(f.toString())
        }

        if(reqFound && uniq_request){
          handleResponses({ error: true, message: `Protected uniq Request: ${f.toString()}`, uniq_request: true })
        } else {
          promises[i] = eval(`slf.${f}`)
          promises[i]
            .then(r => {
                handleResponses(r)
                releaseRequest(f)
              }
            )
            .catch(r => {
                handleResponses(r)
                releaseRequest(f)
              }
            )
        }
      }

      launchRequests(func[0])
    }, 1)
  }
}
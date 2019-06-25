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

  async waitFor(func=[], callback){
    let slf = this
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

    const launchRequests = (f)=>{
      promises[i] = eval('slf.'+f)
      promises[i].then(r => handleResponses(r)).catch(r => handleResponses(r))
    }

    launchRequests(func[0])
  }
}
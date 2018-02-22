import {XFetcher} from '../components'

export class Requester {
  // responseFetching = ""
  // request_retry = 2

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  requestURI(uri, options={}, callback={}){
    const Fetcher = new XFetcher()
    Fetcher.fetch(uri, options, true, callback)
  }

  async wait_for(func=[], callback){
    let responses = []
    let tmp_rep = ""

    for(var i=0; i<func.length; i++)
    {
      tmp_rep = await eval('this.'+func[i])
      responses = responses.concat(tmp_rep)
    }

    callback(responses)
  }
}
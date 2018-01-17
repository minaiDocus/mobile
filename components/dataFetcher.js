import Config from '../Config'
import base64 from 'base-64'
import Realm from 'realm'
import User from '../models/User'

class Fetcher{
  constructor(name=""){
    // const class_name = require(name)
    if(name!=""){this.request = new name}
  }
  
  //Basicly for logout
  clearAll(){
    User.deleteAll()
  }

  setRequest(name){
    this.request = new name
    return this
  }

  async wait_for(func=[], callback){
    let responses = []
    for(var i=0; i<func.length;i++)
    {
      await eval('this.request.'+func[i])
      responses = responses.concat(this.request.synchronious_response)
    }

    callback(responses)
  }
}

export default Fetcher;
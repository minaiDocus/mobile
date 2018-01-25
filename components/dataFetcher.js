import Config from '../Config'
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
    let tmp_rep = ""
    
    for(var i=0; i<func.length;i++)
    {
      tmp_rep = await eval('this.request.'+func[i])
      responses = responses.concat(tmp_rep)
    }

    callback(responses)
  }
}

export default Fetcher;
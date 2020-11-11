import { Requester } from './index'
import { User, Organization, Parameters } from '../models'

class remote_auhtentication extends Requester{
  pingServer(){
    return this.requestURI("api/mobile/remote_authentication/ping", { method: 'POST', params:{version: Config.version, platform: Config.platform, build_code: Config.build_code} })
  }

  logIn(options){
    return  this.requestURI("api/mobile/remote_authentication/request_connexion",  { method: 'POST', params: options },
            {
              onResolve: (r)=> {
                User.deleteAll()
                User.createOrUpdate(1, r.user, true)
              }
            })
  }

  getParameters(){
    if(!isPresent(Master)){ return null }

    return  this.requestURI("api/mobile/remote_authentication/get_user_parameters", { method: 'POST', params: { user_id: Master.id_idocus } },
            {
              onResolve: (r)=>{
                let arraykeys = Object.keys(r.parameters)
                arraykeys.forEach(key=>{
                  if(isPresent(key)){ Parameters.setParameter(key, r.parameters[key]) }
                })
              }
            })
  }

  logOut(){
    Organization.deleteAll()
    Organization.resetUpdatedAt()

    User.deleteAll()
    User.resetUpdatedAt()
    Master = {}
  }
}

export const RemoteAuthentication = new remote_auhtentication()
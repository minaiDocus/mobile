import { TempRecord } from './index'

const _name = "Organization"
const _schema = {
                  id: 'int',
                  name: 'string?',
                  active: 'bool'
                }


class _organization extends TempRecord {
  static isUpdating = false;
  static updatedAt = 0;

  constructor(){
    super(_schema, _name)
  }

  add(organizations){
    const toAdd = organizations.map((org, index)=>{
      return  {
                id:   org.id,
                name: org.name,
                active: (index==0)? true : false
              }
    })

    const result = this.insert(toAdd)
    return result
  }

  getAll(){
    const organzations = this.find()
    return organzations
  }

  getActive(){
    return this.find("active=true")[0] || null
  }

  activate(organization_id){
    if(organization_id  > 0)
    {
      const new_all_org = this.find().map((org)=>{
        const data = realmToJson(org)
        data.active = (data.id == organization_id)? true : false
        return data
      })
      
      this.insert(new_all_org)
    }
  }

  isUpdating(){
    return _organization.isUpdating
  }

  updating(val=true){
    if(val == false)
      _organization.updatedAt = (new Date().getTime()) * 0.001 //millisecond to second
    _organization.isUpdating = val
  }

  needUpdate(){
    now = (new Date().getTime()) * 0.001 //millisecond to second
    diffTime = now - _organization.updatedAt
    return (diffTime >= 600) ? true : false
  }
}

export const Organization = new _organization()

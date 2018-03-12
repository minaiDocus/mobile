import {TempRecord} from './index'

const _name = "Notifications"
const _schema =   {
                    id: 'string',
                    title: 'string?',
                    message: 'string?',
                    created_at: 'string?',
                    is_read: 'bool',
                  }


class _notification extends TempRecord {
  constructor(){
    super(_schema, _name)
  }

  add(notifications){
    const result = this.insert(notifications)
    return result
  }

  getAll(){
    const notifications = this.find()
    return notifications
  }
}

export const Notification = new _notification()

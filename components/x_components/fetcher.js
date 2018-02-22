import base64 from 'base-64'
import {User} from '../../models'

export class XFetcher {
  request_retry = 2
  retry = 0
  responseFetching = ""
  timer_abort = null
  request = null
  body = null
  callback = null
  progress_callback = null
  abort_time = 60 //60 seconds by default

  initRequest(url, options){
    this.request = new XMLHttpRequest()

    this.request.open(this.options.method, this.url)
    this.request.setRequestHeader("Content-Type", this.options.contentType || "application/json")

    if(Config.server == "staging") //if accessing staging server
      this.request.setRequestHeader("Authorization", "Basic " + base64.encode(Config.user + ":" + Config.pass))

    for(var k in this.options.headers||{})
      this.request.setRequestHeader(k, options.headers[k])
  }

  prepare_aborting(){
    this.timer_abort = setTimeout(()=>{
      this.clear_aborting()
      this.request.abort()
      this.responseFetching = {error: true, message: "Impossible de se connecter au serveur!!!"}
      this.callback(this.responseFetching)
    }, (this.abort_time * 1000)) //abort after 60 seconds [default] (if request too long)
  }

  clear_aborting(){
    clearTimeout(this.timer_abort)
  }

  fetch(uri, options={}, with_retry = true, callback = null, progress_callback = null, abort_time = 60){
    this.url = Config.http_host + uri
    this.abort_time = abort_time
    this.options = options
    const method = this.options.method || 'GET'

    if(callback == null)
      this.callback = (e) => {}
    else
      this.callback = callback

    if(progress_callback == null)
      this.progress_callback = (e) => {}
    else
      this.progress_callback = progress_callback

    if(with_retry)
      this.retry = 0
    else
      this.retry = this.request_retry

    this.body = null

    if(method == 'POST')
    {
      this.body = {}
      if(typeof(options.form_body) !== "undefined")
      {
        this.body = options.form_body
      }
      else
      {
        const auth_token = {auth_token: User.getMaster().auth_token}
        Object.assign(this.body, auth_token, options.params)
        this.body = JSON.stringify(this.body)
      }
    }

    this.send()
  }

  send(){
    this.prepare_aborting()
    this.initRequest()

    if(this.body==null)
      this.request.send()
    else
      this.request.send(this.body)

    this.request.onload = (e) => {this.onComplete(e)}

    this.request.onerror = (e) => {this.onError(e)}

    if(this.request.upload)
      this.request.upload.onprogress = this.progress_callback; // event.loaded / event.total * 100 ; //event.lengthComputable
  }

  onComplete(e){
    if (this.request.readyState === 4)
    {
      if(this.request.status != 200)
      {
        this.onError(e)
      }
      else
      {
        this.clear_aborting()

        try
        {
          this.responseFetching = JSON.parse(this.request.responseText)
          this.callback(this.responseFetching) 
        }
        catch(e)
        {
          this.responseFetching = handlingHttpErrors(this.request, "parsing active request")
          this.callback(this.responseFetching)
        }
      } 
    }
  }

  onError(e){
    this.clear_aborting()
    this.request.abort()

    if(this.retry < this.request_retry)
    {
      this.retry = this.retry + 1
      setTimeout(()=>{this.send()}, 2000) //resend after 2 sec
    }
    else
    {
      this.responseFetching = handlingHttpErrors(this.request)
      this.callback(this.responseFetching)
    }
  }
}
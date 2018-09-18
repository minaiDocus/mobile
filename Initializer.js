import Config from './Config'

import { EventRegister } from 'react-native-event-listeners'

import { Notice, CronTask } from './components'

import { ErrorReport } from './requests'

//Private functions
function fillWithZero(date, length_to = 2){
  var f_date = date.toString()
  for(var i=1; i <= (length_to - date.toString().length); i++)
  {
    f_date = `0${f_date}`
  }
  return f_date
}


//Globals functions && declarations
global.appReady = false
global.Config = Config
global.UploadingFiles = false
global.Notice = Notice
global.CronTask = CronTask
global.Orientation = "portrait"

//Function for adding Components to the Front View Modal
global.renderToFrontView = (children, animation="fade", closeCallback=null) => {
  params = { children: children, animation: animation, closeCallback: closeCallback }
  EventRegister.emit("openFrontView", params)
}

//Function for removing Components from Front View Modal (close front view)
global.clearFrontView = () => {
  EventRegister.emit("closeFrontView")
}


//Function for handleling http errors
global.handlingHttpErrors = (request, source="") => {
  let parsedRequest = ""
  try
  { parsedRequest = JSON.parse(request.responseText) }
  catch(e)
  { parsedRequest = request.responseText }

  if(typeof(parsedRequest.error != "undefined") && parsedRequest.error == true)
  {
    return parsedRequest
  }

  let errorMessage = ""

  switch(request.status){
    case 0 :
      errorMessage = "Impossible de se connecter au serveur iDocus!!"
      break;
    case 401:
      errorMessage = "Vous n'avez pas l'autorisation necessaire pour effectuer cette action"
      break;
    case 404:
      errorMessage = "La requette envoyé au serveur n'existe pas"
      break;
    default:
      errorMessage = "Une erreur inattendue s'est produite !!(Error: "+request.status+")"
  } 

  if(source != "")
  {
    const report =  {
                      source: source,
                      data: request
                    }
    ErrorReport.sendErrorReport("Error report mobile : http request", errorMessage, report)
  }

  return {error: true, message: errorMessage}
}

//Function for date format
global.formatDate = (_date=null, format = "DD-MM-YYYY HH:ii") => {
  let dateFormat = format
  if(_date != null && typeof(_date) !== 'undefined')
  {
    let date = new Date(_date)
    
    if(date.getFullYear() <= 2000){ return "-" } //if date is before year 2000

    dateFormat = dateFormat.replace("DD", fillWithZero(date.getDate()))   //Get the day as a number (1-31)

    const dayWeek = date.getDay()  //Get the weekday as a number (0-6)

    dateFormat = dateFormat.replace("YYYY", date.getFullYear())   //Get the four digit year (yyyy)

    dateFormat = dateFormat.replace("HH", fillWithZero(date.getHours()))  //Get the hour (0-23)

    const millisec = date.getMilliseconds()  //Get the milliseconds (0-999)

    dateFormat = dateFormat.replace("ii", fillWithZero(date.getMinutes()))  //Get the minutes (0-59)

    dateFormat = dateFormat.replace("MM", fillWithZero(date.getMonth() + 1))  //Get the month (0-11)

    dateFormat = dateFormat.replace("ss", fillWithZero(date.getSeconds()))  //Get the seconds (0-59)

    const time = date.getTime()  //Get the time (milliseconds since January 1, 1970)

    return dateFormat.toString()
  }
  else
  {
    return "-"
  }
}

//Function for compacting array (deleting null values from an array)
global.arrayCompact = (arr) => {
  let arrReturn = []
  arr.forEach((elem)=>{
    if(elem != null && typeof(elem) !== 'undefined')
    {
      arrReturn.push(elem)
    }
  })
  return arrReturn
}

//Protect speed double press for launching an action
global.actionLock = false
global.actionLocker = (callback) => {
  if(actionLock==false)
  {
    actionLock = true
    callback()
    setTimeout(()=>{actionLock = false}, 1000)
  }
}

//Function for transforming realm object to JSON
global.realmToJson = (object)=>{
  let Json_result = {}
  Json_result = JSON.stringify(object)
  Json_result = JSON.parse(Json_result)
  return Json_result
}
import Config from './Config'

import { EventRegister } from 'react-native-event-listeners'

import { Notice } from './components'

import { ErrorReport } from './requests'

//Private functions
function fillWithZero(number, length_to = 2){
  var f_number = number.toString()
  for(var i=1; i <= (length_to - number.toString().length); i++)
  {
    f_number = `0${f_number}`
  }
  return f_number
}


//Globals functions && declarations
global.Config = Config
global.UploadingFiles = false
global.Notice = Notice
global.KeyboardShow = false
global.Orientation = "portrait"
//TEST
global.PreviousScreen = null
global.CurrentScreen = null
global.ScreenList = []
//TEST
global.MonthsData =   [
                        {label: 'Jan', value: '01'},
                        {label: 'Fev', value: '02'},
                        {label: 'Mar', value: '03'},
                        {label: 'Avr', value: '04'},
                        {label: 'Mai', value: '05'},
                        {label: 'Jui', value: '06'},
                        {label: 'Jul', value: '07'},
                        {label: 'Aou', value: '08'},
                        {label: 'Sep', value: '09'},
                        {label: 'Oct', value: '10'},
                        {label: 'Nov', value: '11'},
                        {label: 'Dec', value: '12'}
                      ]
//Function for truncating text
global.truncate = (text, len, next='...')=>{
  result = text
  if(result && result.length > len)
  {
    result = result.substring(0, len)
    result = result + next
  }
  return result
}

//Function for adding Components to the Front View Modal
global.renderToFrontView = (children, animation="fade", closeCallback=null) => {
  params = { children: children, animation: animation, closeCallback: closeCallback }
  CurrentScreen.getFrontView().openFrontView(params)
}

//Function for removing Components from Front View Modal (close front view)
global.clearFrontView = () => {
  CurrentScreen.getFrontView().closeFrontView()
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

//Function for formating number view
global.formatNumber = (number, format = 'xxx') => {
  return fillWithZero(number, format.toString().length)
}

//Function for compacting array (deleting null values from an array)
global.arrayCompact = (arr, strict=false) => {
  let arrReturn = []
  arr.forEach((elem)=>{
    if(strict)
    {
      if(isPresent(elem))
        arrReturn.push(elem)
    }
    else
    {
      if(elem != null && typeof(elem) !== 'undefined')
        arrReturn.push(elem)
    }
  })
  return arrReturn
}

//Function to group by
global.arrayGroup = (arr, by='') => {
  let arrReturn = []
  let keys = []

  arr.forEach(elem => {
    let curr_key = elem[by]

    if( !keys.find( k => { return k == curr_key }) )
    {
      keys.push(curr_key)

      let curr_tab = arr.filter( a => { return a[by] == curr_key })
      arrReturn.push({ key: curr_key, groups: curr_tab })
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
  if(Array.isArray(object))
  {
    return object.map(obj => {
      Json_result = JSON.stringify(obj)
      Json_result = JSON.parse(Json_result)
      return Json_result
    })
  }
  else
  {
    Json_result = JSON.stringify(object)
    Json_result = JSON.parse(Json_result)
    return Json_result
  }
}

//Function for testing presence of variable
global.isPresent = (variable) => {
  return ( typeof(variable) !== 'undefined' && variable !== null && variable !== '' ) ? true : false
}
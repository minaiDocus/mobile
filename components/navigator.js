import { NavigationActions } from 'react-navigation'

export class Navigator {

  constructor(navigation){
    this.navigation = navigation
    this.last_params = null

    if(this.navigation.state)
      this.params = this.navigation.state.params

    if(this.params)
      this.prevScreen = this.getParams("prevScreen") || ""

    const didFocusScreen = this.navigation.addListener('didFocus', (e)=>{ this.didFocus() })
  }

  didFocus(s){
    setTimeout(()=>{
      if(ScreenList.length > 0){
        CurrentScreen = ScreenList.find((s)=>{ return s.key == this.navigation.state.key }).screen
        CurrentScreen.openScreen()
      }
    }, 1)
  }

  getParams(name)
  {
    let value = null
    try{
      value = this.params[name]
    }
    catch(e){
      value = null
    }
    return value
  }

  removeParams(name){
    try{
      this.params[name] = null
      delete this.params[name]
    }
    catch(e){
      this.params[name] = null
    }
  }

  goTo(screen, params={}){
    const call = ()=>{
                        const parameters = {}
                        const p_default = {
                                    prevScreen: this.navigation.state.key,
                                    initScreen: true
                                  }
                        Object.assign(parameters, p_default, params)

                        const navigateAction = NavigationActions.navigate({
                          routeName: screen,
                          params: parameters
                        })
                        this.navigation.dispatch(navigateAction)
                      }
    actionLocker(call)
  }

  dismissTo(screen, params={}){
    const call = ()=>{
                        const parameters = {}
                        const p_default = {
                                    initScreen: true
                                  }
                        Object.assign(parameters, p_default, params)
                        
                        const resetAction = NavigationActions.reset({
                            index: 0,
                            actions:  [
                                        NavigationActions.navigate({routeName: screen, params: parameters})
                                      ]
                        })
                        this.navigation.dispatch(resetAction)
                      }
    actionLocker(call)
  }

  goBack(params={}){
    this.last_params = params
    actionLocker(this.navigation.goBack)
  }

  screenClose(){
    if(isPresent(this.prevScreen))
    {
      const parameters = {}
      const p_default = {
                          initScreen: true
                        }
      Object.assign(parameters, p_default, this.last_params)
      const recallAction = NavigationActions.setParams({
          key: this.prevScreen,
          params: parameters
        });
      this.navigation.dispatch(recallAction)
    }
  }
}
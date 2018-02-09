import { NavigationActions} from 'react-navigation'

export class Navigator {

  constructor(navigation){
    this.navigation = navigation

    if(this.navigation.state)
      this.params = this.navigation.state.params
    
    if(this.params)
      this.prevScreen = this.getParams("prevScreen") || ""
  }

  getParams(name)
  {
    let value = null
    try{
      value = eval(`this.params.${name}`)
    }
    catch(e){
      value = null
    }
    return value
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
                            actions: [
                                        NavigationActions.navigate({routeName: screen, params: parameters})
                                      ]
                        })
                        this.navigation.dispatch(resetAction)
                      }
    actionLocker(call)
  }

  goBack(){
    actionLocker(this.navigation.goBack)
  }

  screenClose(){
    if(this.prevScreen != "")
    {
      const recallAction = NavigationActions.setParams({
          key: this.prevScreen,
          params: {initScreen: true}
        });
      this.navigation.dispatch(recallAction)
    }
  }
}
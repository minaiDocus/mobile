package com.idocus;

import com.facebook.react.ReactActivity;

// react-native-splash-screen >= 0.3.1
import org.devio.rn.splashscreen.SplashScreen; // here
public class MainActivity extends ReactActivity {
  public static String ShowSplash = "on";
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
  	if(ShowSplash == "on")
	{
	    ShowSplash = "off";
	    SplashScreen.show(this);  // here
	}
    return "iDocus";
  }
}

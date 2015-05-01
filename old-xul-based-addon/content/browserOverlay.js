/**
 * PentadactylChrome namespace.
 */
if ("undefined" == typeof(PentadactylChrome)) {
  var PentadactylChrome = {};
};

/**
 * Controls the browser overlay for the Hello World extension.
 */
PentadactylChrome.BrowserOverlay = {
  /**
   * Says 'Hello' to the user.
   */
    
    sayHello : function(aEvent) {
	let stringBundle = document.getElementById("pentadactyl-string-bundle");
	let message = stringBundle.getString("pentadactyl.greeting.label");
	window.alert(message);
    }
};

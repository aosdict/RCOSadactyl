/* bootstrap.js - Required file for all bootstrappable add-ons. Needs to
   implement startup, shutdown, install and uninstall functions.
*/

/* We probably want to keep all actual code separated from the boilerplate
   stuff. The typical way to do this is with code modules; see
   https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Using
*/

/* I still haven't been able to figure out what these are for. All I know is
   that the sample code for all restartless extensions uses them. */
const Cc = Components.classes;
const Ci = Components.interfaces;

Components.utils.import('resource://gre/modules/Services.jsm');

function loadIntoWindow(window) { 
    if (!window)
	return;

    window.alert("Calling load into window function!!!")
    // DO SOMETHING HERE (create UI)
}

function unloadFromWindow(window) {
    if (!window)
	return;
    // CLEAN UP HERE (remove the UI)
}

var windowListener = {
    onOpenWindow: function(aWindow) {
	// Wait for the window to finish loading
	let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
	domWindow.addEventListener("load", function onLoad() {
	    domWindow.removeEventListener("load", onLoad, false);
	    loadIntoWindow(domWindow);
	}, false);
    },
    
    onCloseWindow: function(aWindow) {},
    onWindowTitleChange: function(aWindow, aTitle) {}
};  

// Called when Firefox starts up with the extension or when it is re-enabled.
function startup(data, reason) {
    //Again, no idea why this is here but it seems to be fairly boilerplate
    let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);

    let windows = wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements()) {
	let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
	domWindow.alert("Here is some other text");
	loadIntoWindow(domWindow);
    }

    // Load into any new windows
    wm.addListener(windowListener);
}

// Called when Firefox closes normally or when the extension is disabled. 
function shutdown(data, reason) {
    // When the application is shutting down we normally don't have to clean
    // up any UI changes
    if (aReason == APP_SHUTDOWN) return;

    let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);

    // Stop watching for new windows
    wm.removeListener(windowListener);

    // Unload from any existing windows
    let windows = wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements()) {
	let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
	unloadFromWindow(domWindow);
    }
    
}

//These do not have to be implemented right now.
//Thry only activate when new versions of the extension are installed.
function install(data, reason) {}
function uninstall(data, reason) {}

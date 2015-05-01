const Ci = Components.interfaces;

Components.utils.import("resource://gre/modules/Services.jsm");

/* Using a global variable is not the best solution, but there are virtually no
   Javascript solutions to have the window accessible in the event handler
   and simultaneously be able to remove the event listener later.
*/
var currWindow;

//Temporary global, this should be made into a preference
var scrollPixels = 10;

function handleKey(ev) {
    /* ev is the keyboard event that triggers this function.
       
       Its member "ev.which" holds the keycode, which is usually the ASCII
       representation of the character pressed without the shift key (i.e.
       you will never get 42 for pressing Shift+8 to get an asterisk; this
       function will be called twice, once for Shift (16) and once for 8 (56).
       
       For letters, you get the ASCII value of the capital letter. So pressing
       'p' will have code 80 'P' rather than 112 'p'.
       
       Special keycodes for non-ASCII keys (and some ASCII ones that are
       different):
       Shift = 16
       Caps Lock = 20
       Control = 17
       Option/Alt = 18
       Command = 224
       Escape = 27
       Enter = 13
       Backspace = 8
       Up, Left, Right, Down = 37, 38, 39, 40
       F1-F8 = 112-119
       Backtick/tilde = 192
       Minus/underscore = 173
       Left bracket/brace = 219
       Pipe/backslash = 220
       Right bracket/brace = 221
       Quote = 222
       Comma = 188
       Period = 190
       Slash/question mark = 191
     */
    //you can uncomment this to report the keycodes of pressed keys
    //currWindow.alert("Event: "+ev.which);
    switch(ev.which) {
    case 72: // H, scroll left
	currWindow.scrollBy(scrollPixels*-1,0); break;
    case 74: // J, scroll up
	currWindow.scrollBy(0, scrollPixels*-1); break;
    case 75: // K, scroll down
	try {
	    cur
	    currWindow.scrollBy(0, scrollPixels);
	} catch(err) {
	    currWindow.alert(err);
	}
	break;
    case 76: // L, scroll right
	currWindow.scrollBy(scrollPixels, 0); break;
    }
}

function loadIntoWindow(window) {
    // All UI setup happens in this function
    
    currWindow = window;
    window.addEventListener("keydown", handleKey);
    /*
    try {
	var doc = window.document;
	var div = doc.createElement("div");
	div.style.width = "100px";
	div.style.height = "100px";
	div.style.background = "red";
	document.body.appendChild(div);
    }catch(err) {
	window.alert(err);
    }
    */
}

function unloadFromWindow(window) {
    // All UI tear down happens in this function
    
    currWindow = window;
    window.removeEventListener("keydown", handleKey);
}

// Boilerplate code, do not change this function
var WindowListener = {
    onOpenWindow: function(xulWindow) {
        var window = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                              .getInterface(Ci.nsIDOMWindow);
        function onWindowLoad() {
            window.removeEventListener("load",onWindowLoad);
            // Only add UI changes if this is a browser window
            if (window.document.documentElement.getAttribute("windowtype") 
                                                                == "navigator:browser")
                loadIntoWindow(window);
        }
        window.addEventListener("load",onWindowLoad);
    },
    onCloseWindow: function(xulWindow) { },
    onWindowTitleChange: function(xulWindow, newTitle) { }
};

// Apply a function to all open browser windows
function forEachOpenWindow(func) {
    var windows = Services.wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements())
        func(windows.getNext().QueryInterface(Ci.nsIDOMWindow));
}

function startup(data,reason) {
    // Load UI into all open windows
    forEachOpenWindow(loadIntoWindow);
    // Listen for any windows that open in the future
    Services.wm.addListener(WindowListener);
}

function shutdown(data,reason) {
    if (reason == APP_SHUTDOWN)
        return;

    // Unload the UI from each window
    forEachOpenWindow(unloadFromWindow);
    // Stop listening for new windows to open.
    Services.wm.removeListener(WindowListener);

    // Do whatever shutdown stuff you need to do on add-on disable
    myModule.shutdown();  

    // Unload the module(s) loaded specific to this extension.
    // Use the same URL for your module(s) as when loaded:
    Components.utils.unload("chrome://myAddon/content/myModule.jsm"); 

    // HACK WARNING: The Addon Manager does not properly clear all add-on related caches
    //               on update. In order to fully update images and locales, their
    //               caches need clearing here.
    Services.obs.notifyObservers(null, "chrome-flush-caches", null);
}

function install(data,reason) { }

function uninstall(data,reason) { }

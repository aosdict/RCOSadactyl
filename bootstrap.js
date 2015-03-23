const Ci = Components.interfaces;

Components.utils.import("resource://gre/modules/Services.jsm");

/* Using a global variable is not the best solution, but there are virtually no
   Javascript solutions to have the window accessible in the event handler
   and simultaneously be able to remove the event listener later.
*/
var currWindow;

function handleKey(ev) {
    currWindow.alert("Event: "+ev.which);
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

const Ci = Components.interfaces;

Components.utils.import("resource://gre/modules/Services.jsm");

function loadIntoWindow(window) {
    Services.prompt.alert(null, "title", "Hey2!");
    window.alert("Hey!");
    /* call/move your UI construction function here */
}

function unloadFromWindow(window) {
    /* call/move your UI tear down function here */
}

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

function forEachOpenWindow(todo) {
    // Apply a function to all open browser windows
    var windows = Services.wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements())
        todo(windows.getNext().QueryInterface(Ci.nsIDOMWindow));
}

function startup(data,reason) {
    // Load this add-ons module(s):
    //Components.utils.import("chrome://myAddon/content/myModule.jsm");
    // Do whatever initial startup stuff is needed for this add-on.
    //   Code is in module just loaded.
    //myModule.startup();  

    // Make changes to the Firefox UI to hook in this add-on
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

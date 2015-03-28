var data = require("sdk/self").data;
// Construct a panel, loading its content from the "text-entry.html"
// file in the "data" directory, and loading the "get-text.js" script
// into it.
var text_entry = require("sdk/panel").Panel({
  contentURL: data.url("text-entry.html"),
  contentScriptFile: data.url("get-text.js"),
  height: 16,
  width: 1500,
  padding: 0,
  margin: 0,
  position: {
    bottom: 1,
    left: 0
  }
});

// Create a button
require("sdk/ui/button/action").ActionButton({
  id: "show-panel",
  label: "Show Panel",
  icon: {
    //"16": "./icon-16.png",
    "32": "./banana32.png",
    "64": "./banana.png"
  },
  onClick: handleClick
  // On event: ":"

});

// Show the panel when the user clicks the button.
function handleClick(state) {
  text_entry.show();
}

// When the panel is displayed it generated an event called
// "show": we will listen for that event and when it happens,
// send our own "show" event to the panel's script, so the
// script can prepare the panel for display.
text_entry.on("show", function() {
  text_entry.port.emit("show");
});

text_entry.show();

// Listen for messages called "text-entered" coming from
// the content script. The message payload is the text the user
// entered.
// In this implementation we'll just log the text to the console.

text_entry.port.on("text-entered", function (text) {
  // :r  ==  restart
  if (text === ":r"){
    // include Components.interface & Components.Classes.  Ci & Cc are just aliases for these.
    // Ci is used to interact with the window (restart and quit) while Cc is used to call these functions
    const {Ci, Cc} = require("chrome");
    var boot = Cc["@mozilla.org/toolkit/app-startup;1"].getService(Ci.nsIAppStartup);
    boot.quit(Ci.nsIAppStartup.eForceQuit|Ci.nsIAppStartup.eRestart);
  }
  // :q  == quit
  else if (text === ":q"){
    //
    //
    const {Ci, Cc} = require("chrome");
    var boot = Cc["@mozilla.org/toolkit/app-startup;1"].getService(Ci.nsIAppStartup);
    boot.quit(Ci.nsIAppStartup.eForceQuit);
  }
  else {
    console.log(text+" hasn't been implemented yet!");
  }

});
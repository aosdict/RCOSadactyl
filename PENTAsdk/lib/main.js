var data = require("sdk/self").data;
var tabs = require("sdk/tabs");
    
// Construct a panel, loading its content from the "text-entry.html"
// file in the "data" directory, and loading the "get-text.js" script
// into it.
var text_entry = require("sdk/panel").Panel({
  contentURL: "./text-entry.html",
  contentScriptFile: "./get-text.js",
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
    onClick: showTextWindow
    // On event: ":"
});

// Add an event listener to all opened pages
/*
require('sdk/page-mod').PageMod({
    include: ["about:newtab"],
    contentScriptWhen: "start",
    contentScript: 'window.alert("AAAAAAAAA");',
    attachTo: ['existing', 'top', 'frame']
});
*/

// Setup code to run in each tab
function setupTab(tab) {
    console.log("       setup");
    var worker = tab.attach({
	contentScriptFile: "./handleKeypress.js"
    });
    worker.port.on("change-mode-command", function(message) {
	// enter command mode and show text entry
	text_entry.port.emit("take-string", ":");
	text_entry.show();
	console.log(message);
    });
    //worker.port.emit("alert", "aaaaa");
}
tabs.on("open", function(tab) { // Run setup code in all new tabs
    //tab.on("ready", function(tab) {
	setupTab(tab);
    //});
});
tabs.on("ready", function(tab) { //Run setup code in first new tab
    setupTab(tabs.activeTab);
});
for(let tab of tabs) // Run setup code in all currently open tabs
    setupTab(tab); 

// Show the panel when the user clicks the button.
function showTextWindow(state) {
    text_entry.show();
}

// When the panel is displayed it generated an event called
// "show": we will listen for that event and when it happens,
// send our own "show" event to the panel's script, so the
// script can prepare the panel for display.
text_entry.on("show", function() {
    text_entry.port.emit("show");
});

//text_entry.port.on("hide"

//text_entry.show();

// Listen for messages called "text-entered" coming from
// the content script. The message payload is the text the user
// entered.

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
    const {Ci, Cc} = require("chrome");
    var boot = Cc["@mozilla.org/toolkit/app-startup;1"].getService(Ci.nsIAppStartup);
    boot.quit(Ci.nsIAppStartup.eForceQuit);
  }

  // open a new tab, focus on it
  else if (text === ":nt" & text.length === 3){
	const{Ci,Cc} = require("chrome");
	var mainWindow = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator).getMostRecentWindow("navigator:browser");
	var gBrowser = mainWindow.gBrowser;
	gBrowser.selectedTab = gBrowser.addTab("about:blank");
  }

  // open multiple tabs given a url
  else if (text.substring(0,3) === ":nt" & text.length > 3){
  	const{Ci,Cc} = require("chrome");
  	// parse textArea for the input urls
  	var urlArray = text.substring(4,text.length).split(" ");
	var mainWindow = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator).getMostRecentWindow("navigator:browser");
	var gBrowser = mainWindow.gBrowser;

	// open each new tab iteratively:

	// if the user only inputs a number, open a blank tab that many times
	// to fixed checks of the first command line argument is a number.

	if (parseInt(urlArray[0]) >= 1 || parseInt(urlArray[0]) <= 10000) {
		if (urlArray.length === 1) {
			for (var i = 0 ; i != parseInt(urlArray[0]) ; i++){
				gBrowser.selectedTab = gBrowser.addTab("about:blank");
			}
		}
		else{
			for (var i = 0 ; i != parseInt(urlArray[0]) ; i++){
				gBrowser.selectedTab = gBrowser.addTab(urlArray[1]);
			}
		}
	}

	else {
		for (var i = 0; i != urlArray.length; i++){
			console.log(urlArray[i]+'\n');
			gBrowser.selectedTab = gBrowser.addTab(urlArray[i]);
		}
	}
  }

  // delete tab
  else if (text === ":dt"){
  	const {Ci,Cc} = require("chrome");
  	var mainWindow = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator).getMostRecentWindow("navigator:browser");
	var gBrowser = mainWindow.gBrowser;
	gBrowser.removeTab(gBrowser.selectedTab);
  }

  // delete multiple tabs

  else if (text.substring(0,3) === ":dt"){
  	const {Ci,Cc} = require("chrome");
  	var mainWindow = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator).getMostRecentWindow("navigator:browser");
	var gBrowser = mainWindow.gBrowser;

	if (text.substring(4,6) === "-x"){
		if (text.length <= 6){
			gBrowser.removeAllTabsBut(gBrowser.selectedTab);
		}
		else {
			tabsToKeep = text.substring(6, text.length).split(" ");
		}
	}

	// check if the user is inputing a url
  	if (text.indexOf("*") === -1){
  		
  		// parse the textArea for the index of tabs to close, starting at 0.
  		var tabsToClose = text.substring(4, text.length).split(" ");
  		for (var i = 0 ; i != tabsToClose.length ; i++){
  			// cast it to an int
  			targetTab = parseInt(tabsToClose[i]);
  			// close the corresponding tab
  			gBrowser.removeTab(gBrowser.mTabContainer.childNodes[targetTab]);
  		}
  	}
  	
  }

  else {
    console.log(text+" hasn't been implemented yet!");
  }
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

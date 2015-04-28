var data = require("sdk/self").data;
var tabs = require("sdk/tabs");
var windows = require("sdk/windows");
var { observer } = require("sdk/keyboard/observer"); //undocumented
var winUtils = require("sdk/window/utils"); //unstable
var system = require("sdk/system"); //unstable
var { Bookmark, save } = require("sdk/places/bookmarks");

// for a couple of lower level functionality
const {Ci, Cc} = require("chrome");
var boot = Cc["@mozilla.org/toolkit/app-startup;1"].getService(Ci.nsIAppStartup);
var mainWindow = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator).getMostRecentWindow("navigator:browser");
var gBrowser = mainWindow.gBrowser;


// Construct a panel, loading its content from the "text-entry.html"
// file in the "data" directory, and loading the "get-text.js" script
// into it.
var text_entry = require("sdk/panel").Panel({
  contentURL: "./text-entry.html",
  contentScriptFile: "./get-text.js",
  padding: 0,
  margin: 0,
  height: 20,
  position: {
    bottom: 1,
    left: 0,
    right: 1
  }
});

observer.on("keydown", function(event) {
  // Ignore events that have been handled elsewhere (e.g. by the web page)
  if(event.defaultPrevented) return;

  var activeWindow = winUtils.getMostRecentBrowserWindow();
  var activeTag = activeWindow.document.activeElement.tagName;
  //console.log(activeTag);
  
  // Ignore if the current focus is not in the actual browser window.
  // i.e. filter out key presses on the URI or search bar
  if(activeTag != "xul:browser" && activeTag != "browser") return;
  
  //winUtils.getMostRecentBrowserWindow().document.activeElement = null;
  // Ignore if the user is typing in an input field
  var focus = winUtils.getFocusedElement();
  if(focus != null && focus.tagName != "HTML") {
    return;
  }
  
  var activeWindow = winUtils.getMostRecentBrowserWindow();
  console.log(activeWindow.scrollY);
  
  switch(event.which) {
  case 59: // semicolon
    if(event.shiftKey) { // colon
      text_entry.port.emit("take-string", ":");
      text_entry.show();
    }
    break;
  case 72: // H
    activeWindow.scrollBy(-10, 0);
    activeWindow.scrollY += 10;
    break;
  case 74: // J
    activeWindow.scrollBy(10, 0);
    break;
  case 75: // K
    activeWindow.scrollBy(-10, 0);
    break;
  case 76: // L
    break;
  default:
    console.log("Undefined key event: "+event.which);
  }
 
  // Handle event normally
  //keys.handleKey(event);
});

/* Various things may call text_entry.show()
   When it gets shown, send the "show" message to the content script to prepare
   the panel to be displayed. */
text_entry.on("show", function() {
  text_entry.port.emit("show");
});

// preserve tags specified by -x flag
function UtilSaveTab(UrlArray , targetUrl){
	for (var i = 0 ; i != UrlArray.length ; i++){
		compString = UrlArray[i].substring(0, UrlArray[i].length-1);
		if (compString != "" && targetUrl.indexOf(compString) > -1){
			return true;
		}
	}
	return false; 
}

function UtilIsInt(str){
	var n = parseInt(str) 
	if ( n >= 0 && n <=9999){
		return true;
	}
	return false;
}

function ChangeTab(TabIndex){
	gBrowser.selectedTab = gBrowser.tabContainer.childNodes[TabIndex];
}

// Listen for messages called "text-entered" coming from
// the content script. The message payload is the text the user
// entered.
text_entry.port.on("text-entered", function (text) {
  
  // include Components.interface & Components.Classes. Ci & Cc are just aliases for these.
  // Ci is used to interact with the window (restart and quit) while Cc is used to call these functions
  // :q
  // quit
  if (text === ":q"){
    system.exit();
  }
 
  // :nt [<url>]
  // open a new tab and optionally load <url>
  else if (text.substring(0,3) === ":nt") {
    tabs.open(text.substring(4, text.length));
  }

  // :dt
  // delete current tab
  else if (text === ":dt") {
    tabs.activeTab.close();
  }

  // :nT 
  // next tab
  else if (text === ":nT"){
  	ChangeTab (gBrowser.tabContainer.selectedIndex + 1);
  }
  
  // :pT
  // previous tab
  else if (text === ":pT"){
  	ChangeTab (gBrowser.tabContainer.selectedIndex - 1);
  }

  else if (text === ":bookmark"){
  	CurrentUrl = gBrowser.tabContainer.childNodes[gBrowser.tabContainer.selectedIndex].linkedBrowser.currentURI.spec
  	var Title = text.substring(9, text.length);
  	var bookmark = Bookmark({ title: Title, url: CurrentUrl });

  	let emitter = save(bookmark);
	// Listen for events
	emitter.on("data", function (saved, inputItem) {
		}).on("end", function (savedItems, inputItems) {
	});
  }

  else if (text.substring(0,11) === ":bookmark G" || text.substring(0,11) === ":bookmark g"){
  	
  }

  /*
  // :<int> = change tab
  else if (UtilIsInt(text.substring(1,text.length))){
  	gBrowser.selectedTab = gBrowser.tabContainer.childNodes[parseInt(text.substring(1,text.length))];
  }

  // delete multiple tabs
  else if (text.substring(0,3) === ":dt") {
	// :dt -x = "delete all tabs except current"
	// :dt -x <str> = "delete all tabs except tabs whose url contains str"
	// :dt left = "delete all tabs to the left of current tab"
	// :dt right = "delete all tabs to the right of the current tab"
	// :dt -x left <str> = "delete all left tabs except left tabs containing <str> in url"
	// etc

	var deleteLeftTabs = false;
	var deleteRightTabs = false;
	var UrlsToKeep = new Array(0);

	if (text.indexOf(" l") != -1){
		deleteLeftTabs = true;
	}

	else if (text.indexOf(" r") != -1){
		deleteRightTabs = true;
	}
	
	if (text.substring(4,6) === "-x" 
		&& !deleteRightTabs 
		&& !deleteLeftTabs){
		if (text.length <= 6){
			gBrowser.removeAllTabsBut(gBrowser.selectedTab);
		}
		else {
			UrlsToKeep = text.substring(5, text.length).split(" ");
			UrlsToKeep.shift();
			// if input is not numbers, but urls to keep
			if (UrlsToKeep[0].substring("*") != -1){
				for (var i = gBrowser.tabContainer.childNodes.length - 1; i >= 0; i--){
					CurrentUrl = gBrowser.tabContainer.childNodes[i].linkedBrowser.currentURI.spec;
					if (!UtilSaveTab(UrlsToKeep, CurrentUrl)){
						gBrowser.removeTab(gBrowser.tabContainer.childNodes[i]);
					}
	  			}
  			}
		}
	}

	else if (deleteRightTabs || deleteLeftTabs) {

		// checking for " l" and " r" eliminates the need to check for " left" and " right" as well
		// spaces are needed to make sure that we aren't detecting random r's and l's in any fed url.
		//UrlsToKeep = [];

		if (text.indexOf(" -x") != -1){
			UrlsToKeep = text.substring((text.indexOf(" -x ") + 4), text.length).split(" ");
		}

		// there's a lot of low level bullshit you probably won't see anywhere else because 
		// i dont know how to read documentation.

		// we should only be calling UtilSaveTab if there are urls to keep or we'd get an indexing error
		// note that it is possible to go through both if branches. this is intentional (y)
		if (deleteLeftTabs){
			for (var i = gBrowser.tabContainer.childNodes.length - 1; i >= 0; i--) {
	  			if (gBrowser.tabContainer.selectedIndex > i) { 
	  				CurrentUrl = gBrowser.tabContainer.childNodes[i].linkedBrowser.currentURI.spec;
	  				console.log(CurrentUrl);
	  				if (UrlsToKeep.length === 0 || !UtilSaveTab(UrlsToKeep,CurrentUrl)){
	  					gBrowser.removeTab(gBrowser.tabContainer.childNodes[i]);
	  				}
	  			}
			}
		}

		if (deleteRightTabs){
			for (var i = gBrowser.tabContainer.childNodes.length - 1; i >= 0; i--) {
		  		if (gBrowser.tabContainer.selectedIndex < i) {
		  			CurrentUrl = gBrowser.tabContainer.childNodes[i].linkedBrowser.currentURI.spec;
		    		if (UrlsToKeep.length === 0 || !UtilSaveTab(UrlsToKeep,CurrentUrl)){
	  					gBrowser.removeTab(gBrowser.tabContainer.childNodes[i]);
	  				}
		  		}
			}
		}
	}
		// as of right now, only takes numbers
		// need to check if the user is inputing a url
	else {
	  	// parse the textArea for the index of tabs to close, starting at 0.
  		var tabsToClose = text.substring(4, text.length).split(" ");
  		for (var i = 0 ; i != tabsToClose.length ; i++){
  			// cast it to an int
  			targetTab = parseInt(tabsToClose[i]);
  			// I hope to god you do not have 10000 or more tabs open
  			if (targetTab >= 0 && targetTab <= 9999)
  				// close the corresponding tab
  				gBrowser.removeTab(gBrowser.mTabContainer.childNodes[targetTab]);
  			// else handle cases where the user input a url.
  			else {
  				for (var j = gBrowser.tabContainer.childNodes.length - 1; j >= 0; j--){
					CurrentUrl = gBrowser.tabContainer.childNodes[j].linkedBrowser.currentURI.spec;
					// using UtilSaveTab for the opposite of it's intended purpose in order to
					// identify which tabs to eliminate rather than save.
					if (UtilSaveTab(tabsToClose, CurrentUrl)){
						gBrowser.removeTab(gBrowser.tabContainer.childNodes[j]);
					}
  				}
  			}
	  	}
	}
  }
  */

  else {
    console.log(text+" hasn't been implemented yet!");
  }

});

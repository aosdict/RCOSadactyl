/* keyHandler.js - module for general handling of all single-key actions by
   the application.
*/

// Take action on what to do with a key
function handleKey(event) {
  //console.log("A key was pressed");
  switch(event.which) {
  case 59: // semicolon
  }
}

// Allow handleKey to be used by the module that required this
exports.handleKey = handleKey;

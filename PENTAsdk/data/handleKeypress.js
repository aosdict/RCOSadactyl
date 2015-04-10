// This content script should be called on ALL newly loaded pages.
// It will add this universal key handler to the page.
console.log("Running content script");

const SCROLL_AMT = 10
var metaPressed = {
  shift: false,
  alt: false,
  ctrl: false
};

window.addEventListener("keyup", function(event) {
  switch(event.which) {
  case 16: //shift
    metaPressed.shift = false;
    break;
  }
});

window.addEventListener("keydown", function(event) {
  switch(event.which) {
  case 16: //shift
    metaPressed.shift = true;
    break;
  case 59: //semicolon
    if(metaPressed.shift) //colon
      self.port.emit("change-mode-command", ":");
    break;
  case 72: //h = scroll left
    window.scrollBy(-SCROLL_AMT, 0);
    break;
  case 74: //j = scroll down
    window.scrollBy(0, SCROLL_AMT);
    break;
  case 75: //k = scroll up
    window.scrollBy(0, -SCROLL_AMT);
    break;
  case 76: //l = scroll right
    window.scrollBy(SCROLL_AMT, 0);
    break;
  default:
    console.log("Undefined keydown event " + event.which);
  }
});

window.focus();

/*
  self.port.on("alert", function(mess) {
  alert(mess);
  });
*/

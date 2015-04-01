// This content script should be called on ALL newly loaded pages.
// It will add this universal key handler to the page.
console.log("Running content script");

window.addEventListener("keydown", function(event) {
    if(event.which == 59) { //semicolon
	self.port.emit("script-message", "Semicolon was pressed");
    }
    console.log("Key down event " + event.which);
});

window.focus();

/*
self.port.on("alert", function(mess) {
    alert(mess);
});
*/

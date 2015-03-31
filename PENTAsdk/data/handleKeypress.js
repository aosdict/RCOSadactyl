// This content script should be called on ALL newly loaded pages.
// It will add this universal key handler to the page.
document.addEventListener("keydown", function(event) {
    if(event.which == 59) { //semicolon
	self.port.emit("alert", "Semicolon was pressed");
	alert("SemicolonWW");
    }
    console.log("Key down event " + event.which);
});

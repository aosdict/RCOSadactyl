// When the user hits return, send the "text-entered"
// message to main.js.
// The message payload is the contents of the edit box.
var availableFeatures = [
	":nexttab",	":prevtab",	":newtab",	":deltab",	
	":bookmark" , ":restart" , ":quit"
];

function utilAutoComplete(text){
	var count = 0;
	var autocompleteString = "";
	for (var i = 0 ; i != availableFeatures.length ; i++){
		console.log(availableFeatures[i].substring(0,text.length));
		if (text === availableFeatures[i].substring(0,text.length)){
			count += 1;
			autocompleteString = availableFeatures[i];
		}
		if (count >= 2){
			return text;
		}
	}
	return autocompleteString;
}

var textArea = document.getElementById("edit-box");

var vimWidnow = document.getElementById("vim-window");

textArea.addEventListener('keyup', function onkeyup(event) {
  if (event.keyCode == 27) {
    // Escape pressed - clear the text and leave
    textArea.value = "";
    window.focus();
    self.port.emit("hide");
  }
  if (event.keyCode === 13) {
    // Remove the newline.
    text = textArea.value.replace(/(\r\n|\n|\r)/gm,"");
    self.port.emit("text-entered", text);
    textArea.value = '';
  }
  if (event.keyCode === 9) {
  	var textBoxValue = textArea.value;
  	var replaceWithMe = utilAutoComplete(textBoxValue);
  	var replaceText = textArea.value.replace(/(\r\n|\n|\r)/gm,replaceWithMe);
    self.port.emit("take-string", replaceText);
    console.log(replaceWithMe);
  	textArea.value = replaceWithMe;
  }
}, false);

// document.addEventListener('1' , function oncolon(event) {
//  	if (event.keyCode === 49) {
//  		vimWidnow.show();	
//  		textArea.show();
//  		textArea.focus();
//  		console.log("test4");
//  	}
// }, false);

// Listen for the "show" event being sent from the
// main add-on code. It means that the panel's about
// to be shown.
//
// Set the focus to the text area so the user can
// just start typing.
self.port.on("show", function onShow() {
  textArea.focus();
});

self.port.on("take-string", function(string) {
  textArea.value = string;
});


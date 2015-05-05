/*self.port.on('scroll-down', function() {
  window.scrollBy(0,10);
});
*/

var SCROLLAMT = 10;

self.port.on("set scrollamt", function(_SCROLLAMT){
  console.log("test2");
  SCROLLAMT = _SCROLLAMT;
});

window.addEventListener('keydown', function(event) {
  if (document.activeElement.tagName != 'INPUT') {
    switch(event.which) {
    case 72: // H
      if (event.shiftKey)
	window.scrollTo(0, window.pageYOffset);
      else
	window.scrollBy(-SCROLLAMT,0);
      break;
    case 74: // J
      if (event.shiftKey)
	window.scrollTo(window.pageXOffset, document.body.scrollHeight);
      else
	window.scrollBy(0, SCROLLAMT);
      break;
    case 75: // K
      if (event.shiftKey)
	window.scrollTo(window.pageXOffset, 0);
      else
	window.scrollBy(0, -SCROLLAMT);
      break;
    case 76: // L
      if (event.shiftKey)
	window.scrollTo(document.body.scrollWidth, window.pageYOffset);
      else
	window.scrollBy(SCROLLAMT, 0);
      break;
    default:
      break;
    }
  }
});

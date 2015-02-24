/**
 * Hello World namespace.
 */
if ("undefined" == typeof(hello_worldChrome)) // All these javascript variables are global (so other extensions can read/write to them), so it's good practice to make sure nothing else took our name
{
	var hello_worldChrome = {}; // Setting a var to "{}" is the same as initializing it to "new Object()"
};

/**
 * Controls the browser overlay for the Hello World extension.
 */
hello_worldChrome.BrowserOverlay = { // Start of the object (the popup)
	/**
	 * Says 'Hello'
	 */
	sayHello : function(aEvent)
	{
		let stringBundle = document.getElementById("hello_world-string-bundle"); // "let" is like "var", but with more restricted scope
		let message = stringBundle.getString("hello_world.greeting.label");

		window.alert(message);
	}
};

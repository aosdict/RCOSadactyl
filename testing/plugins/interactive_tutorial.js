"use strict";
isGlobalModule = true;

var INFO = 
["plugin", { name: "interactive tutorial",
	version: "0.1",
	href: "https://github.com/gregbartell/RCOSadactyl",
	summary: "HTTP header info",
	xmlns: "dactyl" },
	["author", "Gregory Bartell"],
	["license", { href: "http://opensource.org/licenses/mit-license.php"}, "MIT"],
	["project", { name: "Pentadactyl", "min-version": "1.0" }],

	["p", {}, "Adds an interactive tutorial, accessible with the <ex>:interactive_tutorial</ex> command."];

	["example", {}, ["ex", {}, ":interactive_tutorial"]]];

group.commands.add(["interactive_tutorial", "int_tut"],
		"Interactive tutorial",
		function () {return RedirectChannel("dactyl://help/")});

var threadHandler = require("../lib/threadHandler").threadHandler;

console.log("Start Thread Handler");


// script to start
threadHandler.setChildScript('node', ['./extScript.js']);

// total threads to run
threadHandler.setTotalThreads(2);

// some event listeners
threadHandler.on("childStarted", function(pid) {
	console.log ("EMIT: "+pid);
});

threadHandler.on("stdout", function(pid,data) {
	console.log ("pid: "+pid + " -- "+data);
});

threadHandler.on("strerr", function(pid,data) {
	console.log ("err: pid: "+pid + " -- "+data);
});

threadHandler.on("exit", function(pid,code) {
	console.log ("exit: pid: "+pid + " -- "+code);
});

// start threading
var fs = require("fs");
// using readdir as being built on a mac - but inotify would be better
fs.readdir('./pending/', function(err, files) {
	// async read - puts all callbacks into thread handler
	files.forEach(function(e) {
		threadHandler.startChild([e]); // we are sending a custom array of additional arguements to send for the one script being sent
	});
	
});

// get total threads
setInterval(function() {
	console.log("Total Threads: "+ threadHandler.getTotalThreads());
}, 1000);
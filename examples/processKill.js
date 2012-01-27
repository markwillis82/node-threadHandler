var threadHandler = require("../lib/threadHandler").threadHandler;

console.log("Start Thread Handler");


// script to start
threadHandler.setChildScript('node', ['./extScript.js']);

// total threads to run
threadHandler.setTotalThreads(10);

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
threadHandler.runForever();
// set 10 Second time out
threadHandler.setMaxTimeout(10000);

// get total threads

setInterval(function() {
	console.log("Total Threads: "+ threadHandler.getTotalThreads());
}, 10000);
var spawn = require('child_process').spawn;
var eventEmitter = require( "events" ).EventEmitter;

// module vars - defining total threads
var runningThreads = 0;
var totalThreads = 5;
var runningThreadProc = [];
var runningThreadStart = [];
var maxTimeout = false; // 10 Second default timeout in milliseconds
var controller = new eventEmitter();
var processKillInterval = false;


// set maxTimeout to user defines in seconds. after a process has run for the time allowed process will be killed.
var setMaxTimeout = function(total) {
	maxTimeout = total;
	if(processKillInterval){
		clearInterval(processKillInterval);
	}
	processKillInterval = setInterval(checkTimeout,5000);
};

// set total threads - can be called at any time and will either allow more or throttle back
var setTotalThreads = function(total) {
	totalThreads = total;
};

// script to run - can be changed during runtime
var setChildScript = function(scriptName, args) {
	scriptToRun = scriptName;
	scriptArgs = args;
};

var getAvailableThread = function (callback) {
	if(runningThreads < totalThreads) {
		callback();
	} else {
		waitForThread(callback);
	}
};

// used internally
var waitForThread = function(callback) {
	setTimeout(function() {
		process.nextTick(function() {
			controller.getAvailableThread(callback);
		});
	},2);
};

var runForever = function() {
	controller.startChild([],function() {
		process.nextTick(controller.runForever);
	});
};

var startChild = function (options, callback) {
	controller.getAvailableThread(function() {
		controller.spawnChild(options,callback);
	});
};

var spawnChild = function(customArgs,callback) {
	runningThreads++;
	var spawnArgs = scriptArgs;

	if(customArgs) {
		spawnArgs = scriptArgs.concat(customArgs);
	}

	var newThread = spawn(scriptToRun, spawnArgs);
	newThread.pidStore = newThread.pid;

	controller.emit('start', newThread.pid, customArgs);
	runningThreadStart[newThread.pid] = new Date().getTime();	
	runningThreadProc[newThread.pid] = newThread;

	runningThreadProc[newThread.pid].stdout.on('data', function (data) {
		controller.emit('stdout', newThread.pid, data);
	});

	runningThreadProc[newThread.pid].stderr.on('data', function (data) {
		controller.emit('stderr', newThread.pid, data);
	});

	runningThreadProc[newThread.pid].on('exit', function (code) {
		runningThreads--;
		controller.emit('exit', newThread.pidStore, code);
		delete runningThreadProc[newThread.pidStore];
		delete runningThreadStart[newThread.pidStore];
	});


	// spawned - run next callback
	if(callback) {
		callback();
	}
};

function getTotalThreads(cb) {
	return runningThreads;
}
// This function will currently run every 5 seconds and will check if a process has been running to a set amount of time. and kill process if necessary 
function checkTimeout(){
	var datetime = new Date().getTime();	
	runningThreadStart.forEach(function(startTime, key){
		var time = startTime + maxTimeout;		
		var check = time - datetime;		
		if(check < 0){		
			// Kill process	
			process.kill(key, "SIGKILL");			
		}    	
    });
}





controller.setMaxTimeout = setMaxTimeout;
controller.spawnChild = spawnChild;
controller.getAvailableThread = getAvailableThread;
controller.getTotalThreads = getTotalThreads;
controller.setChildScript = setChildScript;
controller.runForever = runForever;
controller.setTotalThreads = setTotalThreads;
controller.startChild = startChild;

exports.threadHandler = controller;

console.log(process.argv);

console.log("running");
setTimeout(function() {
	console.error("Exit");
	process.exit();
},20000);
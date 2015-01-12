"use strict";

//SQL MVC SocketStream 0.3 app

var http = require('http');
var ss = require('socketstream'); //without var this become global( and visible without declaration in other modules), with var it is local
var db = require("./server/database/DatabasePool");
var path = require('path');
var spawn = require('child_process').spawn;
var fs = require('fs');

var timestamp = function () {
	var pad2 = function (number) {
		return (number < 10 ? '0' : '') + number;
	};
	var d = new Date();
	return d.getHours() + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds()) + '.' + pad2(d.getMilliseconds());
};

var run_monitor = function (interval_ms) {
	console.log('monitoring for application changes :');
	var interval = setInterval(function () {

			var command = spawn('server/compiler/check.sh');
			var output = [];

			command.stdout.on('data', function (chunk) {
               if (chunk.length > 10)
				output.push(chunk);
			});

			command.on('close', function (code) {
				if (code === 0) {

					var str = output.join('').toString();
					if (str.length > 10) {
						var fn = path.resolve('server/compiler/output/consol.txt');
						fs.writeFileSync(fn, str + "...");

                        ss.api.publish.all('BuildNotify', '#debugBuildNotify','done'); // Broadcast the message to everyone
					}
					if (str.length > 0) //don't bother us with small status message
						console.log('server/compiler/check.sh result :', str);
				} else

					console.log('server/compiler busy :');

			});

		}, interval_ms);
}

// Define a single-page client called 'main'
ss.client.define('main', {
	view : 'app.html', //file under ../client/views
	css : [//prefer loading from view
	],
	code : [//prefer loading from view
		'app' //file under client/code/
	],
	tmpl : '*'
});

// Serve this client on the root URL
ss.http.route('/', function (req, res) {
	//console.log('===========================Initial contents of my session is ', req.session.myStartID);
	console.log('===========================Inital contents of my session is ', req.headers.host, req.url, req.session.myStartID);

	/*
	TODO locate the application that wants to be run
	within that application we retrieve a config file
	organise the application source in this tree... even though the compiler puts it in the database
	 */

	if (req.session.myStartID === undefined) {
		//ss.session.options.secret = crypto.randomBytes(32).toString();
		req.session.myStartID = timestamp();
		req.session.save();
	}

	var root_folder = path.resolve('./Quale/') + '/';
	db.databasePooled(root_folder, req.session.myStartID, req.url, function (err /*, msg, dbref*/
		) {
		if (err) {
			console.log(err.message);
		} else {
			res.serveClient('main');
		}

	});

}); //end of ss.http.route callback

//ss.session.store.use('redis'); - gves a prolem but should be used later

// Code Formatters

// Use server-side compiled Hogan (Mustache) templates. Others engines available
ss.client.templateEngine.use(require('ss-hogan')); //, '/client/templates');

// Minimize and pack assets if you type: SS_ENV=production node app.js
if (ss.env === 'production')
	ss.client.packAssets();

// Start web server
var server = http.Server(ss.http.middleware);
var config = JSON.parse(require('fs').readFileSync('Quale/Config/config.json').toString());
server.listen(config.serve_port);

//start qq file monitor if in dev mode
if (config.monitor_mode[config.run_mode] === "check") { //Develop Debug Demo Production
	run_monitor(1000);
}

// Start SocketStream
ss.start(server);

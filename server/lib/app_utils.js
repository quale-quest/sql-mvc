"use strict";

//SQL MVC SocketStream helpers


var ss = require('socketstream'); //without var this become global( and visible without declaration in other modules), with var it is local
var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;
var mime = require('mime-types');

exports.timestamp = function () {
	var pad2 = function (number) {
		return (number < 10 ? '0' : '') + number;
	};
	var d = new Date();
	return d.getHours() + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds()) + '.' + pad2(d.getMilliseconds());
};

exports.run_monitor = function (interval_ms) {
	console.log('monitoring for application changes :');
	var interval = setInterval(function () {

			var command = spawn('./check.sh');
			var output = [];

			command.stdout.on('data', function (chunk) {
				if (chunk.length > 10)
					output.push(chunk);
			});

			command.on('close', function (code) {
				if (code === 0) {

					var str = output.join('').toString();
					if (str.length > 10) {
						var fn = path.resolve('output/consol.txt');
						fs.writeFileSync(fn, str + "...");

						ss.api.publish.all('BuildNotify', '#debugBuildNotify', 'done'); // Broadcast the message to everyone
					}
					if (str.length > 0) //don't bother us with small status message
						console.log('check.sh result :', str);
				} else

					console.log('compiler busy :');

			});

		}, interval_ms);
}

//http://stackoverflow.com/questions/7288814/download-a-file-from-nodejs-server-using-express
//example usage:
    //app_util.serveString(res,'text/html; charset=UTF-8', 'abcdef');
    //app_util.serveBuffer(res,'image/png',fs.readFileSync('client/static/images/Green_strawberryIconAlpha.png'));
    //var buffer=fs.readFileSync('client/static/favicon.ico'); //this would read from a database
    //app_util.serveBuffer(res,'image/x-icon',buffer);

exports.serveString = function (res, Type, Str, code) {
	res.statusCode = code || 200;
	res.setHeader('Content-Length', Buffer.byteLength(Str));
	res.setHeader('Content-Type', Type);
	res.end(Str);
	return;

};

exports.serveBuffer = function (res, Type, Buffer, code) {
	res.statusCode = code || 200;
	//var mime = require('mime');
	// var filename = path.basename(file);
	//res.setHeader('Content-disposition', 'attachment; filename=' + filename); //for dowloading files
	//var mimetype = mime.lookup(file);
    
    if ((Type===undefined)||(Type===null)||(Type===''))
        Type = mime.lookup(".png");

	res.setHeader('Content-Length', Buffer.length);
	res.setHeader('Content-Type', Type);
	res.end(Buffer);
	return;

};

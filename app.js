"use strict";

//SQL MVC SocketStream 0.3 app

var http = require('http');
var ss = require('socketstream'); //without var this become global( and visible without declaration in other modules), with var it is local
var db = require("./server/database/DatabasePool");
var path = require('path');

var fs = require('fs');
var app_util = require("./server/lib/app_utils");
var app_uploads = require("./server/lib/app_uploads");

var Busboy  = require('busboy');


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

ss.http.route('/upload', function (req, res) {
return app_uploads.ajax_upload_with_rpc_feedback(req, res);
});

ss.http.route('/blob', function (req, res) {
//check load_binary_resource from zxDeltaScriptFile.js
var fn=req.url.substr(6);
console.log('parse ', req.url, fn);

//   http://10.0.0.254:3000/blob/images/Green_strawberryIconAlpha
app_util.serveBuffer(res,'image/png',fs.readFileSync('client/static/'+fn+".png"));
        //do url processing to get the correct binary object to retrieve from the database       
		//res.serveString('text/html; charset=UTF-8', 'abcdef');
//app_util.serveBuffer(res,'image/png',fs.readFileSync('client/static/images/Green_strawberryIconAlpha.png'));
                                                     
        //var buffer=fs.readFileSync('client/static/favicon.ico'); //this would read from a database
		//app_util.serveBuffer(res,'image/x-icon',buffer);


return true;//app_uploads.ajax_upload_with_rpc_feedback(req, res);
});




ss.http.route('/', function (req, res) {

	if (req.url.substring(0, 7) === '/blobs/') {
        //do url processing to get the correct binary object to retrieve from the database       
		//res.serveString('text/html; charset=UTF-8', 'abcdef');
		//res.serveBuffer('image/png',fs.readFileSync('client/static/images/Green_strawberryIconAlpha.png'));
        //var buffer=fs.readFileSync('client/static/favicon.ico'); //this would read from a database
		//app_util.serveBuffer(res,'image/x-icon',buffer);
		return;
	}
    // we can also serve url friendly pages from the application  
    
    //...rest of normnal socket stream code ....
    

	//console.log('===========================Initial contents of my session is ', req.session.myStartID);
	console.log('===========================Inital contents of my session is ', req.headers.host, req.url, req.session.myStartID);
    
	/*
	TODO locate the application that wants to be run
	within that application we retrieve a config file
	organise the application source in this tree... even though the compiler puts it in the database
	 */

	if (req.session.myStartID === undefined) {
		//ss.session.options.secret = crypto.randomBytes(32).toString();
		req.session.myStartID = app_util.timestamp();
		req.session.save();
	}

	var root_folder = path.resolve('./Quale/') + '/';
	db.databasePooled(root_folder, req.session.myStartID, req.url, function (err /*, msg, dbref*/
		) {
		if (err) {
			console.log(err.message);
		} else {
			//console.log('serveClient b4:', JSON.stringify(res,null,4));
			//console.log('serveClient b4:', res);
			res.serveClient('main');
			// console.log('serveClient aft:', res);
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

//var bodyParser = require('body-parser');
//ss.http.middleware.prepend( bodyParser() );    

//ss.http.middleware.prepend( Busboy () );    
    
// Start web server
var server = http.Server(ss.http.middleware);
var config = JSON.parse(require('fs').readFileSync('Quale/Config/config.json').toString());
server.listen(config.serve_port);

//start qq file monitor if in dev mode
if (config.monitor_mode[config.run_mode] === "check") { //Develop Debug Demo Production
	app_util.run_monitor(1000);
}

// Start SocketStream
ss.start(server);

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

var first_done_message = 0;
var c9_message = function () {
	console.log('');
	console.log('');
	console.log('-------------------------------------------------------------------');
	console.log('The application is now running, click "Share" on the top right of the screen ');
	console.log('  and open the Application URL in a new browser."');
	console.log('');
	console.log('To play around with the application, edit and save the file: ');
	console.log('  sql-mvc/demo-app/Quale/Standard/home/Guest/MainMenu/02_Demos/10_todo_mvc.quic');

}

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
						console.log('compiler done :');
					}
					if (str.length > 0) //don't bother us with small status message
						console.log('check.sh result :', str);
					if (first_done_message == 5)
						c9_message();
					first_done_message++;
				} else {

					console.log('compiler busy :');
				}

			});

		}, interval_ms);
}

var jitJobs=[];
var jitInProgress={};
exports.call_compiler = function (scriptnamed,callback) {
//this can be called by more than one client but we can serve only one at a time...

  console.log('compiler job  queued :',scriptnamed);
  if (scriptnamed)
      jitJobs.push({fn:scriptnamed,cb:callback});
  
  if (!jitInProgress.job)  {
      
      
      jitInProgress.job = jitJobs.shift(); //single threaded node, this wont case a race condition
     
     console.log('compiler job dequeued :',jitInProgress.job.fn);
     
			var command = spawn('node',['server/compiler/compile.js','index',jitInProgress.job.fn]);
			var output = [];

			command.stdout.on('data', function (chunk) {
				if (chunk.length > 10)
					output.push(chunk);
			});

			command.on('close', function (code) {
				if (code === 0) {
                    console.log('compiler done :');
					var str = output.join('').toString();
					if (str.length > 10) {
						var fn = path.resolve('output/consol.txt');
						fs.writeFileSync(fn, str + "...");
						ss.api.publish.all('BuildNotify', '#debugBuildNotify', 'done'); // Broadcast the message to everyone
						console.log('compiler done :');
					}
					if (str.length > 0) //don't bother us with small status message
						console.log('check.sh result :', str);
				} else {

					console.log('compiler error :');
				}
                jitInProgress.job=null;

			});      
      
      
  }      
  
    
}



var forFields = exports.forFields = function (object,callback) {
//returns true and stops if a match is found - acts like arr.some

    if (Array.isArray(object))         
        return object.some(callback);
        
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            if (callback( object[key],key,object)===true) return;
        }
    }                    
    return false;
}                        


var zx_children = null;
var zx_children_mtime = null;
exports.check_children = function (filename) {

	var mt = fs.statSync('output/children.json').mtime;
    //console.log('check_children file :',(zx_children_mtime-mt));
	if ((zx_children_mtime-mt)!==0) {        
		zx_children_mtime = mt;
		zx_children = null;
	}

	if (zx_children === null) {
		try {
			//console.log('check_children reading:');
			var fileContents = fs.readFileSync('output/children.json');
			//console.log('check_children read :',fileContents);
			if (fileContents !== "") {
				zx_children = JSON.parse(fileContents);
				//console.log('check_children contents :', zx_children);
			}

		} catch (e) {
			zx_children = {};
			//console.log('check_children failed :',e);
		}
	}
        
    if (zx_children !== null) {
        var fileobj = zx_children[filename];
	    if (fileobj !== undefined) {
            var allsame=true;
            //console.log('check_children fileobj contents :', fileobj.children);
            forFields(fileobj.children,function (time,file) {
            //for (var indx=0;indx<fileobj.children.length;indx++) {
            //    var file = fileobj.children[indx];
            if (allsame) {
            var mt = String(fs.statSync(file).mtime);
            var same=(time===mt);
            console.warn('check_children forEach :',same,file );    
            allsame = allsame&&same;
            }
            });
            return !allsame; //all passed as equal
        }        
    }        
return true;
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

	if ((Type === undefined) || (Type === null) || (Type === ''))
		Type = mime.lookup(".png");

	res.setHeader('Content-Length', Buffer.length);
	res.setHeader('Content-Type', Type);
	res.end(Buffer);
	return;

};

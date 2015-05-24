"use strict";

//SQL MVC SocketStream helpers


var ss = require('socketstream'); //without var this become global( and visible without declaration in other modules), with var it is local
var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;
var mime = require('mime-types');
var rimraf = require('rimraf');

var db = require("../../server/database/DatabasePool");

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
var jitJobsByName={};
var jitInProgress={};
exports.queue_compiler = function (scriptnamed,session,callback) {
//this can be called by more than one client but we can serve only one at a time...

  console.log('compiler job  queued :',scriptnamed);
  if (scriptnamed) {
      //deduplicate - make sure it is not already in the queue
      if (!jitJobsByName[scriptnamed])
          {
          jitJobs.push({fn:scriptnamed,sn:session,cb:callback});
          jitJobsByName[scriptnamed] = true;
          }
  }
}

exports.call_compiler = function () {  

  if (!jitInProgress.job && jitJobs.length>0)  {
    jitInProgress.job = jitJobs.shift(); //single threaded node, this wont case a race condition    
    jitJobsByName[jitInProgress.job.fn] = false;    
    ss.api.publish.all('BuildStarted',  jitInProgress.job.fn,jitInProgress.job.sn );
    
    console.log('compiler job started :',process.cwd(),__dirname);
    //console.log('compiler job started :',jitInProgress.job.fn);
    var compiler = __dirname+'/../../server/compiler/compile.js';
    //console.log('compiler compiler :',compiler,fs.existsSync(compiler));
    
    var command;
        if (jitInProgress.job.fn==='all') {
            rimraf.sync('output');
            command = spawn('node',[compiler,'all']);
        } else {
			command = spawn('node',[compiler,'index',jitInProgress.job.fn]);
            }
            
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
						console.log('BuildNotify done :');
					}
					if (str.length > 0) //don't bother us with small status message
						console.log('check.sh result :', str);
                        
                    console.log('compiler job done :');    
                    ss.api.publish.all('BuildComplete',  jitInProgress.job.fn,jitInProgress.job.sn );
                    if (jitInProgress.job.cb)
                        jitInProgress.job.cb(null);
                    
                    
                    
                    //now the cleint must compare his file name and request a update if the match
                    //the client waiting for the JIT??????
                    
                    
                    //signal_update_developers(jitInProgress.job.fn,jitInProgress.job.sn);
                        
				} else {

					console.log('compiler error :',code);
                    if (jitInProgress.job.cb)
                        jitInProgress.job.cb('error')
				}
                

                jitInProgress.job=null;
                
                
                //exports.call_compiler();
                
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




exports.follow_file = function (filename,follow) {

    try{
	var mt = fs.statSync(filename).mtime;
    //console.log('check_depends file :',(follow.mtime-mt));
	if ((follow.mtime-mt)!==0) {        
		follow.mtime = mt;
	 	follow.obj   = null;
	}
    } catch (e) {};

	if (!follow.obj) {
		try {
			//console.log('check_depends reading:');
			var fileContents = fs.readFileSync(filename);
			//console.log('check_depends read :',fileContents);
			if (fileContents !== "") {
				follow.obj = JSON.parse(fileContents);
				//console.log('check_depends contents :', zx_children);
			}

		} catch (e) {
			follow.obj = {};
			//console.log('check_depends failed :',e);
		}
	}
    
    return follow.obj;       
}

var zx_depends = {};
//called from gaze with the changed file name

exports.check_zx_depends = function (filename) {    
    var file_counts=0;
    if  (exports.follow_file('output/depends.json',zx_depends)) {
        //console.log('        check_zx_depends zx_depends :', zx_depends);
        var fileobj = zx_depends.obj[filename];
	    if (fileobj !== undefined) {   
            forFields(fileobj.parents,function (val,file) {        
                //console.log('        check_zx_depends fileobj contents :', val,file);
    //this must now lookup in the current pages for each of the dev cleints,
    //    if it find a match the file mus be queued for compilation            
                forFields(db.developers,function (current_script,connection) {        
                    //console.log('            check_zx_depends developers :', current_script,connection);
                    if (current_script===file) {
                        console.log('        found active file - queue for compile:', file);
                        file_counts++;
                        exports.queue_compiler(file,null,null); 
                    }
                });
            });
            
            //show current pages
//            console.log('check_zx_depends connections contents :');
//            forFields(db.connections,function (rambase,file) {        
//                console.log('        check_zx_depends connections contents :', rambase.current_script,file);
//                exports.call_compiler = function (scriptnamed,callback) 
//            });
            
        }        
    } 
    return file_counts;    
}    

exports.check_zx_depends_list = function (filenames) {    
    var file_counts=0;
    forFields(filenames,function (filename) {
       //console.log('check_zx_depends filename :', filename);        
        file_counts+=exports.check_zx_depends(filename);
        });
    if ( file_counts === 0)   {
        console.log('No dependents found, buidling all :',filenames);
        //invalidate all children, and issue a refresh to all 'dev' users
        exports.rebuild_all=true;
        ss.api.publish.all('BuildComplete',  'all','');
        
    }
        
    exports.call_compiler(); //only start compiling after we have check all the files to make sure we don't compile one twice.    

}


var zx_children = {};
exports.rebuild_all=false;
exports.check_children = function (filename) {

    if (exports.rebuild_all) {
        fs.unlink('output/children.json');        
        console.log('BuildComplete all :');
    } 
    exports.rebuild_all = false;
        
    if  (exports.follow_file('output/children.json',zx_children)) {
        var fileobj = zx_children.obj[filename];
	    if (fileobj !== undefined) {
            var allsame=true;
            //console.log('check_children fileobj contents :', fileobj.children);
            forFields(fileobj.children,function (time,file) {
            //for (var indx=0;indx<fileobj.children.length;indx++) {
            //    var file = fileobj.children[indx];
            if (allsame) {
            var mt = String(fs.statSync(file).mtime);
            var same=(time===mt);
            // console.warn('check_children forEach :',same,file );    
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

exports.serveError404 = function (response) {    
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.write("404 Not found");
    response.statusCode = 404;
	response.end();
	return;

};

exports.serveString = function (res, Type, Str, code) {
	res.statusCode = code || 200;
	res.setHeader('Content-Length', Buffer.byteLength(Str));
	res.setHeader('Content-Type', Type);
	res.end(Str);
	return;

};

exports.serveBuffer = function (res, Type, Buffer, code,filename) {
	res.statusCode = code || 200;
	//var mime = require('mime');
	// var filename = path.basename(file);
	//res.setHeader('Content-disposition', 'attachment; filename=' + filename); //for dowloading files
	//var mimetype = mime.lookup(file);

	if ((Type === undefined) || (Type === null) || (Type === ''))
		Type = mime.lookup(filename);

	res.setHeader('Content-Length', Buffer.length);
	res.setHeader('Content-Type', Type);
	res.end(Buffer);
	return;

};

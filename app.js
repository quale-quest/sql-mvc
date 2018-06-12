"use strict";

//SQL MVC SocketStream 0.3 app

var http = require('http');
var ss = require('socketstream'); //without var this become global( and visible without declaration in other modules), with var it is local
var db = require("./server/database/DatabasePool");
var path = require('path');

var fs = require('fs');
var app_utils = require("./server/lib/app_utils");
var app_uploads = require("./server/lib/app_uploads");

var Busboy = require('busboy');
var json_like = require("./server/lib/json_like"); 
var zxGase;

var ServerProcess = require("./server/rpc/ServerProcess"); 
var severside_render = require("./server/lib/severside_render"); 

var crypto = require('crypto');

var winston = require('winston');
const url = require('url');
//winston.add(winston.transports.File, { filename: 'clients.log' });

  winston.add(winston.transports.File, {
    filename: 'events.log',
    handleExceptions: true,
    exceptionHandlers: [
      new winston.transports.File({ filename: 'exceptions.log' })
    ]
  });

winston.warn('App.js Loaded');  

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


//ss.client.set({liveReload: false}) //WORKS FOR PRODUCTION

console.log('add route upload ',ss.http.route('/upload', function (req, res) {
	return app_uploads.ajax_upload_with_rpc_feedback(req, res);
}));


ss.http.route('/locked?*', function (req, res) { //files that should not be publicly accessible
	var fn = req.url.substr(8);
	//console.log('parse ', req.url, fn);
    //var path = zx.config.async.public         	
	return app_uploads.ajax_get_secured_file(req, res,fn);   
});


ss.http.route('/files?*', function (req, res) {
	var fn = req.url.substr(7);
    fn = fn.split(/&/)[0];
	//console.log('parse ', req.session,req.url, fn);
    //var path = zx.config.async.public    
   //dont have a way to correctly read the config...i.e. this service is not related to any config... console.log('parse ', zx.config.async.public.path);
   console.log('Serving file from /files 104503 url:',req.url,'file name :', fn);
   if (fn=='') {
        app_utils.serveError404(res);
   } else {   
	app_utils.serveBuffer(res, '', fs.readFileSync('./database/files/' + fn),0,fn); //TODO in production the s must be improved - should actually be server from a web server or CDN
   }     
	return true; 
});

ss.http.route('/', function (req, res) {
	console.log('\r\n\r\n\r\n\r\n=======================================================ss.http.route: '+req.url);
	var LoadedInstance = crypto.randomBytes(16).toString('base64');
	//console.log('LoadedInstance: ', LoadedInstance);

	var queryData = url.parse(req.url, true).query;
	//console.log('queryData:', queryData);
	// we can also serve url friendly pages from the application
	//...rest of normal socket stream code ....

    var ip = req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         req.connection.socket.remoteAddress;
     
	winston.verbose('Connect route/ ',{ip:ip , url:req.url , inst:LoadedInstance}); 
     
	//console.log('===========================Inital contents of my session is ',ip,  LoadedInstance,  req.headers.host, req.url);

	/*
	TODO locate the application that wants to be run
	within that application we retrieve a config file
	organise the application source in this tree... even though the compiler puts it in the database
	 */
//format  http://10.0.0.254:3000/application/page?username&password
//new  format  http://10.0.0.254:3000/app=abc,page=1,user=guest,pass=pass
//
//page includes the /
    var root_folder = path.resolve('./') + '/';
    var host_name = (req.headers.host.match(/(http:\/\/)?(https:\/\/)?(\w+)/) || ["", "",""])[3];    
    var home_page = (req.url.match(/([\/]\w+)([\w\W]+)/) || ["", "",""]);    
    var decoded="{"+decodeURIComponent(req.url).substring(1) + "}";
    decoded = decoded.replace(/&/g,',');
    decoded = decoded.replace(/\?/g,'');

    //console.log('serveClient decoded:',decoded);
    var params = json_like.parse(decoded);  
	params.user	= params.user|| '';
	params.password	= params.password|| '';
	
	if (params.user=='') {
		//if () //params.invite  // with an invite code create/use a temporary unique user that can be converted to a real login
		//alt create/use a temporary unique user that can be converted to a real login
		
		//finally default use a guest user
		params.user	= 'guest';
		params.password	= 'gu35t';
		}
	
    //console.log('serveClient params:',params);
    var Application = params.app || ''; 
 
	db.databasePooled(root_folder, LoadedInstance,Application, function (err , msg, rambase) {
		if (err) {
			console.log(err.message);
		} else {
			try {
			  //console.log("db.databasePooled :",params,'============================');
              rambase.params=params;
		
              if (params.user=='') {
				//this is a first page load ... without rendering - will be rendered on the login from the user
				//console.log("first page load ... without server-side rendering");
				//todo inject LoadedInstance
				res.serveClient('main');
			  }  else  {
				//this is a first page load ... server-side rendered
				//console.log("first page load ... with server-side rendering");
				ServerProcess.produce_login(req, res, ss,rambase, '', params.user,params.password,
				function (scriptnamed,jsonstring){
                    //console.log("severside_render",jsonstring);
                    severside_render.render(scriptnamed,jsonstring,"client/views/app.html",
                        function (html_inject){
							//console.log("severside_render html_inject");
                            res.serveClient('main',
                            function (html){
                                 html = severside_render.render_inject(html,html_inject,LoadedInstance);
                                 return html;
                            });
                        });    
                   
                });
			  }	
			} catch (e) {
				console.log('ss.http.route threw:',e); 
				winston.error('ss.http.route threw:',e);
			}			
		}

	});

}); //end of ss.http.route callback


//ss.session.store.use('redis'); //- gives a problem but should be used later

// Code Formatters

// Use server-side compiled Hogan (Mustache) templates. Others engines available
ss.client.templateEngine.use(require('ss-hogan')); //, '/client/templates');

// Minimize and pack assets if you type: SS_ENV=production node app.js
if (ss.env === 'production')
	ss.client.packAssets();

ss.client.set({
  onChange:
  { DelayTime:2000,
    GuardTime:3000,
    Validate:function(path, event,action){ //needs fn wrapped else it does not add it to options
    console.log('onChangeValidate :', path);    
    return true;
    },
    Publish:function(path, event,action,pubs){ //needs fn wrapped else it does not add it to options
    console.log('onChange.Publish :', action);      
    //modify pubs if needed
    return pubs;
    }    
  }});
  



//var bodyParser = require('body-parser');
//ss.http.middleware.prepend( bodyParser() );

//ss.http.middleware.prepend( Busboy () );

// Start web server
var server = http.Server(ss.http.middleware);
var config = db.load_config('', '');

//clear screen and scrollback
console.log('\x1Bc'); 
console.log('\x1B[3J');

console.log('serveClient config.run.serve_port:', config.run.serve_port);
server.listen(config.run.serve_port);


//start qq file monitor if in dev mode
if (config.run_settings[config.run_mode].monitor_mode === "check") { 
	app_utils.run_monitor(1000);
}

if (config.run_settings[config.run_mode].monitor_mode === "jit") { 	
		try {
			zxGase= require("./server/compiler/quicc-gaze");
			zxGase.gaze_start(app_utils.check_zx_depends_list);			
		}
		catch (e) {		
			console.log("JIT set but compiler not found - app.js:248");
			throw e;
		}

}
// Start SocketStream
ss.start(server);


if (config.run_mode === "c9") {    
    console.log('To edit the application home page click '+path.resolve(__dirname)+'/Quale/Standard/Home/Guest/Index.quicc');    
    console.log('To access the application click https://'+process.env['C9_HOSTNAME']+' or "preview->preview running application" in the menu above');    
} else if (config.run_mode !== "win") {    
    console.log('To edit the application home page edit the file '+path.resolve(__dirname)+'/Quale/Standard/Home/Guest/Index.quicc');    
    console.log('To access the application open http://'+process.env['C9_HOSTNAME']+':'+config.run.serve_port+'');    
} //win has its own IDE start up


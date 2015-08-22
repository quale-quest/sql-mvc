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
//console.log('parse/ ', req.headers.host);

	// we can also serve url friendly pages from the application

	//...rest of normal socket stream code ....


	//console.log('===========================Initial contents of my session is ', req.session.myStartID);
	console.log('===========================Inital contents of my session is ',
        req.session.myStartID,  req.headers.host, req.url);
    var session_save = 0;
	if (req.session.myStartID === undefined) {
		//ss.session.options.secret = crypto.randomBytes(32).toString();
		req.session.myStartID = app_utils.timestamp();//crypto.randomBytes(32).toString();
        //console.log('===========================Assigned new session ID ',req.session.myStartID);
		session_save = 1;
	}    
    
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

    console.log('serveClient decoded:',decoded);
    var params = json_like.parse(decoded);    
    console.log('serveClient params:',params);
    var Application = params.app || ''; 

    //console.log('serveClient host:',host_name,' home_page:', home_page,params,' Application :',Application);
    if (req.session.Application!=Application) {req.session.Application=Application; session_save = 1;}
    if (req.session.root_folder!=root_folder) {req.session.root_folder=root_folder; session_save = 1;}
    if (session_save) req.session.save();    
    
	db.databasePooled(root_folder, req.session.myStartID,Application, function (err , msg, rambase
		) {
		if (err) {
			console.log(err.message);
		} else {
        
            rambase.params=params;
            
            if (params.invite) {
                //generate the page - using guest login and an invite number
                /* todo debug this code
                
                issue 2 passing invite number as the master.ref to the stored procedure
                        
                
                serverprocess.produce_login(req, res, ss, rambase , '', 'guest','gu35t',
                function (jsonstring){
                    join the json string with the template from a file
                    app_utils.serveBuffer(res, '',html,0,'index.html');                     
                });
                
                */
            } else if (params.user) {    
            //this is a first page load ... server-side rendered                
                ServerProcess.produce_login(req, res, ss,rambase, '', 'guest','gu35t',
                function (scriptnamed,jsonstring){
                    //console.time("severside_render");
                    severside_render.render(scriptnamed,jsonstring,"client/views/app.html",
                        function (html_inject){
                             //console.log('produce_login rendered html 162246:',html_inject);
                             //app_utils.serveBuffer(res, '',html,0,'index.html');  
                             //console.timeEnd("severside_render");
                             res.serveClient('main',
                             function (html){
                                 //console.log("render_from_fullstash returning :");
                                 html = severside_render.render_inject(html,html_inject);
                                 //console.log('produce_login rendered html 162247 XXXXXXXXXXXXXXXXXXX:',html);
                                 //console.timeEnd("severside_render");
                                 return html;
                             });
                        });    
                   
                });
                
                
               // res.serveClient('main');
            } else  {
            res.serveClient('main');
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

console.log('serveClient config.run.serve_port:', config.run.serve_port);
server.listen(config.run.serve_port);


//start qq file monitor if in dev mode
if (config.run_settings[config.run_mode].monitor_mode === "check") { 
	app_utils.run_monitor(1000);
}

if (config.run_settings[config.run_mode].monitor_mode === "jit") { 	
    zxGase= require("./server/compiler/quicc-gaze");
    zxGase.gaze_start(app_utils.check_zx_depends_list);
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


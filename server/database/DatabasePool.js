"use strict";
// Server-side Code
// this abstracts the database access to fire-bird
// later we can have alternatives for nuodb,mssql ...

//there may be a better way to do this...it is a version 0.0.1 - learning node.js,ss-node ....
var fb = require("node-firebird");
var fs = require('fs');
var path = require('path');
var util = require('util');
var os = require('os');
var extend = require('node.extend');
var deasync = require('deasync');

exports.connections = {};
exports.developers = {}; //stores all the developer id and where they are viewing for JIT compiler

exports.module_name = 'DatabasePool.js';

exports.list = function (/*connectionID*/
) {
	return exports.connections;
};

var maintenance_timer = setInterval(function () {
	//console.log('maintenance_timer...:');
	var to= Date.now() - 300000; //5mins
	for (var key in exports.connections) {
		if (exports.connections.hasOwnProperty(key)) {
			var c = exports.connections[key];
			if (c && c.db)
				if (c.last_connect_stamp < to) {
					console.log('maintenance_timer...: Detached :',key);
					c.db.detach();
					c.db =null;
				}
		}
	};
						
	}, 500);

exports.load_config = function (root_folder, Application) {

	if (Application === '')
		Application = '/Home';
	if (Application === '/')
		Application = '/Home';
        
    var initial   =root_folder + 'Quale/Config' + Application; 

	var fileContents = '',
	search = path.resolve(initial);

	console.log('Inital Application is',initial, Application,' located at:',search);
	while (fileContents === "" && search !== '/') {
		try {
			fileContents = fs.readFileSync(search + '/config.json');            
		} catch (e) {
			//console.log('App config error: for ', search,e);
			search = path.resolve(search + '/..');
		}
	}
	//console.log("Config file from : ", search); //,fileContents);
    //console.trace("Stack!")

	var conf = exports.check_run_mode(fileContents);        

	return conf;
}

exports.check_run_mode = function (str) {
    var config;
	try {
		config = JSON.parse(str);
	} catch (e) {
		console.log("WARN Error parsing config.quicc 175908 :", e, 'string:',str);
        console.trace("Stack!")
		process.exit(2);
	}

	//console.log("check_run_mode a : ", config);
	if (config.run_mode === "auto") {
		config.run_mode = os.platform().substring(0, 3);
		var fn = '/mnt/shared/bin/c9';//path.resolve(process.env.HOME ,'.c9')
        try {
		var stats = fs.lstatSync(fn);
		if (stats.mtime) config.run_mode = 'c9';
        } catch (e) {}
        fn = '/mnt/shared/sbin/c9';//path.resolve(process.env.HOME ,'.c9')
        try {
		var stats = fs.lstatSync(fn);
		if (stats.mtime) config.run_mode = 'c9';
        } catch (e) {}
		fn = '../../production.run';
        try {
		var stats = fs.lstatSync(fn);
		if (stats.mtime) config.run_mode = 'prod';
        } catch (e) {}
        
	}
	//console.log("check_run_mode d: ", config.run_mode);	process.exit(2);        
	config.run = extend(config.run,config.run_settings[config.run_mode]);
    config.db = extend(config.db, config.run.db); //second one has the priority
	//console.log("check_run_mode c: ", config);	process.exit(2);
    
	return config;
}


exports.databasePooled = function (root_folder, connectionID, Application, callback) {
	//util.log('db connections json 164959 :'+util.inspect(exports.connections));
	if (exports.connections[connectionID] !== undefined) {
		//console.log("database connection cached from : ", connectionID);
		if (callback !== undefined)
			callback(null, "Connected", exports.connections[connectionID]);
	} else { //read the config from  a file in the application folder
		//console.log("Application for " + connectionID + ' : ' + Application);
		//console.log("database connection connect from : ", connectionID);
		var rambase = {};

		var fileContents = "";
		var conf = exports.load_config(root_folder, Application);

		//console.log("Config file Contents : ", fileContents,conf );
		rambase.conf = conf;
		rambase.host = conf.db.server;
		//console.log('db connections json 165225 :', JSON.stringify(rambase, null, 4));
		rambase.database = conf.db.database;
		if (conf.db.authfile !== undefined && conf.db.authfile !== "") {
			var str;
			try {
				str = fs.readFileSync(conf.db.authfile).toString();
			} catch (e) {
				console.log("WARN DATABASE Password file name is set (in conf.db.authfile) but the file does not exist : ", conf.db.authfile);
				process.exit(2);
			}
			rambase.user = (str.match(/^ISC_USER=\"*(\w+)/im) || ["", "sysdba"])[1];
            rambase.password = (str.match(/^ISC_PASSWORD=\"*([\w\.]+)/im) || ["", "masterkey"])[1]; //old default

			//console.log("Using Password file name set in conf.db.authfile as : ", conf.db.authfile, " retrieved as user ", rambase.user);
		} else {
			rambase.user = conf.db.username;
			rambase.password = conf.db.password;
		}
		//console.log('db connections json 165226 :', JSON.stringify(rambase, null, 4));
		rambase.user_table = conf.db.user_table;
		rambase.pk = conf.pk;
		//console.log('db connections json 165227 :', JSON.stringify(rambase, null, 4));
		rambase.isql_extract_dll_cmdln = ['-ex', '-user', rambase.user, '-password', rambase.password, rambase.host + ':' + rambase.database];
		//console.log("isql_extract_dll_cmdln :",rambase.isql_extract_dll_cmdln);

		var fn = fb.attach;
		if (conf.run.db_create==="yes")
			fn = fb.attachOrCreate;

        rambase.connection_string = {
			host : rambase.host,
			database : rambase.database,
			user : rambase.user,
			password : rambase.password
		};
		fn(rambase.connection_string,
			function (err, dbref) {
			if (err) {

				console.log(err.message);
                if (err.message.match(/user name and password are not defined/)) {
                    console.log('Check the databse config and passwords :', JSON.stringify(rambase.connection_string,null,4));
                    process.exit(2);
                }

				if (callback !== undefined)
					callback(err, "Error");
			} else {
				//console.log('db connections json 165229 :', JSON.stringify(rambase,null,4));
				//console.log('db connections json 165233 :', JSON.stringify(dbref,null,4));
				rambase.db = dbref;
				//console.log('db connections json 165230 :', JSON.stringify(rambase,null,4));
				//console.log('db connections json 164950 :', JSON.stringify(exports.connections, null, 4));
				rambase.connectionID = connectionID;
                rambase.ready = true;
				rambase.last_connect_stamp = Date.now();
				exports.connections[connectionID] = rambase;
                
				//console.log('db connections json 165301 :', JSON.stringify(rambase,null,4));
				// console.log('db connections json :', JSON.stringify(exports.connections,null,4));
				//console.log("connection number 164955 " + Object.keys(exports.connections).length + " for " + connectionID + ' on ' + exports.connections[connectionID]);
                deasync.sleep(15); //on windows this is needed to prevent the compiler form hanging
				if (callback !== undefined)
					callback(null, "Connected", exports.connections[connectionID]);
			}
		});
	}

	return;
};


exports.connect_if_needed = function (connection, callback) {
	
	if (!connection.db) { 
        console.log('connect_if_needed connecting 080005 :');
        fb.attach(connection.connection_string,
			function (err, dbref) {
            console.log('connect_if_needed connected 080005 :');    
			if (err) {
                console.log('connect_if_needed connected error 080005 :');    
				console.log(err.message);
				if (callback !== undefined)
					callback(err, "Error");
			} else {
				connection.db = dbref;
                connection.ready = true;
                deasync.sleep(15); //on windows this is needed to prevent the compiler form hanging
				connection.last_connect_stamp = Date.now();
                console.log('connect_if_needed connected callback 080005 :');    
				if (callback !== undefined)
					callback(null, "Connected", connection);
			}
		});    
	} else {
		connection.last_connect_stamp = Date.now();
        console.log('connect_if_needed already connected 080005 :');
		callback(null, "Connected", connection);
		
		}

};




exports.locateRambase = function (connectionID,cb) {//dont think this is being used
    if (exports.connections[connectionID])  {
        cb(exports.connections[connectionID]);
    } else {
        
	db.databasePooled(root_folder, req.session.myStartID,Application, function (err , msg, Rambase
		) {
		if (err) {
			console.log(err.message);
		} else {
            cb(Rambase);
        }});                  
    }
    
};

exports.locateRambaseReq = function (req,cb) {
    var connectionID=req.session.myStartID;
    if (exports.connections[connectionID])  {
        cb(exports.connections[connectionID]);
    } else {
      
    console.log('locateRambase req.session 105555 :',req.session.myStartID,req.session.Application,req.session.root_folder);
    
	exports.databasePooled(req.session.root_folder, req.session.myStartID, req.session.Application, function (err , msg, Rambase
		) {
		if (err) {
			console.log(err.message);
		} else {
            cb(Rambase);
        }});                  
    }
    
};



exports.locate = function (connectionID) {
    return exports.connections[connectionID];
};

exports.LocateDatabasePool = function (connectionID) {
	if (exports.connections[connectionID] !== undefined) {
		console.log("database connection cached from : ", connectionID);
		return exports.connections[connectionID];
	}
	return null;

}

exports.detach = function (dbref, connectionID, force) {
	//actual detachment is managed by the pool
	if ((connectionID === undefined) || (connectionID === null)) {
		//console.log("compare start " + Object.keys(exports.connections).length);
		//console.log('db connections json :', JSON.stringify(exports.connections,null,4));
		connectionID = undefined;
		for (var key in exports.connections) {
			if (exports.connections.hasOwnProperty(key)) {
				var c = exports.connections[key];
				//console.log("compare for " + c.connectionID, dbref.connectionID);
				if (c.connectionID === dbref.connectionID) {
					connectionID = c.connectionID;
					//console.log("matched for " + c.connectionID + ' on ' + dbref.connectionID);
				}
			}
		}
	}
	//console.log("actual for " + connectionID + ' on ' + dbref);
	if (connectionID !== undefined) {
		exports.connections[connectionID].db.detach();
		delete exports.connections[connectionID];
	}
}

exports.on_exit = function (dbref, connectionID, force) {
	for (var key in exports.connections) {
		if (exports.connections.hasOwnProperty(key)) {
			var c = exports.connections[key];
			if (c)
				if (c.db)
					c.db.detach();
		}
	};

}

//eof

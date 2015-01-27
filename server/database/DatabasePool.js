"use strict";
// Server-side Code
// this abstracts the database access to fire-bird
// later we can have alternatives for nuodb,mssql ...

//there may be a better way to do this...it is a version 0.0.1 - learning node.js,ss-node ....
var fb = require("node-firebird");
var fs = require('fs');
var path = require('path');
var util = require('util');

exports.connections = {};

exports.module_name = 'DatabasePool.js';

exports.list = function (/*connectionID*/
) {
	return exports.connections;
};

exports.locate = function (connectionID) {
	return exports.connections[connectionID];
};

exports.load_config = function (root_folder, Application) {

	if (Application === '')
		Application = '/Home';
	if (Application === '/')
		Application = '/Home';
        
    var initial   =root_folder + 'Config' + Application; 
	var fileContents = '',
	search = path.resolve(initial);

	//console.log('Inital Application is',initial, Application,' located at:',search);
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

	var conf = {};
	if (fileContents !== "")
       {
		conf = JSON.parse(fileContents);
        conf.run=conf.run_settings[conf.run_mode];
        }

	return conf;
}

exports.LocateDatabasePool = function (connectionID) {
	if (exports.connections[connectionID] !== undefined) {
		console.log("database connection cached from : ", connectionID);
		return exports.connections[connectionID];
	}
	return null;

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
			rambase.password = (str.match(/^ISC_PASSWORD=\"*(\w+)/im) || ["", "masterkey"])[1]; //old default

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
		if (conf.run_mode === "dev")
			fn = fb.attachOrCreate;

		fn({
			host : rambase.host,
			database : rambase.database,
			user : rambase.user,
			password : rambase.password
		},
			function (err, dbref) {
			if (err) {

				console.log(err.message);

				if (callback !== undefined)
					callback(err, "Error");
			} else {
				//console.log('db connections json 165229 :', JSON.stringify(rambase,null,4));
				//console.log('db connections json 165233 :', JSON.stringify(dbref,null,4));
				rambase.db = dbref;
				//console.log('db connections json 165230 :', JSON.stringify(rambase,null,4));
				//console.log('db connections json 164950 :', JSON.stringify(exports.connections, null, 4));
				rambase.connectionID = connectionID;
				exports.connections[connectionID] = rambase;
				//console.log('db connections json 165301 :', JSON.stringify(rambase,null,4));
				// console.log('db connections json :', JSON.stringify(exports.connections,null,4));
				//console.log("connection number 164955 " + Object.keys(exports.connections).length + " for " + connectionID + ' on ' + exports.connections[connectionID]);
				if (callback !== undefined)
					callback(null, "Connected", exports.connections[connectionID]);
			}
		});
	}

	return;
};

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
			if (c)
				if (c.db)
					c.db.detach();
		}
	};

}

//eof

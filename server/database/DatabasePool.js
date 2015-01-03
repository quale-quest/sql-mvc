"use strict";
// Server-side Code
// this abstracts the database access to fire-bird
// later we can have alternatives for nuodb,mssql ...

//there may be a better way to do this...it is a version 0.0.1 - learning node.js,ss-node ....
var fb = require("node-firebird");
var fs = require('fs');
var path = require('path');

exports.connections = [];

exports.module_name = 'DatabasePool.js';

exports.list = function (/*connectionID*/
) {
	return exports.connections;
};

exports.locate = function (connectionID) {
	return exports.connections[connectionID];
};

exports.databasePooled = function (root_folder, connectionID, url, callback) {

	if (exports.connections[connectionID] !== undefined) {
		console.log("database connection cached from : ", connectionID);
		if (callback !== undefined)
			callback(null, "Connected", exports.connections[connectionID]);
	} else { //read the config from  a file in the application folder
		//console.log("url for " + connectionID + ' : ' + url);
		console.log("database connection connect from : ", connectionID);
		var rambase = {};

		var conf = {},
		fileContents = "",
		Application = url;
		if (Application === '/')
			Application = '/Home';
		var search = path.resolve(root_folder + 'Config' + Application);

		//console.log('Inital Application is', Application,' located at:',search);
		while (fileContents === "" && search !== '/') {
			try {
				fileContents = fs.readFileSync(search + '/config.json');
			} catch (e) {
				//console.log('App config error: ', e);
				search = path.resolve(search + '/..');
			}
		}
		console.log("Config file from : ", search);

		if (fileContents !== "")
			conf = JSON.parse(fileContents);
		//console.log("Config file Contents : ", fileContents,conf );
		rambase.conf = conf;
		rambase.host = conf.db.server;
		rambase.database = conf.db.database;
		if (conf.db.authfile !== undefined && conf.db.authfile !== "") {
			try {

				var str = fs.readFileSync(conf.db.authfile).toString();
			} catch (e) {
				console.log("WARN DATABASE Password file name is set (in conf.db.authfile) but the file does not exist : ", conf.db.authfile);
				process.exit(2);
			}
			rambase.user = (str.match(/^ISC_USER=\"*(\w+)/im) || ["", "sysdba"])[1];
			rambase.password = (str.match(/^ISC_PASSWORD=\"*(\w+)/im) || ["", "masterkey"])[1]; //old default

			console.log("Using Password file name set in conf.db.authfile as : ", conf.db.authfile, " retrieved as user ", rambase.user);
		} else {
			rambase.user = conf.db.username;
			rambase.password = conf.db.password;
		}
		rambase.user_table = conf.db.user_table;
		rambase.pk = conf.pk;

		fb.attach({
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

				rambase.db = dbref;
				exports.connections[connectionID] = rambase;
				//console.log("connected for " + connectionID + ' on ' + exports.connections[connectionID]);
				if (callback !== undefined)
					callback(null, "Connected", exports.connections[connectionID]);
			}
		});
	}

	return;
};

//eof

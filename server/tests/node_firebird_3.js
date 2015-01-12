"use strict";

var Firebird = require("node-firebird");
var fs = require('fs');
var path = require('path');

var load_config = function () {

	var conf = {},
	fileContents = '',
	search = path.resolve('../../Quale/Config');
	fileContents = fs.readFileSync(search + '/config.json');
	conf = JSON.parse(fileContents);
	if (conf.db.authfile !== undefined && conf.db.authfile !== "") {
		var str;
		try {
			str = fs.readFileSync(conf.db.authfile).toString();
		} catch (e) {
			console.log("WARN DATABASE Password file name is set (in conf.db.authfile) but the file does not exist : ", conf.db.authfile);
			process.exit(2);
		}
		conf.user = (str.match(/^ISC_USER=\"*(\w+)/im) || ["", "sysdba"])[1];
		conf.password = (str.match(/^ISC_PASSWORD=\"*(\w+)/im) || ["", "masterkey"])[1]; //old default
		console.log("Using Password file name set in conf.db.authfile as : ", conf.db.authfile, " retrieved as user ", conf.user);
	} else {
		conf.user = conf.db.username;
		conf.password = conf.db.password;
	}

	var options = {};
	options.host = conf.db.server;
	options.database = conf.db.database;
	options.user = conf.user;
	options.password = conf.password;

	return options;
}

var test_0_1_4_A = function () {
	//returns blobs ok in node firebird 1.4

	Firebird.attach(load_config(), function (err, db) {

		if (err)
			throw err;

		// db = DATABASE
		db.query('SELECT a.PK, a.TSTAMP, a.FILE_NAME, a.REMOVE_STAMP, a.SCRIPT FROM Z$SP a ;', function (err, result) {
			// IMPORTANT: close the connection
			console.log("SELECT a.PK, a.TSTAMP, a.FILE_NAME, a.REMOVE_STAMP, a.SCRIPT FROM Z$SP a : \n", err, result);

			db.detach();
		});

	});

	return;
};

var test_0_1_4_B = function () { //select blob from stored procedure
	//in node firebird 0.1.4 selects blob ok BLOB ID

	Firebird.attach(load_config(), function (err, db) {

		if (err)
			throw err;

		// db = DATABASE
		db.query("SELECT a.info,a.RES FROM SPTEST ('12345') a;", function (err, result) {
			// IMPORTANT: close the connection
			console.log("SELECT info,RES FROM Z$RUN ('6:33:01.520','',1000,0,'','','u05guestp05gu35tw00x00') a : \n", err, result);
			//Error: invalid BLOB ID

			db.detach();
		});

	});

	return;
};

var test_0_3_0_A = function () {
	//returns blobs from table ok in node firebird 3.0.0

	Firebird.attach(load_config(), function (err, db) {

		if (err)
			throw err;

		// db = DATABASE
		db.query('SELECT first 1 a.PK, a.TSTAMP, a.FILE_NAME, a.REMOVE_STAMP, a.SCRIPT FROM Z$SP a ;', function (err, result) {
			// IMPORTANT: close the connection
			console.log("SELECT a.PK, a.TSTAMP, a.FILE_NAME, a.REMOVE_STAMP, a.SCRIPT FROM Z$SP a : \n", err, result);

			result[0].script(function (err, name, e) {

				if (err)
					throw err;

				// +v0.2.4
				// e.pipe(writeStream/Response);

				// e === EventEmitter
				e.on('data', function (chunk) {
					// reading data
					console.log("receive chunk : \n", chunk.length, chunk);
				});

				e.on('end', function () {
					// end reading
					// IMPORTANT: close the connection
					console.log("receive end : \n");
					db.detach();
				});
			});

			db.detach();
		});

	});

	return;
};

var test_0_3_0_B = function () { //
	//in node firebird 0.3.0 throws :  Error: invalid BLOB ID  when selecting blob from stored procedure
	/*
	SET TERM ^ ;
	CREATE PROCEDURE SPTEST (
	INX VARCHAR(40)
	)
	RETURNS (
	INFO VARCHAR(1000),
	RES BLOB SUB_TYPE 1 )
	AS
	BEGIN
	info=INX;
	res=INX;
	suspend;
	END^
	SET TERM ; ^
	 */

	Firebird.attach(load_config(), function (err, db) {

		if (err)
			throw err;

		db.query("SELECT a.info,a.RES FROM SPTEST ('12345') a;", function (err, result) {

			console.log("SELECT a.info,a.RES FROM SPTEST ('12345') a  : \n", err, result);
			//Error: invalid BLOB ID

			result[0].res(function (err, name, e) {
				if (err)
					throw err;

				e.on('data', function (chunk) {
					// reading data
					console.log("receive chunk : \n", chunk.length, chunk);
				});

				e.on('end', function () {
					// end reading
					// IMPORTANT: close the connection
					console.log("receive end : \n");
					db.detach();
				});
			});

			db.detach();
		});

	});

	return;
};

var node_firebird_driver_version = "0.3.0";
var test_type = "SP";
if (node_firebird_driver_version !== "0.3.0") {
	if (test_type == "Table")
		test_0_1_4_A(); //Blobs ok in 0.1.4
	else
		test_0_1_4_B(); //Blobs ok in 0.1.4
} else {
	if (test_type == "Table")
		test_0_3_0_A(); //returns blobs from table ok in node firebird 3.0.0
	else
		test_0_3_0_B(); ////in node firebird 3.0.0 throws :  Error: invalid BLOB ID  when selectin blob from stored procedure
}

//eof

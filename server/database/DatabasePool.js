"use strict";
// Server-side Code
// this abstracts the database access to fire-bird
// later we can have alternatives for nuodb,mssql ...

//there may be a better way to do this...it is a version 0.0.1 - learning node.js,ss-node ....

var fs = require('fs');
var path = require('path');
var util = require('util');
var os = require('os');
var extend = require('node.extend');
var deasync = require('deasync');var deasync_const=15;
var deepcopy = require('deepcopy');

var winston = require('winston');
//winston.add(winston.transports.File, { filename: 'gm.log' });
var crypto = require('crypto');

var db_req = {};

exports.connections = {};
exports.developers = {}; //stores all the developer id and where they are viewing for JIT compiler
exports.stats = {ppm:{} };

exports.module_name = 'DatabasePool.js';

exports.list = function (/*connectionID*/
) {
	return exports.connections;
};

exports.insert_array = function (db,sql,arry,index,cb) {  
//console.log('insert_array...:',index);  
  if( index >= arry.length ) cb(); else {
        console.log('inserting record:',index,"of",arry.length,arry[index]);
        try{
        db.query(sql, arry[index], function(err, result) {       
        console.log('done inserting record:',index);
        //console.log('insert_array...:',index,err);  
        exports.insert_array(db,sql,arry,index+1,cb); 
        });        
        } catch (e) {
            exports.insert_array(db,sql,arry,index+1,cb); 
            console.log('Error inserting tacking data:',index,e); 
            winston.error('Error inserting tacking data 170901',e,index,arry.length,arry[index]);
        }
    }
}    




var maintenance_timer_rambase = null;
var FindOldest_rambase = function (connections) { 
	var to= Date.now() + 5000;
	var found_rambase = null;
	for (var key in connections) {if (connections.hasOwnProperty(key)) {
		
		var rambase = connections[key]; 
		  if (rambase && rambase.db)
			//console.log('FindOldest_rambase...:',rambase.last_connect_stamp,to);
			if ((rambase.last_connect_stamp < to) && (!rambase.transaction_active)) {
				found_rambase = rambase;
				to = rambase.last_connect_stamp;
			}	
	}}	
	return found_rambase;
}

var maintenance_timer = setInterval(function () {
	//every 5 seconds check if we need to disconnect one connection
	//console.log('maintenance_timer...:');//,maintenance_timer_rambase);
	
	//find newest
	var to= Date.now() - 600000; //older than 10 mins	
	if (maintenance_timer_rambase!==null) if (maintenance_timer_rambase.transaction_active)  maintenance_timer_rambase=null; //kill if busy again
	
	if (maintenance_timer_rambase==null)
		maintenance_timer_rambase = FindOldest_rambase(exports.connections);
	if (1)
	if (maintenance_timer_rambase!==null) {
		//console.log('maintenance_timer...:',maintenance_timer_rambase.transaction_active,maintenance_timer_rambase.last_connect_stamp,to);
		if (maintenance_timer_rambase.last_connect_stamp < to) {
			var rambase = maintenance_timer_rambase;
			var key = rambase.last_connect_stamp;
		
			console.log('maintenance_timer...: Preparing to Detach :',key);
			if (rambase.tr_log&&rambase.tr_log.length>0) { //used by trace_to_server
				rambase.tr_log.push([rambase.LoadedInstance,'x',rambase.tr_last_contact,'','']);
				winston.info('tacking',[rambase.LoadedInstance,'x',rambase.tr_last_contact,'','']);
				rambase.tr_log_send = rambase.tr_log;
				rambase.tr_log = [];
				console.log('maintenance_timer...: logging :',
					key,rambase.tr_last_contact,rambase.tr_log.length);   

				exports.insert_array(rambase.db
					,'INSERT INTO track (session, act, stamp, par1, par2) VALUES(?, ?, ?, ?, ?)'
					,rambase.tr_log_send
					,0
					,function () {
						console.log('maintenance_timer...: Detaching after loging :',key,c);
						try {
							if (rambase.db.detach) rambase.db.detach(); //fb/mysql
							if (rambase.db.release) rambase.db.release(); //mssql
							rambase.db =null;                                
						} catch (e) {
							winston.error('Error detatching db 170900',key);
						}    
						console.log('maintenance_timer...: Done Detaching  after loging:',key);
						
					});
				
			} else {
				console.log('maintenance_timer...: Detaching :',key);
				if (rambase.db.detach) rambase.db.detach(); //fb/mysql
				if (rambase.db.release) rambase.db.release(); //mssql
				rambase.db =null;
				console.log('maintenance_timer...: Done Detaching :',key);
			}
			maintenance_timer_rambase = null;
		}		
	}
	
					
	}, 5000); //every 5 seconds check if we need to disconnect



    
exports.load_config = function (root_folder, Application) {

	if (Application === '')
		Application = '/Home';
	if (Application === '/')
		Application = '/Home';
        
    root_folder=path.normalize(root_folder);		
	Application=path.normalize(Application);	
	if (root_folder.substr(-1) != '/') root_folder += '/';

    var initial   =root_folder + 'Quale/Config' + Application; 

	var fileContents = '',
	search = path.resolve(initial);

	//console.log('load_config\r\n root_folder:',root_folder, '\r\n Application:',Application,'\r\n initial:',initial,'\r\n located at:',search);
	while (fileContents === "" && search !== '/') {
		try {
			fileContents = fs.readFileSync(search + '/config.json').toString();            
		} catch (e) {
			//console.log('App config error: for ', search,e);
			search = path.resolve(search + '/..');
		}
	}
    var config = {},next_config = {};
    while (fileContents!=="") {
        try {
			//console.log("fileContents 159 :", fileContents);
			fileContents = fileContents.replace('PasswordGen',crypto.randomBytes(12).toString('base64').replace("/","A").replace("+","A"));
			//console.log("fileContents 161 :", fileContents);
            next_config = JSON.parse(fileContents);
        } catch (e) {
            console.log("WARN Error parsing config.quicc 175908 :", e, 'string:',fileContents);
            console.trace("Stack!")
            process.exit(2);
        }   
        //console.log("config.quicc 175909 :", fileContents,next_config,next_config.config_inherit);
        
        fileContents="";
        if (next_config.config_inherit) {
            if (next_config.config_inherit === "base")
                next_config.config_inherit="../../../node_modules/sql-mvc/Quale/Config/config.json";
            fileContents = fs.readFileSync(path.join(search,next_config.config_inherit)).toString();             
            //console.log("config.quicc 175910 :", fileContents);
        } 
        config = extend(true,next_config, config); //second one has the priority        
        //console.log("config.quicc 175912 :", config);
    }
    
    //console.log("config.quicc 175914 :", config);
	if (Object.keys(config).length<1) {
		console.log("\r\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> config file not found :", config);
		process.exit(2);
	}
	var conf = exports.check_run_mode(config);        
    //console.log("config.quicc 175915 :", config);

	return conf;
}
var database_default_config = {
    "fb25": {
        "server": "127.0.0.1",
        "database_filename": "demo_db_3b",
		"database_folder": "/var/lib/firebird/2.5/data/",
		"database_extension": ".fdb",
        "username": "using the value from authfile, make authfile blank to use this value.",
        "password": "using the value from authfile, make authfile blank to use this value.",
        "authfile": "/etc/firebird/2.5/SYSDBA.password",

		"useUDF": "no",
	    "var_subst": "/***/",
		"var_actaul": ":",
		"var_global_get": "",
		"var_global_set": "",
		
        "sql_set_prefix": "",		
		"sql_concat_set": "res=",
		"sql_concat_prefix": "",
		"sql_concat_res": "res=res||",
		
		"sql_preload_fieldname": "preload",			
		"sql_concat_rowcontent": "rowcontent",
		"sql_insertvar": "insertvar",
		"sql_concat_seperator": "||",
		"sql_ifthen": " then ",	
		"sql_concat_postfix": "",
		"sql_end_postfix": "",		
		"sql_endif_postfix": "",		
		"sql_First1": "first 1",
		"sql_Limit1": "",		
		
		"sql_MAXDATE": "'2030/01/01'"
    },		   
    "mysql57": {        
        "server": "127.0.0.1",

        "database_filename": "demo_db_2",
		"database_folder": "",
		"database_extension": "",		
        "username": "root",
        "password": "zxpabx",
        "authfile": "",

		"useUDF": "no",
	    "var_subst": "/***/",
		"var_actaul": "",
		"var_global_get": "@",
		"var_global_set" : "set @",
				
		"sql_set_prefix": "set ",		
		"sql_concat_set": "res=",
		"sql_concat_prefix": "concat(",
		"sql_concat_res": "res=concat(res,",
			
		"sql_preload_fieldname": "preload",	
		"sql_concat_rowcontent": "rowcontent",	
		"sql_insertvar": "insertvar",		
		"sql_concat_seperator": ",",
		"sql_concat_postfix": ")",
		"sql_end_postfix": ";",		
		"sql_ifthen": " then ",		
		"sql_endif_postfix": "end if;",			
		"sql_First1": " ",		
		"sql_Limit1": " limit 1 ",		
		
		"sql_MAXDATE": "'2030/01/01'"		
    },
    "mssql12": {        
        "server": "127.0.0.1",

        "database_filename": "demo_db_2",
		"database_folder": "",
		"database_extension": "",		
		
		"database_schema": "sqlmvc",
		
        "username": "sqlmvc",
        "password": "Qua1epassword",
        "authfile": "",

		"useUDF": "no",
	    "var_subst": "/***/",
		"var_actaul": "@",
		"var_global_get": "@",
		"var_global_set" : "set @",
				
		"sql_set_prefix": "set @",		
		"sql_concat_set": "res=",
		"sql_concat_prefix": "concat(",
		"sql_concat_res": "res=concat(@res,",
		
		"sql_preload_fieldname": "preload",			
		"sql_concat_rowcontent": "rowcontent",
		"sql_insertvar": "insertvar",
		"sql_concat_seperator": ",",
		"sql_concat_postfix": ")",
		"sql_end_postfix": ";",				
		"sql_ifthen": "",//" \r\nBEGIN \r\n",			
		"sql_endif_postfix": "", //"end",			
		"sql_First1": " top 1 ",		
		"sql_Limit1": " ",		
		
		"sql_MAXDATE": "'2030/01/01'"		
    }
	
}

exports.check_run_mode = function (config) {

	//console.trace("check_run_mode a : ", config);
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
	//console.log("check_run_mode c: ", config.db);	process.exit(2);
	
	
	var conf = deepcopy(config.db);
	config.db = deepcopy(database_default_config[config.db.dialect]);
	config.db = extend(config.db, config[config.db.dialect]); //second one has the priority
	config.db = extend(config.db, conf); 
	
	//console.log("check_run_mode dialect: ", config.db.dialect);	
	//console.log("check_run_mode dialect: ", config.db);	
	//process.exit(2);
	
	return config;
}




exports.databasePooled = function (root_folder, LoadedInstance, Application, callback) {
	//util.log('db connections json 164959 :'+util.inspect(exports.connections));
	//console.trace('MSSQL databasePooled  ');
	if (exports.connections[LoadedInstance] !== undefined) {
		//console.log("database connection cached from : ", LoadedInstance);
		if (callback !== undefined)
			callback(null, "Connected", exports.connections[LoadedInstance]);
	} else { //read the config from  a file in the application folder
		//console.log("Application for " + LoadedInstance + ' : ' + Application);
		//console.log("database connection connect from : ", LoadedInstance);
		var rambase = {};
		rambase.root_folder = root_folder;
		rambase.Application = Application;
		var fileContents = "";
		var conf = exports.load_config(root_folder, Application);

		//console.log("Config file Contents : ", fileContents,conf );
		rambase.conf = conf;
		rambase.host = conf.db.server;
		//console.log('db connections json 165225 :', JSON.stringify(rambase, null, 4));
		rambase.database = conf.db.database_folder + conf.db.database_filename + conf.db.database_extension;

		//console.log("\n\n============================: ",JSON.stringify(rambase.conf.db.dialect, null, 4) );
		if (rambase.conf.db.dialect=="mssql12")  {
			if (exports.msConnectionPool==undefined) {
				exports.msTYPES = require('tedious').TYPES;
				exports.msISOLATION_LEVEL = require('tedious').ISOLATION_LEVEL;
				exports.msConnectionPool = require('tedious-connection-pool');				
			}
			
			if (db_req.msConnectionPool==undefined) {
				db_req.msConnectionPool = exports.msConnectionPool;
				db_req.msRequest = exports.msConnectionPool.Request;

				
				rambase.user = conf.db.username;
				rambase.password = conf.db.password;		
				rambase.user_table = conf.db.user_table;
				rambase.pk = conf.pk;	

				var config = {
				  userName: rambase.user, 
				  password: rambase.password,
				  server: 'localhost',
				  options: {
					  database: rambase.database
				  }
				}

				var poolConfig = {
					min: 10,
					max: 50,
					log: true,
					idleTimeout : 300000
				};

				//create the pool
				//console.log('MSSQL create the pool');
				db_req.mspool = new db_req.msConnectionPool(poolConfig, config);
				
				db_req.mspool.on('error', function(err) {
					console.error('db_req.mspool err : ',err);
				});
					
			}		
		
			//rambase.db = new db_req.mssql.Connection(config);
			db_req.mspool.acquire(function (err, pool_connection) {
					if (err) {
						console.log('MSSQL Failed to acquire! ',err);
					} else {				
						//console.trace('MSSQL mspool.acquire  ');
						rambase.db = pool_connection;
						rambase.Request = db_req.msRequest;
						// Attempt to connect and execute queries if connection goes through
						

						//console.log('MSSQL Connected!');
						
						rambase.LoadedInstance = LoadedInstance;
						rambase.ready = true;
						rambase.last_connect_stamp = Date.now();
						exports.connections[LoadedInstance] = rambase;
						
						if (callback !== undefined)
							callback(null, "Connected", exports.connections[LoadedInstance]);			  			  					

					}
					
				});//acquire
	
			
			 
		} else {
		
		if (rambase.conf.db.dialect=="mysql57")  {
			db_req.mysql = require('mysql');
			rambase.user = conf.db.username;
			rambase.password = conf.db.password;		
			rambase.user_table = conf.db.user_table;
			rambase.pk = conf.pk;			
			var dbref = db_req.mysql.createConnection({
			  host: rambase.host,
			  user: rambase.user,
			  password: rambase.password
			});
			
						
						
			dbref.query('CREATE DATABASE IF NOT EXISTS '+rambase.database, function (err) {
				if (err) {
					console.log("CREATE DATABASE IF NOT EXISTS: ",rambase.database,' err:',err);
					throw err;
				}
				console.log("MySQL Connected!");//,rambase);
				dbref.query('USE '+rambase.database, function (err) {
					if (err) throw err;
						
					
					rambase.db = dbref;
					rambase.LoadedInstance = LoadedInstance;
					rambase.ready = true;
					rambase.last_connect_stamp = Date.now();
					exports.connections[LoadedInstance] = rambase;
					
					deasync.sleep(deasync_const); //on windows this is needed to prevent the compiler form hanging
					rambase.db.query("select version()", [],	function (err, result, fields) {
						console.log("MySQL info :",result);//, fields);
						if (callback !== undefined)
							callback(null, "Connected", exports.connections[LoadedInstance]);			  			  					
						});
			
						
				});
			});			
			
		}
		if (rambase.conf.db.dialect=="fb25")  
		{
		db_req.fb = require("node-firebird-dev");


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

		var fn = db_req.fb.attach;
		if (conf.run.db_create==="yes")
			fn = db_req.fb.attachOrCreate;

		
        rambase.connection_string = {
			host : rambase.host,
			database : rambase.database,
			user : rambase.user,
			password : rambase.password
		};
		
		//console.log('Database config and passwords :', JSON.stringify(rambase.connection_string,null,4));
		//console.log('conf.run :', JSON.stringify(conf.run,null,4));
		fn(rambase.connection_string,
			function (err, dbref) {
			if (err) {

				console.log('databasePooled ',err.message);
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
				rambase.LoadedInstance = LoadedInstance;
                rambase.ready = true;
				rambase.last_connect_stamp = Date.now();
				exports.connections[LoadedInstance] = rambase;
                
				//console.log('db connections json 165301 :', JSON.stringify(rambase,null,4));
				// console.log('db connections json :', JSON.stringify(exports.connections,null,4));
				//console.log("connection number 164955 " + Object.keys(exports.connections).length + " for " + LoadedInstance + ' on ' + exports.connections[LoadedInstance]);
                deasync.sleep(deasync_const); //on windows this is needed to prevent the compiler form hanging
				if (callback !== undefined)
					callback(null, "Connected", exports.connections[LoadedInstance]);
			}
		});
	}
	}
	}
	return;
};


exports.connect_if_needed = function (connection, callback) {
	
	if (!connection.db) { 
        //console.log('connect_if_needed connecting 080005 :');
        db_req.fb.attach(connection.connection_string,
			function (err, dbref) {
            //console.log('connect_if_needed connected 080005 :');    
			if (err) {
                //console.log('connect_if_needed connected error 080006 :');    
				//console.log('connect_if_needed', err.message);
                winston.error('Error connect_if_needed connected 080006 ',err.message);
				if (callback !== undefined)
					callback(err, "Error");
			} else {
				connection.db = dbref;
                connection.ready = true;
                deasync.sleep(deasync_const); //on windows this is needed to prevent the compiler form hanging
				connection.last_connect_stamp = Date.now();
                //console.log('connect_if_needed connected callback 080005 :');    
				if (callback !== undefined)
					callback(null, "Connected", connection);
			}
		});    
	} else {
		connection.last_connect_stamp = Date.now();
        //console.log('connect_if_needed already connected 080005 :');
		callback(null, "Connected", connection);
		
		}

};




exports.locateRambase = function (LoadedInstance,cb) {//dont think this is being used
    if (exports.connections[LoadedInstance])  {
        cb(exports.connections[LoadedInstance]);
    } else {
		console.log('locateRambase fails to find the instance ');		
    }
    
};


exports.locate = function (LoadedInstance) {
    return exports.connections[LoadedInstance];
};

exports.LocateDatabasePool = function (LoadedInstance) {
	if (exports.connections[LoadedInstance] !== undefined) {
		console.log("database connection cached from : ", LoadedInstance);
		return exports.connections[LoadedInstance];
	}
	return null;

}

exports.detach = function (dbref, LoadedInstance, force) {
	//actual detachment is managed by the pool
	if ((LoadedInstance === undefined) || (LoadedInstance === null)) {
		//console.log("compare start " + Object.keys(exports.connections).length);
		//console.log('db connections json :', JSON.stringify(exports.connections,null,4));
		LoadedInstance = undefined;
		for (var key in exports.connections) {
			if (exports.connections.hasOwnProperty(key)) {
				var c = exports.connections[key];
				//console.log("compare for " + c.LoadedInstance, dbref.LoadedInstance);
				if (c.LoadedInstance === dbref.LoadedInstance) {
					LoadedInstance = c.LoadedInstance;
					//console.log("matched for " + c.LoadedInstance + ' on ' + dbref.LoadedInstance);
				}
			}
		}
	}
	//console.log("actual for " + LoadedInstance + ' on ' + dbref);
	if (LoadedInstance !== undefined) {
		exports.connections[LoadedInstance].db.detach();
		delete exports.connections[LoadedInstance];
	}
}

exports.on_exit = function (dbref, LoadedInstance, force) {
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

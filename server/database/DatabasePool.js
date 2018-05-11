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
var deasync = require('deasync');
var deepcopy = require('deepcopy');

var winston = require('winston');
//winston.add(winston.transports.File, { filename: 'gm.log' });

var db_req = {};

exports.connections = {};
exports.developers = {}; //stores all the developer id and where they are viewing for JIT compiler

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


var maintenance_timer = setInterval(function () {
	//console.log('maintenance_timer...:');
	var to= Date.now() - 300000; //5mins
	for (var key in exports.connections) {
		if (exports.connections.hasOwnProperty(key)) {
			var c = exports.connections[key];
			if (c && c.db)
				if (c.last_connect_stamp < to) {
					console.log('maintenance_timer...: Preparing to Detach :',key);
                    if (c.tr_log&&c.tr_log.length>0) {
                        c.tr_log.push([c.connectionID,'x',c.tr_last_contact,'','']);
                        winston.info('tacking',[c.connectionID,'x',c.tr_last_contact,'','']);
                        c.tr_log_send = c.tr_log;
                        c.tr_log = [];
					    console.log('maintenance_timer...: logging :',
                            key,c.tr_last_contact,c.tr_log.length);   

                        exports.insert_array(c.db
                            ,'INSERT INTO track (session, act, stamp, par1, par2) VALUES(?, ?, ?, ?, ?)'
                            ,c.tr_log_send
                            ,0
                            ,function () {
                                console.log('maintenance_timer...: Detaching after loging :',key,c);
                                try {
                                c.db.detach();
                                c.db =null;                                
                                } catch (e) {
                                    winston.error('Error detatching db 170900',key);
                                }    
                                console.log('maintenance_timer...: Done Detaching  after loging:',key);
                                
                            });
                        
                    } else {
                        console.log('maintenance_timer...: Detaching :',key);
                        c.db.detach();
                        c.db =null;
                        console.log('maintenance_timer...: Done Detaching :',key);
                    }
				}
		}
	};
						
	}, 500);



    
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

	console.log('load_config\r\n root_folder:',root_folder, '\r\n Application:',Application,'\r\n initial:',initial,'\r\n located at:',search);
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
		
		"sql_concat_seperator": "||",
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
			
		"sql_concat_seperator": ",",
		"sql_concat_postfix": ")",
		"sql_end_postfix": ";",			
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
		"var_actaul": "",
		"var_global_get": "@",
		"var_global_set" : "set @",
				
		"sql_set_prefix": "set ",		
		"sql_concat_set": "res=",
		"sql_concat_prefix": "concat(",
		"sql_concat_res": "res=concat(res,",
			
		"sql_concat_seperator": ",",
		"sql_concat_postfix": ")",
		"sql_end_postfix": ";",			
		"sql_endif_postfix": "end if;",			
		"sql_First1": " ",		
		"sql_Limit1": " limit 1 ",		
		
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
		rambase.database = conf.db.database_folder + conf.db.database_filename + conf.db.database_extension;


		//console.log("\n\n============================: ",JSON.stringify(rambase.conf.db.dialect, null, 4) );
		if (rambase.conf.db.dialect=="mssql12")  {
			db_req.mssql = require('tedious');
						
			//var Connection = require('tedious').Connection;
			//var Request = require('tedious').Request;
			//var TYPES = require('tedious').TYPES;
			
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
			
			
			
			rambase.db = new db_req.mssql.Connection(config);
			rambase.Request = db_req.mssql.Request;
			// Attempt to connect and execute queries if connection goes through
			rambase.db.on('connect', function(err) {
			  if (err) {
				console.log(err);
			  } else {
				console.log('MSSQL Connected!');
				
				var Req = new rambase.Request('SELECT @@VERSION;', function (err, rowCount, rows) {
					if (err) throw err;

					console.log("MSSQL info :",rowCount,rows);
					
					rambase.connectionID = connectionID;
					rambase.ready = true;
					rambase.last_connect_stamp = Date.now();
					exports.connections[connectionID] = rambase;
					
					if (callback !== undefined)
						callback(null, "Connected", exports.connections[connectionID]);			  			  					

			
						
				});
							
				// Print the rows read
				
				var result = "";
				Req.on('row', function(columns) {
					columns.forEach(function(column) {
						if (column.value === null) {
							console.log('NULL');
						} else {
							result += 'col : ' + column.value + " ";
						}
					});
					console.log('MSSQL row',result);
					result = "";
				});
				

				// Execute SQL statement
				rambase.db.execSql(Req);				
				
			  }
			});
			
			
			 
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
					rambase.connectionID = connectionID;
					rambase.ready = true;
					rambase.last_connect_stamp = Date.now();
					exports.connections[connectionID] = rambase;
					
					deasync.sleep(15); //on windows this is needed to prevent the compiler form hanging
					rambase.db.query("select version()", [],	function (err, result, fields) {
						console.log("MySQL info :",result);//, fields);
						if (callback !== undefined)
							callback(null, "Connected", exports.connections[connectionID]);			  			  					
						});
			
						
				});
			});			
			
		}
		if (rambase.conf.db.dialect=="fb25")  
		{
		db_req.fb = require("node-firebird");


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
	}
	}
	return;
};


exports.connect_if_needed = function (connection, callback) {
	
	if (!connection.db) { 
        console.log('connect_if_needed connecting 080005 :');
        db_req.fb.attach(connection.connection_string,
			function (err, dbref) {
            console.log('connect_if_needed connected 080005 :');    
			if (err) {
                console.log('connect_if_needed connected error 080006 :');    
				console.log(err.message);
                winston.error('Error connect_if_needed connected 080006 ',err.message);
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

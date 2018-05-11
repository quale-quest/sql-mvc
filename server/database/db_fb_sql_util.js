"use strict";

/*
speed/memory performance  is not important
ease of use is important
 */

/*
this provides data base utility functions to the compiler, at compile time.
 */

//https://github.com/luciotato/waitfor-ES6   //npm install wait.for-es6
//var fb = require("node-firebird");

var db = require("../../server/database/DatabasePool");
var fs = require('fs');
//var Sync = require('sync');
var deasync = require('deasync');
var deasync_const=5; 

var connection = {};
var deepcopy = require('deepcopy');

var parse_error = function (zx, err, source, script) {
	//console.log('\n\n\n\n\n\n\nparse_error a :');
	//process.exit(2);
	//console.log('\n\n\n\n\n\n\nparse_error b :', err.status);
	if (err.status !== undefined) {
		err.status.forEach(function (entry) {
			console.log('error entry:', entry);
		});
	}
	var script_err = {};
	script_err.source_file = "undetermined";
	script_err.source_line = 0;
	script_err.source_col = 0;
	script_err.text = "";

	var a = (err.message.match(/line\ (\d+)/));
	if (a && a.length > 1)
		script_err.line =  + (a[1]);
	a = (err.message.match(/column\ (\d+)/));
	if (a && a.length > 1)
		script_err.col =  + (a[1]);
	script_err.message = err.message;

	if (source === undefined) {
		source = zx.sql.filelinemap[script_err.line];
		//console.log('script_err mapping :',script_err,source,zx.sql.filelinemap.length );
		//console.log('script_err zx.sql.filelinemap :',zx.sql.filelinemap );
	}

	if (source === undefined) {
		script_err.source_file = "undetermined";
		script_err.source_line = 0;
		script_err.source_col = 0;
		script_err.text = "";

	} else {
		var src,
		srcx;

		if (source.src_obj)
			srcx = source.src_obj.srcinfo;
		else
			srcx = source.srcinfo;
		if (srcx !== undefined) {
			var src = deepcopy(srcx);
			if (src.source && src.source.length > 200)
				src.source = zx.show_longstring(src.source);
			console.log('script_err source:', src); //,source );

			script_err.source_file = src.filename;
			script_err.source_line = src.start_line + script_err.line;
			if (source.src_obj)
				script_err.source_line += source.LineNr;

			script_err.source_col = script_err.col;
			script_err.text = src.source;
			if (script !== undefined)
				script_err.context = script.substr(script_err.col - 10, 20);
			console.log('script_err source err:', script_err);
			zx.error.log_syntax_warning(zx, 'script_err source err:', zx.err, zx.line_obj);
		} else {
			zx.error.log_syntax_warning(zx, 'script_err source err:', zx.err, zx.line_obj);
		}

	}

	zx.err = script_err;

	return script_err;

};
exports.LocateDatabasePool = function (connectionID) {
	return db.LocateDatabasePool(connectionID);
}

exports.databaseUtils = function (root_folder, connectionID, url, callback) {
	connection.ready = false;
	if (connection.db === undefined) { //read the config from  a file in the application folder
		//console.log('attach:',connectionID,url );

		db.databasePooled(root_folder, connectionID, url,
			function (err, msg, rambase) {
			if (err) {

				console.log("error connecting on ", err);

				console.log(err.message);
				if (callback !== undefined)
					callback(err, "Error");
			} else {
				connection.db = rambase.db;
				connection.rambase = rambase;
				//console.log("connected on " + connection, ' rambase: ',connection.rambase);
				connection.ready = true;
				if (callback !== undefined)
					callback(null, "Connected", connection.rambase);
			}
		});
		//connection.db=rambase.db;
		//connection.ready=true;

	} else
		callback(null, "Connected", connection.rambase);

};



	 
var check_parse = function (zx, err, script, line_obj,expect,result,callback) {
	
	if (err) {
		//parse the error
		var script_err = JSON.stringify(err);
		var	sql_log_obj=['dataset',script,script_err];
		zx.sql_log_file_obj.push(sql_log_obj);	
		if (expect !== undefined && expect.test(script_err)) {
			// Silently ignore the error
			//	console.log('Acceptable error:', expect,script);
				
		} else { // make a record of the error for debugging
			console.log('script_err:', expect,script_err, err, ' in :------------------>\n', script);
			script_err = parse_error(zx, err, line_obj);
			zx.err = script_err;
			zx.eachplugin(zx, "commit", 0);
			fs.writeFileSync("exit2.sql","DELIMITER //\n" +script +"//\nDELIMITER ;\r\n\r\n\r\n\r\n>>>>>>>>>>>>>>>>>\r\n"+ script_err.message);
			throw new Error("update script error.", script_err + '/n' + script);
			//todo - show operator some            kind of server error
		}
		
		var	sql_log_obj=['exec_qry_cb_async ok',script];
		zx.sql_log_file_obj.push(sql_log_obj);
        if (callback !== undefined)					
		    callback(null, script_err);

			
	} else {
			//console.log('dataset result:', result);
			if (result === undefined)
				result = [];
			var	sql_log_obj=['dataset ok',script];
			zx.sql_log_file_obj.push(sql_log_obj);
			result.ok=true;	
			callback(null, result);		
	}
}	 
	 
//
exports.exec_query_async = function (zx, connection, name, script,line_obj,expect , callback) {
	var qrystr = script;
	if (zx.mssql12) {
		// Attempt to connect and execute queries if connection goes through
		//console.log('MSSQL exec_qry_cb_async :'+qrystr);
		var result = [];
		var Req = new connection.rambase.Request(qrystr, function (err, rowCount, rows) {
			check_parse(zx, err, script, line_obj,expect,result,callback);
		});

		Req.on('row', function(columns) {
			columns.forEach(function(column) {
				if (column.value === null) {
					console.log('NULL');
				} else {							
					result.push(column.value);
				}
			});
			console.log('MSSQL row',result);
		});
		

		// Execute SQL statement
		connection.rambase.db.execSql(Req);	
		
	} else {
		connection.db.query(qrystr, [],
		function (err, result, fields) {
			check_parse(zx, err, script, line_obj,expect,result,callback);
		});
	}
};

	 

exports.fetch_query_result = function (zx, connection, name, script,line_obj,expect) {		
	var result, done=false;
    //console.trace("fetch_dataset:" ,qrys,zx.dbu);
	exports.exec_query_async(zx, 
		connection, 
		name, 
		script,
		line_obj,
		expect , 
		function (err,res) {
			result = res;
			done = true;
		});
	
	while (!done) {
		deasync.sleep(deasync_const);
	}
    //console.log("fetch_dataset:" ,result);
	return result;
};





exports.validate_script = function (zx, name, script) {
	var querys;

	if (zx.conf.db.dialect=="fb25")
		querys = 'EXECUTE BLOCK RETURNS  (cid integer,info varchar(200),res blob SUB_TYPE 1)AS declare pki integer=0;declare pkf integer=0;declare z$sessionid varchar(40)=\'\';' + script;
	if (zx.conf.db.dialect=="mysql57")
		querys =
			"\n\n\nDELIMITER  $$\nDROP PROCEDURE IF EXISTS execute_test $$\n" +
			"CREATE PROCEDURE execute_test (cid  integer,info varchar(200), res TEXT)\nBEGIN\n" +
			"declare pki integer default 0;\n" +
			"declare pkf integer default 0;\n" +
			"declare Z$SESSIONID varchar(40) default '';\n\n\n"+ script + "\n-- no need to - set term ;#\n";
			
	var result = exports.fetch_query_result(zx, connection, name, querys,0,undefined);
	console.log("validate_script result:" ,result);
	if (result.ok) return ("ok");
	return result;
}


exports.dataset = function (cx, name, script, line_obj, callback) {
	var querys = script;
	//console.log('exports.dataset: ',querys);
	//var fn=connection.db.query;
	//if (querys.substring(0,6).toLowerCase()!=="select")
	//    fn=connection.db.execute;

	if (cx.zx.mssql12) {
			// Attempt to connect and execute queries if connection goes through

				//console.log('MSSQL dataset :'+querys);
				var result = [];
				var Req = new connection.rambase.Request(querys, function (err, rowCount, rows) {
					if (err) throw err;
					//console.log('MSSQL dataset done :',rowCount,result, err);
					if (callback !== undefined) {						
						var	sql_log_obj=['dataset ok',result,querys];
						cx.zx.sql_log_file_obj.push(sql_log_obj);
						//console.log('MSSQL dataset callback :',result);						
						callback(null, result);												
					}
						
				});

				
				Req.on('row', function(columns) {
					columns.forEach(function(column) {
						if (column.value === null) {
							//console.log('NULL');
						} else {
							result.push(column.value);
						}
					});
					//console.log('MSSQL dataset row',result);
					
				});
				

				// Execute SQL statement
				connection.rambase.db.execSql(Req);				
				
			  
				
	} else {


	connection.db.query(querys, [],
		function (err, result,fields) {
		//console.log('exports.dataset: result ',err,result,fields );
		if (err) {
			//parse the error
			console.log('exports.dataset err: ');
			var script_err = parse_error(cx.zx, err);
			var	sql_log_obj=['dataset',querys,script_err];
			cx.zx.sql_log_file_obj.push(sql_log_obj);			
			cx.zx.err = script_err;
			//todo - show operator some kind of server error
			callback(null, script_err);
		} else {
			//console.log('dataset result:', result);
			if (result === undefined)
				result = [];
			var	sql_log_obj=['dataset ok',querys];
			cx.zx.sql_log_file_obj.push(sql_log_obj);						
			callback(null, result);
		}

	});
    }
};

exports.fetch_dataset = function (zx,name, qrys) {
	var result, done=false;
    //console.trace("fetch_dataset:" ,qrys,zx.dbu);
	zx.dbu.dataset({zx : zx },
        name, 
        qrys,
        0,
		function (err,res) {
		result = res;
		done = true;
	});
	
	while (!done) {
		deasync.sleep(deasync_const);
	}
    //console.log("fetch_dataset:" ,result);
	return result;
};
exports.singleton = function (zx, field, qrys,trace) {
	if (trace) console.log('singleton q: ',qrys,' field:',field);
    
    var res = exports.fetch_dataset(zx,"util singleton", qrys);
	if (trace) console.log('singleton r: ',field,res);
	if (field === "")
		return '';
	//console.log('singleton 7: ',res);
	if (res[0] === undefined) {
		console.log('singleton rq: ', qrys);
		console.log("singleton unknown record :", res);
		return '';
	}
	//console.log('singleton s: ',field);
	if (res[0][field] !== undefined) {

		//console.log("singleton a:" ,typeof res[0][field], res[0][field])
		
		if (res[0][field] === null)
			return '';
		if (res[0][field].low_ === undefined)
			return res[0][field];
		return res[0][field].low_ + (res[0][field].high_ * 65536 * 65536);
	} else {
		console.log('singleton qq: ', qrys);
		console.log("singleton unknown field :", field, res);
		return '';
	}
};

exports.getGenerator = function (zx, name, increment) {
	return exports.singleton(zx, "gen_id", "SELECT GEN_ID( " + name + "," + increment + " ) FROM RDB$DATABASE;");
};

exports.exec_qry_cb_async = function (cx, name, script, line_obj, callback) {

	var qrystr = script;
	//console.log('exec_qry_cb_async :',qrystr );
	connection.db.query(qrystr, [],
		function (err, result, fields) {
		//console.log('exec_qry_cb_async result: write',err,result, fields );
		//if (verbosity>5)
		//   console.log(" Executed without error, from line:", Lastddlcount,' lines:',DDLLen,'text:',qrystr);

		if (err) {
			//parse the error
			var script_err = JSON.stringify(err);
			var	sql_log_obj=['dataset',qrystr,script_err];
			cx.zx.sql_log_file_obj.push(sql_log_obj);	
			//console.log('exec_qry_cb_async error:', cx.expect,script_err);

			if (cx.expect !== undefined && cx.expect.test(script_err)) {
				
				//	console.log('Acceptable error:', cx.expect,qrystr);
					
			} else {
				console.log('script_err: \r\n\t expect:', cx.expect,'\r\n\t script err:',script_err,'\r\n\t err:', err, '\r\n:------------------>\r\n', script, '\r\n<-----------');
				script_err = parse_error(cx.zx, err, line_obj);
				cx.zx.err = script_err;
				cx.zx.eachplugin(cx.zx, "commit", 0);
				fs.writeFileSync("exit2.sql","DELIMITER //\r\n" +qrystr +"//\r\nDELIMITER ;\r\n\r\n\r\n\r\n>>>>>>>>>>>>>>>>>\r\n"+ script_err.message);
				throw new Error("update script error.", script_err + '/n' + script);
				//todo - show operator some            kind of server error
			}
			callback(null, script_err);
		} else {
			//console.log('exec_qry_cb result:', result,qrystr);
			var	sql_log_obj=['exec_qry_cb_async ok',qrystr];
			cx.zx.sql_log_file_obj.push(sql_log_obj);				
			callback(null, result);
		}

	});

};

exports.exec_qry_cb = function (cx, name, script, line_obj) {
	//onsole.log('.write_script - ' +spi,name,'script:',script);
    var  err,result,done=false;
	name = name.replace(/\\/g, '/'); //windows
    
    exports.exec_qry_cb_async (cx, name, script, line_obj, function (err,res){        
        result=res;
        done = true;        
        });
    
    while (!done) {
		deasync.sleep(deasync_const);
	}
    
  return  result;
};
exports.getUpdateOrInsert = function (zx, name) {
	
	var CurrentPageIndex = exports.singleton(zx, "pk", "select pk from Z$SP where FILE_NAME='" + name + "'");
	//console.log('getUpdateOrInsert a: ' +CurrentPageIndex);
	if (CurrentPageIndex=="") {
		//console.log('getUpdateOrInsert c: ' +name);
		exports.singleton(zx, "", "INSERT INTO Z$SP (FILE_NAME)VALUES ('" + name + "') ");
		CurrentPageIndex = exports.singleton(zx, "pk", "select pk from Z$SP where FILE_NAME='" + name + "'");
	}
	//console.log('getUpdateOrInsert z: ' +CurrentPageIndex);
	return CurrentPageIndex;
	
}

exports.getPageIndexNumber = function (zx, name) {
    if (zx.conf.db.dialect=="fb25") {
	//console.log('getPageIndexNumber : A' ,name);
	exports.singleton(zx, "", "UPDATE OR INSERT INTO Z$SP (FILE_NAME)VALUES ('" + name + "') MATCHING (FILE_NAME) ");
	//console.log('getPageIndexNumber : B' );
	var CurrentPageIndex = exports.singleton(zx, "pk", "select pk from Z$SP where FILE_NAME='" + name + "'");

	//console.log('getPageIndexNumber : ' +CurrentPageIndex);
	return CurrentPageIndex;
	}

    if (zx.conf.db.dialect=="mysql57")
	    return exports.getUpdateOrInsert(zx, name);
}


exports.create_script_async = function (zx, real, spi, spiname, mtHash, script, code, callback) {
//

	//console.log('.write_script_async - ' +spi,'>',name,'<',zx.sql.testhead, '>',script);	
    var drops = "\nDROP PROCEDURE IF EXISTS "+spiname+" " ;		
    //console.log('create_script_async a:>>>\r\n',drops,"<<<\r\n\r\n\r\n\r\n" );	
	connection.db.query(drops, [],
		function (err, result) {
			//console.log('droped real SP :',pname,err,result );
			var compoundscript = zx.sql.testhead +script + zx.sql.testfoot;
			//console.log('create_script_async b:> >>>\r\n',compoundscript ,"<<< <\r\n\r\n\r\n\r\n" );	
			connection.db.query(compoundscript, 
			   [ ],
				function (err, result) {
					if (err) {
						console.log('Error in creating real SP :',"\r\n\r\n\r\n\r\n>>>>>>>>>>>>>>>>>\r\n",compoundscript,"\r\n\r\n\r\n\r\n>>>>>>>>>>>>>>>>>\r\n",err,result );
						
						fs.writeFileSync("exit2.sql","DELIMITER //\n" +compoundscript +"//\nDELIMITER ;\r\n\r\n\r\n\r\n>>>>>>>>>>>>>>>>>\r\n"+ err);
				
					    process.exit(2);
					}
					callback(null, err);

			});

			
			

		});
	
};



exports.write_script_async = function (zx, real, spi, name, mtHash, script, code, callback) { //todo move to driver file
	name = name.replace(/\\/g, '/'); //windows
	var FN_HASH = 'ZZ$' + zx.ShortHash(name); //spi; //zx.ShortHash(name);
	var spiname =  'Z$$' + spi;
	//console.log('.write_script_async - ' +spiname,'>',name,'<'	);
	//console.log('<',script);
	script = script.replace('Z$$integer', FN_HASH);
    
	

    if (zx.mssql12) {
		var call_script = "call "+FN_HASH+";";
		connection.db.query("UPDATE Z$SP set FILE_NAME=? , SCRIPT= ? , CODE=?, MT_HASH = ?, FN_HASH=?  where PK=? ", [ name, call_script, JSON.stringify(code),mtHash,FN_HASH,spi],
			function (err, result) {

			if (real) {
				console.log('create real SP : ', script);
				connection.db.query(script, [],
					function (err, result) {
					console.log('dbresult: write',result );
					//also write it to the table for convenience and access to code field
					//console.log('dbresult: write' );
					console.log('write_script_async done : ');
					
					exports.create_script_async(zx, real, spi, FN_HASH, mtHash, script, code, 
							function (err, result) {
									callback(null, err);
							});
					
					
				});
			} else
				callback(null, err);
		});
    }	
	
	
    if (zx.conf.db.dialect=="fb25") {
	var querys="UPDATE OR INSERT INTO Z$SP (PK,TSTAMP,FILE_NAME,SCRIPT,CODE,MT_HASH)VALUES (?,'now',?,?,?,?) MATCHING (PK) ";
	connection.db.query(querys, [spi, name, script, JSON.stringify(code),mtHash],	
		function (err, result) {
		if (err) console.log('.write_script_async err- ' ,err, result);
		if (real) {
			//name = 'Z$$' + spi;
			//console.log('create real SP : ', script);
			connection.db.query(script, [],
				function (err, result) {
				var	sql_log_obj=['dataset',querys,err];
				zx.sql_log_file_obj.push(sql_log_obj);						
				//console.log('dbresult: write' );
				//also write it to the table for convenience and access to code field
				//console.log('dbresult: write' );
				//console.log('write_script_async done : ');
				callback(null, err);
			});
		} else
			callback(null, err);
	});
    }

    if (zx.mysql57) {
		var call_script = "call "+FN_HASH+";";
		connection.db.query("UPDATE Z$SP set FILE_NAME=? , SCRIPT= ? , CODE=?, MT_HASH = ?, FN_HASH=?  where PK=? ", [ name, call_script, JSON.stringify(code),mtHash,FN_HASH,spi],
			function (err, result) {

			if (real) {
				console.log('create real SP : ', script);
				connection.db.query(script, [],
					function (err, result) {
					console.log('dbresult: write',result );
					//also write it to the table for convenience and access to code field
					//console.log('dbresult: write' );
					console.log('write_script_async done : ');
					
					exports.create_script_async(zx, real, spi, FN_HASH, mtHash, script, code, 
							function (err, result) {
									callback(null, err);
							});
					
					
				});
			} else
				callback(null, err);
		});
    }	

};

exports.write_script = function (zx, real, spi, name, mtHash, script, code) {
	//console.log('.write_script - ' +spi,name,'script:',script);
    var  err,done=false;
	name = name.replace(/\\/g, '/'); //windows
    
	zx.dbu.write_script_async(zx, real, spi, name,mtHash, script, code, function (err,res){        
        done = true;
        });
    
    while (!done) {
		deasync.sleep(deasync_const);
	}
    
	if (spi !== null)
		return spi;
	else
		return exports.singleton(zx, "pk", "select PK from z$SP where FILE_NAME='" + name + "'");
};

var SQL_TEXT = 452, // Array of char
SQL_VARYING = 448,
SQL_SHORT = 500,
SQL_LONG = 496,
SQL_FLOAT = 482,
SQL_DOUBLE = 480,
SQL_D_FLOAT = 530,
SQL_TIMESTAMP = 510,
SQL_BLOB = 520,
SQL_ARRAY = 540,
SQL_QUAD = 550,
SQL_TYPE_TIME = 560,
SQL_TYPE_DATE = 570,
SQL_INT64 = 580,
SQL_BOOLEAN = 32764, // >= 3.0
SQL_NULL = 32766; // >= 2.5

exports.get_meta_info = function (meta) {
	var info;

	var div = Math.pow(10, -meta.scale);

	if (meta.type === SQL_NULL) {
		info = {
			base_type : 'Text',
			strlen : 20
		};
	}
	if (meta.type === SQL_TEXT) {
		info = {
			base_type : 'Text',
			strlen : meta.length
		};
	}
	if (meta.type === SQL_VARYING) {
		info = {
			base_type : 'Text',
			strlen : meta.length
		};
	}
	if (meta.type === SQL_BLOB) {
		info = {
			base_type : 'Text',
			strlen : meta.length
		};
	}

	if (meta.type === SQL_TIMESTAMP) {
		info = {
			base_type : 'Text',
			strlen : 20,
			codec : 'stamp'
		};
	}
	if (meta.type === SQL_TYPE_TIME) {
		info = {
			base_type : 'Text',
			strlen : 10,
			codec : 'time'
		};
	}
	if (meta.type === SQL_TYPE_DATE) {
		info = {
			base_type : 'Text',
			strlen : 10,
			codec : 'date'
		};
	}

	if (meta.type === SQL_BOOLEAN) {
		info = {
			base_type : 'Int',
			allow : ['0', '1', 'false', 'true', 'yes', 'no'],
			pick : 'noyes',
			codec : 'bool'
		};
	}
	if (meta.type === SQL_SHORT) {
		info = {
			base_type : 'Int',
			range : [-32767, 32767]
		};
	}
	if (meta.type === SQL_LONG) {
		if (meta.scale === 0)
			info = {
				base_type : 'Int',
				range : [-2147483648, 2147483647]
			};
		else {
			//todo test this code - it is likely incorrect
			info = {
				base_type : 'Num',
				range : [-2147483648 / div, 2147483647 / div],
				places : -meta.scale
			};
		}
	}
	if (meta.type === SQL_INT64) {
		info = {
			base_type : 'Int',
			range : [-9223372036854775808, 9223372036854775807]
		};
	}
	if (meta.type === SQL_QUAD) {
		info = {
			base_type : 'Int',
			range : [-9223372036854775808, 9223372036854775807]
		};
	}

	if (meta.type === SQL_FLOAT) {
		//todo test this code - it is likely incorrect
		info = {
			base_type : 'Num',
			range : [-9223372036854775808 / div, 9223372036854775807 / div],
			places : -meta.scale
		};
	}
	if (meta.type === SQL_DOUBLE) {
		//todo test this code - it is likely incorrect
		info = {
			base_type : 'Num',
			range : [-9223372036854775808 / div, 9223372036854775807 / div],
			places : -meta.scale
		};
	}
	if (meta.type === SQL_D_FLOAT) {
		//todo test this code - it is likely incorrect
		info = {
			base_type : 'Num',
			range : [-9223372036854775808 / div, 9223372036854775807 / div],
			places : -meta.scale
		};
	}

	if (meta.type === SQL_ARRAY) {
		//todo test this code - it is likely incorrect
		info = {
			base_type : 'Text',
			strlen : meta.length,
			codec : 'csv'
		};
	}

	return info;
};

var spawn = require('child_process').spawn;
exports.extract_dll_async = function (zx, callback) {
	//console.log('extract_dll :',connection.rambase.isql_extract_dll_cmdln);
	//isql-fb -ex -o ddlx.sql -user SYSDBA -password pickFb2.5 192.168.122.1:db31


	var output = [];

	if (zx.config.windows) {

		callback(null, {
			err : 2,
			ddl : ""
		});
	} else {
		var command = spawn('/usr/bin/isql-fb', connection.rambase.isql_extract_dll_cmdln);
		command.stdout.on('data', function (chunk) {
			output.push(chunk);
		});

		command.on('close', function (code) {
			if (code === 0) {
				var str = output.join('');
				//  console.log('sddl_backup result :', str);
				callback(null, {
					err : code,
					ddl : str
				});
			} else {
				console.log('extract_dll failed :', code);
				callback(null, {
					err : code,
					ddl : ""
				});
			}

		});
	}

};

exports.extract_dll = function (zx) {
    var  err,data,done=false;
    exports.extract_dll_async (zx,function (err,res){
        data = res;
        done = true;
        });
    
	while (!done) {
		deasync.sleep(deasync_const);
	}
    return data;
}    


exports.exit = function (/*zx*/
) {
	//console.trace('database detaching');
    if (connection.db)
		if (connection.db.detach) {
		connection.db.detach(
			function () {
			console.log('database detached');
			process.exit(0);
			
		});
	}
};

exports.init = function (/*zx*/
) {
	//each type of database generator would be different ,//including noSQL
	//console.log('init db_access.fb.sql: ');


};

exports.sqltype = function (zx,fb,mysql,mssql) {	
    if (zx.conf.db.dialect=="mssql12") return mssql;
	if (zx.conf.db.dialect=="fb25")    return fb;
	if (zx.conf.db.dialect=="mysql57") return mysql;
	return fb;
}

exports.sql_make_compatable_final_pass = function (zx,qrystr) {	//only on final pass fixups
	if (zx.mysql57) {
		
			qrystr = qrystr.replace(/then\s+end\s+if\s*;/gi, "then set @stuffed=1; end if;");	 //null conditional blocks not allowed - add stuffing
			qrystr = qrystr.replace(/then\s+else\s+/gi, "then set @stuffed=1; else ");	 //null conditional blocks not allowed - add stuffing
			qrystr = qrystr.replace(/else\s+end\s+if\s*;/gi, "else set @stuffed=1; end if;");	 //null conditional blocks not allowed - add stuffing
			qrystr = qrystr.replace(/begin\s+end\s*;/gi, "");	 //removed blank blocks - later also do for fb - //todo-fb
     		qrystr = qrystr.replace(/--:/g, "-- :"); //fb to mysql
	    	qrystr = qrystr.replace(/cast\s*\(\s*'now'\s+as\s+timestamp\s*\)/gi, " NOW() ");	//fb to mysql						
			qrystr = qrystr.replace(/\slist\s*\(/gi, " GROUP_CONCAT( ");	//fb to mysql	
	}
	
	return qrystr;
}
exports.sql_make_compatable = function (zx,qrystr) {	
/* Take common sql syntax used by many engines and convert it to the current engine
*/
var params;
var instr='';
//process.exit(2);
//simple convertions
	if (zx.mysql57) {
		qrystr = exports.sql_make_compatable_final_pass(zx,qrystr);
	}


//more complex convertions
	while (instr!=qrystr) {
		instr=qrystr;
		
		if (params=qrystr.match(/(\w+)\s+containing\s+'([^']*)'/i)) {
			if (zx.mysql57) {
				var inj = "INSTR(" + params[1] + ",'" + params[2] + "') ";
				qrystr=qrystr.replace(params[0],inj);
			}
				
		}	
		
		// First 5 skip 10 
		
		if (params=qrystr.match(/first\s+(\S+)\s+skip\s+(\S+)\s/i)) {
			if (zx.mysql57) {				
				var inj = " LIMIT " + params[2] + " , " + params[1] + " ";
				qrystr=qrystr.replace(params[0],"") + inj;				
			}
			if (zx.mssql) {				
				var inj = " OFFSET " + params[2] + "  ROWS FETCH NEXT " + params[1] + " ROWS ONLY";
				qrystr=qrystr.replace(params[0],"") + inj;				
			}
			
				
		}	else  if (params=qrystr.match(/\sfirst\s+([0-9]+)/i)) {
			if (zx.mysql57) {				
				var inj = " LIMIT " + params[1] ;
				qrystr=qrystr.replace(params[0], " ") + inj;				
			}
			if (zx.mssql) {				
				var inj = " TOP " + params[1] + " ";
				qrystr=qrystr.replace(params[0],inj);				
			}			
		}	
		
		
		
	}
	return qrystr;
}

exports.sql_make_compatable_TestOne = function (zx,desc,qrystr,resultstr) {
		
	var res=exports.sql_make_compatable(zx,qrystr);
	if (res!=resultstr) {
			console.log(zx.conf.db.dialect,":",desc,":");
			console.log("\t\t\t>>>'",qrystr,"'<<<Original");
			console.log("\t\t\t>>>'",res,"'<<<Translation");	
			console.log("\t\t\t>>>'",resultstr,"'<<<Should be");
			return 1;
	}
	else{
		console.log("sql_make_compatable Pass:",desc);
		return 0;
	}
}	

exports.sql_make_compatable_TestX = function (desc,qrystr,fbstr,mystr) {
	var zxfb = {conf:{db:{dialect:"fb25"   }},fb25:1,mysql57:0};
	var zxmy = {conf:{db:{dialect:"mysql57"}},fb25:0,mysql57:1};
	var errors=0;
	errors+=exports.sql_make_compatable_TestOne(zxfb,desc,qrystr,fbstr);
	errors+=exports.sql_make_compatable_TestOne(zxmy,desc,qrystr,mystr);
	return errors;	
}	

exports.sql_make_compatable_test = function () {
	var errors=0;
	console.log('sql_make_compatable unit_test');	
	
	errors+=exports.sql_make_compatable_TestX("containing",
			"and key_list containing 'admin,' or key_list containing 'all')) )",
			"and key_list containing 'admin,' or key_list containing 'all')) )",
			"and INSTR(key_list,'admin,')  or INSTR(key_list,'all') )) )");
	
	errors+=exports.sql_make_compatable_TestX("rows",
			"Select First 5 skip 10 NAME,STATUS,REF From GALLERY where blob_id is null ",
			"Select First 5 skip 10 NAME,STATUS,REF From GALLERY where blob_id is null ",
			"Select NAME,STATUS,REF From GALLERY where blob_id is null  LIMIT 10 , 5 ");
	
	errors+=exports.sql_make_compatable_TestX("list",
			"Select List(NAME) From GALLERY",
			"Select List(NAME) From GALLERY",
			"Select GROUP_CONCAT( NAME) From GALLERY");
	
	
	
	
	//errors+=1;
	if (errors>0){
	    console.log('Fail sql_make_compatable unit_test, errors:',errors);
		process.exit(2);		    
	}
	
}	


exports.sql_make_compatable_test();




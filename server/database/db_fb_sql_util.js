"use strict";

/*
speed/memory performance  is not important
ease of use is important
 */

/*
this provides data base utility functions to the compiler, at compile time.
 */

//https://github.com/luciotato/waitfor-ES6   //npm install wait.for-es6

var db = require("../../server/database/DatabasePool");
var fs = require('fs');
//var Sync = require('sync');
var deasync = require('deasync');

var deasync_const=5; 

var connection = {};
var deepcopy = require('deepcopy');
var TYPES = require('tedious').TYPES;

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
		//console.log('script_err source:', source);
		//this needs a lot of review .. where this  srcinfo gets generated must be made consistent
		//the syntax_warning is very generic - does not help at all
		if (srcx !== undefined) {
			//console.log('script_err srcx:', srcx);
			var src = deepcopy(srcx);
			if (src.source && src.source.length > 200)
				src.source = zx.show_longstring(src.source);
			//console.log('script_err source:', src); //,source );

			script_err.source_file = src.filename;
			script_err.source_line = src.start_line + script_err.line;
			if (source.src_obj)
				script_err.source_line += source.LineNr;

			script_err.source_col = script_err.col;
			script_err.text = src.source;
			if (script !== undefined)
				script_err.context = script.substr(script_err.col - 10, 20);
			//console.log('script_err source err:', script_err);
			zx.error.log_syntax_warning(zx, 'script_err source err:', zx.err, script_err);
		} else {
			zx.error.log_syntax_warning(zx, 'script_err source err type 2:', zx.err, zx.line_obj);
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

				console.log("error connecting msg ",err.message);
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



	 
var check_parse = function (zx, err, script, params, line_obj,expect,result,name,defaultval,callback) {
	
	if (err) {
		//parse the error
		//console.log('check_parse err :', err);
		var script_err = err.message;
		var	sql_log_obj=['dataset',script,script_err];
		zx.sql_log_file_obj.push(sql_log_obj);	
		if (expect !== undefined && expect.test(script_err)) {
			// Silently ignore the error
			//	console.log('Acceptable error:', expect,script);
			var	sql_log_obj=['check_parse ok',script];
			zx.sql_log_file_obj.push(sql_log_obj);
			if (callback !== undefined)					
				callback(null,defaultval);
			else 
				callback(null,[]);
			
			
		} else { // make a record of the error for debugging
			//console.log('script_err:', expect,script_err, err, ' in :------------------>\n', script);
			script_err = parse_error(zx, err, line_obj);
			zx.err = script_err;
			zx.eachplugin(zx, "commit", 0);
			zx.db_update.write_log.push("-- "+name + "  --- "+ script_err.message);
			if (zx.fb25) { 
			    fs.writeFileSync("exit2.sql","SET TERM ^ ;\n" +script +"^ \nSET TERM ; ^\r\n\r\n\r\n\r\n>>>>>>>>>>>>>>>>>\r\n"+ script_err.message+"\r\n"+name+"\r\nparams:"+params);
			} else if (zx.mysql57) {				
				fs.writeFileSync("exit2.sql","DELIMITER //\n" +script +"//\nDELIMITER ;\r\n\r\n\r\n\r\n>>>>>>>>>>>>>>>>>\r\n"+ script_err.message+"\r\n"+name+"\r\nparams:"+params);
			} else if (zx.mssql12) {				
				fs.writeFileSync("exit2.sql","DELIMITER //\n" +script +"//\nDELIMITER ;\r\n\r\n\r\n\r\n>>>>>>>>>>>>>>>>>\r\n"+ script_err.message+"\r\n"+name+"\r\nparams:"+params);
			} else throw new Error("dialect code missing");
				
			
			callback({thrw:true,name:name, script_err:script_err,script:script,err:err},[]);	
			//throw new Error(name, script_err + '\r\n' + script);
			//todo - show operator some            kind of server error
			
		}
			
	} else {
			//console.log('check_parse result:', defaultval, result);
			if (result === undefined) {
				//console.log('check_parse result undef:', defaultval, result);
				result = defaultval;
			}	
			var	sql_log_obj=['dataset ok',script];
			zx.sql_log_file_obj.push(sql_log_obj);			
			callback(null, result);		
	}
}	 
	 
//
exports.exec_query_async = function (zx, connection, name, script,params,line_obj,expect,defaultval , callback) {
	var qrystr = script;
	//console.log("exec_query_async a:");
	if (zx.mssql12) {
		// Attempt to connect and execute queries if connection goes through
		//console.log('MSSQL check_parse :'+qrystr);
		var result = [];
		var Req = new connection.rambase.Request(qrystr, function (err, rowCount, rows) {
			check_parse(zx, err, script, params, line_obj,expect,result, name,defaultval,callback);
		});

		Req.on('row', function(columns) {
			columns.forEach(function(column) {
				if (column.value === null) {
					console.log('NULL');
				} else {							
					result.push(column.value);
				}
			});
			//console.log('MSSQL row',result);
		});
		
		if (params) {
			//console.log('MSSQL params',typeof params,params);
			var p=1;
			//for (var par in params) {
			params.forEach(function (par) {
				//console.log('MSSQL addParameter',p + " : ",typeof par,par);
				if (par===undefined) {
					throw new Error("MSSQL params undefined p:" + p , "");					
				}
				Req.addParameter('p'+p, TYPES.VarChar, par);
				p++;
			});
		}
		
		// Execute SQL statement
		connection.rambase.db.execSql(Req);	
		
	} else {
		//console.trace("exec_query_async:",qrystr);
		connection.db.query(qrystr, params,
		function (err, result, fields) {
			//console.trace("exec_query_async check_parse: ");
			check_parse(zx, err, script, params, line_obj,expect,result,name,defaultval,callback);
		});
	}
};

	 

exports.fetch_query_result = function (zx, connection, name, script,params,line_obj,expect,defaultval) {		
	var error,result, done=false;
    //console.log("fetch_query_result:" ,script,params);
	exports.exec_query_async(zx, 
		connection, 
		name, 
		script,
		params,
		line_obj,
		expect, 
		defaultval,
		function (err,res) {
			error = err;
			result = res;
			done = true;
		});
	
	//console.log("fetch_query_result waiting:"+name);
	while (!done) {
		deasync.sleep(deasync_const);
	}
	//console.log("fetch_query_result:" ,error,result);
	if (error && error.thrw==true){
		//callback(null,[thrw=true,name, script_err + '\r\n' + script]);	
		//throw new Error(error.name, error.script_err + '\r\n' + error.script);
		console.trace(error.name, error.script_err + '\r\n' );//+ error.script);
		process.exit(2);			
	}
	
    
	return result;
};





exports.validate_script = function (zx, name, script) {
	var querys;

	if (zx.fb25) {
		querys = 'EXECUTE BLOCK RETURNS  (cid integer,info varchar(200),res blob SUB_TYPE 1)AS '+
			     'declare pki integer=0;declare pkf integer=0;declare z$sessionid varchar(40)=\'\';' + script;
	} else if (zx.mysql57) {
		querys =
			"\r\n\r\n\r\nDELIMITER  $$\r\nDROP PROCEDURE IF EXISTS execute_test $$\r\n" +
			"CREATE PROCEDURE execute_test (cid  integer,info varchar(200), res TEXT)\r\nBEGIN\r\n" +
			"declare pki integer default 0;\r\n" +
			"declare pkf integer default 0;\r\n" +
			"declare Z$SESSIONID varchar(40) default '';\r\n\r\n\r\n"+ script + "\r\n-- no need to - set term ;#\r\n";
	} else if (zx.mssql) {
		
	} else throw new Error("dialect code missing");
	
	//console.log("validate_script go:######################################################\r\n\r\n\r\n" ,querys,"\r\n######################################################\r\n\r\n\r\n");		
	var result = exports.fetch_query_result(zx, connection, name, querys,[],0,undefined,"Error");
	//console.log("validate_script result:" ,result);
	//throw new Error("dialect code missing result - ",result);
	if (result!="Error") return ("ok");
	//if (!result.error) return ("ok");
	return result;
}
exports.fetch_dataset = function (zx,name, qrys) {
	
var result = exports.fetch_query_result(zx, connection, name, qrys,[],0,undefined,"Error");	
return result;
	
}



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
	if (zx.mssql12) {
		if (res[0]) {
			return res[0];
		}
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
		console.trace("singleton unknown field :", field, res);
		throw new Error("singleton unknown field :"+ field);
		return '';
	}
};

//exports.getGenerator = function (zx, name, increment) {
//	return exports.singleton(zx, "gen_id", "SELECT GEN_ID( " + name + "," + increment + " ) FROM RDB$DATABASE;");
//};

exports.exec_qry_cb = function (cx, name, script, line_obj) {
	name = name.replace(/\\/g, '/'); //windows	
   return exports.fetch_query_result(cx.zx, connection, name, script,[],line_obj,cx.expect,"Error");
};
 
exports.getUpdateOrInsert = function (zx, name) {
	

	
}

exports.getPageIndexNumber = function (zx, name) {
    if (zx.fb25) {
		//console.log('getPageIndexNumber : A' ,name);
		exports.singleton(zx, "", "UPDATE OR INSERT INTO Z$SP (FILE_NAME)VALUES ('" + name + "') MATCHING (FILE_NAME) ",0);
		//console.log('getPageIndexNumber : B' );
		var CurrentPageIndex = exports.singleton(zx, "PK", "select PK from Z$SP where FILE_NAME='" + name + "'",0);

		//console.log('getPageIndexNumber : ' +CurrentPageIndex);
		return CurrentPageIndex;
	} else if (zx.mysql57||zx.mssql12){
	    var CurrentPageIndex = exports.singleton(zx, "pk", "select pk from Z$SP where FILE_NAME='" + name + "'");
		//console.log('getUpdateOrInsert a: ' +CurrentPageIndex);
		if (CurrentPageIndex=="") {
			//console.log('getUpdateOrInsert c: ' +name);
			exports.singleton(zx, "", "INSERT INTO Z$SP (FILE_NAME)VALUES ('" + name + "') ");
			CurrentPageIndex = exports.singleton(zx, "pk", "select pk from Z$SP where FILE_NAME='" + name + "'");
		}
		//console.log('getUpdateOrInsert z: ' +CurrentPageIndex);
		return CurrentPageIndex;
	} else throw new Error("dialect code missing");	
}




exports.write_script = function (zx, real, spi, name, mtHash, script, code) {
	//console.log('.write_script - ' +spi,name,'script:',script);
      
//todo move to driver file
	name = name.replace(/\\/g, '/'); //windows
	var FN_HASH = 'ZZ$' + zx.ShortHash(name); //spi; //zx.ShortHash(name);
	var spiname =  'Z$$' + spi;
	//console.log('.write_script_async - ' +spiname,'>',name,'<'	);
	//console.log('<',script);
	script = script.replace('Z$$integer', FN_HASH);
	
    if (zx.conf.db.dialect=="fb25") {
		var call_script = "EXECUTE BLOCK RETURNS  (info varchar(200),res blob SUB_TYPE 1,SCRIPTNAMED varchar(200))AS begin EXECUTE procedure "+FN_HASH+" ";

		exports.fetch_query_result(zx, connection, "create_script_async fb25 UPDATE", 
			"UPDATE OR INSERT INTO Z$SP (PK,TSTAMP,FILE_NAME,SCRIPT,CODE,MT_HASH,FN_HASH)VALUES (?,'now',?,?,?,?,?) MATCHING (PK) ",
			[spi, name, call_script, JSON.stringify(code),mtHash,FN_HASH],
			0,undefined);
			
		if (real) {
			//exports.fetch_query_result(zx, connection, "create_script_async  UPDATE real", script,	[],	0,undefined);			
			
			var compoundscript = zx.sql.testhead +script + zx.sql.testfoot;
			//console.log('compoundscript >',compoundscript);
			exports.fetch_query_result(zx, connection, "Error in creating real SP :", compoundscript,[],0,undefined);			
			
		}

		return FN_HASH;	

		
	} else if (zx.mysql57) {
		var call_script = "call "+FN_HASH+";";
		var UPDATE_script = "UPDATE Z$SP set FILE_NAME=? , SCRIPT= ? , CODE=?, MT_HASH = ?, FN_HASH=? where PK=? "; 
		
		exports.fetch_query_result(zx, connection, "create_script_async mysql57 UPDATE", 
			UPDATE_script,
			[ name, call_script, JSON.stringify(code),mtHash,FN_HASH,spi],
			0,undefined);

		if (real) {
			//console.log('create real SP : ', script);
						
			//console.log('.write_script_async - ' +spi,'>',FN_HASH,'<',zx.sql.testhead, '>',script);	
			var drops = "\nDROP PROCEDURE IF EXISTS "+FN_HASH+" " ;		
			//console.log('create_script_async a:>>>\r\n',drops,"<<<\r\n\r\n\r\n\r\n" );	
			exports.fetch_query_result(zx, connection, "create_script_async DROP", drops,[],0,undefined);
			//console.log('droped real SP :',FN_HASH );
			
			var compoundscript = zx.sql.testhead +script + zx.sql.testfoot;
			//console.log('create_script_async b:> >>>\r\n',FN_HASH ,"<<< <\r\n\r\n\r\n\r\n" );	
			var result = exports.fetch_query_result(zx, connection, "Error in creating real SP :", compoundscript,[],0,undefined);
			//console.log('create_script_async done :',FN_HASH );
				
		}
		return FN_HASH;		
		
    } else if (zx.mssql12) {
		var call_script = "EXECUTE "+FN_HASH+" ";
		var UPDATE_script = "UPDATE Z$SP set FILE_NAME=@p1 , SCRIPT= @p2 , CODE=@p3 , MT_HASH = @p4 , FN_HASH=@p5  where PK=@p6 "; 
		console.log('create real SP spi : ', spi);
		exports.fetch_query_result(zx, connection, "create_script_async mssql12 UPDATE", 
			UPDATE_script,
			[ name, call_script, JSON.stringify(code),mtHash,FN_HASH,spi],
			0,undefined);

		if (real) {
			//console.log('create real SP : ', script);
						
			//console.log('.write_script_async - ' +spi,'>',FN_HASH,'<',zx.sql.testhead, '>',script);	
			var drops = "\nDROP PROCEDURE IF EXISTS "+FN_HASH+" " ;		
			//console.log('create_script_async a:>>>\r\n',drops,"<<<\r\n\r\n\r\n\r\n" );	
			exports.fetch_query_result(zx, connection, "create_script_async DROP", drops,[],0,undefined);
			//console.log('droped real SP :',FN_HASH );
			
			var compoundscript = zx.sql.testhead +script + zx.sql.testfoot;
			//console.log('create_script_async b:> >>>\r\n',FN_HASH ,"<<< <\r\n\r\n\r\n\r\n" );	
			exports.fetch_query_result(zx, connection, "Error in creating real SP :", compoundscript,[],0,undefined);
			//console.log('create_script_async done :',FN_HASH );
			
			if (spi !== null)
				return spi;
			else
				return exports.singleton(zx, "PK", "select PK from z$SP where FILE_NAME='" + name + "'",0);		
			
		}
    } else throw new Error("dialect code missing");		                         
	return FN_HASH;	
    
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
	if (zx.fb25)     return fb;
    if (zx. mysql57) return mysql;	
	if (zx.mssql12 ) if (mssql!=undefined) return mssql; else  throw new Error("dialect code missing above line 686 ");
	if (zx.pgsql90 )  throw new Error("dialect code missing");
	if (zx.odsql11 )  throw new Error("dialect code missing");

	throw new Error("dialect code missing");
	return fb;
}

exports.sql_make_compatable_final_pass = function (zx,qrystr) {	//only on final pass fixups
	
	if (zx.fb25) { 
	} else if (zx.mysql57) {
		
			qrystr = qrystr.replace(/then\s+end\s+if\s*;/gi, "then set @stuffed=1; end if;");	 //null conditional blocks not allowed - add stuffing
			qrystr = qrystr.replace(/then\s+else\s+/gi, "then set @stuffed=1; else ");	 //null conditional blocks not allowed - add stuffing
			qrystr = qrystr.replace(/else\s+end\s+if\s*;/gi, "else set @stuffed=1; end if;");	 //null conditional blocks not allowed - add stuffing
			qrystr = qrystr.replace(/begin\s+end\s*;/gi, "");	 //removed blank blocks - later also do for fb - //todo-fb
     		qrystr = qrystr.replace(/--:/g, "-- :"); //fb to mysql
	    	qrystr = qrystr.replace(/cast\s*\(\s*'now'\s+as\s+timestamp\s*\)/gi, " NOW() ");	//fb to mysql						
			//qrystr = qrystr.replace(/\slist\s*\(/gi, " GROUP_CONCAT( ");	//fb to mysql	
	} else if (zx.mssql12) {	
			qrystr = qrystr.replace(/cast\s*\(\s*'now'\s+as\s+timestamp\s*\)/gi, " CURRENT_TIMESTAMP ");	//fb to mssql
			qrystr = qrystr.replace(/'now'/gi, " CURRENT_TIMESTAMP ");	//fb to mssql
			//qrystr = qrystr.replace(/\slist\s*\(/gi, " STRING_AGG( ");	//fb to mssql	
	} else throw new Error("dialect code missing");
	
	return qrystr;
}



exports.sql_make_compatable = function (zx,qrystr) {	
/* Take common sql syntax used by many engines and convert it to the current engine
*/
//console.log('>>>>>>>>>>>>>>>sql_make_compatable ',qrystr);
var params;
var instr='';
//process.exit(2);
//simple convertions
	
//	if (zx.fb25||zx.mysql57||zx.mssql12) {
//		qrystr = exports.sql_make_compatable_final_pass(zx,qrystr);
//	} else throw new Error("dialect code missing");


//more complex convertions
	while (instr!=qrystr) {
		instr=qrystr;
		qrystr = exports.sql_make_compatable_final_pass(zx,qrystr);
		
		if (params=qrystr.match(/(\w+)\s+containing\s+'([^']*)'/i)) {
			if (zx.fb25) { 
			} else if (zx.mysql57) {
				var inj = "INSTR(" + params[1] + ",'" + params[2] + "') ";
				qrystr=qrystr.replace(params[0],inj);
			} else if (zx.mssql12) {	
				var inj = "(CHARINDEX(" + params[1] + ",'" + params[2] + "')>0) ";
				qrystr=qrystr.replace(params[0],inj);
				
			} else throw new Error("dialect code missing");
				
		}	
		
		// First 5 skip 10 
		
		if (params=qrystr.match(/first\s+(\S+)\s+skip\s+(\S+)\s/i)) {
			if (zx.fb25) { 
			} else if (zx.mysql57) {				
				var inj = " LIMIT " + params[2] + " , " + params[1] + " ";
				qrystr=qrystr.replace(params[0],"") + inj;				
			} else if (zx.mssql12) {				
				var inj = " OFFSET " + params[2] + "  ROWS FETCH NEXT " + params[1] + " ROWS ONLY";
				qrystr=qrystr.replace(params[0],"") + inj;				
			} else throw new Error("dialect code missing");
			
				
		}	else  if (params=qrystr.match(/\sfirst\s+([0-9]+)/i)) {
			if (zx.fb25) { 
			} else if (zx.mysql57) {
				var inj = " LIMIT " + params[1] ;
				qrystr=qrystr.replace(params[0], " ") + inj;				
			} else if (zx.mssql12) {				
				var inj = " TOP " + params[1] + " ";
				qrystr=qrystr.replace(params[0],inj);				
			} else throw new Error("dialect code missing");			
		}	
		
		
		
		if (params=qrystr.match(  /substring\s*\(/i  )) {
			if (zx.fb25) { 
			} else if (zx.mysql57) {				
			} else if (zx.mssql12) {		

				
				var l = params[0].length+params.index-1 ;
				var p = zx.GetClosingBracket(qrystr,l);
				
				var xx='';
				//console.log(' substring a   : ',qrystr ,params );

				var in_side_brackets = qrystr.slice(l+1, p);
				//console.log(' substring in_side_brackets      : ',in_side_brackets);
				var done_in_side_brackets=exports.sql_make_compatable(zx,in_side_brackets);
				//console.log(' substring done_in_side_brackets : ',done_in_side_brackets);
				var fromto=done_in_side_brackets.match(/from\s+([0-9]+)\s+for\s+([0-9]+)$/i);
				if (fromto) {
					var _from = fromto[1];
					var _to   = fromto[2];
					xx=done_in_side_brackets.replace(fromto[0], ','+_from+','+_to) ;	
					//console.log(' substring fromto : ',fromto);
					//console.log(' substring done_in_side_brackets : ',done_in_side_brackets);
					//console.log(' substring done_in_side_bracketsx: ',xx);
					//console.log(' substring a00 : >'+qrystr.slice(0, l+1)+'<');
					//console.log(' substring a01 : >'+qrystr.slice(l+1, p)+'<');
					//console.log(' substring a02 : >'+qrystr.slice(p)+'<');					
					qrystr = qrystr.slice(0, l+1) + xx + qrystr.slice(p);
					//console.log(' substring a09 : >'+qrystr+'<');					
				}
			} else throw new Error("dialect code missing");
		}		
		
		if (params=qrystr.match(/list\s*\(/i)) {
			if (zx.fb25) { 
			} else if (zx.mysql57) {				
				var m = qrystr.match(/(.*)([\s(])(list\s*\()(.*)/i);
				if (m) {
					//console.log('list GROUP_CONCAT A: ',m);
					//console.log('list GROUP_CONCAT D: ',qrystr.substring(0,m.index));
					qrystr = qrystr.substring(0,m.index) + m[1]+ m[2]+"GROUP_CONCAT("+m[4];	//fb to mysql	
					//console.trace('list GROUP_CONCAT F: ',qrystr);
				}
			} else if (zx.mssql12) {		
				var l = params[0].length+params.index-1;
				var p = zx.GetClosingBracket(qrystr,l);
				//console.log('list GROUP_CONCAT a : ',qrystr ,params , " sl:>",qrystr.slice(l, p)+"<");
				qrystr = qrystr.slice(0, p) + ",','  " + qrystr.slice(p);
			    //console.log('list GROUP_CONCAT: ',l,' qry',qrystr);
				qrystr=qrystr.replace(params[0], 'STRING_AGG(  ') ;	
				
			} else throw new Error("dialect code missing");
		}		
	}
	
    //console.log('<<<<<<<<<<<<<<<sql_make_compatable ',qrystr);	
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

exports.sql_make_compatable_TestX = function (desc,qrystr,fbstr,mystr,msstr) {
	const zxxx = require('../compiler/zx.js');
	var zxfb = {conf:{db:{dialect:"fb25"   }},fb25:1,mysql57:0,mssql12:0};
	var zxmy = {conf:{db:{dialect:"mysql57"}},fb25:0,mysql57:1,mssql12:0};
	var zxms = {conf:{db:{dialect:"mssql12"}},fb25:0,mysql57:0,mssql12:1};
	var errors=0;
	zxfb.GetClosingBracket = zxxx.GetClosingBracket ;
	zxmy.GetClosingBracket = zxxx.GetClosingBracket ;
	zxms.GetClosingBracket = zxxx.GetClosingBracket ;
	errors+=exports.sql_make_compatable_TestOne(zxfb,desc,qrystr,fbstr);
	errors+=exports.sql_make_compatable_TestOne(zxmy,desc,qrystr,mystr);
	errors+=exports.sql_make_compatable_TestOne(zxms,desc,qrystr,msstr);
	return errors;	
}	

exports.sql_make_compatable_test = function () {
	var errors=0;
	console.log('sql_make_compatable unit_test');	
	
	errors+=exports.sql_make_compatable_TestX("containing",
			"and key_list containing 'admin,' or key_list containing 'all')) )",
			"and key_list containing 'admin,' or key_list containing 'all')) )",
			"and INSTR(key_list,'admin,')  or INSTR(key_list,'all') )) )",
			"and (CHARINDEX(key_list,'admin,')>0)  or (CHARINDEX(key_list,'all')>0) )) )");
	
	errors+=exports.sql_make_compatable_TestX("rows",
			"Select First 5 skip 10 NAME,STATUS,REF From GALLERY where blob_id is null ",
			"Select First 5 skip 10 NAME,STATUS,REF From GALLERY where blob_id is null ",
			"Select NAME,STATUS,REF From GALLERY where blob_id is null  LIMIT 10 , 5 ",
			"Select NAME,STATUS,REF From GALLERY where blob_id is null  OFFSET 10  ROWS FETCH NEXT 5 ROWS ONLY");
	
	/*errors+=exports.sql_make_compatable_TestX("list",
			"Select List(NAME) From GALLERY",
			"Select List(NAME) From GALLERY",
			"Select GROUP_CONCAT( NAME) From GALLERY",
			"Select STRING_AGG( NAME) From GALLERY");
*/
	
	errors+=exports.sql_make_compatable_TestX("listA",
			"Select List( xxx(name,')',1,8)) From GALLERY",
			"Select List( xxx(name,')',1,8)) From GALLERY",
			"Select GROUP_CONCAT( xxx(name,')',1,8)) From GALLERY",
			"Select STRING_AGG(   xxx(name,')',1,8),','  ) From GALLERY"   );

	errors+=exports.sql_make_compatable_TestX("substring",
			"substring(name from 1 for 8)",
			"substring(name from 1 for 8)",
			"substring(name from 1 for 8)",
			"substring(name ,1,8)");			
			
	errors+=exports.sql_make_compatable_TestX("list of substring",
			"Count(*,','  ), List(  substring(name,1,8))",
			"Count(*,','  ), List(  substring(name,1,8))",
			"Count(*,','  ), GROUP_CONCAT(  substring(name,1,8))",
			"Count(*,','  ), STRING_AGG(    substring(name,1,8),','  )"   );
			
	errors+=exports.sql_make_compatable_TestX("substring of list of substring",
			"count,substring(list(substring(name from 1 for 8)) from 1 for 198) from",
			"count,substring(list(substring(name from 1 for 8)) from 1 for 198) from",
			"count,substring(GROUP_CONCAT(substring(name from 1 for 8)) from 1 for 198) from",
			"count,substring(STRING_AGG(  substring(name ,1,8),','  ) ,1,198) from");	
	

	
	//errors+=1;
	if (errors>0){
	    console.log('Fail sql_make_compatable unit_test, errors:',errors);
		process.exit(2);		    
	}
	
}	


//exports.sql_make_compatable_test();




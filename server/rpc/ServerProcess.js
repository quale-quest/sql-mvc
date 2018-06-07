"use strict";
// Server-side Code

/*
The login/page and updates can all be integrated into a single request,
but then the page must be stored on the db server, else we will have to ask it and that is pointless.....

 */


var db = require("../../server/database/DatabasePool");
var ide = require("../../server/IDE/debugger");
var fb = require("node-firebird");
var app_utils = require("../lib/app_utils");
var fs = require('fs');
var path = require('path');
var winston = require('winston');

const TYPES = require('tedious').TYPES;

exports.produce_div = function (req, res, ss, rambase, messages, session,recursive,cb) {    
    
    db.connect_if_needed(
      rambase,
      function () { exports.connect_and_produce_div(req, res, ss, rambase, messages, session,recursive,cb);
      });
    
}

exports.connect_and_produce_div = function (req, res, ss, rambase, messages, session,recursive,cb) {
    console.time("========================DB QUERY");
	//input='SELECT info,p.RES FROM Z$RUN ('SESSION1', 'ACT', 999,999, 'VALU', 'u08USER8002p041257x00end') p;

	//console.log("Server received messages:", messages);
	//TODO ... we should range check and validate the same as on the client side ....
	//     or should this be some code in the db server
	//TODO write audit trail to log file-can also happen inside the db - one idea is to have a external change log in redis that can be shown to the user if the server creashes during a update
	//convert from json to internal update form for easier parsing in sql
	var message = [];
	var update = '';
	var last_cid = '';
	var public_parameters = '';
	messages.forEach(function (msg) {
		//last one will be a click
		message = msg;
		message.session = session;
		if (msg.update !== undefined) { //only the login command currently updates directly
			update += msg.update;
		} else {
			if (msg.typ === 'change') {
				if (last_cid !== message.cid) {
					update += par_format('c', message.cid);
					last_cid = message.cid;
				}
				update += par_format('k', message.pkf);
				update += par_format('v', message.valu);
			}
			if (msg.typ === 'params') {
				update += par_format('t', message.key);
				update += par_format('r', message.valu);
			}            
		}
	});

	if (message.valu === undefined)
		message.valu = "";
	if (message.typ === undefined)
		message.typ = "";
	update += par_format('w', '');
	update += "x00";
	console.log("Server received update:", update);
	console.log("rambase.conf.db.dialect:", rambase.conf.db.dialect);

    if (rambase.conf.db.dialect=="fb25")  {
		connect_and_produce_div_sub_fbsql(req,ss,rambase,message,recursive,public_parameters,update,cb);
	} else if (rambase.conf.db.dialect=="mysql57")  {			
		connect_and_produce_div_sub_mysql(req,ss,rambase,message,recursive,public_parameters,update,cb);
	} else if (rambase.conf.db.dialect=="mssql12")  {
		//console.trace("rambase.conf.db.dialect:", rambase.conf.db.dialect);		
		connect_and_produce_div_sub_mssql(req,ss,rambase,message,recursive,public_parameters,update,cb);		
	} else throw new Error("dialect code missing");
			
}

function connect_and_produce_div_sub_fbsql(req,ss,rambase,message,recursive,public_parameters,update,cb)  {
	console.log('\n\n SELECT NEW_CONTEXT_ID,info,RES,ScriptNamed FROM Z$RUN (\'' + message.session + '\',' + 
	  message.cid + ',' + message.pkf + ',\'' + public_parameters + '\',\'' + update + 
	  '\')');
	console.log('\n\n SELECT * FROM Z$RUN_SUB (\'' + message.session + '\',' + 
	  message.cid + ',' + message.pkf + ',\'' + update + 
	  '\')\n');	  

	console.log('starting Transaction :');
	try {// does not seem to catch silent failing queries
	rambase.db.startTransaction(//transaction(fb.ISOLATION_READ_COMMITED,
		function (err, transaction) {
			console.log('startTransaction fb err:', err);
		if (err) {
			error(err);
			var source = {}; //filename,start_line,start_col,source};
			parse_error(zx, err, source, line_obj);
			console.log('Error starting transaction:', err);

			return;
		}
		
		transaction.query('SELECT NEW_CONTEXT_ID,info,RES,scriptnamed FROM Z$RUN (?,?,?,?,?)',
			[message.session, message.cid, message.pkf, public_parameters, update],
			function (err, result) {

            console.log('dbresult raw:', result);
			if (err !== undefined || result===null || result.length<1 || result[0].scriptnamed===null) {
				console.log('dberror:', err);
				//console.log('dbresult on err: ',result );
				//todo - show operator some kind of server error
				transaction.rollback();
			} else {

            
                if (!recursive && rambase.conf.run.monitor_mode === "jit" && result[0].scriptnamed) {
                    if (result.length > 0) {
                        
                        console.log('db -jit- ScriptNamed:', result[0].scriptnamed.toString());
                        if (app_utils.check_children(result[0].scriptnamed))  {
                            console.log('check_children fileobj changed :', result[0].scriptnamed);
                            if (ss.publish && ss.publish.socketId)
                                ss.publish.socketId(req.socketId, 'switchPage', '#PAGE_4', '');
                            transaction.rollback();

                            app_utils.queue_compiler (result[0].scriptnamed,session,function (err) {
                                //recursively resubmit the query
                                console.log('app_utils.call_compiler callback on :',err, result[0].scriptnamed);
                                exports.produce_div(req, res, ss, rambase, messages, session,1);
                                
                            });   
                            app_utils.call_compiler();
                            return ;
                        }
                    }
                    //process.exit(2);
                }
            
				transaction.commit(function (err) {
					if (err) {
						console.log('error in transaction.commit', err);
						transaction.rollback();
					} else {
						if (result.length === 0)
							console.log('no database results'); //this could be use full for save only instructions that don't feedback
						else {
							//if ((rambase.conf.run_mode=="dev")&&result[0].res)
                            var infos=String(result[0].info);    
							//console.log('dbresult infos:', infos, '');
							if (infos === 'exception') {
								var str = '\n\n\n\nSET TERM ^ ;' + result[0].res + '^\nSET TERM ; ^\n\n\n\n';
								//write this to a audit
								console.log(str);                                
						        fs.writeFileSync( path.resolve('output/runtime_exception.txt'), str );

							} else {
                                console.log('db - ScriptNamed:', (result[0].scriptnamed||'').toString());
                                console.log('db - NEW_CONTEXT_ID :', result[0].new_context_id);
                                var newdata = (result[0].res);
								console.log('db - JSON       :\n\n', newdata, '\n\n');
								console.log('db - JSON LENGTH: ', newdata.length, '\n\n');
								{ //debug
									//var json = JSON.parse(result[0].res);
									//console.log('db json :', JSON.stringify(json[0].Data,null,4));
									//console.log('db stash :', JSON.stringify(json[0].Stash,null,4));
									//console.log('db cid :', JSON.stringify(json[0].Data.cid,null,4));
								}

								//console.log('Index.htm.sql  ouput: ',result[0].res );
                                if (result[0].new_context_id!==0) 
                                   rambase.current_cid    = result[0].new_context_id;
							    console.log('db - NOW_CID    :', rambase.current_cid);
                                rambase.current_script = (result[0].scriptnamed||'').toString();
                                //todo filter developers on some key value - so only a small subset of users can to live editing of source
                                db.developers[message.session] = (result[0].scriptnamed||'').toString();

                                if (infos === 'logout') {
                                    rambase.logged_out = true;
                                    //console.log('db - logged_out message for :', rambase);
                                } else rambase.logged_out = false;   

                                
                                //console.log('=================================rambase.current_cid> ',rambase.current_cid );
                                console.timeEnd("========================DB QUERY");
								console.log('db - cb      :',cb);
                                if (cb) cb((result[0].scriptnamed||'').toString(),newdata)
                                else {    
                                    if (ss.publish && ss.publish.socketId) {
                                    ss.publish.socketId(req.socketId, 'newData', 'content', newdata);
                                    ss.publish.socketId(req.socketId, 'switchPage', '#PAGE_2', '');
                                    } else console.warn('=================================Data processing lost due to not having a connected socket ');
                                }
							}
						}
					}
				}); //tr com
			}
		}); //tr qry
		

	}); //tr	
	
		} catch (err) {          
            console.error("fbsql transaction.query err: ",err);//process.exit(2);
		}
	
	
}	



function connect_and_produce_div_sub_mysql(req,ss,rambase,message,recursive,public_parameters,update,cb)  {
	
	console.log("connect_and_produce_div_sub_mysql:");
	console.log('\n\nCALL Z$RUN(\'' + message.session + '\',' + message.cid + ',' + message.pkf + ',\'\',\'' + update + '\')\n\n');
	var query_str = 'CALL Z$RUN(?,?,?,?,?)';
	//query_par = [message.session, message.cid, message.pkf, update];			
		

	console.log('starting Transaction :');
	rambase.db.beginTransaction(function (err) {
			console.log('startTransaction :', err);
		if (err) {
			error(err);
			var source = {}; //filename,start_line,start_col,source};
			parse_error(zx, err, source, line_obj);
			console.log('Error starting transaction:', err);

			return;
		}
		console.log('rambase.db.queryx:');
		console.log('rambase.db.query:', query_str);
		rambase.db.query(query_str,
			[message.session, message.cid, message.pkf,'', update],
			function (err, result_x,fields) {
			console.log('dbresult raw:', result_x[0][0]);//.res);
			var result = [{}];
			result[0].NEW_CID = result_x[0][0].NEW_CID;
			result[0].info = result_x[0][0].info;
			result[0].res = result_x[0][0].res;
			result[0].scriptnamed = result_x[0][0].ScriptNamed;

            console.log('result :', result);
			console.log('result[0].scriptnamed :', result[0].scriptnamed);
			console.log(' result.length :',  result.length);
			console.log(' err :',  err,(err !== null));
			
			//console.log('dbresult fields:', fields);
			if (err !== null || result===null || result.length<1 || result[0].scriptnamed===null) {
				console.log('dberror:', err);
				//console.log('dbresult on err: ',result );
				//todo - show operator some kind of server error
				rambase.db.rollback();
			} else {

				//todo addback jit compiling

				console.log('rambase.db.commit');
				rambase.db.commit(function (err) {
					if (err) {
						console.log('error in transaction.commit', err);
						rambase.db.rollback();
					} else {
						if (result.length === 0)
							console.log('no database results'); //this could be use full for save only instructions that don't feedback
						else {
							//if ((rambase.conf.run_mode=="dev")&&result[0].res)
                            var infos=String(result[0].info);    
							//console.log('dbresult infos:', infos, '');
							if (infos === 'exception') {
								var str = '\n\n\n\nSET TERM ^ ;' + result[0].res + '^\nSET TERM ; ^\n\n\n\n';
								//write this to a audit
								console.log(str);                                
						        fs.writeFileSync( path.resolve('output/runtime_exception.txt'), str );

							} else {
                                console.log('db - ScriptNamed:', (result[0].scriptnamed||'').toString());
                                console.log('db - NEW_CID    :', result[0].new_cid);
                                var newdata = (result[0].res);//.replace(/\n/g, " ").replace(/\r/g, " ");
								console.log('db - JSON       :\n\n', newdata, '\n\n');
								{ //debug
									//var json = JSON.parse(result[0].res);
									//console.log('db json :', JSON.stringify(json[0].Data,null,4));
									//console.log('db stash :', JSON.stringify(json[0].Stash,null,4));
									//console.log('db cid :', JSON.stringify(json[0].Data.cid,null,4));
								}

								//console.log('Index.htm.sql  ouput: ',result[0].res );
                                if (result[0].new_cid!==0) 
                                   rambase.current_cid    = result[0].new_cid;
							    console.log('db - NOW_CID    :', rambase.current_cid);
                                rambase.current_script = (result[0].scriptnamed||'').toString();
                                //todo filter developers on some key value - so only a small subset of users can to live editing of source
                                db.developers[message.session] = (result[0].scriptnamed||'').toString();

                                if (infos === 'logout') {
                                    rambase.logged_out = true;
                                    //console.log('db - logged_out message for :', rambase);
                                } else rambase.logged_out = false;   

                                
                                //console.log('=================================rambase.current_cid> ',rambase.current_cid );
                                console.timeEnd("========================DB QUERY");
								console.log('db - cb      :',cb);
                                if (cb) cb((result[0].scriptnamed||'').toString(),newdata)
                                else {    
                                    if (ss.publish && ss.publish.socketId) {
                                    ss.publish.socketId(req.socketId, 'newData', 'content', newdata);
                                    ss.publish.socketId(req.socketId, 'switchPage', '#PAGE_2', '');
                                    } else console.warn('=================================Data processing lost due to not having a connected socket ');
                                }
							}
						}
					}
				}); //tr com
			}
		}); //tr qry

	}); //tr	
}	


function connect_and_produce_div_sub_mssql(req,ss,rambase,message,recursive,public_parameters,update,cb)  {
	
	console.log("connect_and_produce_div_sub_mssql:");
	var scriptnamed="", newdata="";

	console.log('starting Transaction mssql:');
	rambase.db.beginTransaction(function (err) {
			console.log('startTransaction mssql  err:', err);
		if (err) {
			error(err);
			var source = {}; //filename,start_line,start_col,source};
			parse_error(zx, err, source, line_obj);
			console.log('Error starting transaction:', err);

			return;
		}
		
		try {		
			var result = [];
			console.log(' rambase.db.Request ...:');		
			var request = new rambase.Request('Z$RUN', function(err, rowCount) {
		
				console.log('rambase.Request err:',err);
				
				
				rambase.db.commitTransaction(function (err) {
						console.log('startTransaction mssql  err:', err);
					if (err) {
						error(err);
						var source = {}; //filename,start_line,start_col,source};
						parse_error(zx, err, source, line_obj);
						console.log('Error commitTransaction:', err);

						return;
					}
					
					
					
								console.log('db - cb -mssql      :',cb);
                                if (cb) cb((scriptnamed||'').toString(),newdata)
                                else {    
                                    if (ss.publish && ss.publish.socketId) {
                                    ss.publish.socketId(req.socketId, 'newData', 'content', newdata);
                                    ss.publish.socketId(req.socketId, 'switchPage', '#PAGE_2', '');
                                    } else console.warn('=================================Data processing lost due to not having a connected socket ');
                                }					
					
					
									
				}); //commitTransaction
		
		
			}); //new Request

			request.on('row', function(columns) {
				columns.forEach(function(column) {
					if (column.value === null) {
						console.log('NULL');
					} else {							
						result.push(column.value);
					}
				});
				console.log('MSSQL row',result);
			});					
					

			request.on('done', function(rowCount, more) {
				console.log('done '+ rowCount + ' rows returned');
				
			  }); //request.on('done'
			  
			request.on('returnValue', function(parameterName, value, metadata) {
				console.log('mssql returnValue:' + parameterName + ' = ' + value); 
				if (parameterName=='ScriptNamed') {scriptnamed=value;}				
				if (parameterName=='res') {newdata=value;  }				
			  });
			  
		
			console.log('request.addParameter ...:');
			request.addParameter('SESSIONID', TYPES.VarChar, message.session);
			request.addParameter('PRIOR_CONTEXT_ID', TYPES.Int, message.cid);
			request.addParameter('PRIOR_ITEM_ID', TYPES.Int, message.pkf );  
			request.addParameter('PUBLIC_PARAMETERS', TYPES.VarChar,'' );  
			request.addParameter('UPDATES', TYPES.VarChar, update);
		    request.addOutputParameter('NEW_CONTEXT_ID', TYPES.Int);
			request.addOutputParameter('info', TYPES.VarChar);
			request.addOutputParameter('res', TYPES.VarChar);
			request.addOutputParameter('ScriptNamed', TYPES.VarChar);
		  
			console.log('request.callProcedure ...:');  
			
			
			console.log('\r\n\r\ndeclare @lINFO Varchar(1000)=\'a\';');
			console.log('declare @lCURRENTPAGE Varchar(100);');
			console.log('declare @lpage_params_in Varchar(1000);');
			console.log('declare @lCIDRETURN Integer;');
			console.log('declare @lPKREFRETURN Integer;');
			console.log('declare @res VARCHAR(max);');
			
			console.log('declare @ScriptNamed Varchar(1000);');
			console.log('declare @page_params Varchar(1000);');
			console.log('declare @IN_CID Integer;');
			console.log('declare @IN_PKREF Integer;	');		
			
			console.log('EXEC Z$RUN \''+message.session+'\', '+message.cid+','+message.pkf+',\'\', \''+update+'\',@lCIDRETURN output,  @lINFO output, @res output, @lCURRENTPAGE output');
			console.log('-- EXEC Z$RUN_SUB \''+message.session+'\', '+message.cid+','+message.pkf+',  \''+update+'\',@lINFO output,  @ScriptNamed output, @page_params output, @IN_CID output, @IN_PKREF output');
			console.log('select  @lCIDRETURN as lCIDRETURN,  @lINFO as  lINFO, @res as res, @lCURRENTPAGE as lCURRENTPAGE');
			console.log('select  @lINFO as lINFO,  @ScriptNamed as ScriptNamed, @page_params as page_params, @IN_CID as IN_CID, @IN_PKREF as IN_PKREF');
			console.log('select @lCIDRETURN,@lINFO ,@res,@lCURRENTPAGE as pki');
			console.log('select * from Z$PK_CACHE where indx=120000001');
		    console.log('select * from TODO_MVC');			
			console.log('\r\n\r\n');

			
			rambase.db.callProcedure(request);		
				
		} catch (e) {
			console.log("Threw error in callProcedure :" ,e,"\r\n",JSON.stringify(e));				
		}			
				
			
		
		
		
	}); //tr	
}	



exports.push_passed_params = function (rambase,messagelist) {
//	var message = [];
         console.log('push_passed_params params 183135 :',rambase.params);            
        app_utils.forFields(rambase.params, function (field, key) {  
            if (key !== 'object_ended_at') {        
            
            	var message = {
					typ : 'params',
					key : '' +  key,
					valu: '' + field
                    };	
               messagelist.push(message);  
               console.log('params 183135 :',key,field);
            }
        
        });
}


exports.facebook_check = function (rambase,Login_response,response,cb) {

	//input='SELECT info,p.RES FROM Z$RUN ('SESSION1', 'ACT', 999,999, 'VALU', 'u08USER8002p041257x00end') p;
	var message = [];
	var update = '';
	var last_cid = '';
	var public_parameters = '';
	

	rambase.db.startTransaction(
		function (err, transaction) {
		if (err) {
			error(err);
			var source = {}; 
			parse_error(zx, err, source, line_obj);
			console.log('Error starting transaction:', err);

			return;
		}

        
        //console.log('\n--------------------------------------------------------\nLogin_response.authResponse,response:', Login_response.authResponse,response,rambase.params);
        //console.log('\n--------------------------------------------------------\nrambase 115821:', rambase);
        var ar = Login_response.authResponse; 
        var rs = response;  
        var pars = [ar.userID, rs.email, rs.first_name, rs.gender, rs.last_name, 
                    rs.link, rs.locale,rs.name,rs.timezone+'', 
                    rambase.params.invite || '', rambase.params.site || '',rambase.connectionID
                    ];
        var pars2 = [ '101619350173460',
  'john@our-beloved.co.za',
  'John',
  'male',
  'Ourbeloved',
  'https://www.facebook.com/app_scoped_user_id/101619350173460/',
  'en_US',
  'John Ourbeloved',
  '2',
  
  '',
  '',
  '7:28:16.721' ];

  
        console.log('\npars 084245:',pars);//pars);
		transaction.query("SELECT INFO FROM FACEBOOK_CHECK (?,?,?,?,?, ?,?,?,?,'now', ?,?,?)",
			pars,
			function (err, result) {

			if (err !== undefined) {
				console.log('dberror:', err);
				//console.log('dbresult: empty' );
				//todo - show operator some kind of server error
				transaction.rollback();
                cb();
			} else {

            
            
				transaction.commit(function (err) {
					if (err) {
						console.log('error in transaction.commit', err);
						transaction.rollback();
					} else {
                        
					}
                    
                    cb();
				}); //tr com
			}
		}); //tr qry

	}); //tr
}

function lpad(input, len, chr) {
	var str = input.toString();
	chr = chr || " ";
	while (str.length < len) {
		str = chr + str;
	}
	return str;
}

function par_format(type, message) {
    message = '' + message;
	if (message.length < 95) {
		type = type.toLowerCase();
		return type + lpad(message.length, 2, '0') + message;
	} else {
		type = type.toUpperCase();
		return type + lpad(message.length, 5, '0') + message;
	}

}

exports.BuildNotify = function (message) {
	ss.publish.all('BuildNotify', '#debugBuildNotify', message); // Broadcast the message to everyone
}

var produce_login = exports.produce_login = function (req, res, ss, rambase, Page, User,Password,cb) {   
                if (!Page) Page='';
                if (rambase.params) {
                    if (rambase.params.page) Page=rambase.params.page||'';
                    if (rambase.params.user) User=rambase.params.user||'';
                    if (rambase.params.pass) Password=rambase.params.pass||'';
                }
                
				var messagelist = [];
				var message = {
					cid : 1000,
					pkf : 0,
					valu : ''
				};
                                
				// update:'u08USER8002p041258x00end'                
				message.update = par_format('u', User) + par_format('p', Password);
                
                //this could be a security issue so maybe only allow it in dev
				if (Page&&rambase.conf.run.url_page) message.update += par_format('l', Page);
					                
                exports.push_passed_params(rambase,messagelist);

                messagelist.push(message);
				exports.produce_div(req, res, ss, rambase, messagelist, req.session.myStartID,0,cb);
				//exports.produce_div(req, res, ss,rambase,message);
}

// Define actions which can be called from the client using ss.rpc('demo.ACTIONNAME', param1, param2...)
exports.actions = function (req, res, ss) {
	var rambase;
	// Example of pre-loading sessions into req.session using internal middleware
//    console.log('The contents of my req was ', req);
	req.use('session');
//    console.log('db.module_name 133135 :', db.module_name);

	// Uncomment line below to use the middleware defined in server/middleware/example
	//req.use('example.authenticated')
    
	return {
		connected : function (first_page_rendered) {
			
			try{
			
            if (first_page_rendered) {
                console.log("Connected and first_page_rendered 065230 :");
            } else {
			//console.log('The contents of my session is', req.session.myStartID);
            rambase = db.locate(req.session.myStartID);
            //console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<rambase.current_cid  sp :',rambase.current_cid);
			
			
            if (!rambase.current_cid ||  rambase.logged_out || rambase.conf.run.dont_reload) {
                //or go direct to the app as guest user
                //console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<rambase.conf  sp :',rambase.conf);
                if (rambase.conf.run.login_first)
                    ss.publish.socketId(req.socketId, 'switchPage', '#PAGE_1', '');//login
                else
                    produce_login(req, res, ss, rambase, '', 'guest','gu35t');
                
            } else {    
                var messagelist = [];
                var message = {
                    cid : rambase.current_cid,
                    pkf : 0,
                    valu : '',
                    typ : 'click'
                };
                
                console.log("Connected message reloading 065230 :");
                exports.push_passed_params(rambase,messagelist);
                messagelist.push(message);
                exports.produce_div(req, res, ss, rambase, messagelist, req.session.myStartID);
            }
            }
            
			
			} catch (e) {
				console.log("Threw error in produce :" ,e,"\r\n",JSON.stringify(e));				
			}
			
			
		},
		getSession : function () {
			console.log('The contents of my session is', req.session);
		},
		updateSession : function () {
			req.session.myVar = 1234;
			req.session.cart = {
				items : 3,
				checkout : false
			};
			req.session.save(function (err) {
				console.log('Session data has been saved:', req.session, err);
			});
		},
        FBLoginAction : function (Login_response,response,Page) {
            rambase = db.locate(req.session.myStartID);
            //console.log('FBLoginAction is',req.session.myStartID,Login_response,response, rambase);
            //TODO validate  Login_response.accessToken and Login_response.userID
            //first create facebook user if it does not exist
            db.connect_if_needed(
              rambase,
              function () { exports.facebook_check(rambase,Login_response,response,
                        function () {//console.log('exports.facebook_checked 210655 :',req.session.myStartID,Login_response,response, rambase);
                        var User = Login_response.authResponse.userID; 
                        console.log('exports.facebook_checked 210655 :',User);
                        produce_login(req, res, ss, rambase, '', User,'FACEBOOKED');
                        }); 
              });              
              
        },
		LoginAction : function (User, Password, Page) {
			if (User && User.length >= 0) { // Check for blank messages
                db.locateRambase(req.session.myStartID,function (rambase) {
				
				//console.log('My session is',req.session.myStartID,' and my database is ', rambase);

                console.log('LoginAction is', Page, User,Password);
                produce_login(req, res, ss, rambase, Page, User,Password);

                }); 
                
				return res(true); // Confirm it was sent to the originating client
			} else {
				return res(false);
			}
		},

		NavSubmit : function (message) {
			if (message && message.length > 0) { // Check for blank messages
            
                db.locateRambaseReq(req,
                function (rambase) {            
				//console.log('My session is',req.session.myStartID,' and my database is ', rambase);
				message = JSON.parse(message);

				//console.log("message do:", message);
				//message= BSON.deserialize(message);
				//console.log("message done:", message);


				console.log('NavSubmit is', message);
				exports.produce_div(req, res, ss, rambase, message, req.session.myStartID);
                });

				return res(true); // Confirm it was sent to the originating client
			} else {
				return res(false);
			}
		},
		clickLink : function (message) {
			if (message && message.length > 0) {
				// Check for blank messages - ignore
				//ignore rapid repeated identical messages
				// rate limit other messages


				//process the changes if any

				//send the new page, either to the same div, or to another dif
				// or reload the all the divs


				//ss.publish.all('newMessage', message);     // Broadcast the message to everyone
				//ss.publish.socketId(req.socketId, 'justForMe', 'Just for one tab');

				return res(true); // Confirm it was sent to the originating client
			} else {
				return res(false);
			}
		},

		sendDebugMessage : function (message) {
			if (message && message.length > 0) { // Check for blank messages
				//ss.publish.all('newMessage', message); // Broadcast the message to everyone
				console.log('sendDebugMessage recieved:', message);
				var cmds = JSON.parse(message);
				//console.log('sendDebugMessage cmds:', JSON.stringify(cmds,null,4)  );
				var result = ide.ProcessDebugRequest(cmds);

				ss.publish.socketId(req.socketId, 'debugresult', '#debugcontainer', result, cmds.fn);
				return res(true); // Confirm it was sent to the originating client
			} else {
				return res(false);
			}
		},
		sendBroadcastMessage : function (message) {
			if (message && message.length > 0) { // Check for blank messages
				ss.publish.all('newMessage', message); // Broadcast the message to everyone
				return res(true); // Confirm it was sent to the originating client
			} else {
				return res(false);
			}
		},
        trace_to_server : function (message) {
			if (message && message.length > 0) { // Check for blank messages
            
                db.locateRambaseReq(req,
                function (rambase) {            
				//console.log('My session is',req.session.myStartID,' and my database is ', rambase);
                
                //console.log('trace_to_server recieved:',rambase.tr_last_contact, message);
                if (!rambase.tr_log) rambase.tr_log=[];
                message.forEach(function (msg) {
                    try {
                        //console.log(' proc:', msg);
                        if (msg[0]=='get') {                             
                            rambase.tr_dt = msg[1] - Date.now();                    
                            rambase.tr_last_contact = msg[1];                    
                            msg[1] = msg[1] - rambase.tr_dt;
                            rambase.tr_log.push([rambase.connectionID,msg[0],new Date(msg[1]),msg[2],msg[3]]);
                            winston.info('tacking',[rambase.connectionID,msg[0],new Date(msg[1]),msg[2],msg[3]]);
                            //console.log('dt client-server:',rambase.tr_dt,msg[1],typeof msg[1],new Date(),new Date(msg[1]));
                        } else  if (msg[0]=='x') {
                            msg[1] = msg[1] - rambase.tr_dt;
                            rambase.tr_last_contact = new Date(msg[1]);
                        } else {
                            msg[1] = msg[1] - rambase.tr_dt;
                            rambase.tr_log.push([rambase.connectionID,msg[0],new Date(msg[1]),msg[2],msg[3]]);
                            winston.info('tacking',[rambase.connectionID,msg[0],new Date(msg[1]),msg[2],msg[3]]);                            
                            //rambase.tr_log.push(msg);                                                        
                        }

                    } catch (e) {}
                    
                    
                });
                
                });

				
			}    
            return res(true); // Confirm it was sent to the originating client            
            
            
            return res(true);
        }    

	};

};

    
    
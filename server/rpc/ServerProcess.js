"use strict";
// Server-side Code

/*
The login/page and updates can all be integrated into a single request,
but then the page must be stored on the db server, else we will have to ask it and that is pointless.....

 */

var ide = require("../../server/IDE/debugger");
var db = require("../../server/database/DatabasePool");
var fb = require("node-firebird");
var app_utils = require("../lib/app_utils");
var fs = require('fs');
var path = require('path');

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

	console.log('\n\nSELECT NEW_CID,info,RES,ScriptNamed FROM Z$RUN (\'' + message.session + '\',\'' + message.typ + '\',' + message.cid + ',' + message.pkf + ',\'' + message.valu + '\',\'' + public_parameters + '\',\'' + update + '\')\n\n');

	rambase.db.startTransaction(//transaction(fb.ISOLATION_READ_COMMITED,
		function (err, transaction) {
		if (err) {
			error(err);
			var source = {}; //filename,start_line,start_col,source};
			parse_error(zx, err, source, line_obj);
			console.log('Error starting transaction:', err);

			return;
		}

		transaction.query('SELECT NEW_CID,info,RES,scriptnamed FROM Z$RUN (?,?,?,?,?,?,?)',
			[message.session, message.typ, message.cid, message.pkf, message.valu, public_parameters, update],
			function (err, result) {

			if (err !== undefined) {
				console.log('dberror:', err);
				//console.log('dbresult: empty' );
				//todo - show operator some kind of server error
				transaction.rollback();
			} else {

                //console.log('dbresult:', result);
                if (!recursive && rambase.conf.run.monitor_mode === "jit") {
                    if (result.length > 0 && result[0].scriptnamed) {
                        
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
                            var infos = String(result[0].info);    
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
                                db.developers[message.session] = rambase.current_script;

                                if (infos === 'logout') {
                                    rambase.logged_out = true;
                                    //console.log('db - logged_out message for :', rambase);
                                } else rambase.logged_out = false;   

                                

                                //console.log('=================================rambase.current_cid> ',rambase.current_cid );
                                console.timeEnd("========================DB QUERY");
                                if (cb) cb(rambase.current_script,newdata)
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
                messagelist.push(message);
                exports.produce_div(req, res, ss, rambase, messagelist, req.session.myStartID);
            }
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

                db.locateRambaseReq(req,function (rambase) {            
				console.log('My session is',req.session.myStartID,' and my database is ', rambase);
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
		}

	};

};

    
    
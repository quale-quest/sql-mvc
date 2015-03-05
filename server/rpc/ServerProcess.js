"use strict";
// Server-side Code

//fbpool = require("DatabasePool");
//var zxDiv = require('../../zxDiv').init();
//var fs = require('fs');

/*
The login/page and updates can all be integrated into a single request,
but then the page must be stored on the db server, else we will have to ask it and that is pointless.....

 */

var ide = require("../../server/IDE/debugger");
var db = require("../../server/database/DatabasePool");
var fb = require("node-firebird");
var app_utils = require("../lib/app_utils");

exports.produce_div = function (req, res, ss, rambase, messages, session,recursive) {

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
			update = msg.update;
		} else {
			if (msg.typ === 'change') {
				if (last_cid !== message.cid) {
					update += par_format('c', message.cid);
					last_cid = message.cid;
				}
				update += par_format('k', message.pkf);
				update += par_format('v', message.valu);
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

	console.log('\n\nSELECT info,RES,ScriptNamed FROM Z$RUN (\'' + message.session + '\',\'' + message.typ + '\',' + message.cid + ',' + message.pkf + ',\'' + message.valu + '\',\'' + public_parameters + '\',\'' + update + '\')\n\n');

	rambase.db.startTransaction(//transaction(fb.ISOLATION_READ_COMMITED,
		function (err, transaction) {
		if (err) {
			error(err);
			var source = {}; //filename,start_line,start_col,source};
			parse_error(zx, err, source, line_obj);
			console.log('Error starting transaction:', err);

			return;
		}

		transaction.query('SELECT info,RES,scriptnamed FROM Z$RUN (?,?,?,?,?,?,?)',
			[message.session, message.typ, message.cid, message.pkf, message.valu, public_parameters, update],
			function (err, result) {

			if (err !== undefined) {
				console.log('dberror:', err);
				//console.log('dbresult: empty' );
				//todo - show operator some kind of server error
				transaction.rollback();
			} else {

            
                if (!recursive && rambase.conf.run_settings[rambase.conf.run_mode].monitor_mode === "jit") {
                    if (result.length > 0) {
                        
                        console.log('db -jit- ScriptNamed:', result[0].scriptnamed);
                        if (app_utils.check_children(result[0].scriptnamed))  {
                            console.log('check_children fileobj changed :', result[0].scriptnamed);
                            transaction.rollback();
                    
                            app_utils.call_compiler (result[0].scriptnamed,function (err) {
                                //recursively resubmit the query
                                exports.produce_div(req, res, ss, rambase, messages, session,1);
                                
                            });   
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
							console.log('dbresult:', String(result[0].info), '');
							if (result[0].info === 'exception') {
								var str = '\n\n\n\nSET TERM ^ ;' + result[0].res + '^\nSET TERM ; ^\n\n\n\n';
								//write this to a audit
								console.log(str);

							} else {
                                console.log('db - ScriptNamed:', result[0].scriptnamed);
								console.log('db - JSON:\n\n', result[0].res, '\n\n');
								{ //debug
									//var json = JSON.parse(result[0].res);
									//console.log('db json :', JSON.stringify(json[0].Data,null,4));
									//console.log('db stash :', JSON.stringify(json[0].Stash,null,4));
									//console.log('db cid :', JSON.stringify(json[0].Data.cid,null,4));
								}

								//console.log('Index.htm.sql  ouput: ',result[0].res );
                                
								ss.publish.socketId(req.socketId, 'newData', 'content', result[0].res);
								ss.publish.socketId(req.socketId, 'switchPage', '#PAGE_2', '');
							}
						}
					}
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

// Define actions which can be called from the client using ss.rpc('demo.ACTIONNAME', param1, param2...)
exports.actions = function (req, res, ss) {
	var rambase;
	// Example of pre-loading sessions into req.session using internal middleware
	req.use('session');

	// Uncomment line below to use the middleware defined in server/middleware/example
	//req.use('example.authenticated')

	return {

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
		LoginAction : function (User, Password, Page) {
			if (User && User.length >= 0) { // Check for blank messages
				rambase = db.locate(req.session.myStartID);
				//		console.log('My session is',req.session.myStartID,' and my database is ', rambase);
				var messagelist = [];
				var message = {
					cid : 1000,
					pkf : 0,
					valu : ''
				};
                
                if (!Page) Page='';
                var page_user_pass = rambase.page_user_pass;
                if (page_user_pass[1]) Page=page_user_pass[1];
                if (page_user_pass[2]) User=page_user_pass[2];
                if (page_user_pass[3]) Password=page_user_pass[3];
                
               
                console.log('LoginAction is', Page, User,Password);

				// update:'u08USER8002p041258x00end'                
				message.update = par_format('u', User) + par_format('p', Password);
                
                //this could be a security issue so maybe only allow it in dev
				if (Page&&rambase.conf.run.url_page) message.update += par_format('l', Page);
				
				messagelist.push(message);
				exports.produce_div(req, res, ss, rambase, messagelist, req.session.myStartID);
				//exports.produce_div(req, res, ss,rambase,message);

				return res(true); // Confirm it was sent to the originating client
			} else {
				return res(false);
			}
		},

		NavSubmit : function (message) {
			if (message && message.length > 0) { // Check for blank messages
				rambase = db.locate(req.session.myStartID);
				//console.log('My session is',req.session.myStartID,' and my database is ', rambase);
				message = JSON.parse(message);

				//console.log("message do:", message);
				//message= BSON.deserialize(message);
				//console.log("message done:", message);


				console.log('NavSubmit is', message);
				exports.produce_div(req, res, ss, rambase, message, req.session.myStartID);

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

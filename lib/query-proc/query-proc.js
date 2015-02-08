"use strict";
var fs = require('fs');
var db = require("../../server/database/DatabasePool");
var path = require('path');
var hogan = require("hogan");

/*
This is a place holder for future code.

look also at https://github.com/alibaba/nquery
http://ql.io/docs/about

query-proc.js is a js based stored procedure emulator / proxy.

It is an alternative to database centric stored procedures.

It is intended for use with databases that do not have stored procedure facilities
such as sqlite, no-sql databases or web services.
It will also find use where the stored procedure must query multiple data sources.

It is intended to be able to run either server side or client side,
for web applications without a central server.

This could be combined with some replication methods to
make for totally off-line client apps.


Implementation details:
The stored procedure text is compiled into a JSON-LR (JSON language representation).

A simple runtime interprets the tags in the JSON and executes them,
the database query (of which ever dialect) is passed almost unaltered(just variable substitution).

normal flow control, if,while
blocks are just sub arrays
select records - flow control

 */

/*

this gets called where  a local variable 'c' is the context variable
var c={};

The Select will produce output as an array, this array values can be "extended" into c
c=extend(c,result[0])

before a line is evaluated it is (is optionally )moustached (could be hogan)
then it is evaluated (either as a sql statement or a control)

 */

/*
Multiple levels of convenience exist
internal json script representation - used by the engine to execute, it is verbose an precise, difficult for a developer to get 100%
first level scripts are still jsol but easier to write
SP this is very close to firebird SP

Project plan
we start of with experimental internal json to make some tasks easier

internal format
Array of commands,
each command is an array, first field being the command , followed by optional parameters depending on the command
blocks are sub arrays, parameters are evalued with eval, all variables sit in the conetxt v. , all record fields  sit in r.

command      : ["command","parameter","parameter" ...]    //array
command_list : [command, command .....]                   //array of commands

commands :
["=","name","value"]            : assignment
["connect"]                     : start connection(if not already connected)  and transaction
["if", "condition",command_list,command_list]       : if  condition true execute arrray of commands in 3rd parameter, else in 4th (if it is supplied)
["while", "condition",command_list]
["log"]                         : log all local variables on screen for debugging
["log","v.name"}                : or cx.r  for record variables
["commit"]                      : commit and close the transaction, (not the connection)
["complete"]                    : commit and close the connection (unless it was a previously open connect (ie pooled))
["js", function (cx, inst) {}]  : sync callback to a user function with context cx, cx.r = record,cx.v=variables, inst= all the parameters to the command
["cb", function (cx, inst,cb) { ... cb();}]  : async callback, wthat will callback when it is done
["query", "SELECT first 1 ..."],  singleton select no loop one record is loaded into r. context
["query", "SELECT first 1 ...",[]],  singleton with parameters, select no loop one record is loaded into r. context
["query", "SELECT ...",[],[]],  dataset with parameters, and loop, executed for each record in dataset, each record is loaded into r. context
["adapt",command]               : treat first command with moustache template, for self modifying code...


 */
var extend = require('node.extend');
//exports.compile = function (db, text_script, callback) {};

exports.exec = function (cx, token_script) {
	//cx contains dbref.db .. :  cx.dbref=db;  or cx:{dbref:db}, but other contexts variables can also be supplied,
	//we to very little validation in execution as thus would have been pre-validated by the compiler - or careful developer.....

	var step = function (cx) { //state machine

		var start_transaction = function (cx) {
			cx.dbref.db.startTransaction(
				function (err, transaction) {
				if (err) {
					return;
				}
				cx.transaction = transaction;
				step(cx);
			}); //tr

		};
		var detach = function (cx) {
			if (cx.attached_by_script) {
				db.detach(cx.dbref);
				delete cx.dbref;
			}
			step(cx);
		};

		//===================start of step function
		var popout = false,
		inst;
		var v = cx.v;
		var r;
		r = cx.r;

		if (cx.sf.ip >= cx.sf.ip_end) { //end of the block
			console.log('sp end of block :', cx.sf.ip, cx.sf.ip_end, cx.stack.length);
			if (cx.sf.records) { //loop over records
				if (cx.sf.record_index < cx.sf.records.length) {
					extend(cx.r, cx.sf.records[cx.sf.record_index]);
					cx.sf.record_index++;
					step(cx);

				} else {
					//end of record loop
					popout = true;
				}

			} else { //not record loop
				if (cx.sf.whle) {
					if (eval(cx.sf.whle)) { //while loop
						cx.sf.ip = 0;
						step(cx);
					} else {
						popout = true;
					}

				} else {
					//no more looping
					popout = true;
				}

			}

		} else {
			inst = cx.sf.bp[cx.sf.ip];
			if (inst === undefined) {
				console.log('sp step bp undefined:', cx.sf.ip, cx.sf.bp);
				throw (new Error('sp step undefined - likely a missing comma after step ' + (cx.sf.ip - 1) + ' ' + (cx.sf.bp[cx.sf.ip - 1] || '')));
			} else if (inst[0] === undefined)
				console.log('sp step undefined:', cx.sf.ip, inst);
			else
				console.log('sp step :', cx.sf.ip, inst[0]);

			if (inst[0] === 'adapt') //self modifying code
			{
				inst = inst.slice(1); //make sure this does not affect the original structure

				inst[1] = hogan.compile(inst[1]).render(cx);
				console.log('sp hogan.compiled :', inst[1]);
			}

			cx.sf.ip++;
			switch (inst[0]) {
			case 'connect': {

					if (cx.dbref)
						start_transaction(cx);
					else {
						console.log('db database connect :', cx.sf.ip, inst[0]);
						var root_folder = path.resolve('../../Quale/') + '/';
						var session = 'stored procedures';
						db.databasePooled(root_folder, session, '/', function (err, msg, dbref) {
							if (err) {
								console.log(err.message);
							} else { //console.log('serveClient b4:', JSON.stringify(res,null,4));
								cx.dbref = dbref;
								cx.attached_by_script = true;
								start_transaction(cx);
							}
						});
					}

				}
				break; //start
			case 'log': {
					if (!inst[1])
						console.log('sp log ---------------:', v);
					else {
						console.log('sp log ---------------:', eval(inst[1]));
					}
					step(cx);
				}
				break;
			case 'js': {
					inst[1](cx, inst);
					step(cx);
				}
				break;
			case 'cb': {
                    console.log('sp CB :', v);
					inst[1](cx, inst,function (err) {step(cx);}); //function will callback cb;
				}
				break;
			case '=':
			case 'assign': {
					//http://blog.rakeshpai.me/2008/10/understanding-eval-scope-spoiler-its.html
					cx.v[inst[1]] = eval(inst[2]);
					step(cx);
				}
				break;
			case 'if': {
					if (eval(inst[1])) {
						cx.stack.push(cx.sf);
						cx.sf = {};
						cx.sf.ip = 0;
						cx.sf.bp = inst[2];
						cx.sf.ip_end = cx.sf.bp.length;

					} else {
						if (inst[3]) { //else block
							cx.stack.push(cx.sf);
							cx.sf = {};
							cx.sf.ip = 0;
							cx.sf.bp = inst[3];
							cx.sf.ip_end = cx.sf.bp.length;

						}
					}
					step(cx);
				}
				break;
			case 'while': {
					if (inst[2]) {
						cx.stack.push(cx.sf);
						cx.sf = {};
						cx.sf.ip = 0;
						cx.sf.bp = inst[2];
						cx.sf.ip_end = cx.sf.bp.length;
						cx.sf.whle = inst[1];
					}
					step(cx);
				}
				break;
			case 'query': {
					var exec_against = cx.dbref,
					with_params = [];
					if (cx.transaction)
						exec_against = cx.transaction;
					if (inst[2])
						with_params = inst[2];

					exec_against.query(inst[1], with_params, function (err, result) {
						if (err !== undefined) {
							console.log('dberror:', err);
							//console.log('dbresult: empty' );
							//todo - show operator some kind of server error
							exec_against.rollback();
						} else {
							if (result.length === 0) {
								console.log('no database results');
								cx.recordcount = 0;
								step(cx);
							} else {
								//console.log('db - JSON:\n\n', result[0], '\n\n');
								cx.sf.recordcount = result.length;
								extend(cx.r, result[0]);
								if ((inst[3]) && Array.isArray(inst[3])) { //loop over
									cx.stack.push(cx.sf);
									cx.sf = {};
									cx.sf.ip = 0;
									cx.sf.bp = inst[3];
									cx.sf.records = result;
									cx.sf.record_index = 1;
									cx.sf.ip_end = cx.sf.bp.length;
									//..indicate loop to recursive..
									step(cx);
								} else { //singleton - no block

									step(cx);
								}

							}
						}
					});
				}
				break; //query
			case 'complete':
			case 'commit': {
					//console.log('transaction.commit', cx.transaction);
					if (cx.transaction) {
						cx.transaction.commit(function (err) {
							if (err) {
								console.log('error in transaction.commit', err);
								cx.transaction.rollback();
								//abort
							} else {
								delete cx.transaction;
								if (inst[0] === 'complete')
									detach(cx);
							}
						}); //tr com

					} else {
						if (inst[0] === 'complete')
							detach(cx);
					}

				}
				break; //commit
			case 'break': {
					popout = true;
				}
				break;
			default: {
					//nop
					step(cx);
				}
				break;
			} //switch
		}

		if (popout) {
			delete cx.sf;
			if (cx.stack.length > 0) {
				cx.sf = cx.stack.pop();
				step(cx);
			} else {
				//done no more to do
			}
		}

	}; //step = function


	//===============start of func
	cx.sf = {
		ip : 0
	}; //stack frame

	cx.sf.ip = 0;
	cx.sf.bp = token_script;
	cx.sf.ip_end = cx.sf.bp.length;
	cx.stack = [];
	cx.v = {};
	cx.r = {};

	step(cx);

};

var test = function () {
	var cid = 17;
	var pkf = 70000000;
	var jobs_test = [
		["connect"],
		["query", "SELECT first 1 a.BASERECORD,a.QUERY FROM Z$PK_CACHE a where a.MASTER=? and a.INDX=?", [cid, pkf]],
		["=", " cnt ", " 0 "],
		["log", " r "],
		["if", " v.cnt < 0 ",
			[
				["log", " 'stuff' "],
				["=", " cnt ", "(v.cnt + 1)"],
				["log", " v.cnt "]
			]
		],

		//	["commit"],

		["complete"],
		["js", function (cx, inst) {
				console.log('js  :', cx.dbref);
			}
		]
	];

	var jobs = [
		["connect"],
		["query", "SELECT first 1 a.BASERECORD,a.QUERY FROM Z$PK_CACHE a where a.MASTER=? and a.INDX=?", [cid, pkf]],
		["log", " r "],
		["adapt", "query", "SELECT p.PKO FROM Z${{r.baserecord}}(2, '{{{r.query}}}' , 'BINTYPE', ?, 'THUMBTYPE', 'THUMB', 'NAME') p", [fs.createReadStream('/tmp/lst.txt')]], //,{ encoding: null})]],
		["complete"]

	];

	var cx = {}; //	dbref : dbref
	exports.exec(cx, jobs);

};
//test();
//eof

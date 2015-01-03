"use strict";

/*
speed/memory performance  is not important
ease of use is important
 */
/*

this handlees db-agnostic aspects of expression evaluation




handles variable assignment and substitution part of script control


lot of wording expresses sql or firebird PSQL, this is not the intent to limit it, just the lingo of the first platform

 */

/*
 */

 exports.module_name='expressions.js';
 
var extractEscapedString = function (zx, o, OpenKey, CloseKey) {
	return zx.extractEscapedStringFrom(o, OpenKey, CloseKey, 0);
};

var extractFunctionTableField = function (zx, r) {
	if (r.method === "variable") {
		//console.log('table field in >>>>: ',r.content);
		var ofn = {
			left : r.content
		};
		if (extractEscapedString(zx, ofn, "(", ")")) {
			r.functionname = ofn.left.substring(0, ofn.at); //this is not used anywhere in v2 as far as i know
			r.content = ofn.content;
			//r.method = "function"; we inspect  functionname
			//this is no in use at the moment
		} else { //no function
		}

		r.field = r.content;
		var res = r.content.split(".");
		//console.log('table field  res>>>>: ',res);

		if (res.length > 1) {
			r.table = res[0];
			r.field = res[1];
			r.method = "tablefield";
		}
		//console.log('table field r >>>>: ',r);

		// we now have function name.table.field

	}
};

var TagTypes =
	[{
		"open" : "{{$select",
		"close" : "}}",
		"method" : "select",
		"insert" : "(select",
		"insertz" : ")",
		"recurse" : true

	}, {
		"open" : "($select",
		"close" : "$)",
		"method" : "select",
		"insert" : "(select",
		"insertz" : ")",
		"recurse" : true
	}, {
		"open" : "($elect",
		"close" : "$)",
		"method" : "select",
		"insert" : "(select",
		"insertz" : ")",
		"recurse" : true
	}, {
		"open" : "'#",
		"close" : "#'",
		"method" : "variable"
	}, {
		"open" : "#",
		"close" : "#",
		"method" : "variable"
		/*
		a bit problematic as : is used in comments etc - re evaluate it use later
		<#print "name:($elect name from Me where #testmacro# and ref=#user1# $)
		-- here the : becomes a empty variable,,,, also   abc:def  would mean def is a varable....
		future code , but backwards issues

		}, {
		"open" : ":",  //new consistent with psql - to use this we must temp output of / *:* /
		"close" : "",
		"method" : "variable"
		 */
	}, {
		"open" : "'master.",
		"close" : "'",
		"method" : "variable"
	}, {
		"open" : "master.",
		"close" : "",
		"method" : "variable",
		"addback" : false
	}, {
		"open" : "operator.",
		"close" : "",
		"method" : "variable",
		"addback" : false
	}, {
		"open" : "'operator.",
		"close" : "'",
		"method" : "variable"
	}, {
		"open" : "session.",
		"close" : "",
		"method" : "getter",
		"addback" : false
	}, {
		"open" : "system.",
		"close" : "",
		"method" : "getter",
		"addback" : false
	}, {
		"open" : "here.",
		"close" : "",
		"method" : "getter",
		"addback" : false
	}, {
		"open" : "my.",
		"close" : "",
		"method" : "getter",
		"addback" : false
	}
];
var TagTypeStartSelect = {
	"open" : "^select",
	"close" : "^",
	"method" : "select",
	"insert" : "(select ",
	"insertz" : ")",
	"recurse" : true
};
var TagTypeConst = {
	"open" : "",
	"close" : "",
	"method" : "constant"
};

exports.ExtractFirstOne = function (zx, o, r, debugmsg) {
	//clean/prep defaults
	debugmsg = undefined;
	//r={};
	r.content = "";
	if (r.tag !== undefined)
		delete r.tag;

	r.functionname = "";
	r.table = "";
	r.field = "";
	r.query = "";

	r.method = "";

	if (r.tagtype !== undefined)
		delete r.tagtype;

	//console.log('ExtractFirstOne input: ', o,debugmsg);
	//if (o.content=='my.my') process.exit(2);

	if (o.left === "") {
		if (debugmsg !== undefined)
			console.log('ExtractFirstOne Nomore left: ', debugmsg, o.left);
		return false;
	}

	//now if it starts with select
	if (o.left.substr(0, 6).toLowerCase() === "select") {
		if (debugmsg !== undefined)
			console.log('ExtractFirstOne Select: ', debugmsg, o.left);
		r.tag = TagTypeStartSelect;
		r.method = r.tag.method;
		r.content = o.left.substr(6);
		o.left = "";
		o.right = "";
		return true;
	}

	var ftag,
	firstp = 999999;
	var lower = o.left.toLowerCase();
	TagTypes.forEach(function (tag) {
		var p = lower.indexOf(tag.open);
		//console.log('ExtractFirstOne tag.open: ', lower,tag.open, p);
		if ((p >= 0) && (p < firstp)) {
			//console.log('ExtractFirstOne tag.open: ', lower,tag.open, p);
			ftag = tag;
			firstp = p;
		}
	});

	//if (debugmsg!==undefined)
	// console.log('ExtractFirstOne found: ',debugmsg, firstp, ftag);

	if (firstp > 0) { //found const first
		r.tag = TagTypeConst;
		r.method = r.tag.method;
		r.content = o.left.substr(0, firstp);
		o.right = o.left.substr(firstp);
		o.left = "";
		if (debugmsg !== undefined)
			console.log('ExtractFirstOne found const: ', debugmsg, r.content);
		return true;
	} else //==0
	{
		if (zx.extractEscapedStringFrom(o, ftag.open, ftag.close, firstp)) {
			r.tag = ftag;
			r.method = r.tag.method;
			r.content = o.content;
			//console.log('ExtractFirstOne found xxx t,o:  ', r,o);
			extractFunctionTableField(zx, r);
			//if (debugmsg!==undefined)
			//console.log('ExtractFirstOne found func: ',debugmsg, r);
			return true;
		}
		//else

		//it should never reach here
		console.log('ExtractFirstOne should never reach here: ', debugmsg, o, r, ftag);
		process.exit(2);

	}

	//it should never reach here
	return false;
};

var recurseMacroExpansion = function (zx, line_obj, varx, QryStr) {
	//this handles macro substitution, and is independent of the dbe used
	//   makeexpression is very similar but does the actual variable expression evaluation

	var o = {},
	r = {},
	v,
	result,
	loopc = 0;

	//console.log('recurseMacroExpansion on:', QryStr,'\n',line_obj);
	result = QryStr;
	do {
		if (loopc++ > 100) {
			console.log('CRASH: ecurseMacroExpansion looping infintely: \n', QryStr, '\n', line_obj);
			process.exit(2);
		}
		//console.log('recurseMacroExpansion b4 do: \n', QryStr,"\n",result);
		QryStr = result;
		result = "";

		o.left = QryStr;
		while (exports.ExtractFirstOne(zx, o, r, 1600269)) {
			//if ( r.tag.method!=='constant')
			//console.log('recurseMacroExpansion !c : ',r.tag.method, r.content );//o, r);
			if (r.tag.recurse === true) {
				//console.log('xxxxxxxxxxxxxxxxx recurseMacroExpansion  call b4 do: \n', r.tag,"\n",result);
				if (r.tag.insert !== undefined)
					result += r.tag.insert + "";

				result += recurseMacroExpansion(zx, line_obj, varx, r.content);
				if (r.tag.insertz !== undefined)
					result += r.tag.insertz;
				//console.log('xxxxxxxxxxxxx recurseMacroExpansion  call aft do: \n', r.tag,"\n",result);
			}
			/*
			else if (r.method === "tablefieldx") {
			result += r.tag.open+r.content+r.tag.close;

			tablefield is very similar to variable...
			could be it exists as it has been defined (in full)
			could be that it exists in a "record only" like in  "into firstuser select first 1 * from me" - where first user is now a record
			-- we dont want to select all fields, so it would be handy to select only the ones used---
			-- so in the first pass here we dont find the field, but add it to a list, then on the next pass of the into we expand the * into each field
			-- when we reuse the record name for different tables this will be a problem -- not allowed to do that
			--      dialrecord in bpm does this in order to select a record from sales or lead table
			}
			 */
			else if ((r.method === "variable") || (r.method === "tablefield")) {
				var vary = zx.variables.named[r.content.toLowerCase()];
				//console.log('recurseMacroExpansion step : ', vary,r.content);
				if (vary === undefined) {
					v = {
						rfn : r.content,
						table : r.table,
						field : r.field
					};
					zx.variables.required[r.content.toLowerCase()] = v;
					if (r.content.toLowerCase() === "operator.operator")
						process.exit(2);

					if (zx.pass > 2) {
						console.log('recurseMacroExpansion MISSSING VARIABLE !!!!!!!!!!!!!!!!!!!!!!!!!!! : {', r.content, '}'
							//,line_obj,'\n'
							//,zx.variables.named
						);
						zx.err = {};
						zx.err.classs = "MISSSING VARIABLE";
						zx.err.message = zx.err.classs + " : " + r.content;
						zx.err.source_line = line_obj.srcinfo.start_line;
						zx.err.source_col = line_obj.srcinfo.start_col;
						zx.err.source_file = line_obj.srcinfo.filename;
						zx.err.err = line_obj.srcinfo.source;
					}

					if (varx.target_type === 'paramitizedstatement')
						result += '?';

				} else {
					if (vary.isvariable === true) { //assign the variabes by name
						if (varx.target_type === 'paramitizedstatement')
							result += '?';
						else {
							result += '' + zx.dbg.emit_var_ref(r.content);
							vary.varused++;
						}
					} else {
						if (vary.target_type === 'macro') {
							//console.log('recurseMacroExpansion expand : ', r.content,' to ', vary.source);
							result += vary.source;
						}
						if (vary.target_type === 'var') {
							//console.log('RecurseVariable expanded : ', r.content);
							if (varx.target_type === 'paramitizedstatement')
								result += '?';
							else {
								vary.varused++;
								result += '' + zx.dbg.emit_var_ref(r.content);
							}
						}
					}
				}
			} else if ((r.method === "getter")) {
				if ((varx.target_type === 'paramitizedstatement'))
					result += '?';
				else {
					v = {
						rfn : r.content,
						table : r.content.split('.')[0],
						field : r.content.split('.')[1]
					};
					result += zx.dbg.emit_variable_getter(zx, line_obj, v, "expression variable_getter");
					//console.log('getter.method: ', v,result,varx.target_type);
				}
			} else {
				//result += "<CC"+r.content+'vvv'+r.method+"CC>";
				//console.log('r.method: ', r.method);//,o, r);
				result += r.content;
			}

			o.left = o.right;

			//console.log('recurseMacroExpansion o,r : ', o, r);
		}

		//console.log('recurseMacroExpansion done: \n', QryStr,"\n",result);
	} while (QryStr !== result); //
	return result;
};

//bool TPWFormat::ContextValue(TIBSQL *sql,AS QryStr,AS &Result,AS LogContext)
exports.MacroExpansion = function (zx, line_obj, varx, QryStr /*, DebugContext*/
) {
	//console.log('\n\nExpression b4 validate : ',DebugContext, QryStr);
	QryStr = zx.dbg.validateExpression(zx, line_obj, QryStr);
	//console.log('Expression: ', varx.DebugContext, QryStr);
	//console.log('\n\nExpression: ',DebugContext, QryStr);
	QryStr = recurseMacroExpansion(zx, line_obj, varx, QryStr);
	varx.source = QryStr;
	//console.log('\n\nrecurseMacroExpansion: ',DebugContext, QryStr);
	return varx;
};

exports.AnonymousExpression = function (zx, line_obj, val, target_type /*, DebugContext*/
) {
	var varx = {};
	varx.key = "";
	varx.target_type = target_type;
	exports.MacroExpansion(zx, line_obj, varx, val, "AnonymousExpression");
	var expr = zx.dbg.makeexpression(zx, line_obj, varx);

	return expr;
};

exports.ConstantExpressions = function (zx, line_obj, QryStr, target_type, DebugContext) { //this is for the postback instructions for updates an links
	//combine with : TextWithEmbededExpressions = function (zx, line_obj, QryStr, DebugContext) { //this is not "true expression" it is the text from tag_print
	// expressions are only resolved at the top level,
	// in the calling process, the text will later be ouput as html and the expressions properly resolved

	if (QryStr instanceof Array) {
		QryStr = QryStr.join('\n');
	}
	var varx = {};
	varx.key = "";
	varx.target_type = target_type;
	exports.MacroExpansion(zx, line_obj, varx, QryStr, "ConstantExpressions" + DebugContext);
	var QryStrExpanded = varx.source;

	var o = {
		left : QryStrExpanded
	},
	r = {},
	val;

	if (DebugContext !== undefined)
		console.log('ConstantExpressions: ', DebugContext, target_type, QryStr, '\n\nexpanded:', QryStrExpanded);
	var whilec = 0;
	var result = "";
	while (zx.expressions.ExtractFirstOne(zx, o, r, 1600434 /*,1*/
		)) {
		whilec++;
		if (DebugContext !== undefined)
			console.log('ConstantExpressions o,r : ', o, r);
		if (r.method === "constant") {
			result += r.content;
			if (DebugContext !== undefined)
				console.log('ConstantExpressions constant : ', r.content);
		}
		//else if (r.method === "variable") {
		else {
			//evaluate the expression
			if (r.tag.insert !== undefined)
				val = r.insert + r.content;
			else
				val = r.content;
			line_obj.vari = whilec;

			if (target_type === "text") {
				varx = zx.var_control.AnonymousVariable(zx, line_obj, "ConsExpr", val, "var", DebugContext);
				varx.varused++;
				zx.dbg.EmitVariable(zx, line_obj, varx.key);
				result += "{{" + varx.key + "}}";
			}
			if (target_type === "postback") {
				if (DebugContext !== undefined)
					console.log('ConstantExpressions postback : ', val);
				varx = exports.AnonymousExpression(zx, line_obj, val, target_type, DebugContext);
				result += '\'\'\'||' + varx + "||\'\'\'";
			}
			if (target_type === "paramitizedstatement") { //moment identical to post back but should .....
				if (DebugContext !== undefined)
					console.log('ConstantExpressions paramitizedstatement : ', val);
				varx = exports.AnonymousExpression(zx, line_obj, val, target_type, DebugContext);
				result += '\'\'\'||' + varx + "||\'\'\'";
			}
			//zx.mt.lines.push("eval(" + varx.key+ " as " + varx.source + ")");
		}
		o.left = o.right;
	}

	if (target_type === "text") {
		zx.mt.lines.push(result);
	}
	return result;
};

exports.TextWithEmbededExpressions = function (zx, line_obj, QryStr, dest, Context) { //this is not "true expression" it is the text from tag_print
	// expressions are only resolved at the top level,
	// in the calling process, the text will later be ouput as html and the expressions properly resolved

	if (QryStr instanceof Array) {
		QryStr = QryStr.join('\n');
	}

	var o = {
		left : QryStr
	},
	r = {},
	val;

	//console.log('TextWithEmbededExpressions: ', Context, QryStr);
	var whilec = 0;
	var result = "";
	while (zx.expressions.ExtractFirstOne(zx, o, r, 1600502)) {
		whilec++;
		//console.log('TextWithEmbededExpressions o,r : ', o, r);
		if (r.method === "constant") {
			result += r.content;
			// console.log('TextWithEmbededExpressions push htnl : ', r.content);
		} else {
			//evaluate the expression
			//if (r.tag.insert !== undefined)  val =  r.insert + r.content;
			//else val = r.content;
			if (r.tag === undefined)
				console.log('TextWithEmbededExpressions create variable for : ', r, val);
			if (r.tag.insert !== undefined)
				val = r.tag.insert + r.content + r.tag.insertz;
			else if (r.tag.addback === false)
				val = r.content;
			else
				val = r.tag.open + r.content + r.tag.close;
			line_obj.vari = whilec;

			var varx = zx.var_control.AnonymousVariable(zx, line_obj, Context, val, "var", Context);
			//console.log('TextWithEmbededExpressions create variable for : ', r,val,varx);
			varx.varused++;

			zx.dbg.EmitVariable(zx, line_obj, varx.key);

			if (dest === "mt")
				result += "{{" + varx.key + "}}";
			else
				result += ":" + varx.key + " ";
			//zx.mt.lines.push("eval(" + varx.key+ " as " + varx.source + ")");
		}
		o.left = o.right;
	}

	return result;
};

exports.start_pass = function (/*zx, line_objects*/
) {
	//console.log('Epression start_pass: ', zx.pass);

};

exports.unit_test = function () {
	//
	var o = {},
	r = {};
	//o.left = " this is hashed variable types #variable# done";
	o.left = ' name from Me where #testmacro#';
	exports.ExtractFirstOne(o, r);
	console.log('unit test: ', o, r);
	if (0) {
		o.left = " this is hashed table types #table.field# done";
		exports.ExtractFirstOne(o, r);
		console.log('unit test: ', o, r);

		o.left = " this is hashed function table types #call(table.field)# done";
		exports.ExtractFirstOne(o, r);
		console.log('unit test: ', o, r);

		o.left = " this is master function table types master.ref done";
		exports.ExtractFirstOne(o, r);
		console.log('unit test: ', o, r);
	}
};
//exports.unit_test();
//process.exit(2);;

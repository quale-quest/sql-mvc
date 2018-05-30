"use strict";
/*
speed/memory performance  is not important
ease of use is important
 */
/*

handles scripting
tries to be db agnostic...relies on generic functions of the dbe

lot of wording ewxpresses sql or firebird PSQL, this is not the intent to limit it, just the lingo of the first platform

 */

/*
 */

/*
variables are expressed as firebird PSQL
fill constants are just that.
master.ref is replaced with #master_ref#
## gets expanded to '||var||'

keep a log of each record. master. being accessed they will need to be manually assigned later


a significan variance in the varaibles is the use of field short hands using assignments,
although this could be made fully generic it is not the intention to make it so,
thus we must optimise this case to simple text substitutions

 */
 
 exports.module_name='script_control.js';
 exports.tags=[
 {name:"script"},
 {name:"procedure"},
 {name:"master"}
 ];

var zx_script_debugscript =0;
 
var script_into = function (zx, line_obj, r) {

	var name;
	//recname = r.content;

	/* into recordname select * from where .....;
	- this looks for which names in zx.variables.required[] start with recordname.
	then include each one into the wildcard name
	 */

	//find record fields required to define


	//produce the actual script code for the into record statement
	var params = r.content;

	params = params.replace(/\n/, " "); //1 line

	var recprefix = zx.parseword(params).toLowerCase() + '.';
	params = zx.removeword(params);
	//console.log('tag_script xxxxxxxxx : ', params,' of ',recprefix);
	//console.log('tag_script xxxxxxxxxzz : ',zx.variables);
	var mssqlfieldnames = [];
	var fieldnames = [];
	var varnames = [];
	for (name in zx.variables.required) {
		                         //console.log('tag_script  fields for : ', recprefix,' of ',name);
		if (recprefix === name.substring(0, recprefix.length)) {
			var nameonly = name.substring(recprefix.length);
			var varx = {
				key : name.toLowerCase(),
				isvariable : true
			};
			//console.log('tag_script  fields for : ', recprefix,' of ',name);
			//zx.dbg.emit(zx, line_obj, "--p4 ='" + name + "'", "script_into");
			var vname=zx.dbg.emit_var_ref(name,zx);
			varnames.push(vname);
			//zx.dbg.emit(zx, line_obj, "--p4.1 ='" +name +";"+ vname +";"+JSON.stringify(varnames)  + "'", "script_into");
			fieldnames.push(nameonly);
			mssqlfieldnames.push(''+vname+'='+nameonly);
			//zx.dbg.emit(zx, line_obj, "--p5 ='" + JSON.stringify(fieldnames) + "'", "script_into");
			//- we should do a better way - not direct - split declare and define  functionszx.dbg.DeclareVar(zx,line_obj,varx);
			zx.sql.declare_above[varx.key] = {
				name : varx.key,
				db_type : "varchar(1000)"
			};
			zx.variables.named[name.toLowerCase()] = varx;
		}
	}
	//zx.dbg.emit(zx, line_obj, "--p6 ='" + JSON.stringify(varnames) + "'", "script_into");
	//console.log('tag_script ww... : ', fieldnames);

	if (fieldnames.length > 0) {
		var field = fieldnames.join(',');
		var vars = varnames.join(',');
		var mssqlfields = mssqlfieldnames.join(',');
		//console.log('tag_script  fields into : ', recprefix,' of ',field);
		
		//zx.dbg.emit(zx, line_obj, "--p12 ='" + JSON.stringify(field) + "'", "script_into");
		//zx.dbg.emit(zx, line_obj, "--p13 ='" + JSON.stringify(varnames) + "'", "script_into");
		var complex = false;
		if (params.indexOf('#defaultmastertable#') > 0) {
			params = params.replace(/#defaultmastertable#/g, zx.conf.db.platform_user_table.user_table_name);
		}
		if (params.indexOf('::') > 0) {
			console.log('script_into   params : ',params);
			params = params.replace(/::/g, zx.config.db.var_actaul);
			complex = true;
		}
		/*                    if (params.indexOf('#overridemastertable#')>0){
		//special keyword //perform this as a execute statement query
		if (zx.overridemastertable !== undefined)
		params = params.replace(/#overridemastertable#/g,zx.overridemastertable);
		else params = params.replace(/#overridemastertable#/g,":-overridemastertable");
		complex=true;
		}*/

		//zx.dbg.emit(zx, line_obj, "--p3 ='" + vars + "'", "select into statement");
		//console.log('TextWithEmbededExpressions tag_script i',params,vars);
		
		var b4 = params;
		params = zx.expressions.TextWithEmbededExpressions(zx, line_obj, params, "sql", "tag_script");
		//console.log('TextWithEmbededExpressions tag_script r',params,vars);
		if (b4 !== params) {
			//process.exit(2);
			complex = true;
			console.log('TextWithEmbededExpressions tag_script complex   : ',b4);
		}

		if (complex) {
			// inject  '''||  and  ||'''  around variables starting :   as in '''||:pki||''');
			// provide for unqoted syntax with :-
			console.log('TextWithEmbededExpressions tag_script b4   : >'+b4+'<');
			console.log('TextWithEmbededExpressions tag_script vars : ',vars);
			console.log('TextWithEmbededExpressions tag_script names: ',fieldnames);
			console.log('TextWithEmbededExpressions tag_script      : >'+params+'<');
			
			params = zx.escape_scriptstring(zx, params, 1, /:[^\-]/g, "", "'''||:", "||'''");
			params = zx.escape_scriptstring(zx, params, 2, /:-/g, "", "'||:", "||'");
			params = params.replace(/\*/, field);
			zx.dbg.emit(zx, line_obj, "-- p1 ='" + params + "'", "select into statement");
			zx.dbg.emit(zx, line_obj, zx.config.db.sql_set_prefix + "st='" + params + "';", "select into statement");
			zx.dbg.emit(zx, line_obj, "execute statement st into " + vars + ";", "select into statement");
			//if (zx.pass!==1) 
			//   throw new Error("todo redo complex master table dereferencing ");
		} else { //simple direct query

			if (zx.fb25) { 
				params = params.replace(/\*/, field);
				params = params + ' into ' + vars + ';';
			} else if (zx.mysql57) { 
				params = params.replace(/\*/, field);
				params = params + ' into ' + vars + ';';
			} else if (zx.mssql12) { 
				params = params.replace(/\*/, mssqlfields);
				//console.log('script_into mssql12 : ', params,"\r\n",vars);
			} else throw new Error("dialect code missing");
		
			
			//zx.dbg.emit(zx, line_obj, "-- p2 ='" + params + "'", "select into statement");
			zx.dbg.emit(zx, line_obj, params, "select into");
		}
		//console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!! : \r\n{', r.content,'}',params, '\n',zx.variables.named);
		//console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!! : \r\n ', line_obj,'\n');
		//console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!! : \r\n{', r.content,'}', line_obj,'\n',zx.variables.named);
		//console.trace('!!!!!!!!!!!!!!!!!!!!!!!!!!! : \r\n', zx.sql.script);
		//process.exit(2);
	}
	//console.log('tag_script ...rrrrrrrr : ', params,"\r\n",zx.sql.script);
	//process.exit(2);
};

var script_remark = function (/*zx, line_obj, r*/
) {
	//do nothing
};
var script_set = function (zx, line_obj, r) {

	var v = {
		rfn : r.content,
		table : r.content.split('.')[0],
		field : r.content.split('.')[1]
	};

	var params = r.content;
	v.table = zx.parseword(params);
	params = zx.removeword(params).substring(1);
	v.field = zx.parseword(params);
	v.params = zx.removeword(params).substring(1);
	//console.log('script_set 2: ',v);
	zx.dbg.emit_variable_setter(zx, line_obj, v, "script emit_variable_setter");

};

var script_as_is = function (zx, line_obj, r) {
	var params = zx.expressions.TextWithEmbededExpressions(zx, line_obj, r.content, "sql", "script_as_is");
	zx.dbg.emit(zx, line_obj, r.tag.open + params + (r.tag.close === undefined ? "" : r.tag.close), 'script_as_is:' + r.tag.open);
};


var script_if_then = function (zx, line_obj, r) {
	var params = zx.expressions.TextWithEmbededExpressions(zx, line_obj, r.content, "sql", "script_as_is");
	var thn = r.tag.close;
	if (zx.mssql12) thn="";
	zx.dbg.emit(zx, line_obj, r.tag.open + params + thn, 'script_as_is:' + r.tag.open);
};


var script_declare = function (zx, line_obj, r) {
	var params = r.content;
	var name = zx.parseword(params).toLowerCase();
	params = zx.removeword(params);
	zx.sql.declare_above[name] = {
		name : name,
		db_type : params
	};
};

var script_sql = function (zx, line_obj, r) {	
	var params = zx.expressions.TextWithEmbededExpressions(zx, line_obj, r.content, "sql", "script_sql");
	//zx.dbg.emit(zx, line_obj, ' /* script_sql ' + params + '; */', "script_sql");
	zx.dbg.emit(zx, line_obj, '' + params + ';', "script_sql");
};
/*
/*the following has been replaced with  script_as_is
var script_insert = function (zx, line_obj, r) {
var params = r.content;
var b4 = params;
params = zx.expressions.TextWithEmbededExpressions(zx, line_obj, params, "sql", "script_insert");
//only complex quries params = escape_scriptstring(zx,params,":","","'''||:","||''');
zx.dbg.emit(zx, line_obj, 'insert ' + params + ';', "script insert");
};
var script_ifthen = function (zx, line_obj, r) {
var params = zx.expressions.TextWithEmbededExpressions(zx, line_obj, r.content, "sql", "script_ifthen");
zx.dbg.emit(zx, line_obj, 'if ' + params + ' then ', "script_ifthen");
};
var script_else = function (zx, line_obj, r) {
zx.dbg.emit(zx, line_obj, r.tag.open, "script_else");
};
var script_begin = function (zx, line_obj, r) {
zx.dbg.emit(zx, line_obj, r.tag.open, "script_begin");
};
var script_end = function (zx, line_obj, r) {
zx.dbg.emit(zx, line_obj, r.tag.open, "script_as_is:" + r.tag.open);
};*/

var script_dooverridemastertable = function (zx, line_obj /*, r*/
) {
	//zx.overridemastertable='xxxx';
	if (zx.overridemastertable !== undefined)
		zx.dbg.emit(zx, line_obj, "overridemastertable='" + zx.overridemastertable + "';", "script_dooverridemastertable");
};

var script_overridemastertable = function (zx, line_obj, r) {
	zx.overridemastertable = r.content;
};
var script_defaultmastertable = function (zx, line_obj, r) {
	zx.defaultmastertable = r.content;
};
var script_breakpoint = function (/*zx, line_obj, r*/
) {
	//TODO add script break point debug info
	console.trace('process.exit(2) from script_breakpoint : '); process.exit(2); ///breakpoint in file
};

var script_debugscript = function (zx, line_obj, r) { //TODO
  console.log('script_debugscript : ', r);
  zx_script_debugscript = +r.content;  
};
var script_assign = function (/*zx, line_obj, r*/
) { //TODO
};

var script_jsvar = function (/*zx, line_obj, r*/
) { //TODO or deprecate
};
var script_print = function (/*zx, line_obj, r*/
) { //TODO
};
var script_movefile = function (/*zx, line_obj, r*/
) { //TODO
};
var script_system = function (/*zx, line_obj, r*/
) { //TODO
};

var script_cdv_check = function (/*zx, line_obj, r*/
) { //TODO
};

var TagTypes =
	[{
		"open" : "into ",
		"close" : ";",
		"callback" : script_into

	}, {
		"open" : "assign overridemastertable ",
		"close" : ";",
		"callback" : script_overridemastertable
	}, {
		"open" : "execute overridemastertable",
		"close" : ";",
		"callback" : script_dooverridemastertable
	}, {
		"open" : "assign defaultmastertable ",
		"close" : ";",
		"callback" : script_defaultmastertable
	}, {
		"open" : "debugscript",
		"close" : ";",
		"callback" : script_debugscript
	}, {
		"open" : "scriptdebug",
		"close" : ";",
		"callback" : script_debugscript
	}, {
		"open" : "assign ",
		"close" : ";",
		"callback" : script_assign
	}, {
		"open" : "jsvar ",
		"close" : ";",
		"callback" : script_jsvar
	}, {
		"open" : "print ",
		"close" : ";",
		"callback" : script_print
	}, {
		"open" : "cdv_check",
		"close" : ";",
		"callback" : script_cdv_check
	}, {
		"open" : "movefile ",
		"close" : ";",
		"callback" : script_movefile
	}, {
		"open" : "system ",
		"close" : ";",
		"callback" : script_system
	}, {
		"open" : "breakpoint",
		"close" : ";",
		"callback" : script_breakpoint
	}, {
		"open" : "rem ",
		"close" : ";",
		"callback" : script_remark
	}, {
		"open" : "sql ",
		"close" : ";",
		"callback" : script_sql
	}, {
		"open" : "declare ",
		"close" : ";",
		"callback" : script_declare
	}, {
		"open" : "set ",
		"close" : ";",
		"callback" : script_set
	}, {
		"open" : "update ",
		"close" : ";",
		"callback" : script_as_is
	}, {
		"open" : "select ",
		"close" : ";",
		"callback" : script_as_is
	}, {
		"open" : "insert ",
		"close" : ";",
		"callback" : script_as_is
	}, {
		"open" : "if ",
		"close" : "then",
		"callback" : script_if_then
	}, {
		"open" : "else",
		"xclose" : "",
		"callback" : script_as_is
	}, {
		"open" : "begin",
		"xclose" : "",
		"callback" : script_as_is
	}, {			
		"open" : "end if;",
		"xclose" : "",
		"callback" : script_as_is				
	}, {
		"open" : "end;",
		"xclose" : "",
		"callback" : script_as_is
	}, {			
		"open" : "end",
		"xclose" : "",
		"callback" : script_as_is

	}

];
var TagTypeConst = {
	"open" : "",
	"close" : ""

};

exports.ExtractFirstScript = function (o, r, debugmsg) {
	//clean/prep defaults
	var e;
	r.functionname = "";
	r.table = "";
	r.field = "";
	r.query = "";

	r.method = "";

	if (r.tagtype !== undefined)
		delete r.tagtype;

	if (o.left === "") {
		if (debugmsg !== undefined)
			console.log('ExtractFirstScript Nomore left: ', debugmsg, o.left);
		return false;
	}

	var ftag,
	firstp = 999999;
	var lower = o.left.toLowerCase();
	TagTypes.forEach(function (tag) {
		var p = lower.indexOf(tag.open);
		//console.log('ExtractFirstScript tag.open: ', lower,tag.open, p);
		if ((p >= 0) && (p < firstp)) {
			//emit(zx, 0, "-- sc1:"+ p + " " + tag.open, "");
			//console.log('TagTypes.forEach tag.open: ', tag.open, p);
			ftag = tag;
			firstp = p;
		}
	});

	if (debugmsg !== undefined)
		console.log('ExtractFirstScript found: ', debugmsg, firstp, ftag);
	
	if (zx_script_debugscript>5)
		console.log('!!!!!!!!!!!!!!!!!!!!!!!', debugmsg, firstp, ftag);

	if (firstp > 0) { //found const first
	    //console.log('ExtractFirstScript the tagaaaa: ',ftag);
		r.tag = TagTypeConst;
		r.method = r.tag.method;
		r.content = o.left.substr(0, firstp);
		o.right = o.left.substr(firstp);
		o.left = "";
		if (debugmsg !== undefined)
			console.log('ExtractFirstScript found const: ', debugmsg, r.content);
		return true;
	} else //==0
	{
		//console.log('ExtractFirstScript the tag: ',ftag);
		if (ftag.close === undefined) { //only one word
			//console.log('ExtractFirstScript only one word: ',ftag);
			e = ftag.open.length;
			r.tag = ftag;
			r.method = r.tag.method;
			r.content = o.left.substring(ftag.open.length, e);
			o.right = o.left.substr(e);
			o.left = "";
			return true;
		} else {
			e = lower.indexOf(ftag.close);
			if (e <= 0)
				e = lower.length;
			r.tag = ftag;
			r.method = r.tag.method;
			r.content = o.left.substring(ftag.open.length, e);
			o.right = o.left.substr(e + ftag.close.length);
			o.left = "";
			//if (debugmsg!==undefined)
			//console.log('ExtractFirstScript found func: ',debugmsg, r);
			return true;
		}
		//else
	}
	//it should never reach here
	console.log('ExtractFirstScript should never reach here: ', debugmsg, o, r, ftag);
	console.trace('process.exit(2) from ExtractFirstScript : ');process.exit(2);
	//it should never reach here
	return false;
};

exports.tag_master = function (zx, o) {
    if (zx.pass!==1) return;
    if (!o.table) o.table=o.array[0];
    if (!o.table) return;
    zx.overridemastertable = o.table;    
}

exports.tag_script = function (zx, line_obj) {
	// if (active_pass!=zx.pass) return true;
	//other scripts only run once

	var o = {},
	r = {};

	o.name = zx.gets(line_obj.select);

	o.left = zx.gets(line_obj.nonkeyd);
	//console.log('tag_script line_obj script : ', line_obj,o.left);
	o.left = o.left.replace(/\n/, " "); //1 line

	if (o.left.indexOf('#defaultmastertable#') > 0) {
		o.left = o.left.replace(/#defaultmastertable#/g, zx.conf.db.platform_user_table.user_table_name);
		//console.log('-------------------------tag_script o.left : ', o.left);
		//process.exit(2);
	}
	while (exports.ExtractFirstScript(o, r /*, "tag_script"*/
		)) {
		//console.log('-------------------------tag_script o,r : ', o, r);
		//this is very sql dialect specific code and should be generalised and moved into the drivers -or make this into a drive
		// it will be usefull if this diver does some sql normilastion between dialects
		if (r.tag.callback !== undefined) {
			r.tag.callback(zx, line_obj, r);
			//console.log('-------------------------returened tag.callback o,r : ', o, r);
		} else {
			var s = r.content.trim();
			if (s === ';')
				s = '';
			if (s !== "" && s !== '()') {
				//console.log('-------------------------tag_script unknown s,o,r : {'+ s+ '}\n', o, r);
                //zx.error.log_syntax_warning(zx, "tag_script unknown :" , s, zx.line_obj);
				//process.exit(2); //tag_script unknown
			}
		}

		o.left = o.right;
		//console.log('tag_script o,r : ', o, r);
	} //while


};

exports.tag_procedure = function (zx, line_obj) {
	//line_obj.procedure=...
	//100% equivalent at the moment
	exports.tag_script(zx, line_obj);
};

exports.start_pass = function (/*zx, o*/
) {};

exports.start_item = function (/*zx, line_obj*/
) {};
exports.done_item = function (/*zx, line_obj*/
) {};

exports.init = function (zx) {
	//
	//console.log('init script: ');
	
	zx.defaultmastertable = 'me'; //default if no real file is found - me
	delete zx.overridemastertable; //overwrites what ever file is found - allow me or real file

	//    zx.variables = {};
	//	zx.variables.named={};
	//exports.unit_test2(zx);
	//process.exit(2);
};

exports.done = function (/*zx, o*/
) {
	//console.log('done script: ',zx.variables);
	//console.log('done script: ');

};

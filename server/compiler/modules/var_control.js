"use strict";

// storing macro's and variables, checking how often they are used.....
// db agnostic

/*
speed/memory performance  is not important
ease of use is important
 */

/*



handles variable assignment and substitution part of script control


lot of wording expresses sql or firebird PSQL, this is not the intent to limit it, just the lingo of the first platform

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



this at the moment cannot evalute when left value changes in the simple expression.......

 */
exports.module_name='var_control.js';
exports.tags=[{name:"assign"}];

exports.NamedVariable = function (zx, line_obj, key, val, target_type, DebugContext) {
	////assigns come in 2 variances, a)static text substitution, b)sql query results

	var var_save = zx.variables.named[key.toLowerCase()];
	var varx = {};

	varx.key = key;
	varx.source = val;
	varx.DebugContext = DebugContext;
	varx.target_type = target_type;
	varx.assign_count = 1;
	varx.inline = false;
	varx.varused = 0;

	zx.dbg.clasifyAssign(zx, line_obj, varx);

	if (var_save === undefined) { //first instance

	} else {
		if (var_save.simpletext === false)
			varx.simpletext = false;
		varx.assign_count += var_save.assign_count;
		varx.varused += var_save.varused;
	}

	//macros are just stored- evaluated at use time
	// variables are evaluated at define time
	//console.log('define : ',key,varx.target_type,"\n",val);
	if (varx.target_type === "macro") //target type is to a macro - means we delay evaluation until the macro is used
	{
		//console.log('macro : ',key,val,"\n",varx,var_save);
		//stored as is - expand macros
	} else { //var //target type is to a variable - we have to evaluate it now
		//console.log('NamedVariable before MacroExpansion : ',key,val,"\n",varx);
		zx.expressions.MacroExpansion(zx, line_obj, varx, val, varx.target_type, "set NamedVariable-" + DebugContext);
		//console.log('NamedVariable after MacroExpansion : ',key,val,"\n",varx);
		varx.expr = zx.dbg.makeexpression(zx, line_obj, varx);
		//console.log('NamedVariable after makeexpression : ',key,val,"\n",varx);

		//if (varx.varused) // pass 1 this will not output any  dbg code
		{
			//if (active_pass==zx.pass)
			zx.dbg.DeclareVar(zx, line_obj, varx); //expand expression
		}
	}
	zx.variables.named[key.toLowerCase()] = varx;

	return varx;
};

exports.AnonymousVariable = function (zx, line_obj, anon_class, val, target_type, DebugContext) {
	// cannot use real anon - changes in compile phase will through names off - use source line number based, names zx.variables.AnonymousIndex++;
	var key = zx.UniqueName(zx, line_obj, anon_class);
	return exports.NamedVariable(zx, line_obj, key, val, target_type, DebugContext);
};

var assignFromText = function (zx, line_obj, txt, target_type) {
	////assigns come in 2 variances, a)static text substitution, b)sql query results

	var p = txt.indexOf("=");
	var key = txt.substr(0, p);
	var val = txt.substr(p + 1);
	if ((val.slice(0, 1) === "'") && (val.slice(-1) === "'"))
		val = val.slice(1, -1);

	//..special handling....
	if (val.indexOf('#defaultmastertable#') > 0) {
		val = val.replace(/#defaultmastertable#/g, zx.conf.db.platform_user_table.user_table_name);
	}
	if (zx.defaultmastertable === undefined)
		process.exit(2);

	//console.log('assignFromText: ',txt,"\n",type,key,val,"\n\n");
	exports.NamedVariable(zx, line_obj, key, val, target_type, "assignFromText");
	return;
};

exports.AssignKeys = function (zx, line_obj) {
	////assigns come in 2 variances, a)static text substitution, b)sql query results

	//console.log('AssignKeys: ',line_obj);
	if (line_obj.assign !== undefined) {
		line_obj.assign.forEach(function (entry) {
			assignFromText(zx, line_obj, entry, "assign");
		});
    }
	if (line_obj["var"] !== undefined) {
        console.log('assignFromText: line_obj[var] ',line_obj["var"]);        
        zx.forFieldsx(line_obj["var"],function (entry) {
		//line_obj["var"].forEach(function (entry) {
             console.log('assignFromText: var ',entry);
			assignFromText(zx, line_obj, entry, "var");
		});
    }
	if (line_obj.macro !== undefined) {
		line_obj.macro.forEach(function (entry) {
			assignFromText(zx, line_obj, entry, "macro");
		});
    }    

	//console.log('script: ',line_obj);
	return line_obj;
};
exports.assignTag = function (/*zx, obj*/
) {
	//this is from a tag key= val=
	// not used anywhere in v2
	//console.log('assign: ',obj);
	return;
};

exports.tag_assign = function (zx, o) {
	//if (active_pass!=zx.pass) return ;
	exports.assignTag(zx, o);
};

exports.done_pass = function (/*zx, line_objects*/
) {
	// console.log('Variable done_pass: ',zx.pass);

};

exports.start_pass = function (zx /*, line_objects*/
) {
	var name;
	// console.log('Variable start_pass: ',zx.pass);
	//console.log('check variables: ',zx.variables);
	zx.variables.AnonymousIndex = 0;

	for (name in zx.variables.named) {
		zx.variables.named[name.toLowerCase()].assign_count = 0;
		//zx.variables.named[name.toLowerCase()]].varused=true;
	}

	//console.log('check variables: ',zx.variables);
	for (name in zx.variables.required)
		zx.variables.required[name].done = false;

};

exports.start_item = function (zx, line_obj) {
	//console.log('var_control start_item: ',line_obj);
	exports.AssignKeys(zx, line_obj);
	//all the assign keys in all the statements
};

exports.done_item = function (/*zx, line_obj*/
) {};

exports.init = function (zx) {
	//
	//console.log('init var: ');
	zx.variables = {};
	zx.variables.AnonymousIndex = 0;
	zx.variables.named = {};
	zx.variables.required = {}; //this is assembled from conditionals and selects from tables,widgits
	//exports.unit_test2(zx);
	//process.exit(2);
};

exports.done = function (/*zx, o*/
) {
	//console.log('done variables: ');
	//console.log('done script: ',zx.variables.named);
	//console.log('var required: ',zx.variables.required);
	//we don't emit variables unless they are used
	//for (var name in zx.variables.named) {
	//var varx = zx.variables.named[name.toLowerCase()];
	//if (varx.DebugContext=='eval_ifexistsxxx')
	//if (varx.varused)
	//	console.log('Variable: ',varx);
	//}

};

exports.unit_test = function (zx) {
	//
	var o = {};
	//    o.str=" this is hashed variable types #variable# done";
	//	assignFromText(zx,o,"ref=where boss=operator.ref and ref=#master.ref# and ");
	assignFromText(zx, o, "ref=select name from me where parentme=operator.ref and ref=#master.ref# and status=($select first 1 status from file$) ");
	console.log('unit_test2aX: ', zx.variables.named.ref);

};

//exports.unit_test();
//process.exit(2);

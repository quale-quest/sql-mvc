"use strict";
/*
speed/memory performance  is not important
ease of use is important
 */
/*
Purpose is handle flow control separate from database engine, so db engine is easier to port

 */

/*
strategy dealing with conditionals

conditional is evaluated to single if statement
if there is a "block tag" a additional opening begin is placed
each tag gets wrapped in a begin/end
on elseblock	we do  end else begin statements
on unblock	we do a end statement

The block "names" are  pushed on a stack in the compiler
named  elseblock and unblock the name is only used as a warning(or error) that the blocking is misaligned


for each blockif and elseblock a mt variable is emitted to sync the data between mt and db

 */

/*
strategy dealing with conditionals
flow control is done in flowcontrol.js based on this pattern
cond=true;
if (cond) cond=.....
if (cond) cond=.....
output (key<=cond)
if (cond)
begin
end
else
begin
end

any db language code can ge generated as long as it follows this flow pattern
the else part is optional

it does not matter what the db is  as long as it can produce the
fullstach json format


 */

 exports.module_name='flow_control.js';
 exports.tags=[{name:"ifblock"},{name:"elseblock"},
{name:"unblock"},{name:"include"}];
 
var append_conditional = function (a, b, pre, post) {
	b.forEach(function (entry) {
		a.push({
			pre : pre,
			cond : entry,
			post : post
		});
	});
};

exports.is_conditional = function (zx, o) {

	//common conditional keys - they have to be all true else the operation is skipped

	//if (zx.pass==1)
	//only build the consolidated conditionals on the first pass ...?
	if (o.and_if === undefined)
		o.and_if = [];

	if (o.when !== undefined) { //make the database query and add it to if exists list
		append_conditional(o.and_if, zx.getA(o.when),
			'not run_procedure=\'',
			'\'');
	}

    var keyqry =   
            "select first 1 "+zx.conf.db.platform_user_table.user_pk_field+" from "+
             zx.conf.db.platform_user_table.user_table_name + " where "+
             zx.conf.db.platform_user_table.user_pk_field+"=:operator$ref and  "+
             zx.conf.db.platform_user_table.user_keys_field + " containing '";
             
	if (o.key !== undefined) { //make the database query and add it to if exists list
		append_conditional(o.and_if, zx.getA(o.key),"not exists ("+keyqry,"')");
	}
	if (o.notkey !== undefined) { //make the database query and add it to if(not) exists list
        append_conditional(o.and_if, zx.getA(o.notkey),"exists ("+keyqry,"')");
	}
	if (o.ifkey !== undefined) { //make the database query and add it to if exists list
    
    //console.log('ifkey conditionals is :',keyqry,zx.getA(o.ifkey));
        append_conditional(o.and_if, zx.getA(o.ifkey),"not exists ("+keyqry,"')");
	}
	if (o.ifnotkey !== undefined) { //make the database query and add it to if(not) exists list
        append_conditional(o.and_if, zx.getA(o.ifnotkey),"exists ("+keyqry,"')");
	}

	if (o.ifempty !== undefined) { //make the database query and add it to if(not) exists list
		append_conditional(o.and_if, zx.getA(o.ifempty), ' ', '==\'\''); //this is correct - negative test
	}
	if (o.ifnotempty !== undefined) { //make the database query and add it to if(not) exists list
		append_conditional(o.and_if, zx.getA(o.ifnotempty), ' ', '!=\'\''); //this is correct - negative test
	}
	if (o.ifblank !== undefined) { //make the database query and add it to if(not) exists list
		append_conditional(o.and_if, zx.getA(o.ifblank), ' ', '==\'\''); //this is correct - negative test
	}
	if (o.ifnotblank !== undefined) { //make the database query and add it to if(not) exists list
		append_conditional(o.and_if, zx.getA(o.ifnotblank), '', '!=\'\''); //this is correct - negative test
	}
	if (o.ifnumber !== undefined) { //make the database query and add it to if(not) exists list
		append_conditional(o.and_if, zx.getA(o.ifnumber),
			' (', ' similar to \'[[:DIGIT:]]*\')'); //this is correct -already  negative test
	}
	if (o.ifnotnumber !== undefined) { //make the database query and add it to if(not) exists list
		append_conditional(o.and_if, zx.getA(o.ifnotnumber),
			'not (', ' similar to \'[[:DIGIT:]]*\')'); //this is correct - already negative test
	}

	if (o.ifrandom !== undefined) { //make the database query and add it to if(not) exists list
		//random=100  means at random 1 in 100 will execute
		append_conditional(o.and_if, zx.getA(o.ifrandom),
			'(select cast (rand()* ', 'as integer) from RDB$DATABASE)!=1'); //this is correct - negative test
	}

	if (o.ifexists !== undefined) { //make the database query and add it to if(not) exists list
		//console.warn('Flowcontrol ifexists :' );
		append_conditional(o.and_if, zx.getA(o.ifexists), ' not exists '); //this is correct - negative test
	}
	if (o.ifnotexists !== undefined) { //make the database query and add it to if(not) exists list
		append_conditional(o.and_if, zx.getA(o.ifnotexists), ' exists '); //this is correct - negative test
		//delete o.ifnotexists;
	}
	if (o["if"] !== undefined) { //make the database query and add it to if(not) exists list
		append_conditional(o.and_if, zx.getA(o["if"]), ' not '); //this is correct - negative test
	}

	if (o.and_if.length === 0) { //no conditions
		return false; //no conditions
	}

	return true; //conditions exist
};

exports.conditionals = function (zx, line_obj) {

	//database
	// if (line_obj.tag=='table')
	//   console.log('conditionals is :',line_obj);
	if (!exports.is_conditional(zx, line_obj)) { //no conditions
		//unconditional block - this does not have a end label

		exports.beginblock(zx, line_obj);
		return;
	}

	exports.eval_start(zx, line_obj);
	if (line_obj.and_if.length > 0) {
		//produce the db script code to resolve the query
		exports.eval_cond(zx, line_obj, line_obj.and_if);
	}

	exports.EmitCondition(zx, line_obj);
};

exports.eval_start = function (zx, line_obj) {
	//this initiates an evaluation sequince
	return zx.dbg.eval_start(zx, line_obj);
};

exports.eval_cond = function (zx, line_obj, conditionals) {
	//This is a AND (conditions)
	return zx.dbg.eval_cond(zx, line_obj, conditionals);
};

exports.EmitCondition = function (zx, line_obj) {
	//compiles conditional db script
	//this is conditional so we need to emit a value to moustache also
	var bid = "";
	if (line_obj.Block === undefined) { //not a goto block
		zx.vid++;
		bid = "F" + zx.vid;
		zx.fc.bid = bid;
	} else { //goto block
		bid = line_obj.Block;
		zx.fc.blockactive[bid] = true;
	}

	zx.mt.lines.push("{{#" + bid + "}}");
	zx.dbg.EmitConditionAndBegin(zx, line_obj, bid);

	return line_obj;
};

exports.beginblock = function (zx, line_obj) {
	//compiles sql   if there is no goto this wont begin a real block
	if (line_obj.Block !== undefined) {
		zx.dbg.EmitUnconditionalBegin(zx, line_obj);
	}

	return line_obj;
};

exports.elseblock = function (zx, line_obj) {
	zx.mt.lines.push("{{/" + zx.fc.bid + "}}");
	zx.dbg.elseblock(zx, line_obj);
	zx.mt.lines.push("{{#^" + zx.fc.bid + "}}");
	return line_obj;
};

exports.implicid_unblock = function (zx, line_obj) {
	if (zx.fc.bid !== undefined) { //immediate blocks can only last 1 instruction
		zx.dbg.unblock(zx, line_obj);

		zx.mt.lines.push("{{/" + zx.fc.bid + "}}");
		delete zx.fc.bid;
		return true;
	}

	return false;
};

exports.explicid_unblock = function (zx, line_obj) {
	if (!exports.implicid_unblock(zx, line_obj)) {
		var bid = line_obj.Label;
		//console.log('unblock: ',bid,zx.fc.blockactive,zx.fc.blockactive[bid]);
		zx.dbg.unblock(zx, line_obj);
		if (zx.fc.blockactive[bid] !== undefined) {
			zx.mt.lines.push("{{/" + bid + "}}");
		}

	}
	return line_obj;
};

exports.tag_ifblock = function (/*zx, o*/
) {
	//unnamed blocks, and named blocks
	// no real code most the work is done by the common conditional tags

};

exports.tag_elseblock = function (zx, o) {

	//if (active_pass!=zx.pass) return;
	exports.elseblock(zx, o);
};

exports.tag_unblock = function (zx, o) {
	//if (active_pass!=zx.pass) return;
	//console.log('unblock Tag ',i,o );
	exports.explicid_unblock(zx, o);
};

exports.tag_include = function (/*zx, o*/
) {};

exports.start_item = function (zx, line_obj) {
	//if (active_pass!=zx.pass) return true;
	//console.warn('Flowcontrol start_item :' );
	exports.conditionals(zx, line_obj);
};
exports.done_item = function (zx, line_obj) {
	//if (active_pass!=zx.pass) return true;
	exports.implicid_unblock(zx, line_obj);
};

exports.start_pass = function (zx, line_objects) {
	//if (active_pass!=zx.pass) return true;
	line_objects.forEach(function (line_obj) {
		line_obj.and_if = [];
	});
};

exports.init = function (zx) {
	//each type of database generator would be different ,//including noSQL
	zx.fc = {};
	zx.fc.blockactive = {};
};
exports.done = function (/*zx, line_objects*/
) {};

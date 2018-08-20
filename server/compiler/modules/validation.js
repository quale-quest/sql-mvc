"use strict";
/*
validation plugin
 */
var deepcopy = require('deepcopy');

exports.module_name='validation.js';
exports.tags=[{name:"validator",man_page:"Specifies the validation required for either a field or a form."}];


exports.tag_validator = function (zx, o) {
	//JS object of key:values output by name  into the fullstash structure
	//console.log('tag_validator:',o);
	//console.log('tag_validator math:',o.math);
	//console.log('tag_validator math a:',o.math.array);
	console.log('tag_validator pattern:',o.name,o.pattern);
	
	var v = deepcopy(o);
	v.name = zx.gets(o.name);
	delete v.srcinfo;
	delete v.tag;
	delete v.json_parse;
	delete v.body;
	delete v.dialect_active;
	delete v.object_ended_at;
	delete v.q;
	delete v.nonkeyd;
	delete v.and_if;
	delete v.debug;
	delete v.quale_context;
	

	/*
	v.check = zx.gets(o.check);
	v.nullok = zx.gets(o.nullok);
	v.math = zx.gets(o.math);
	v.pattern = zx.gets(o.pattern); //JS-REGEX
	v.similar = zx.gets(o.similar); //SQL-REGEX
	v.jsscript = zx.gets(o.jsscript);
	v.sqlscript = zx.gets(o.sqlscript);
	v.fails = zx.gets(o.fails);
	v.pass = zx.gets(o.pass);
	v.blank = zx.gets(o.blank);
	v.placeholder = zx.gets(o.placeholder);
	v.hint = zx.gets(o.hint);
	
	v.length = zx.geta(o.length);
	v.range = zx.geta(o.range);
	v.sub_validators = zx.geta(o.valid);
	*/
		
	zx.validators.named[v.name] =v;
	
	//console.log('\r\ntag_validator math:',v);
	zx.static_stash.Validators[v.name] = v;
	
};

exports.done_pass = function (/*zx, line_objects*/
) {

};

exports.start_pass = function (zx /*, line_objects*/
) {
	zx.static_stash.Validators={}; 
	var name;

	for (name in zx.validators.named) {
		//zx.validators.named[name.toLowerCase()].assign_count = 0;
		//zx.variables.named[name.toLowerCase()]].varused=true;
	}

	//console.log('check variables: ',zx.variables);
//	for (name in zx.validators.required)
//		zx.validators.required[name].done = false;

};

exports.start_item = function (zx, line_obj) {

};

exports.done_item = function (/*zx, line_obj*/
) {};

exports.init = function (zx) {
	zx.validators = {};
	zx.validators.named = {};
};

exports.done = function (/*zx, o*/
) {
};

exports.unit_test = function (zx) {

};

//exports.unit_test();
//process.exit(2);

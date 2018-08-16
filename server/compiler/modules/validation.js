"use strict";
/*
validation plugin
 */


exports.module_name='validation.js';
exports.tags=[{name:"validator"}];


exports.tag_validator = function (zx, o) {
	//JS object of key:values output by name  into the fullstash structure
	//console.log('tag_validator:',o);
	//console.log('tag_validator math:',o.math);
	//console.log('tag_validator math a:',o.math.array);
	var v = {};
	v.name = zx.gets(o.name);
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
		
	zx.validators.named[v.name] =v;
	
	//console.log('\r\ntag_validator math:',v);
	
	
};

exports.done_pass = function (/*zx, line_objects*/
) {

};

exports.start_pass = function (zx /*, line_objects*/
) {
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

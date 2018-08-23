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
	//console.log('tag_validator pattern:',o.name,o.pattern);
	
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
	v.length  = zx.getArrayOrUndefined(o.length);
	v.range   = zx.getArrayOrUndefined(o.range);
	v.sub_validators = zx.getArrayOrUndefined(o.valid);	
		
	v.assign_count = 0;
	zx.validators.named[v.name] =v;
	
	//console.log('\r\ntag_validator math:',v);
	zx.static_stash.Validators[v.name] = v;	
};

exports.use = function (zx, name) {	
	if (name) {
		if (zx.static_stash.Validators[name]) {
			//console.log('Validators.use:',name,zx.static_stash.Validators);
			zx.static_stash.Validators[name].assign_count += 1;
		} else {
			console.log('Validators missing/unknown:',name);
			zx.error.log_syntax_warning(zx, 'Validators missing/unknown:'+name, '', '');				
		}
	}	
}

exports.make_stash_object = function (zx) {
    var data={};
	data.Validators={};
	for (var name in zx.validators.named) {
		//console.log('Validators make_stash_object:',name,zx.validators.named[name].assign_count);
		if (zx.validators.named[name].assign_count>0) {
			data.Validators[name]=deepcopy(zx.static_stash.Validators[name]);
			delete data.Validators[name].assign_count;
		}
	}
	
	data.TablesIndex=deepcopy(zx.static_stash.TablesIndex);
	data.Data={};
	//console.log('Validators make_stash_object Data:',name,zx.static_stash.Data);	
	//console.log('Validators make_stash_object ListIndex:',name,zx.static_stash.ListIndex);
	for (var name in zx.static_stash.ListIndex) {
		if (zx.static_stash.ListIndex[name].assign_count>0) {
			data.Data[name]=zx.static_stash.Data[name];
		}
	}
	return data;
};

exports.done_pass = function (zx) {
	for (var name in zx.validators.named) {
		//console.log('Validators done_pass:',name,zx.validators.named[name].assign_count);
	}
};

exports.start_pass = function (zx /*, line_objects*/
) {
	zx.static_stash.Validators={}; 
	for (var name in zx.validators.named) {
		zx.validators.named[name].assign_count = 0;
	}
};

exports.start_page = function (zx, line_obj) {
    zx.static_stash={};
	zx.static_stash.Data={}; 
};

exports.init = function (zx) {
	zx.validators = {};
	zx.validators.named = {};
};


exports.unit_test = function (zx) {

};

//exports.unit_test();
//process.exit(2);

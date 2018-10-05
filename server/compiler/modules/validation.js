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
    //console.log('\r\nValidators use:',name);
	if (name) {
		for (let i in name) {
			let item=name[i];
			//console.log('    Validators item:',i,item);
			if (zx.static_stash.Validators[item[0]]) {
				//console.log('Validators.use:',name,zx.static_stash.Validators);
				zx.static_stash.Validators[item[0]].assign_count += 1;
			} else {
				console.log('    Validators missing/unknown:',item[0]);
				zx.error.log_syntax_warning(zx, 'Validators missing/unknown:'+item[0], '', '');				
			}
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

var resolve_table_and_field_names = function (zx,fields,cx) {
	var res=[]; var i,v;
	//console.log('\r\n\r\n fields:',fields);
	//console.log('\r\n\r\n cx.fields:',cx.fields);
	//console.log('\r\n\r\n cx.TableContexts:',zx.TableContexts);
	// exports.ResolveFieldAndTableNames 

	zx.forFields(fields, function (field, key) {
		//console.log('   field:',key,field);	
		v = field;
		//console.log('   field:',key,field);		
		//.fieldname or table.fieldname or table.
		if (field.slice(0,1)=='.') {
			var i = zx.exists_inArray_byname(cx.fields,field.slice(1)); 
			if (i>=0) {
				v = [cx.tid,i];
			}
		} else if (field.slice(-1)=='.') {
			//console.log(' slice(-1):',field.slice(0,-1));
			var table= zx.table_widget.GetTableByAlias(zx,cx,field.slice(0,-1));
			//console.log(' slice(-1)xx:',table.name);
			if (table) {
				v = [table.name,0];
			}
		} else if (field.indexOf('.')>0) {			
			var arr=field.match(/(.+)\.(.+)/)||['',''];
			//console.log(' table_and_field:',arr);
			var table= zx.table_widget.GetTableByAlias(zx,cx,arr[1]);			
			if (table) {
				//console.log(' table_and_field t:',table);
				var i = zx.exists_inArray_byname(table.fields,arr[2]); 
				if (i>=0) {
					v = [table.name,i];
				}
				
			}
		} 
		
		
		//console.log('   field,v:',field,v);		
		res.push(v);
		//if (!cx.fieldDebug[field.f.name]) cx.fieldDebug[field.f.name] = {};		
		//cx.fieldDebug[field.f.name].Qualia = field.f;
	});
	//console.log('   field,res:',res);		
	return res;
}

exports.reformat = function (zx,validator,cx) {
	var res=[]; var v;
	//console.log('\r\n\r\nreformat validator:',validator);
	if (zx.pass<5) return validator;
	if (!validator) return null;

	if (typeof validator === 'object') {
		Object.keys(validator).forEach(function (key) {

			if (key=='array' || key=="Function") {
				//console.log('\t ignor:',key);
			} else {
				var step=validator[key];
				if (typeof step === 'object') {					
					//console.log('\t xxxxx with parm:',key,' - ',step.array);
					let s= deepcopy(step.array);
					v= resolve_table_and_field_names(zx,s,cx);
					//console.log('reformat:',s,v);
					v.unshift(key);
					res.push(v);
				} else {
					//console.log('\t xxxxx    simple:',key);	
					res.push([key]);
				}								
			}
		});		
	} else {
		res=[[validator]];
	}
	zx.validation.use(zx, res);
	
	//console.log('reformat result:',res,'\r\n');			
	return res;
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

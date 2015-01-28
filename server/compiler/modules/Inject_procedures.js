"use strict";
/*
speed/memory performance  is not important
ease of use is important
 */

/*
strategy dealing with injected procedures
//first pass sets up the items second pass injects them


procedures call ed from a button can be
executed in the same file or needs to be injected into another file that is being linked to.
the procedure should not be dependent on any context variable (other than operator_ref and ...
it will be passed a pki  and  one optional parameter


Injecting into target files
a procedure that gets removed in the source will just disappear leaving a dangling procedure in the target
when the target gets recompiled it must check if the source exists...

we have one cross-link file that contain all such procedures
with 2 dictionaries
{Source:{"filename":{name:{}}},Targets:{"filename":[Source_filename:'',name:'']}

 */

var fs = require('fs');
//var path = require('path');
var fileutils = require('./fileutils.js');
exports.module_name='Inject_Procedures.js';
exports.check_inline_link_procedure = function (zx, line_obj,debug) {
	//..if there is code to execute  inject it and set a when statement......
    //console.log('check_inline_link_procedure from 151927:',debug,line_obj.nonkeyd);
	if (zx.pass !== 1)
		return; //first pass sets up the items second pass injects them

    //if (debug) console.log('check_inline_link_procedure from 151928:',line_obj.title,line_obj.tag,debug,line_obj.nonkeyd);
        
	var myname = zx.injected.page_name;	
	if ((zx.gets(line_obj.nonkeyd).length > 0)&&zx.injected.cross!==undefined) {
        var Code = zx.getA(line_obj.nonkeyd);
		var name = zx.UniqueName(zx, line_obj, 'CondProc');
		console.log('Inline button procedure:',Code,name,line_obj.form);
        //console.trace("STACK 150115");
		line_obj.execute = name;

		var target_name = (line_obj.form === undefined) ? myname : zx.Current_main_page_name;

		var obj = {
			tag : "procedure",
			name : name,
			when : [name],
			nonkeyd : Code,
			srcinfo : line_obj.srcinfo,
			condproc_target : target_name
		};
		if (line_obj.form !== undefined)
			obj.form = line_obj.form;
		//console.log('check_inline_link_procedure compare :',myname,name,zx.injected.cross.cmp,obj);
		if (zx.injected.cross.src[myname] === undefined)
			zx.injected.cross.src[myname] = {};
		//console.log('check_inline_link_procedure compare :',myname,name,zx.injected.cross.src[myname][name],obj);

		zx.injected.cross.src[myname][name] = obj;

		if (zx.injected.cross.tar[target_name] === undefined)
			zx.injected.cross.tar[target_name] = {};
		if (zx.injected.cross.tar[target_name][myname] === undefined)
			zx.injected.cross.tar[target_name][myname] = {};
		zx.injected.cross.tar[target_name][myname][name] = {
			src : myname,
			name : name
		};

		if (line_obj.form !== undefined) {
			var same = false;
			if (zx.injected.cross.cmp[name] !== undefined)
				same = (zx.injected.cross.cmp[name].nonkeyd.toString() === obj.nonkeyd.toString());
			//console.log('check_inline_link_procedure compare code:',same,zx.injected.cross.cmp[name].nonkeyd,obj.nonkeyd);
			if (!same) {
				var fn = fileutils.locatefile(zx, target_name, zx.file_name, obj, 120049);
				fn += zx.app_extn;
				zx.queue_file_to_be_compiled(zx, fn);
				// console.log('done checking  queue_file_to_be_compiled:');
			}
		}
		//console.log('Inline button procedure list:',zx.injected.inject_procedures);
	}
};

exports.tag_inject_point = function (zx, line_obj) {

	//   console.log('Injecting check at :',line_obj.srcinfo.current_tag_index+1,zx.injected.inject_procedures);
	if (zx.pass !== 2)
		return; //first pass sets up the items second pass injects them
	var myname = zx.injected.page_name;
	var new_line_objects = [];
	//    console.log('Injecting now at :',line_obj.srcinfo.current_tag_index+1,zx.injected.inject_procedures);
	//any cross injections
	if (zx.injected.cross.tar[myname] !== undefined)
		for (var Sources in zx.injected.cross.tar[myname]) {
			for (var Files in zx.injected.cross.tar[myname][Sources]) {
				var sourceid = zx.injected.cross.tar[myname][Sources][Files];
				//console.log('Injecting sourceid:',sourceid,zx.injected.cross.src[sourceid.src][sourceid.name]);
				if ((zx.injected.cross.src[sourceid.src][sourceid.name] === undefined) ||
					(zx.injected.cross.src[sourceid.src][sourceid.name].condproc_target !== myname) //check if destination moved
				) {
					//remove from the target lists as it is no longer used in the target
					delete zx.injected.cross.tar[myname][Sources][Files];
					//console.log('Injecting delete at :',zx.injected.cross.tar[myname]);
					if (zx.isObjectEmpty(zx.injected.cross.tar[myname][Sources]))
						delete zx.injected.cross.tar[myname][Sources];
					if (zx.isObjectEmpty(zx.injected.cross.tar[myname]))
						delete zx.injected.cross.tar[myname];
					//console.log('Injecting delete at :',zx.injected.cross.tar[myname]);
				} else {
					var obj = zx.injected.cross.src[sourceid.src][sourceid.name];
					new_line_objects.push(obj);
				}
			}
		}

	zx.insertArrayAt(zx.line_objects, line_obj.srcinfo.current_tag_index + 1, new_line_objects);
};

exports.start_page = function (zx, page) {
	//console.log('start_page Inject :',page);
	zx.injected = {};
	zx.injected.inject_procedures = [];
	zx.injected.cross = {
		src : {},
		tar : {}

	};
	zx.injected.page_name = page.name;

	if (fs.existsSync(zx.output_folder + 'cross-injections.json')) {
		var fileContents = fs.readFileSync(zx.output_folder + 'cross-injections.json');
		if (fileContents !== "")
			zx.injected.cross = JSON.parse(fileContents);
	}
	//console.log('start_page loaded inject :',zx.injected.cross);

	//rename any old src
	zx.injected.cross.cmp = zx.injected.cross.src[page.name];
	zx.injected.cross.src[page.name] = {};
    //console.log('start_page done :',page);
};

exports.done_page = function (zx) {
	delete zx.injected.cross.cmp;
	fs.writeFileSync(zx.output_folder + 'cross-injections.json', JSON.stringify(zx.injected.cross, null, 4));
};

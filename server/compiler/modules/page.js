"use strict";
/*
speed/memory performance  is not important
ease of use is important
 */

//var Sync = require('sync'); // https://github.com/ybogdanov/node-sync
var fileutils = require('./fileutils.js');
var extend = require('node.extend');
var deepcopy = require('deepcopy');

exports.module_name = 'page.js';

exports.compile = function (divText) {
	return divText;
};

var fs = require('fs'), bcb = require('./bcbiniparse.js');
//var path = require('path');


var appendToDepenance = exports.appendToDepenance = function (zx, filename) {
	var fileobj = zx.depends[filename];
	if (fileobj === undefined) {
		fileobj = {
			fn : filename,
			parents : {}

		};
		zx.depends[filename] = fileobj;
	}
	var parentobj = fileobj.parents[zx.main_page_name];
	if (parentobj === undefined) {
		fileobj.parents[zx.main_page_name] = true;
		zx.depends[filename] = fileobj;
	}
};

var preProcess = function (zx, filename, str) {
	//check file type
	str = str.trim();
	var pre_tag = '<pre process=';
	var post_tag = '</pre>';
	if (str.substr(0, pre_tag.length) === pre_tag) {
		//some transform required
		str = str.slice(pre_tag.length);

		if (str.slice(-post_tag.length) === post_tag)
			str = str.slice(0, -post_tag.length);

		var preprocessor = zx.parseword(str);
		var p = str.search(/>/g);
		var preparam = str.substring(0, p);
		str = str.substring(p + 1);
		//check multiple nested levels of pre processing
		str = preProcess(zx, filename, str);
		//console.warn('plugin preprocessor_ searching for  :',preprocessor, ' parm:',preparam );
		if (1) {
			zx.eachplugin(zx, 'preprocessor_' + preprocessor, str);
		} else {

			var done = zx.plugins.forEach(function (entry) { //to many params .. zx.eachplugin(zx, 'preprocessor_' + preprocessor, 0);
					if (entry['preprocessor_' + preprocessor] !== undefined) {
						//console.warn('plugin preprocessor_ found :',preprocessor );
						str = entry['preprocessor_' + preprocessor](zx, str, preparam, filename, preprocessor);
					}
				});
		}
		//console.log( markdown.toHTML( "Hello *World*!" ) );
	}
	return str;
};

exports.ParseFileToObject = function (zx, filename, objtype) {
	var s,
	eob,
	str,
	debuglevel = 1;

	//we parse <#  .. > as ini  <#: > as quic  and <{   }>  as json or the whole file as json
	try {
		var obj = JSON.parse(filename);
		//console.log('json page..',filename,obj);
		return obj;
	} catch (e) {
		zx.obj = [];
		obj = zx.obj;
		try {
			str = String(fs.readFileSync(filename));
		} catch (e) {
			zx.missingfiles.push(filename);
			return [];
		}
		//console.log('not a json page..processing as htm',filename,str.length);

		//check file type - markdown etc....
		str = preProcess(zx, filename, str);

		zx.inputfilecount++;
		//first dump up to <body >
		var body = str;
		var crCount = 1;
		var bodies = str.split(/<body/g);
		if (bodies !== undefined && bodies.length > 1) {
			if (debuglevel > 5)
				console.log('bodies', bodies);

			crCount += zx.counts(bodies[0], "\n");

			bodies = bodies[1].split(/<\/body/g)[0];
			//console.log('bodies2',bodies);
			//
			var bodytag = bodies.substring(0, bodies.indexOf('>'));
			crCount += zx.counts(bodytag, "\n");

			body = bodies.substring(bodies.indexOf('>') + 1);

			//console.log('body',body);
			//return;
		}
		//console.log('finding :',body);
		//console.log('finding body :...');

		if (zx.inputfilecount === 1) { //only on the first file
			//wrap in library scripts && wrap in local layout
			var concat_body = "<#include file=~/All/StandardPageOpen> ";

			zx.model_files.reverse().forEach(function (filename) {
				if (fs.statSync(filename).isDirectory()) {}
				else {
					var br = fileutils.locateclosestbuildroot(zx, filename);
					var qfilename = fileutils.changefileextn(br.filename, '');
					concat_body += '<#include file="' + qfilename + '" >\n';
					//console.log('------------------------------ adding :', qfilename);
				}
			});

			//console.log('------------------------------ finding :', concat_body);
			concat_body +=
			"<#include file=LayoutOpen> " +
			body +
			"<#include file=LayoutClose> " +
			"<#include file=~/All/StandardPageClose> ";
			body = concat_body;
		}

		//we dont allow nesting of <# and <{ so parsing is more simple
		var starts = body.split(/(<#|<\{)/g); //jshint complains about this - fix later
		if (debuglevel > 5)
			console.log('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF finding :', starts);

		var blocks = [];

		var itemCrCount;
		var col = 1;
		for (var i = 0; i < starts.length; i++) {

			itemCrCount = zx.counts(starts[i], "\n");
			//console.log('itemCrCount:',itemCrCount);
			if (starts[i] === "<#") { //parse tags
				//stop on >
				s = starts[i + 1];
				eob = s.indexOf('>'); //in strict mode this should be />
				var tag_string = s.substring(0, eob < 0 ? s.length : eob);

				//parse into ini
				//console.log('ParseFileToObject a:',line_obj);
				var sourcestr = tag_string;
				var line_obj = {};
				line_obj.srcinfo = {};
				//in case the parser needs to throw an error
				line_obj.srcinfo.main_page_name = zx.main_page_name;
				line_obj.srcinfo.file_stack = zx.file_stack.slice(0);
				line_obj.srcinfo.filename = filename;
				line_obj.srcinfo.source = sourcestr;
				line_obj.srcinfo.start_line = crCount;
				line_obj.srcinfo.start_col = col;
				line_obj.srcinfo.current_tag_index = 0;
				line_obj.tag = 'unknown123';

				//console.log('ParseFileToObject b:',tag_string,line_obj);
				if (tag_string.substr(0, 1) !== ":") {
					//console.log('bcb a:',line_obj);
					if ((objtype === undefined))
						line_obj = bcb.parse(tag_string, filename, line_obj);
					//console.log('bcb b:',line_obj);
				} else {

					var tage = zx.delimof(tag_string, [' ', '\n']);
					var tag = tag_string.substring(1, tage).trim();
					var body_string = tag_string.substring(tage + 1).trim();
					//console.log('Quic input:',tag,body_string);
					line_obj.tag = tag;

					if ((objtype === undefined) || (objtype === line_obj.tag.toLowerCase()))
						line_obj = zx.quic.parse(zx, line_obj, body_string, tag); //line_obj here gets filled later...should really be made into 2 separate objects

					//console.log('Quic output:',line_obj);
				}

				//line_obj.filename=line_obj.srcinfo.filename;
				//console.log('bcb:',line_obj);
				//have to re do this as the parser overwrites the object

				if ((objtype === undefined) || (objtype === line_obj.tag.toLowerCase())) {
					zx.locate_plugin(zx, "tag_pass0_", line_obj.tag, line_obj);
					zx.eachplugin(zx, "process_pass0", {
						line_obj : line_obj,
						blocks : blocks
					});
				}
				//console.log('bcb b2:',line_obj);

				//left over html on the next line
				starts[i] = "<#" + tag_string + ">";
				starts[i + 1] = s.substring(eob + 1);
				itemCrCount = zx.counts(tag_string, "\n");
			} else if (starts[i] === "<{") //json format - not used yet
			{
				//stop on >
				s = starts[i + 1];
				eob = s.indexOf('}>');
				//var json = s.substring(0, eob);
				//var clean_html = s.substring(eob + 2);
				//console.log('tag ini:{{{{{{{{{{{{{{{{{{{{{{',ini,' \nhtml:',html,'\neob=====================');
				//ignoring for now

			} else { //text before the first pair
				//var clean_html=starts[i].replace(/[^\x20-\x7f]/g, "");

				if ((starts[i] !== "") && (objtype === undefined))
					blocks.push({
						tag : "html",
						html : starts[i],
						srcinfo : {
							filename : filename,
							source : 'html',
							file_stack : zx.file_stack.slice(0),
							//note:'mark1898321'
						}
					});

				//count the chars in the last line


				//console.warn('Unknown start ',starts[i]);
				//  return (2);
			}

			var arr = starts[i].split("\n");
			//console.log('arr.length:',arr.length,col,arr);
			if (arr.length > 1)
				col = 1;
			col += arr.pop().length;

			crCount += itemCrCount;
		}

		//console.warn('blocks start ',blocks);

		return blocks;
	}

};

var addFileToLinkFiles = function (zx, fn, obj, debugref) {
	if ((fn !== '') && (fn !== undefined)) {
		var ofn = fn;
		fn = fileutils.locatefile(zx, fn, zx.file_name, obj, debugref);
		if (fn !== "") {
			if (zx.Current_main_page_name.indexOf('SaleForm') >= 0) {
				console.log('table adding SaleForm to linkfiles: ', ofn, zx.file_name, obj);
				process.exit(44);
			}

			zx.linkfiles.push({
				name : zx.Current_main_page_name,
				obj : obj
			});

		}
	}
};

exports.RecurseParseFileToObject = function (zx, filename) {
	var fn; //,debuglevel = 1;

	//get the object, find an include file and repeat the find

	zx.inputfilecount = 0;

	//zx.file_stack.push({filename:filename});

	//console.warn('main  file 2obj ',filename);
	var obj = exports.ParseFileToObject(zx, filename);
	//console.warn('main  file ',filename, JSON.stringify(obj, null, 4).length );
	for (var i = 0; i < obj.length; i++) {
		if (obj[i].tag === undefined)
			console.warn('page-undefined Tag ', i, obj[i]);

		if (obj[i].tag.toLowerCase() === 'table') {
			if (obj[i].q) {
				//console.log('quale table tag: ',obj[i].q.Fields );
				//obj[i].q.Fields.forEach(function (f) {
				for (var i2 = 0; i2 < obj[i].q.Fields.length; i2++) {
					var f = obj[i].q.Fields[i2];
					addFileToLinkFiles(zx, f.form, obj[i], 120015);
				}
			}
			if (obj[i].form !== undefined) {
				//console.log('table arr: ',obj[i].form );
				var arr = obj[i].form[0].split(",");
				for (var i3 = 0; i3 < arr.length; i3++) {
					var fn3 = arr[i3];
					//arr.forEach(function (fn) {
					addFileToLinkFiles(zx, fn3, obj[i], 120019);
				}
			}
		}
		if (obj[i].tag.toLowerCase() === 'menu') {
			//console.log('menu tag: ',obj[i] );
			if (obj[i].form !== undefined) {
				fn = obj[i].form[0];
				addFileToLinkFiles(zx, fn, obj[i], 120016);

			}
		}

		if (obj[i].tag.toLowerCase() === 'include') {
			fn = obj[i].file[0] + zx.app_incl_extn;

			fn = fileutils.locatefile(zx, fn, zx.file_name, obj[i], 120014);
			//WIP
			if (fn !== "") {
				var fn_clone = fn + zx.app_incl_extn;
				appendToDepenance(zx, fn_clone);
			}

			//if (obj[i].srcinfo.file_stack===undefined) console.warn(':obj.srcinfo.file_stack===undefined ',obj[i] );
			//console.log('include tag stack: ',obj[i] );
			zx.file_stack = obj[i].srcinfo.file_stack.slice(0);
			zx.file_stack.push({
				filename : obj[i].srcinfo.filename,
				start_line : obj[i].srcinfo.start_line
			});
			//console.log('include tag stack x:',obj[i] );
			zx.includedfiles.push(zx.Current_file_name);
			zx.includedfiles = zx.deduplicate(zx.includedfiles);
			//console.log('include tag stack y:',obj[i] );
			var obj2 = exports.ParseFileToObject(zx, fn + zx.app_extn);
			//console.warn('include tag : file ',fn, JSON.stringify(obj2, null, 4).length );


			if (obj2 === undefined) {
				console.warn('include file could ot be read or found ', fn + zx.app_extn);
				process.exit(33);
			} else {
				//console.warn('b4splice ',obj.length,obj2.length );
				//http://fromanegg.com/post/43733624689/insert-an-array-of-values-into-an-array-in-javascript

				obj[i].Block = 'Block-' + zx.BlockIndex;
				var lobj = {
					tag : "Unblock",
					Label : ('Block-' + zx.BlockIndex),
					srcinfo : {}

				};
				obj2.push(lobj);
				obj2.unshift(i + 1, 0);
				Array.prototype.splice.apply(obj, obj2);
				//console.warn('after splice ',obj.length,obj2.length );
				//console.warn('splice input ',obj2);

				zx.BlockIndex++;
			}

		}
	}
	//console.warn('final main  file ',filename, JSON.stringify(obj, null, 4).length );
	return obj;
};

exports.start_up = function (zx) {
	zx.model_defines = {};
	zx.saving_models = '';
};

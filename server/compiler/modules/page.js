"use strict";
/*
speed/memory performance  is not important
ease of use is important
 */

//var Sync = require('sync'); // https://github.com/ybogdanov/node-sync
var path = require('path');
var fileutils = require('../../lib/fileutils.js');
var extend = require('node.extend');
var deepcopy = require('deepcopy');
var json_like = require("../../lib/json_like");

exports.module_name = 'page.js';

exports.compile = function (divText) {
	return divText;
};

var fs = require('fs'), bcb = require('./bcbiniparse.js');
//var path = require('path');


var appendToDepenance = exports.appendToDepenance = function (zx, filename) {
    var page_name=zx.main_page_name.replace(/\\/g, "/");
    
//from child perspective    
	var fileobj = zx.depends[filename];
	if (fileobj === undefined) {
		fileobj = {
			fn : filename,
			parents : {}

		};
		zx.depends[filename] = fileobj;
	}
	var parentobj = fileobj.parents[page_name];
	if (parentobj === undefined) {
		fileobj.parents[page_name] = true;
		zx.depends[filename] = fileobj;
	}


//from parent perspective
    
	fileobj = zx.children[page_name];
	if (fileobj === undefined) {
		fileobj = {
			fn : page_name,
			children : {}

		};
		zx.children[page_name] = fileobj;
	}
	var mt = String(fs.statSync(filename).mtime);
    //console.warn('children 110918 :',mt, filename );    
	fileobj.children[filename] = mt;
	zx.children[page_name] = fileobj;
	    
    
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
		var end_of_pre_regex = '>';
		var preprocessor = zx.parseword(str);
		var p = str.search(end_of_pre_regex);
		var preparam = str.substring(0, p);
		str = str.substring(p + end_of_pre_regex.length);
		//check multiple nested levels of pre processing
		str = preProcess(zx, filename, str);
		//console.warn('plugin preprocessor_ searching for  :',preprocessor, ' parm:',preparam );
		if (1) {
			str = zx.gets(zx.eachplugin(zx, 'preprocessor_' + preprocessor, str));
		} else {

			var done = zx.plugins.forEach(function (entry) { //to many params .. zx.eachplugin(zx, 'preprocessor_' + preprocessor, 0);
					if (entry['preprocessor_' + preprocessor] !== undefined) {
						//console.warn('plugin preprocessor_ found :',preprocessor );
						str = entry['preprocessor_' + preprocessor](zx, str, preparam, filename, preprocessor);
					}
				});
		}

	}
	return str;
};
var check_user_table_name = exports.check_user_table_name = function (zx, str) {
	var check_user_table = function (str, key) {
		if (zx.conf.db.platform_user_table[key] !== key) {
			//console.log('replace platform_user_table ',key,' with ',zx.conf.db.platform_user_table[key]);
			return zx.replaceAll(str, key, zx.conf.db.platform_user_table[key]);
		} else
			return str;
	}

	str = check_user_table(str, "user_table_name");
	str = check_user_table(str, "user_display_field");
	str = check_user_table(str, "user_pk_field");
	str = check_user_table(str, "user_name_field");
    str = check_user_table(str, "user_guest_name");
	str = check_user_table(str, "user_password_field");
	str = check_user_table(str, "user_keys_field");
    str = check_user_table(str, "user_landing_page");
	return str;
}


var ParseIntoStatements = function (zx, compound_statement, objtype) {
	var statements = [];
    var compound_statement_debug=0;
	if (!objtype) {
		if (compound_statement.indexOf("ParseIntoStatements_debug")>0) {
               compound_statement_debug=1;
			//console.log('ParseIntoStatements: ', compound_statement);
           
		}
	}
	var split = compound_statement.split(zx.all_tags_rx);
    if (compound_statement_debug) console.log('\n\n\nParseIntoStatements R: ', split);
	if (split.length > 0) {
		if (split.length == 1) {
			statements.push({
				statement : split[0]
			});

		} else {
			//console.log('ParseIntoStatements X: ', split);//[0] ,' ...', split[1]);
			split[1] = split[0] + split[1];

			for (var i = 1; i < split.length; i += 2) //
			{
				statements.push({
					statement : split[i] + split[i + 1]
					//command : split[i],
					//input : split[i + 1]
				});
                if (compound_statement_debug) console.log('ParseIntoStatements Z: ',i, split[i] + split[i + 1]);//[0] ,' ...', split[1]);
			}
		}
	}
    if (compound_statement_debug) console.log('ParseIntoStatements Y: ',statements);
	return statements;
}

exports.ParseFileToObject = function (zx, filename, objtype) {
	var s,
	eob,
	str,
	obj,
	debuglevel = 1;

	//console.log('ParseFileToObject start:');
	//we parse <#  .. > as ini  <#: > as quic  and <{   }>  as json or the whole file as json
	//try {
	//....????	obj = JSON.parse(filename);
	//	//console.log('json page..',filename,obj);
	//	return obj;
	//} catch (e)
	{
		zx.obj = [];
		obj = zx.obj;
		try {
			str = String(fs.readFileSync(filename));
			if (objtype !== "dropinmenu") {
				//console.log('loading in file : ', filename);
				//console.trace("STACK!!!!");
			}
		} catch (e) {
			zx.missingfiles.push(filename);
			return [];
		}
		str = check_user_table_name(zx, str);
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
			var concat_body = "<#include(file=~/All/StandardPageOpen) #> ";
			//console.log('building include files : ',zx.model_files);
			zx.model_files.reverse().forEach(function (filename) {
				if (fs.statSync(filename).isDirectory()) {}
				else {
					var br = fileutils.locateclosestbuildroot(zx, filename);
					var qfilename = fileutils.changefileextn(br.filename, '');
                    qfilename = qfilename.replace(/\\/g,'/');
					concat_body += '<#include (file="' + qfilename + '") #> ';
					//console.log('------------------------------ adding :', qfilename);
				}
			});

			//console.log('------------------------------ finding :', zx.inputfilecount,concat_body);
			concat_body +=
			"<#include(file=LayoutOpen)#> " +
			body +
			"<#include(file=LayoutClose)#> " +
			"<#include(file=~/All/StandardPageClose)#> ";
			body = concat_body;
			//console.log('Main Body : ',body);
		}

		//we dont allow nesting of <# and <{ so parsing is more simple
		var starts = body.split(/(<#|<\{)/g); //jshint complains about this - fix later
		if (debuglevel > 5)
			console.log('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF finding :', starts);

		var blocks = [];

		var itemCrCount;
		var col = 1;
		//console.log('ParseFileToObject 0a:', starts.length);
		for (var i = 0; i < starts.length; i++) {

			itemCrCount = zx.counts(starts[i], "\n");
			//console.log('itemCrCount:',itemCrCount,process.memoryUsage());
			if (starts[i] === "<#") { //parse tags
				//stop on >


				s = starts[i + 1];
				eob = s.indexOf(zx.end_of_block); //in strict mode this should be #>
				var compound_statement = s.substring(0, eob < 0 ? s.length : eob).trim();
                var compound_statement_debug=0;
		        if (compound_statement.indexOf("compound_statement_debug")>0)   compound_statement_debug=1;
				var Statements = ParseIntoStatements(zx, compound_statement, objtype);
				//console.log('ParseFileToObject a:', i, Statements.length);

				for (var is = 0; is < Statements.length; is++) {
					var Statement = Statements[is].statement;
					var sourcestr = compound_statement;
					//console.log('ParseFileToObject b:',Statement,line_obj);
					var line_obj = {};
					//var splits = Statement.match(/[:=]*\s*(\w+)\s*([\w\W]*)/);
					var splits = Statement.match(/[:=]*\s*(\w+)\s*([\(\{\[])?([\w\W]*)/);
                    //if (compound_statement_debug) console.log('ParseFileToObject b:', is, Statements.length, splits);
					if (splits) {
						line_obj.tag = splits[1];
						line_obj.json_parse = true;
						line_obj.body = (splits[2]||'') + splits[3];
					} else {
						splits = Statement.match(/[:=]*\s*(\w+)\s*(.*)/);
						if (splits) {
							line_obj.tag = splits[1];
							line_obj.body = splits[2];
						}
                        else
                        {
                            //console.log('\n\nParseFileToObject no splits:', is, Statements.length,Statements,"\n", splits);
                        }

					}
                    if (compound_statement_debug) console.log('ParseFileToObject bb:', is, Statements.length, line_obj);
                    //if (line_obj.tag==='count')
                    //   console.log('\n\nParseFileToObject count:', is, Statements.length,Statements,"\n", splits);

					if (splits) {

						line_obj.srcinfo = {};
						//in case the parser needs to throw an error
						line_obj.srcinfo.main_page_name = zx.main_page_name;
						line_obj.srcinfo.file_stack = zx.file_stack.slice(0);
						line_obj.srcinfo.filename = filename;
						line_obj.srcinfo.source = sourcestr;
						line_obj.srcinfo.start_line = crCount;
						line_obj.srcinfo.start_col = col;
						line_obj.srcinfo.current_tag_index = 0;

						if ((objtype === undefined) || (objtype === line_obj.tag.toLowerCase())) {
							blocks.push(line_obj);
						}
					}
				}

                //if (compound_statement_debug) console.log('ParseFileToObject bc:', blocks);                
                if ((Statements.length>1)&&(objtype === undefined))
                {
                var eob_line_obj = {};
                
                eob_line_obj.tag = "compoundstatementdone";
                eob_line_obj.srcinfo = {};
                blocks.push(eob_line_obj);
                }
                 

				//left over html on the next line
				starts[i] = "<#" + compound_statement + zx.end_of_block;
				starts[i + 1] = s.substring(eob + zx.end_of_block.length);
				itemCrCount = zx.counts(compound_statement, "\n");
                //if (compound_statement_debug) console.log('ParseFileToObject bc:', blocks);                
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
			//console.log('ParseFileToObject z:');
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
				console.trace('process.exit(2) from addFileToLinkFiles : ');
				process.exit(44);
			}

			zx.linkfiles.push({
				name : zx.Current_main_page_name,
				obj : obj
			});

		}
	}
};

exports.check_json_parse = function (zx, obj) {
              
    if (obj.json_parse)  {
                //console.log('Quic RecurseParseFileToObject 172021a0 :');
				var jl = json_like.parse(obj.body);
				//console.log('Quic RecurseParseFileToObject 172021a :', jl);
                 if (jl.debug_options) zx.debug_options=jl.debug_options;
                
                if (jl.object_ended_at){
                   obj.body = obj.body.substring(jl.object_ended_at);
                   //later... now it is good for debugging delete jl.object_ended_at;   
                }
                //console.log('Quic RecurseParseFileToObject 172021c :', jl);
                //later... now it is good for debugging delete obj[i].json_parse;
                obj = extend(obj, jl); //second one has the priority
                //console.log('Quic RecurseParseFileToObject 172021z :', obj);
    }
    return obj;            
}

exports.check_json_parse_array = function (zx, objs) {
     //console.log(' check_json_parse_array 120807a0 :', objs);
    for (var i = 0; i < objs.length; i++) {        
        //console.log(' check_json_parse_array 120807a :', objs[i]);
        objs[i] = exports.check_json_parse(zx,objs[i]);
        //console.log(' check_json_parse_array 120807m :', objs[i]);
    };
    
  //console.log(' check_json_parse_array 120807z :', objs);  
  return objs;
}
                
var MaxIncludes = 0;
exports.RecurseParseFileToObject = function (zx, filename) {
	//get the object, find an include file and repeat the find

	zx.inputfilecount = 0;
	zx.dialect_active = 1;

	//zx.file_stack.push({filename:filename});

	//console.warn('main  file 2obj ',filename);
	console.warn('=======================================================================================================================================Making simple objects');
	var obj = exports.ParseFileToObject(zx, filename);
	//console.warn('main  file ', filename, JSON.stringify(obj, null, 4).length);
	console.warn('=======================================================================================================================================Done Making simple objects, now parsing paramaters');
	for (var i = 0; i < obj.length; i++) {
		//console.warn('page-Tag ', zx.dialect_active, i, obj.length, obj[i].tag);
		obj[i].dialect_active = zx.dialect_active ;
		if (obj[i].tag === undefined)
			console.warn('page-undefined Tag ', i, obj[i]);

		try {
			if (obj[i].ini_body) {
				obj[i].srcinfo.filename = filename;
				console.warn('\n\nbcb.parse:', obj[i].ini_body);
				obj[i] = bcb.parse(obj[i].ini_body, obj[i].srcinfo.filename, obj[i]);
				//console.warn('bcb.parse o :', JSON.stringify(obj[i], null, 4));
				console.warn('\n\n\n\n\n');
			}
			if (obj[i].body) {
				//console.log('Quic RecurseParseFileToObject 172021 :', obj[i]);

                if (zx.tag_attr[ obj[i].tag.toLowerCase() ] && zx.tag_attr[ obj[i].tag.toLowerCase() ].dontparseparam===true) {
                    //console.log('Quic RecurseParseFileToObject dontparseparam 172029m :',obj[i].body);
                    obj[i].nonkeyd = obj[i].body;
                }
                else {
                
                    obj[i] = exports.check_json_parse(zx,obj[i]);

                }
				obj[i] = zx.quic.parse(zx, obj[i], obj[i].body, obj[i].tag, true); //obj[i] here gets filled later...should really be made into 2 separate objects
                if (obj[i].tag==='table')  {
				   //console.log('Quic RecurseParseFileToObject 172022 :', obj[i]);
                   //console.log('Quic RecurseParseFileToObject 172022 nonkeyd:', obj[i].nonkeyd);
                   //if (obj[i].q.fields)
                   //console.log('Quic RecurseParseFileToObject 172022 fields:', obj[i].q.Fields);
                }
			}
		} catch (e) {
			zx.error.caught_exception(zx, e, " RecurseParseFileToObject mark-172031 ");
			throw new Error("local known error 117016");
		}
		try {
			zx.locate_plugin(zx, "tag_pass0_", obj[i].tag, obj[i]);
			zx.eachplugin(zx, "process_pass0", {
				line_obj : obj[i],
				blocks : obj
			});

		} catch (e) {
			zx.error.caught_exception(zx, e, " RecurseParseFileToObject mark-172032 ");
			throw new Error("local known error 117017");
		}
		if (obj[i].tag.toLowerCase() === 'dialect') {
				//console.log('Dialect object:', obj[i]);
				zx.flow_control.dialect_eval(zx, obj[i]);
		}
		if (obj[i].dialect_active)
		{
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
				var arr = zx.gets(obj[i].form).split(",");
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
				var menufile = zx.gets(obj[i].form);
				addFileToLinkFiles(zx, menufile, obj[i], 120016);

			}
		}

		if (obj[i].tag.toLowerCase() === 'include') {
			var file_name;
			 //console.log('include this tag found obj : ', obj[i]);
			if (zx.gets(obj[i].file) === 'this') { //useful for displaying own source
				obj[i].file = zx.pages[zx.pgi].name;
				//console.log('include this tag : ', zx.pages[zx.pgi].name);
			} {
				file_name = zx.gets(obj[i].file);
				//console.log('include this tag check m: ', file_name);
				if (file_name === "") {
					//console.log('file not specified : ', obj[i]);
				} else {
					if (!fs.existsSync(file_name)) {
						file_name = zx.gets(obj[i].file) + zx.app_incl_extn;
						 //console.log('include this tag check m2: ', file_name);
						if (!fs.existsSync(file_name)) {
							file_name = fileutils.locatefile(zx, zx.gets(obj[i].file) + zx.app_incl_extn, zx.file_name, obj[i], 120014);
							//console.log('include this tag check m3: ', file_name);
							if (!fs.existsSync(file_name)) {
								file_name = file_name + zx.app_incl_extn;
								//console.log('include this tag check m4: ', file_name);
								if (!fs.existsSync(file_name))  {
									console.log('include this tag not found m5: ', file_name);
									file_name="";
								} else {
									//console.log('include this tag found m5: ', file_name);
								}
							}
						}
					}
				}
			}
			//console.log('include this tag found z: ', file_name);
			//console.log('include tag : ', fn);
			if (file_name === "") {
				//file not found
				console.log('file not found : ', zx.gets(obj[i].file));
			} else {

				appendToDepenance(zx, file_name);

				zx.includedfiles.push(zx.Current_file_name);
				zx.includedfiles = zx.deduplicate(zx.includedfiles);

				if (obj[i].type === undefined || obj[i].type === 'quicc') {
					//if (obj[i].srcinfo.file_stack===undefined) console.warn(':obj.srcinfo.file_stack===undefined ',obj[i] );
					//console.log('include tag stack: ',obj[i] );
					zx.file_stack = obj[i].srcinfo.file_stack.slice(0);
					zx.file_stack.push({
						filename : obj[i].srcinfo.filename,
						start_line : obj[i].srcinfo.start_line
					});
					//console.log('include tag stack x:',obj[i] );

					//console.log('include tag stack y:', i, obj.length);
					var obj2 = exports.ParseFileToObject(zx, file_name);
					//console.warn('include tag : file ', file_name, JSON.stringify(obj2, null, 4).length);
					//console.warn('include tag : obj2 ', zx.show_longstring(JSON.stringify(obj2)));
					if (MaxIncludes++ > 5000) {
						console.trace('process.exit(2) from RecurseParseFileToObject MaxIncludes exceeded: ');
						process.exit(33);
					}
					if (obj2 === undefined) {
						console.warn('include file could ot be read or found ', file_name);
						console.trace('process.exit(2) from RecurseParseFileToObject : ');
						process.exit(33);
					} else {
						//console.warn('b4splice ',obj.length,obj2.length );
						//http://fromanegg.com/post/43733624689/insert-an-array-of-values-into-an-array-in-javascript

						obj[i].Block = 'IncludeFileBlock-' + zx.BlockIndex;
						var lobj = {
							tag : "Unblock",
							Label : ('IncludeFileBlock-' + zx.BlockIndex),
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

				var Inject_html = '';
				if (zx.gets(obj[i].type) === 'pre') {
					Inject_html = zx.showSource(fs.readFileSync(file_name));
				}
				if (zx.gets(obj[i].type) === 'html') {
					Inject_html = fs.readFileSync(file_name);
				}
				if (zx.gets(obj[i].type) === 'md') {
					Inject_html = zx.markdown.preprocessor_md(zx, fs.readFileSync(file_name).toString());
					//Inject_html = file_name;
					//console.warn('obj[i].type === md: ',file_name);
				}
				if (Inject_html !== '') {
					//push as html block
					var htmlobj = [i + 1, 0, {
							tag : "html",
							html : Inject_html,
							srcinfo : {
								source : 'html',
								filename : obj[i].srcinfo.filename,
								start_line : obj[i].srcinfo.start_line,
								file_stack : zx.file_stack.slice(0),
								//note:'mark1898321'
							}
						}
					];
					Array.prototype.splice.apply(obj, htmlobj);
					zx.BlockIndex++;
				}

			}
		}
		}
	}
	//console.warn('final main  file ',filename, JSON.stringify(obj, null, 4).length );
	console.warn('=======================================================================================================================================Done parsing paramaters');
	return obj;
};

exports.start_up = function (zx) {
	zx.end_of_block = "#>";
	zx.end_of_block_regex = /#>/g;
	var Keyword_API_md = '#Commands and reserverd keywords in the Quale language\n\n ';
	var Keyword_API_npp = '';
	
	zx.all_tags_str = '(';
    zx.tag_attr={};
	zx.forFields(zx.plugins, function (plugin) {
		zx.forFields(plugin.tags, function (keyword) {
			zx.all_tags_str += '^:' + keyword.name + '|';
			zx.all_tags_str += '^' + keyword.name + '|';
			//keyword.rx = new RegExp('^' + keyword.name, "im");
			// console.log('build regex for', (plugin.module_name || ' plugin has no name'), keyword);

			Keyword_API_md += '\n\n##' + keyword.name;
			Keyword_API_md += '\n\n' + keyword.man_page || ' - TBD';
            Keyword_API_npp += keyword.name +'&#x000D;&#x000A;';
            zx.tag_attr[ keyword.name ] = keyword;
		});
	});
	zx.all_tags_str = zx.all_tags_str.slice(0, -1) + ')';
	//console.log('build regex all tags', zx.all_tags_str);
	zx.all_tags_rx = new RegExp(zx.all_tags_str, "img");

	//console.log('Keyword_API_md:', Keyword_API_md);
	var fn = 'doc/Keywords.md',
	c;
	try {
		fs.mkdirSync("doc");
	} catch (err) {}
	try {
		c = fs.readFileSync(fn).toString();
	} catch (err) {}

	try {
		if (c !== Keyword_API_md) {
			fs.writeFileSync(fn, Keyword_API_md);
			console.log('updated Keyword_API_md:', c);
			//process.exit();
		}

	} catch (err) {}
	try {
        //var APPDATA = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preference' : '/var/local');
        //APPDATA = path.join(APPDATA,'Notepad++','userDefineLang.xml');
        var APPDATA = 'install/userDefineLang.xml';
        console.log('Notepad userDefineLang:', APPDATA);
        //if (!fs.existsSync(APPDATA))    {
		    console.log('Creating Notepad userDefineLang:', APPDATA);	
            var npp = 'install/npp.txt';
            var str = String(fs.readFileSync(npp));
		    str = str.replace('QUICCKEYWORDS',Keyword_API_npp);
			zx.updateFileSync(APPDATA,str)
		   
		//}
            
	} catch (err) {}    
    

};

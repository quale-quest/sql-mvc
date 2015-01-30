"use strict";
/*
speed/memory performance  is not important
ease of use is important
 */

/*
QUery Inline Code


 */

//===========================================================
var JSOL = require("../../lib/jsol");
var extend = require('node.extend');
var deepcopy = require('deepcopy');

exports.module_name = 'quic.js';

exports.remove_comments = function (zx, obj, str) {

	var search_from = 0;
	while (search_from < str.length) {
		//console.log('search_from:',search_from,str.length,str.substr(search_from,6));
		var commentindex = str.indexOf('--', search_from);
		if (commentindex === -1) {
			search_from = str.length;
			//console.log('commentindex === -1:',commentindex,first_cr,search_from);
		} else {
			//console.log('search_from x:',commentindex,str.substr(commentindex,4));
			if (str.substr(commentindex, 3) === '--{') {
				search_from = commentindex + 3;
			} else {
				if (str.substr(commentindex, 4) === '--:{') {
					search_from = commentindex + 4;
					//console.log('dont remove_comment at:',commentindex);
				} else {
					var first_cr = str.indexOf('\n', commentindex);
					if (first_cr < 0)
						first_cr = str.length;
					str = str.substr(0, commentindex) + str.substr(first_cr);
					//console.log('remove_comments:',commentindex,first_cr);
				}
			}
		}
	}

	return str;
};

exports.parse = function (zx, line_obj, str, tag,Quale_eval) {
	//input is any string or strings that may contain  --:{
	var quics = '';
	zx.q.rl_context = '';
	zx.q.rl_from = '';
	zx.q.ths = {};
	zx.q.indx = 0;

	//console.log('B4 Quic remove_comments');//,str.length);
	str = exports.remove_comments(zx, line_obj, str);
	//console.log('Quic remove_comments',str);
	try {

		var parse_from = 0;
		while (parse_from < str.length) {
			//var tagindex=str.indexOf('--:{',parse_from);
			//console.log('Quic parse loop:',parse_from,str.length);
			var tagindex = zx.delimof(str, ['--:{', '--{'], parse_from);
			if (tagindex >= str.length) {
				//no tags
				//console.log('no Quic tag in:',str);
				//return str;
				break;
			}

			var linestart = str.substring(0, tagindex).lastIndexOf('\n');
			//if (linestart === -1) linestart=0;
			//find the end of the json object - at the end of a line before a comment --

			//console.log('Quic parse in:',str.substring(linestart+1,tagindex));
			var opener;
			if (str.substr(tagindex, 4) === '--:{')
				opener = '--:{';
			if (str.substr(tagindex, 3) === '--{')
				opener = '--{';
			var openerlength = opener.length;

			var search_from = tagindex + openerlength,
			first_cr,
			firstcomment,
			end_s = -1;
			while (search_from < str.length) {
				first_cr = str.indexOf('\n', search_from);
				if (first_cr < 0)
					first_cr = str.length;
				firstcomment = str.indexOf('--', search_from);
				if (firstcomment < 0)
					firstcomment = str.length;
				if (firstcomment < first_cr) {
					end_s = firstcomment;
					quics = str.substring(tagindex + openerlength - 1, firstcomment).trim();
					if (quics.slice(-1) === '}')
						break;

					search_from = first_cr = str.indexOf('\n', firstcomment);
					if (search_from < 0)
						search_from = str.length;
				} else {
					end_s = first_cr;
					quics = str.substring(tagindex + openerlength - 1, first_cr).trim();
					if (quics.slice(-1) === '}') {
						break;
					}
					search_from = first_cr + 1;

				}
			}

			var quickinput = str.substring(linestart + 1, tagindex).trim();

			str = str.substr(0, tagindex) + str.substr(end_s);
			parse_from = tagindex;
			//console.log('Quic parse :',linestart,tagindex,quickinput,quics,tag,opener);
			if (opener === '--:{'  && Quale_eval)
				try {
					exports.Quic_eval(zx, line_obj, quickinput, quics, tag, opener);
				} catch (e) {
					zx.error.caught_exception(zx, e, " Quicc parse mark 070741 ");
					throw zx.error.known_error;
				}

			if (opener === '--{')
				try {
					exports.Tag_eval(zx, line_obj, quickinput, quics, tag, opener);
				} catch (e) {
					zx.error.caught_exception(zx, e, " Quicc parse mark 070743 ");
					throw zx.error.known_error;
				}
		}

	} catch (e) {
		zx.error.caught_exception(zx, e, " Quicc parse mark 070745 ");
		throw zx.error.known_error;
	}

	zx.q.ths.query = str;
	//console.log('Quic parse done:',zx.q.contexts);
	//console.log('Quic parse done:',zx.q.ths);
	line_obj.q = zx.q.ths;

	if (zx.q.quale_context !== undefined)
		line_obj.quale_context = zx.q.quale_context;

	line_obj = extend(line_obj, zx.q.ths.Tag);
	line_obj.nonkeyd = str;
	delete zx.q.ths.Tag;

	return line_obj;
};

// This function handles arrays and objects
function tokenscheck_eachRecursive(obj) {
	for (var k in obj) {
		if (!obj.hasOwnProperty(k))
			continue; // skip this property

		if (typeof obj[k] === "object" && obj[k] !== null) {
			//console.log('tokenscheck_eachRecursive:',k," : ",obj[k]);
			tokenscheck_eachRecursive(obj[k]);
		} else {
			// do something...
			if (obj[k] === true)
				obj[k] = 'true';
			if (obj[k] === false)
				obj[k] = 'false';

			if (typeof obj[k] === "string" && obj[k] !== null)
				if (obj[k].substring(0, 7) === "regex:/") {
					var sp = obj[k].split("/");
					//console.log('tokenscheck_eachRecursive sp:',obj[k],sp);
					if (sp.length > 1) {
						var flags = '';
						if (sp.length > 2)
							flags = sp[2];
						var re = new RegExp(sp[1], flags);
						obj[k] = re;
					}
				}

		}
	}
}
function tokens_eval_eachRecursive(obj, zx, line_obj, quickinput) {
	for (var k in obj) {
		//console.log('tokens_eval_eachRecursive:',k," : ",obj.hasOwnProperty(k),obj[k] instanceof RegExp,typeof obj[k],obj[k]);
		if (!obj.hasOwnProperty(k))
			continue; // skip this property

		if (typeof obj[k] === "object" && obj[k] !== null) {
			if ((obj[k]instanceof RegExp) && (k !== 'regex')) {
				//console.log('tokens_eval_eachRecursive:',k," : ",obj[k], 'in ',quickinput);

				var matches = quickinput.match(obj[k]);
				//console.log('tokens_eval_eachRecursive:',k," : ",obj[k],matches);
				if (matches === null) {
					var ds = 'Default_' + k;
					//console.log('tokens_eval_eachRecursive null:',ds,obj.hasOwnProperty(ds)," : ",obj);
					if (obj.hasOwnProperty(ds))
						obj[k] = obj[ds];
					else
						delete obj[k]; //='';
				} else {
					//console.log('tokens_eval_eachRecursive found:',k,':',matches[1]);
					obj[k] = matches[1];
				}

			} else {
				//console.log('tokenscheck_eachRecursive..:',k," : ",obj[k]);
				tokens_eval_eachRecursive(obj[k], zx, line_obj, quickinput);
			}
		} else {
			// do something...
		}
	}
}

var watch = function (zx, msg) {
	//if (zx.q.contexts['TODO_MVC'] && zx.q.contexts['TODO_MVC'].STATUS)
	//	console.log('>>>>>>>>>>>>WATCH ' + msg, zx.q.contexts[' TODO_MVC '][' STATUS '].Type);
    //console.log('>>>>>>>>>>>>WATCH ' + msg);
};

exports.Quic_eval = function (zx, line_obj, quickinput, quics, tag) {
	//console.log('-------------------------- \ nQuic_eval : ',quickinput,'::',quics)//," :::",str);

	var quale = {};
	watch(zx, " at 134240 :");
	//apply regex qualia to the SQL input

	zx.q.regex.forEach(function (regexx) {
		//console.log(' zx.q.regex.forEach:',regexx,' in ',quickinput);
		if (quickinput.search(regexx.regex) !== -1) {
			//console.log('quickinput found regexx:',regexx,' in ',quickinput);
			//interpret any regex in the properties
			var copy = deepcopy(regexx);
			tokens_eval_eachRecursive(copy, zx, line_obj, quickinput);
			quale = extend(quale, copy); //second one has the priority
		}
		//zx.q.regex.
		//if (entry.start_page!==undefined) entry.start_page(zx,zx.pages[zx.pgi]);
	});
	delete quale.regex;

	//Parse the Quic object
	var q_obj = {};
	try {
		q_obj = JSOL.parse(quics);
	} catch (e) {
		console.log('JSOL.parse exception: ', quickinput, line_obj);
		process.exit(2); //TODO

	}
	//console.log('JSOL.parse:',q_obj)//,":: : ",str);
	//interpret/fixup some tokens in the object
	tokenscheck_eachRecursive(q_obj);

	watch(zx, " at 134242 ");
	//merge the objects to create the new quale
	extend(quale, q_obj); //second one has the priority
	//console.log('quale:',quale);

	//merge with any class information
	if (quale.as !== undefined) {
		if (!Array.isArray(quale.as)) 
			quale.as = [].concat(quale.as);
		quale.as.forEach(function (clss) {
			if (zx.q.classes[clss] !== undefined) {
				//console.log('--------------------------\n   quickinput found classes:',clss,' in ',quickinput);
				//interpret any regex in the properties
				var copy = deepcopy(zx.q.classes[clss]);
				//console.log('copy:',copy);
				tokens_eval_eachRecursive(copy, zx, line_obj, quickinput);
				quale = extend(copy, quale); //quale overrides any class settings
				//console.log('quale:',quale);
			}

		});
		delete quale['class'];
	}

	watch(zx, " at 134245 ");
	//merge with any context information
	//console.log('quale b4 context:',quale);
	if ((tag.toLowerCase() !== 'model') && (quale.name === undefined) && quale.from === undefined) {
		var firstword = quickinput.match(/(\w+.\w)/); //TODO this looks wrong
		//console.log('Quale firstword extract :', firstword);
		if (firstword !== null) {
			firstword = firstword[1];
			var fa = firstword.split('.');
			if (fa.length > 1) {
				quale.table = fa[0];
				quale.name = fa[1];
			} else {
				if (fa.length > 0)
					quale.name = fa[0];
			}
		}
		//console.log('quale z context:',quale);
	}

	watch(zx, " at 134250 ");
	if (quale.table === undefined && zx.q.rl_from !== undefined)
		quale.table = zx.q.rl_from;

	if ((quale.name !== undefined) && (quale.name !== '') && (quale.table !== undefined) && (quale.table !== '')) {
		//this is for reading back from existing models
		if (quale.debug) {
			console.log('AAAAAAAAAAAAAAAAAAAAAAA Quale context inheritance from quale:', tag, quale.table, ' . ', quale.name, quale);
			console.log('BBBBBBBBBBBBBBBBBBBBBBB Quale context inheritance from contexts :', tag, quale.table, ' . ', quale.name, zx.q.contexts[quale.table][quale.name]);
		}
		watch(zx, " at 134255 ");
        //console.log('quale z5 context:',quale ,' in ',Object.keys(zx.q.contexts));
        if (zx.q.contexts[quale.table]!==undefined)
		    extend(true, quale, zx.q.contexts[quale.table][quale.name], deepcopy(quale)); //second one has the priority
         else
          {
          console.trace("Unknown Table");
}          
		watch(zx, " at 134258 ");

		//quale = extend(quale,zx.q.contexts[quale.table][quale.name]);
		//console.log('CCCCCCCCCCCCCCCCCCCCCC Quale context inheritance merged quale:',tag,quale.table,' . ',quale.name,quale);
	}

	//merge the quale to the global dictionary or object
	quale.quickinput = quickinput;

	watch(zx, " at 134248 ");
	if (tag.toLowerCase() === 'model') {
		//console.log('Quale model  :',quale);
		if (quale.regex !== undefined)
			zx.q.regex.push(quale);
		else {
			if (quale.rl_context !== undefined)
				zx.q.rl_context = quale.rl_context;

			if ((zx.q.rl_context !== undefined) && (zx.q.rl_context !== ''))
				quale.context = zx.q.rl_context;

			if (quale.context !== undefined) {
				if (zx.q.contexts[quale.context] === undefined)
					zx.q.contexts[quale.context] = {};
				if (quale.name !== undefined) {
					if (quale.debug) {
						console.log('Quale setting model fields :', quale.context, '.', quale.name, ':', quale);
					}
					zx.q.contexts[quale.context][quale.name] = extend(zx.q.contexts[quale.context][quale.name], deepcopy(quale));

				} else {
					if (quale.debug) {
						console.log('Quale setting model table :', quale.context, ':', quale);
					}
					zx.q.contexts[quale.context].Table = extend(zx.q.contexts[quale.context].Table, deepcopy(quale));
					zx.q.quale_context = quale.context; //returns context back to line object for debugging
				}
			}

			if (quale['class'] !== undefined) {
				if (quale.debug) {
					console.log('Quale setting class :', quale['class'], ':', quale);
				}
				zx.q.classes[quale['class']] = extend(zx.q.classes[quale['class']], deepcopy(quale));
			}

		}
	} else { //use in table or other tags

		if (quale.from !== undefined)
			zx.q.rl_from = quale.from;

		if (quale.name !== undefined) {
			//fields
			if (quale.debug) {
				console.log('Quale setting local fields :', quale.name, ':', quale);
			}
			if (quale.append !== undefined) { //find an existing quale by name an append to it
				if (zx.q.ths.names[quale.append] !== undefined)
					quale.indx = zx.q.ths.names[quale.append];
			}
			if (quale.indx === undefined) {
				quale.indx = zx.q.indx;
				zx.q.indx++;
			} //allow quales with field indexes to append to existing quales
			//better to use array in case of name conflicts

			// extend(zx.q.ths[quale.name], quale);
			if (zx.q.ths.Fields === undefined)
				zx.q.ths.Fields = [];
			zx.q.ths.Fields[quale.indx] = extend(zx.q.ths.Fields[quale.indx], deepcopy(quale));

			if (zx.q.ths.names === undefined)
				zx.q.ths.names = {};
			zx.q.ths.names[quale.table + '.' + quale.name] = quale.indx;

			//zx.q.ths.FieldOrder[quale.indx]= zx.q.ths[quale.name];

		} else {
			//console.log('Quale setting table :', ':', quale);
			zx.q.ths.Table = extend(zx.q.ths.Table, deepcopy(quale));
			// zx.q.ths= extend(zx.q.ths, quale);
		}
	}

};

exports.Tag_eval = function (zx, line_obj, quickinput, quics) {
	var q_obj = {};
	q_obj = JSOL.parse(quics);
	zx.q.ths.Tag = extend(zx.q.ths.Tag, q_obj);

};

exports.init = function (zx) {
	zx.q.rl_context = '';
	zx.q.rl_from = '';
	zx.q.ths = {};
	//  console.log(" QuicInit ");
};
exports.start_up = function (zx) {
	zx.q = {};
	zx.q.regex = [];
	zx.q.classes = {};
	zx.q.contexts = {};
	zx.q.rl_context = '';
	zx.q.rl_from = '';

	zx.q.ths = {};
};

var disp_quic = function (zx, line_obj, str) {
	console.log(" \ n \ n \ nparsing : ", str);
	var sql = exports.parse(zx, line_obj, str, 'model');
	console.log(" SQL remaining after parsed:: \ n ", sql);
	console.log(" \ n------------------------------ \ n \ n ");
};

exports.unit_test = function () {
	var zx = {};

	exports.init(zx);

	var line_obj = {};
	//line_obj = JSOL.parse(" {hello :  \ " test \ "}");
	console.log('start Quic', line_obj.hello);

	disp_quic(zx, line_obj, "--:{regex:\"regex:/varchar/i\",Default_length:\"20\",length:\"regex:/(\\\\d+)/\",name:\"regex:/(\\\\w+)/\",base:\"text\"} --comment ");
	disp_quic(zx, line_obj, "--:{regex:\"regex:/create\\\\s+table/i\",rl_context:\"regex:/create\\\\s+table\\\\s+(\\\\w+)/i\"} ");
	disp_quic(zx, line_obj, "--:{class:\"Text\",mode:\"edit\"} ");
	//disp_quic(zx,line_obj,"--:{class:\"Table\",match:\"regex:/create\s+table/i\",name:\"regex:/create\\\\s+table\\\\s+(\\\\w+)/\"} ");
	disp_quic(zx, line_obj, "CREATE TABLE TODO_MVC				--:{as:\"Table\"} ");
	disp_quic(zx, line_obj, "FirstNAME VARCHAR(100),				--:{as:\"Text\",size:45,\"onupdate\":\"owner=session.id\"}  ");
	disp_quic(zx, line_obj, "NAME VARCHAR(100),				--:{context:\"me\",as:\"Text\",size:40,\"onupdate\":\"owner=session.id\"} \n " +
		"FLAG CHAR(10),				--:{as:\"Text\",name:\"Flag\"} --state change \n ");

	//exports.parse(,,"--:{regex:/varchar/,length:scan_integer1,base=text}  ");


	console.log('final Qualia:', zx.q);
	console.log('final TODO_MVC:', zx.q.contexts.TODO_MVC);

	console.log('regex\n:', "prev> CREATE \n TABLE TODO_MVC {..}".match(/create\s+table\s+(\w+)/i));
	// console.log('regex:',"prev> CREATE TABLE TODO_MVC {..}".match(/(?<=\bcreate table\s)(\w+)/i) );

	process.process.exit(2);
};

//test_quic();

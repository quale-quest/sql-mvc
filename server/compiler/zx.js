"use strict";
/* qq utilities - for server side */

exports.intersect_safe_sorted = function (a, b) { //http://stackoverflow.com/questions/1885557/simplest-code-for-array-intersection-in-javascript
	var ai = 0,
	bi = 0;
	var result = [];
	while (ai < a.length && bi < b.length) {
		if (a[ai] < b[bi]) {
			ai++;
		} else if (a[ai] > b[bi]) {
			bi++;
		} else /* they're equal */
		{
			result.push(a[ai]);
			ai++;
			bi++;
		}
	}

	return result;
};

exports.intersect = function (a, b) {
	return a.filter(function (n) {
		return b.indexOf(n) !== -1;
	});
	//test: var a= [1,2,3,4,5,6,7,8];var b= [4,6,8,10,12];console.log('zxintersect',zxintersect(a, b));
};

exports.removefromarray = function (arr, item) {
	var i;
	while ((i = arr.indexOf(item)) !== -1) {
		arr.splice(i, 1);
	}
};

exports.deduplicate = function (array) {
	//http://jsperf.com/remove-duplicate-array-tests
	var temp = {};
	for (var i = 0; i < array.length; i++)
		temp[array[i]] = true;
	var r = [];
	for (var k in temp)
		r.push(k);
	return r;
};
exports.deduplicate_byname = function (array) {
	//http://jsperf.com/remove-duplicate-array-tests
	var temp = {};
	for (var i = 0; i < array.length; i++)
		temp[array[i].name] = array[i];
	var r = [];
	for (var k in temp)
		r.push(temp[k]);
	return r;
};
exports.exists_inArray_byname = function (array,name,def) {
	
	for (var i = 0; i < array.length; i++)
		if (array[i].name == name) return i;
	return def||-1;
};
exports.GetNamesInArray = function (array) {
	var names = [];
	for (var i = 0; i < array.length; i++)
		names.push(array[i].name);
	
	return names;
};

exports.sortObj = function (arr) {
	//http://www.latentmotion.com/how-to-sort-an-associative-array-object-in-javascript/
	// Setup Arrays
	var i,
	sortedKeys = [],
	sortedObj = {};

	// Separate keys and sort them
	for (i in arr) {
		sortedKeys.push(i);
	}
	sortedKeys.sort();

	// Reconstruct sorted obj based on keys
	for (i in sortedKeys) {
		sortedObj[sortedKeys[i]] = arr[sortedKeys[i]];
	}
	return sortedObj;
};

exports.getfilename = function (str) {
	//http://stackoverflow.com/questions/423376/how-to-get-the-file-name-from-a-full-path-using-javascript
	return str.split('\\').pop().split('/').pop();
	//todo rather use path.basename('/foo/bar/baz/asdf/quux.html')
};
exports.getfilenamepart = function (str) {
	//http://stackoverflow.com/questions/423376/how-to-get-the-file-name-from-a-full-path-using-javascript
	return (str.split('\\').pop().split('/').pop()).split('.').shift();
};

exports.delimof = function (str, delim, parse_from) {

	//find the first of the delimiter list or the end of the string
	if (parse_from === undefined)
		parse_from = 0;
	var leastp = str.length;
	for (var i = 0; i < delim.length; i++) {
		var p = str.indexOf(delim[i], parse_from);
		if (p >= 0)
			if (p < leastp) {
				leastp = p;
			}
	}
	return leastp;
};

exports.endsWith = function (str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

var properCase = exports.properCase = function (txt) {
	if (txt === undefined)
		return "";
	txt = txt.toLowerCase();
	var c = txt.charAt(0);
	if ((c >= 'a') && (c <= 'z')) {
		txt = txt.zxreplaceAt(0, c.toUpperCase());
	}
	return txt;
};

exports.Beautify = function (txt) {

	var p;
	var c;
	var cp = ' ';
	if (txt === undefined)
		return txt;
	if (!txt.toUpperCase)
		txt = String(txt);
	//console.log('Beautify: ',txt);
	//txt =  txt.trim();
	var l = txt.length;
	//replace $ . _ with spaces
	p = 0;
	while (p < l) {
		c = txt.charAt(p);

		if ((c === '$') || (c === '_') || (c === '.')) {
			txt = txt.zxreplaceAt(p, ' ');
		}
		if (((cp >= 'a') && (cp <= 'z')) && ((c >= 'A') && (c <= 'Z'))) {
			//small case followed by upper
			txt = txt.zxreplaceAt(p, c.toUpperCase());
			txt = txt.zxinsertAt(p, " "); //space camel-case
			l++;
		}
		cp = c;
		p++;
	}

	//capitalize first letter if longer than 1 , else lower case
	if (l > 1)
		txt = properCase(txt);
	else
		txt = txt.toLowerCase();

	return txt;
};

exports.FirstBeauty = function (txt1, txt2, txt3, txt4, txt5) {

	//console.log('FirstBeauty: ',txt1,txt2,txt3,txt4,txt5);
	if (txt1 !== undefined) {
		if (txt1 !== "")
			return exports.Beautify(txt1);
	}
	if (txt2 !== undefined) {
		if (txt2 !== "")
			return exports.Beautify(txt2);
	}
	if (txt3 !== undefined) {
		if (txt3 !== "")
			return exports.Beautify(txt3);
	}
	if (txt4 !== undefined) {
		if (txt4 !== "")
			return exports.Beautify(txt4);
	}

	return txt5;

};

exports.EscapeToHtmlString = function (str) {
	str = str.replace(/\"/g, "&quot;");
	str = str.replace(/</g, "&lt;");
	str = str.replace(/>/g, "&gt;");
	return str;
};

exports.pushArray = function (Target, Source) {
	Target.push.apply(Target, Source);
};

var indent = exports.indent = function (dent) {
	var str = '';
	for (var i = 0; i < dent; ++i) {
		str += ' ';
	}
	return str;
};

exports.gets = function (val,sep) {
	if (val === undefined)
		return "";
	if (Array.isArray(val))
		val = val.join(sep||' ');
	if (val === undefined)
		return "";
    if (typeof val == 'string' || val instanceof String)
        return val.trim();
    else
        return JSON.stringify(val);
	return "";
};

exports.geta = function (val) {
	if (val === undefined)
		return [];
	if (Array.isArray(val))
		return val;

	if (val.array)
		return val.array;
				
	return [val];	
};


exports.getA = function (val) {
	if (val === undefined)
		return [];
	if (Array.isArray(val))
		return val;
	return [val];
};

exports.stripWrapper = function (val, open, close) {
	if (val === undefined)
		return "";
	val = val.trim();
	if (val.substring(0, open.length) !== open)
		return val;
	if (val.slice(-close.length) !== close)
		return val;
	return val.slice(1, -1).trim()
};

exports.stripQ = function (val) {
	return exports.stripWrapper(val, '"', '"');
};

exports.stripBrackets = function (val) {
	return exports.stripWrapper(val, '(', ')');
};

exports.parseword = function (val) { //works in combo with  removeword
	val = val.trim();
	var p = val.search(/[^a-z0-9_\$]/gi);
	var ret = val.substring(0, p);
	return ret;
};
exports.removeword = function (val) {
	val = val.trim();
	var p = val.search(/[^a-z0-9_\$]/gi);
	val = val.substring(p);
	return val;
};
exports.parsealphanumeric = function (val) { //works in combo with  removeword
	val = val.trim();
	var p = val.search(/[^a-z0-9]/gi);
	if (p < 0)
		p = val.length;
	var ret = val.substring(0, p);
	return ret;
};
exports.removealphanumeric = function (val) {
	val = val.trim();
	var p = val.search(/[^a-z0-9]/gi);
	if (p < 0)
		p = val.length;
	val = val.substring(p);
	return val;
};

exports.parsenumeric = function (val) { //works in combo with  removeword
	val = val.trim();
	var p = val.search(/[^0-9]/gi);
	if (p < 0)
		p = val.length;
	var ret = val.substring(0, p);
	return ret;
};
exports.removenumeric = function (val) {
	val = val.trim();
	var p = val.search(/[^0-9]/gi);
	if (p < 0)
		p = val.length;
	val = val.substring(p);
	return val;
};

exports.extractEscapedStringFrom = function (o, OpenKey, CloseKey, from) { //substitute fields and symbols
	o.content = "";
	var lower = o.left.toLowerCase();
	o.at = lower.indexOf(OpenKey, from);
	if (o.at >= 0) {
		var left,
		afrom,
		okl = OpenKey.length,
		to,
		ckl = CloseKey.length;
		if (CloseKey !== "") { //sting delimiter
			to = lower.indexOf(CloseKey, o.at + okl);
			if (to < 0) {
				to = from.length;
			} //no closing .. presume rest of string
		} else { //non alphanum
			afrom = o.left.substring(o.at + okl);
			to = afrom.search(/[^a-z0-9_\$]/gi);
			if (to === -1) {
				to = afrom.length;
			}
			//console.log('non alphanum >>>>: ',okl,to,ckl,'from',afrom,o);
			to += o.at + okl;
			okl = 0;
		}

		o.content = o.left.substring(o.at + okl, to);
		left = o.left.substring(0, o.at);
		o.right = o.left.substring(to + ckl);
		o.left = left;
		//console.log('ExtractAnyOne >>>>: ',okl,to,ckl,o);
		return true;
	}

	return false;
}; // can inject replacement string  at o.at




exports.extractEscapedStringFromRegex = function (o, okl, OpenKey, CloseKey, from) { //substitute fields and symbols

	var afrom; //lower = o.left.toLowerCase();

	//o.at = lower.indexOf(OpenKey, from);

	afrom = o.left.substring(from);
	o.at = afrom.search(OpenKey) + from;

	if (o.at >= 0) {
		var left,
		to,
		ckl = CloseKey.length;
		//console.log(' alphanum >>>>: ',okl,to,ckl,'from',afrom,o,o.at );
		if (CloseKey !== "") { //sting delimiter
			var lower = o.left.toLowerCase();
			to = lower.indexOf(CloseKey, o.at + okl);
			console.log(' to >>>>: ', okl, to, ckl, 'from', afrom, o, o.at);
			if (to < 0) {
				to = o.at;
			} //no closing .. presume rest of string
			console.log(' to2 >>>>: ', okl, to, ckl, 'from', afrom, o, o.at);
		} else { //non alphanum
			afrom = o.left.substring(o.at + okl);
			to = afrom.search(/[^a-z0-9_\$]/gi);
			if (to === -1) {
				to = afrom.length;
			}
			//console.log('non alphanum >>>>: ',okl,to,ckl,'from',afrom,o);
			to += o.at + okl;
			okl = 0;
		}

		o.content = o.left.substring(o.at + okl, to);
		left = o.left.substring(0, o.at);
		o.right = o.left.substring(to + ckl);
		o.left = left;
		//console.log('ExtractAnyOne >>>>: ',okl,to,ckl,o);
		return true;
	}
	o.content = "";
	o.right = "";

	return false;
}; // can inject replacement string  at o.at


exports.process_tags = function (str,OpenKey, CloseKey, from,callback) {     
  	
	var o = {},
	res = "";
    from = from||0;
    
	o.left = str;
	while (exports.extractEscapedStringFrom(o, OpenKey, CloseKey, from)) {
		//console.log('process_tags',o);
		res += o.left + callback(o.content);//.substring(OpenKey.length));
		o.left = o.right;
		//process.exit(1);
	}
	res += o.left;
    //console.log('process_tags ..:',res);
	return res;
}

exports.escape_scriptstring = function (zx, val, open_key_length, open, close, before, aft) {
	var from = 0,
	o = {},
	res = "";
	//TODO must also escape  ' and other unprintable chars
	o.left = val;
	while (exports.extractEscapedStringFromRegex(o, open_key_length, open, close, from)) {
		//console.log('escape_scriptstring',o);
		res += o.left + before + o.content.substring(open_key_length) + aft;
		o.left = o.right;
		//process.exit(1);
	}
	res += o.left;

	return res;

};

exports.eachplugin = function (zx, fn, line_obj,value) {
	var results = [];
	for (var ixx = 0, max = zx.plugins.length; ixx < max; ixx += 1) {
		if (zx.plugins[ixx][fn] !== undefined) {
			//console.log('eachplugin ',(zx.plugins[ixx].module_name||' plugin has no name'),fn,exports.show_longstring(line_obj));//,zx.plugins[ixx]);
			try {
				var result = zx.plugins[ixx][fn](zx, line_obj,value);
				if (result !== undefined)
					results.push(result);
			} catch (e) {
				zx.error.caught_exception(zx, e, " zx.eachplugin: " +zx.plugins[ixx].module_name + " " + fn +" ( "  + exports.show_longstring(JSON.stringify(line_obj))+" ) ");
			}
		}
	}
	return results;
};

exports.locate_plugin = function (zx, txt, tag, value) {
	for (var ixx = 0, max = zx.plugins.length; ixx < max; ixx += 1) {
		if (zx.plugins[ixx][txt + tag] !== undefined) {
			zx.plugins[ixx][txt + tag](zx, value, tag);
			return true;
		}
	}
	return false;
};

exports.counts = function (str, searchvalue) {
	var c = 0,
	l = searchvalue.length,
	f = str.indexOf(searchvalue, 0);
	while (f >= 0) {
		f = str.indexOf(searchvalue, f + l);
		c++;
	}
	return c;
};

exports.ShortHash = function (str) {
	//makes a short has from a string

	//http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
	var hash = 0;
	if (str.length === 0)
		return hash;
	for (var i = 0; i < str.length; i++) {
		var chr = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash = hash & hash; // Convert to 32bit integer
	}
	return String(Math.abs(hash));

};

exports.UniqueName = function (zx, line_obj, anon_class) {
	// cannot use real anon - changes in compile phase will through names off - use source line number based, names zx.variables.AnonymousIndex++;
	var key = anon_class + zx.ShortHash(line_obj.srcinfo.filename) + String(line_obj.srcinfo.current_tag_index); // USE a short has of the file name
	if (line_obj.vari !== undefined)
		key += "_" + String(line_obj.vari);
	return key;
};

exports.insertArrayAt = function (array, index, arrayToInsert) {
	Array.prototype.splice.apply(array, [index, 0].concat(arrayToInsert));
};

exports.replaceAll = function (str, find, replace) {
	//http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
	//http://jsperf.com/replace-all-vs-split-join
	//this is faster than regex
	return str.split(find).join(replace);
};

exports.isObjectEmpty = function (array) { //http://stackoverflow.com/questions/6072590/how-to-match-an-empty-dictionary-in-javascript
	for (var prop in array)
		if (array.hasOwnProperty(prop))
			return false;
	return true;
};

exports.CSVtoArray = function (text) { //http://www.quora.com/How-can-I-parse-a-CSV-string-with-Javascript
	var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
	var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
	if (!re_valid.test(text))
		return null;
	var a = [];
	text.replace(re_value,
		function (m0, m1, m2, m3) {
		if (m1 !== undefined)
			a.push("'" + m1.replace(/\\'/g, "'") + "'"); //keep quotes
		else if (m2 !== undefined)
			a.push('"' + m2.replace(/\\"/g, '"') + '"');
		else if (m3 !== undefined)
			a.push(m3);
		return '';
	});
	if (/,\s*$/.test(text))
		a.push('');
	return a;
};

var show_longstring = exports.show_longstring = function (str,siz) {
    if (!siz) siz=40;
    
	if (str === undefined)
		return undefined;
	if (typeof str !== 'string')
		str = '[OBJECT]'; //JSON.stringify(str);
	str = str.trim();
	if (str.length > (siz*1.5))
		return "[" + str.substring(0, siz).replace(/\n/g, '\\n') + " ..." + (str.length) + " bytes... " + str.slice(-siz).replace(/\n/g, '\\n') + "]";
	else
		return "[" + str + "] shown in full " + (str.length) + " bytes... ";
}

//======================================================================================================extending the base classes
//http://stackoverflow.com/questions/1431094/how-do-i-replace-a-character-at-a-particular-index-in-javascript
//note interesting .. extending the base string class
String.prototype.zxreplaceAt = function (index, character) {
	return this.substr(0, index) + character + this.substr(index + character.length);
};
String.prototype.zxinsertAt = function (index, character) {
	return this.substr(0, index) + character + this.substr(index);
};
/* shows up as a name in a // for (name in zx.sql.declare_above)
Array.prototype.zxpushArray= function(Source) {
this.push.apply(this, Source);
}*/

//unit test:
//var res;
//var o={left:" kjaslkdaj lkas #dlaks jdla   "};
//if (exports.ExtractEscapedStringFrom(o,  "#" , "#", 0)) console.log('TRUE'); else console.log('FALSE');
//console.log('escape_scriptstring',o );
//console.log('escape_scriptstring',res=exports.escape_scriptstring(0," where :-varname=0  and :var2 end ",1,/:[^-]/g,"","'''||:","||'''") );
//console.log('escape_scriptstring',res=exports.escape_scriptstring(0,res,2,/:-/g,"","'||:","||'") );
//console.log('escape_scriptstring',res=exports.escape_scriptstring(0,res,2,":-","","'||:","||'") );
//var res='ref=/***/operator_ref';
//console.log('escape_scriptstring',res,exports.escape_scriptstring(0,res,5,/\/\*\*\*\//,"","'||/***/","||'"));
//process.exit(2);


/*

sizeof.js

A function to calculate the approximate memory usage of objects

Created by Stephen Morley - http://code.stephenmorley.org/ - and released under
the terms of the CC0 1.0 Universal legal code:

http://creativecommons.org/publicdomain/zero/1.0/legalcode

 */

/* Returns the approximate memory usage, in bytes, of the specified object. The
 * parameter is:
 *
 * object - the object whose size should be determined
 */
exports.sizeof = function (object) {

	// initialise the list of objects and size
	var objects = [object];
	var size = 0;

	// loop over the objects
	for (var index = 0; index < objects.length; index++) {

		// determine the type of the object
		switch (typeof objects[index]) {

			// the object is a boolean
		case 'boolean':
			size += 4;
			break;

			// the object is a number
		case 'number':
			size += 8;
			break;

			// the object is a string
		case 'string':
			size += 2 * objects[index].length;
			break;

			// the object is a generic object
		case 'object':

			// if the object is not an array, add the sizes of the keys
			if (Object.prototype.toString.call(objects[index]) != '[object Array]') {
				for (var key in objects[index])
					size += 2 * key.length;
			}

			// loop over the keys
			for (var key in objects[index]) {

				// determine whether the value has already been processed
				var processed = false;
				for (var search = 0; search < objects.length; search++) {
					if (objects[search] === objects[index][key]) {
						processed = true;
						break;
					}
				}

				// queue the value to be processed if appropriate
				if (!processed)
					objects.push(objects[index][key]);

			}

		}

	}

	// return the calculated size
	return size;

}


var forFields = exports.forFields = function (object,callback) {
//returns true and stops if a match is found - acts like arr.some
	if ((object==undefined)||(object==null)) return false;

    if (Array.isArray(object))         
        return object.some(callback);
        
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            if (callback( object[key],key,object)===true) return true;
        }
    }                    
    return false;
}    
var forFieldsx = exports.forFieldsx = function (object,callback) {
//returns true and stops if a match is found - acts like arr.some
//redbin: combine with forFields and test all code using it for side effects
    if (Array.isArray(object))         
        return object.some(callback);
        
    if (typeof val === 'object') {       
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                if (callback( object[key],key,object)===true) return;
            }
        }                    
    }
    else {
        callback( object,0,[object]);
    }
    //return false;
}                      

var stringify_2 = exports.stringify_2 = function (object,depth,maxdepth) {
//returns true and stops if a match is found - acts like arr.some
    //console.log(' xxxx>',depth,':',maxdepth,':');
    if (!depth) depth=0;
	if (!maxdepth) maxdepth=99;
	let indent_depth = depth*4;
	//console.log(' xxxx>',depth,':',maxdepth,':',indent_depth);
    forFields(object, function (field, key) {
        
        if (typeof field === 'object') {
			if (depth<maxdepth) {
				console.log(indent(indent_depth)+'',key,':');
				console.log(indent(indent_depth)+'  { ');
				if (key!=='zx')
					stringify_2(field,depth+1,maxdepth);
				console.log(indent(indent_depth)+'  } //',key);
			}
			else {
				console.log(indent(indent_depth)+'',key,':{...object depth limited...} >>>>>>>>>>>>>>>>>>>');
			}
        }else{
            console.log(indent(indent_depth)+'',typeof field ,key,exports.show_longstring(String(field)));
        }
        		
			

    });
                  
    return false;
}                        


var forFieldsRecursively = exports.forFieldsRecursively = function (object,callback,depth) {
//calls with each base type
    if (!depth) depth=0;
    forFields(object, function (field, key) {
        if (typeof field === 'object' || Array.isArray(field)) {
            forFieldsRecursively(field,callback,depth+1);
        }else{
            callback(field,key,object);
        }
    });                  
    return false;
}  

var forEveryString = exports.forEveryString = function (object,callback) {
    forFieldsRecursively(object, function (field, key) {
        if (typeof field === 'string') {
                callback(field,key,object);
                //console.log(indent(depth)+' ==',typeof field ,key,(String(field)));
                var newstr = field.replace(/CRLF/g, '\n');   
                obj1[key]=newstr;
                //console.log(indent(depth)+' ->',typeof field ,key,newstr);
            }  
    });        
    return false;
} 

var ReplaceForEveryString = exports.ReplaceForEveryString = function (object,regex,str) {
    //Redbin: there is code in replace_string_in_object that can be moved to a common library using this
    forEveryString(object, function (field, key) {
                //console.log(indent(depth)+' ==',typeof field ,key,(String(field)));
                var newstr = field.replace(regex,str);   
                obj1[key]=newstr;
                //console.log(indent(depth)+' ->',typeof field ,key,newstr);              
    });        
    return false;
} 

            


var copy_params = exports.copy_params = function (cx,obj,depth) {
//copies only shallow parameters
    if (!depth) depth=0;
    forFields(obj, function (field, key) {        
        if (typeof field === 'object') {
        }else{
            cx[key]=obj[key];
        }
    });

}                        




var encodeHtml = exports.encodeHtml = function (html) {
//decode with <script type="text/javascript">document.write(unescape("..."));</script>
     html = escape(html);
     html = html.replace(/\//g,"%2F");
     html = html.replace(/\?/g,"%3F");
     html = html.replace(/=/g,"%3D");
     html = html.replace(/&/g,"%26");
     html = html.replace(/@/g,"%40");
     return html;
   } 
var showSource = exports.showSource = function (html) {
    html = '' + html + '';
    html = html.replace(/</g,"&#60;");
    html = html.replace(/>/g,"&#62;");
    //html = html.replace(/\n/g,"<br>");
    
    html =  '<div align="left"> <pre class="brush: js; html-script: true">' + html + '</pre></div>';
    return html;
} 
   

var padRight = exports.padRight = function (text,length) {
    return text+Array(l-text.length+1).join(" ")
} 

var updateFileSync = exports.updateFileSync = function (file_name,text) {
    var str=null;
    try { str = String(fs.readFileSync(file_name));
    } catch (e) {}
    
    if (str!=text)
      fs.writeFileSync(file_name,text);
}    
   
   
//http://stackoverflow.com/questions/25058134/javascript-split-a-string-by-comma-except-inside-parentheses
var splitNoParen = exports.splitNoParen = function (s, delim) { //Lafras enhanced to do quotes
	//console.log("splitNoParen :", s);
	var left = 0,
	right = 0,
	A = [],
	Q = 0,
	M = s.match(/([^()']+)|([()'])/g);
	if (!M)
		return A;
	var
	L = M.length,
	next,
	str = '',
    dbg=0;
	//var del_regx = new RegExp("([^" + (delim) + "]+)", 'g'); //anything except the delimiter
	if (dbg) console.log("splitNoParen:", L, M);
	for (var i = 0; i < L; i++) {    
		next = M[i];       
        //console.log("             xx:",str, ' n:', next, left, right);
		if (next === "'" && Q === 0) {
			++left;
			Q = 1;
		} 
        if (next === '(')
			++left;

		if ((left !== right)&&(i !== (L-1))) {
			str = str + next;
			if (dbg) console.log("accumulate :", str, left, right,' m:');
            }
        
        if ((left === right)||(i === (L-1))) {
			//var add=next.match(del_regx);
			var add = next.split(delim);
			if (dbg) console.log("Appending :", str,next, add);
            str+=add.shift();
            if (dbg) console.log(".....ding :", str, add);
            if (A.length===0) A.push('');
            A[A.length-1]+=str;
			A = A.concat(add);
            str='';
		}
        
        
        if (next === ')')
			++right;
        if (next === "'" && Q === 1) {
			++right;
			Q = 0;
		}         
        
	}
	return A;
}   

var GetClosingBracket = exports.GetClosingBracket = function (s,frm) { 
	var c,
	    Quoted=0,
		Bracketed=0,
		L = s.length;
		
    for (var i = frm; i < L; i++) {  
		c = s.charAt(i);
		//console.log("GetClosingBracket i:",i, " c:",c," Q:",Quoted," B:",Bracketed);
		if (Quoted) {
			if (c=="'") Quoted--;
		} else {
			if (c=="'") Quoted++;
			if (c=='(') {Bracketed++; }			
			if (c==')') {
				Bracketed--; 
				if (Bracketed==0) return i;	
				}
			}
		}		
	return L;			
}
	

exports.unit_test_s = function (zx) {


console.log(JSON.stringify(zx.GetClosingBracket("(abc,'123)'default);999"), null, 4));
//console.log(JSON.stringify(zx.GetClosingBracket('123;456;789;(abc;(123;456;789) default;) 999', ';'), null, 4));
//console.log(JSON.stringify(zx.GetClosingBracket('(123;456;789;(abc;123;456;789")" default;) 999);888;777', ';'), null, 4));
console.trace('process.exit(2) from test in updater : ');process.exit(2);//test
}

//var inputs = fs.readFileSync('test.txt', 'utf8');
//console.log(JSON.stringify(splitNoParen(inputs, ';'), null, 4));
//console.log(inline_comment_suppress('abc --def\nghi\nklm\n---none of this\nend')); 
//exports.unit_test_s(exports);
//process.exit(2);


/*//var fields={a:"a",b:"b",c:"c"};
var fields=["a","b","c"];
    forFields( fields,function (fld,key) {
     console.log('forFields process_tags a: ', fld,key);           
    });   
process.exit(2);    */
    
//================================================tests
/*
var Result="abc,repack(cd,ef),ouqwui";
	exports.process_tags(Result, 'repack(', ')', 0, function (value) {
    console.log('repacking process_tags a: ', value);
		var a = value.split(',') || [value];
		var r = '';
		a.forEach(function (p) {
			r += "{{#field.f."+p+"}}"+p+"=\"{{field.f."+p+"}}\"{{/field.f."+p+"}} ";
		});
        console.log('repacking process_tags: ', r);
        return r;
	});

*/

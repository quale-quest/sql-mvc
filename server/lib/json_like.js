"use strict";

/*
Few of the tools I have looked at
    http://pegjs.org/
    https://www.npmjs.com/package/jsonic
    https://github.com/mbest/js-object-literal-parse


purpose
is to have a programmer friendly concise method of expressing complex data,
 that is similar to JSON,HTML properties and CSS properties.

JSON like parser
 **warning does not produce JSON compatible output - especially in regards to arrays

Syntax
like JSON, except
Quotes are either " '
Colon is optional -  a{b} ==a:{b}
Key quotes are optional
value quotes are optional for single words
values may be multi line text
values are optional if not supplied, will default to "true" i.e. operate as a switch
unified object (),[],{} all produce the same object


Rules
The top level object is considered to be wrapped in {}
an anonymous {} drops out to its parent level. i.e. its values is assigned to its parent, i.e. it does not open a sub object
keys are separated form their values by either : or =
key-values are separated from each other by , or ; or space

objects are created with either {} or [] or () and give the same result
all objects/arrays/functions are stored as both an object and an array
a key without a value is a key switch with the value true in the object and a entry in the array (if the name is very long(>100) we may omit it from the object)
a key value pair is not stored in the array, it considers that named keys can be anywhere and move about, without affecting the fixed position values
a() adds  isFuntion:true to the object
a{b:2 4}  is  a:{b:2,4=true,array:["4"]}
a[1,2,3]  is  a:{1:true,2:true,3:true,array:[1,2,3]}
- consistent access if I want the array value I can go: if (a.array) log(a.array[a.array.length])

key-name modifier prefixes:
!word is a switch with the value false (inverter)
others:  ^word *word %word etc are reserved may be useful later




Examples
when   a:1 {b:2} c:3     - is a anonymous object???  or is b anonymous, part of the parent or part of a ?  ---I think part of the parent - use case sloppy copying of attributes from other locations
when   a:1 [1,2,3] c:3    - is a anonymous array???  array cant be part of the parent object - so is it part of a or an anonymous array- a could be anything, so it only levaes aa
--look at use cases...--- call it aa[] an anonymous array  so = [{b:2},[1,2,3]]
when   a:1  lots of text    - lots of text is three indicator flags - lots of text  - on the same line as preceding key:values is taken as flags - unless in quotes
when   a:1 "lots of text"    -  "lots of text" goes into anonymous array as a string
when   a:1 \n lots of text     - lots of text goes into anonymous array as a string
when   {a:1 \n lots of text}     - lots of text  goes into anonymous array as a string

when   text  --values          text goes into aa , values goes into object array
when   a or {a} or [a]         {a:true,array:["a"]}    access with c.a; if (c.array) log(c.array[c.array.length-1]);
when   a:true                  {a:true}  -- no array
when   a(1)                    {a:{1:true,array:[1],funtion:true}}
when   a(b:1)                  {a:{b:1,funtion:true}}


short-cut use cases    A"Edit" ==Action Edit  or v[1,2,3] = value array
when   te"xt"                  te:"xt"
when   "te"xt                  te:"xt"
when   te{xt}                  te:{xt:true}
when  te[xt]                   te:["xt"]
when  te(xt)                   te is a function  te:{aa:["xt"]} and set a key te_is_a_function to true
when te xt  or te,xt           te=true,xt=true
when [te xt]  or [te,xt]       ["te","xt"]

when   key:te"xt"              key:"te" xt:true
when   ke"y":te"xt" or "ke"y:te"xt"    ke:"y" te:"xt"   the colon is technically invalid here- but is ignored

when   {a"   b:c d:e}       {a:"   b:c d:e}"}   the object could throw an error no closing quote and no closing brace
when   {a""   b:c d:e}       {a:"",b:c,d:e"} normal short cut

when   {a:  b:c d:e}       {a:true,b:c,d:e"}
when   {:a  b:c d:e}       {aa["a"],b:c,d:e"}
when   {:a :b b:c d:e}       {aa["a","b"],b:c,d:e"}


when  a(key:val 1 te:xt)             use case : like named parameters  (ES6), a:{key:"te",aa[1],te:"xt"} and set key a_is_a_function to true
or a:{key:"te","1":true,te:"xt"}
--this is quite a hard one to implement

when  a:[{key:val},{te:xt}]             [{key:"te"},{xt:true}]  - pretty much standard array of objects
when  a:[key:val 1 te:xt]             ["key","te",1,"xt","true"] or ["key:te",1,"xt:true"] or would it be [{key:"te"},1,{te:"xt"}]  ???

when  {a:b:c}                       {a:b,c:true,array:["c"]}


Challenging:
consider above when   a:1 "lots of text"    -  "lots of text" goes into anonymous array as a string
when  te(xt)                          te:{aa:["xt"]} and set a key te_is_a_function to true
when  a(key:val 1 te:xt)              a:{key:"te",aa[1],te:"xt"}
when  a:[key:val 1 te:xt]             ["key","te",1,"xt","true"] or ["key:te",1,"xt:true"] or would it be [{key:"te"},1,{te:"xt"}]  ???
when  a:[1 key:val te:xt]             if a key pair is found on a array, move the array into a sub array named aa  and change ThisLevel to a object

 */

var parse_v1 = function (text, context_vars) { //old version
	if (typeof text !== "string" || !text) {
		return null;
	}
	context_vars = context_vars || '';
	text = text.trim();
	return (new Function(context_vars + " ;\n var yes='yes',no='no',y='y',n='n';return " + text))(); //yes we know eval is evil but for now we accept it - keep the warning and fix later

};

//=============================

var forFields = exports.forFields = function (object, callback) {
	//returns true and stops if a match is found - acts like arr.some

	if (Array.isArray(object))
		return object.some(callback);

	for (var key in object) {
		if (object.hasOwnProperty(key)) {
			if (callback(object[key], key, object) === true)
				return;
		}
	}
	return false;
};

var Space = 32,
Comma = 44,
Semicolon = 59, //;
Newline = 10,
SingleQuote = 39,
DoubleQuote = 34,
BackTick = 34,
OpenBrace = 123, //  {
CloseBrace = 125,
OpenBracket = 40, //  (
CloseBracket = 41,
OpenArray = 91, //  [
CloseArray = 93,
Escape = 92,
Equal = 61, //=
Colon = 58, // :
//ThisLevel states
thisIsAnObject = -10,
thisIsAnArray = -11,
thisIsAnString = -12, //intentional
SwitchOnValue = "on",

looking_for_key_or_value = -1;

var closing_for = function (c) {
	if (c === OpenBracket)
		return CloseBracket;
	if (c === OpenArray)
		return CloseArray;
	if (c === OpenBrace)
		return CloseBrace;
	if (c === DoubleQuote)
		return DoubleQuote; //"
	if (c === SingleQuote)
		return SingleQuote; //'

};

var isQoute = function (chr) {
	return (chr === SingleQuote) || (chr === DoubleQuote) || (chr === BackTick);
};

var isOpenObject = function (chr) {
	return (chr === OpenBracket) || (chr === OpenBrace);
};

var isOpenArray = function (chr) {
	return (chr === OpenArray);
};

var isDelimiter = function (chr) {
	return (chr === Comma) || (chr === Space) || (chr === Semicolon) || (chr === Newline) ;
};

var isAssigner = function (chr) {
	return (chr === Equal) || (chr === Colon);
};

var debug = 0;
var parse3count = 0;
var parse3countMax = 999999;

var parse4 = function (text) {
    //debug=1;
    return parse3(text,1);
}
var parse3 = function (text,extra_mode_par) {
    //extra mode 1 : when the object closes, stop scanning and return the position in the string as scan_return_pos 
    //extra mode 0 : continue scanning until the end of the string 
    
	// make sure text is a "string"
	if (typeof text !== "string" || !text) {
		return null;
	}

	var o = {};
	var left = 0,
	right = 0,
	max = 99999;
    var depth=0;
    var extra_mode=extra_mode_par;
    
	var str = text.trim() + " "; //last delimiter to avoid an unnecessary code block
	parse3count++;
	if (debug)
		console.log('parse3 start with : length=', text.length, '"' + text + '"');
	var parse_quoted_string_old_method = function () {
		var p = str.indexOf(str.charAt(right), right + 1);
		if (debug)
			console.log('parse3 parse_quoted_string :', left, right, p);
		if (p < 0)
			p = str.length;
		right = p;
	};
	var parse_quoted_string = function () {
		var localescaped = false;
		var quotechar = str.charAt(right);
		var out = '';
		++right;
		for (; right < str.length; ++right) {
			var chr = str.charAt(right);
			if (localescaped) {
				out += chr;
				localescaped = false;
			} else {
				if (chr === "\\") {
					localescaped = true;
				} else {
					if (chr === quotechar)
						return out;
					out += chr;
				}
			}
		}
		return out;
	};

	var skip_space = function () {
		while ((right < str.length - 1) && str.charCodeAt(right + 1) == Space) {
			right++;
		} //quick over multiple spaces
		//must leave the last spacespaces
	};
	var skip_space_here = function () {
		while ((right < str.length - 1) && str.charCodeAt(right) == Space) {
			right++;
		} //quick over multiple spaces
		//must leave the last spacespaces
	};
              
var past_space = function () {  
					right++; //affect 10a if enabled
                    skip_space_here();//wont skip any thing right is still on the colon                     
                        //console.log('parse3 isAssigner space   :', left, right,':', str.charAt(right));
                    left = right;
                    right--;//compensate decrement for the increment at the end of the loop
}    
    
	var sub_parse3 = function (closing, current_object) {
		if (debug)
			console.log('sub_parse3 start with :', left, right, closing, current_object);
		var key_or_value,
		keyname;
		var scan_mode = looking_for_key_or_value;
		var nonSpaceCount = 0;
		var arrayObj = 0;
		var escaped = 0;

		var string_recieved = function (value) {
            
            if (debug) console.log('string_recieved :',keyname,value );
            
			if (arrayObj) {
				if (current_object.array === undefined)
					current_object.array = [];
				current_object.array.push(keyname);
			}
			if (keyname) { //already has a key so this is the end of the value

				if (typeof value != "number") {
					value = value.trim();
					if (value === "true")
						value = true;
				}

				current_object[keyname] = value;
				keyname = null;
			} else { //this must be the end of the key-name and start of the value in a te"xt"   short-cut
                if (typeof value != "number") {
				keyname = value.trim();
                }
			}
			nonSpaceCount = 0;
			left = right + 1;
			arrayObj = 0
		};
		//=========function:
		if (debug)
			console.log('parse3 01:', left, right, ':', str.charAt(right), nonSpaceCount);
		for (; right < str.length; ++right) {
			if (--max < 0) {
				if (debug)
					console.log('max exeeded - likely algorithom fault');
				console.trace('process.exit(2) from sub_parse3 : '); process.exit(2);
			}
			if ((str.charCodeAt(right) === Space) && (right < str.length - 1)) {
				while ((right < str.length - 1) && str.charCodeAt(right + 1) == Space) {
					right++;
				} //quick over multiple spaces- leave one space
			}

			if ((str.charCodeAt(right) === Space) && (str.charCodeAt(right + 1) === Colon)) {
				if (debug)
					console.log('parse3 Space Colon found:', left, right, chr, ':', str.charAt(right), nonSpaceCount);
				right++;
			}

			var chr = str.charCodeAt(right);
			escaped = false;
			if (chr === Escape) {
				right++;
				chr = str.charCodeAt(right);
				escaped = true;
			}

			if (!escaped) {

				if (chr !== Space)
					nonSpaceCount++;
				if (debug)
					console.log('parse3 a:', keyname,left, right, chr, ':', str.charAt(right), nonSpaceCount);

				if (closing === chr) { //closer found
					//..what to do with it 		//I have already been doing it
					key_or_value = str.substring(left, right - 1 + 1);

					if (debug)
						console.log('parse3 closing === chr)   :', left, right, chr, ':', str.charAt(right), '{', keyname, ":", key_or_value, '}', str, o);
					if (!keyname) {
						if (left !== right) {
							keyname = key_or_value;
							key_or_value = SwitchOnValue;
							arrayObj = 1;
						}
						if (debug)
							console.log('parse3 closing === chr) AOAOAO :', left, right, chr, ':', str.charAt(right), '   ', keyname, ":", key_or_value);
					} else if (left === right) {
						key_or_value = SwitchOnValue;
						arrayObj = 1;
					}
                    
						try {
							var ival = +key_or_value;
                            if (!isNaN(ival)) 
							key_or_value = ival;
						} catch (e) {}                    
					string_recieved(key_or_value);

					return;
				}

				if (nonSpaceCount > 1 && isQoute(chr)) { // a quote in the middle of an unquoted word
					//this is the end of the unquoted part

					key_or_value = str.substring(left, right - 1 + 1);
					if (debug)
						console.log('parse3 isQoute nspc>0   :', left, right, chr, ':', str.charAt(right), ":", key_or_value, str);
					string_recieved(key_or_value);
					//continues at mark1
				}
				if (isAssigner(chr)) {
					key_or_value = str.substring(left, right - 1 + 1);
					if (debug)
						console.log('parse3 isAssigner     :', left, right, chr, ':', str.charAt(right), '{', keyname, ":", key_or_value, "}", o);
					if (left !== right) {//would ready have a key name
						string_recieved(key_or_value);
                        //right++; //affect 10a if enabled
                    }
                      else
                      {                          
                      }
                    past_space();  
                                        
					
					if (debug)
						console.log('parse3 isAssigner X   :', left, right, chr, ':', str.charAt(right), '{'+keyname+":"+key_or_value+"}");
					nonSpaceCount = 0;
				}
				if (isDelimiter(chr)) {

					key_or_value = str.substring(left, right - 1 + 1).trim();
					if (debug)
						console.log('parse3 isDelimiter      :', left, right, chr, ':', str.charAt(right), '   {', keyname, ":" + key_or_value + "}");

					if (!keyname) {
						if (debug)
							console.log('parse3 isDelimiter AOXXXX :', left, right, chr, ':', str.charAt(right), '   {', keyname, ":" + key_or_value + "}", o);
						if (key_or_value) {
							keyname = key_or_value;
							key_or_value = SwitchOnValue;
							arrayObj = 1;
							if (debug)
								console.log('parse3 isDelimiter AOAOAO :', left, right, chr, ':', str.charAt(right), '   ', keyname, ":", key_or_value);
							string_recieved(key_or_value);
						} else {
							skip_space();
							left = right + 1;
						}
					} else {
						//this is not a quoted value
                        if (left === right) {
						key_or_value = SwitchOnValue;
						arrayObj = 1;
					    }
						try {
							var ival = +key_or_value;
                            if (!isNaN(ival)) 
							key_or_value = ival;
						} catch (e) {}

						string_recieved(key_or_value);
					}

					//right++; affect 05d
					skip_space();

				}

				if (isOpenObject(chr) || isOpenArray(chr)) {
					key_or_value = str.substring(left, right - 1 + 1);
					if (debug)
						console.log('parse3 isOpenObject   :', left, right, chr, ':', str.charAt(right), ":", key_or_value);
					if (!keyname)
						keyname = key_or_value;
					if (keyname) {
						//new sub object
						current_object[keyname] = {};
						current_object = current_object[keyname];
						if (chr === OpenBracket) {
							current_object.Function = true;
						}
					}
					left = right = right + 1;
                    depth++;
					sub_parse3(closing_for(chr), current_object);
                    depth--;
                    //console.log('parse3 returned from OpenObject   :', left, right, chr, ':', str.charAt(right), ":",extra_mode, depth,current_object);
                    if ((depth===0)&&(extra_mode===1))  {
                         current_object.object_ended_at = right;   
                         //console.log('parse3 object_ended_at   :', current_object.object_ended_at);
                         return;
                    }
                    
					//skip_space();
					left = right + 1;
					keyname = null;

				}

				if (nonSpaceCount <= 1 && isQoute(chr)) { // a quote at the start of ...
					//mark1 from above also continues here
					//start of a string with a quote
					left = right + 1;
					key_or_value = parse_quoted_string();
					//key_or_value = str.substring(left, right - 1 + 1);
					if (debug)
						console.log('parse3 isQoute          :', left, right, chr, ':', str.charAt(right), keyname, ":", key_or_value);
                    past_space(); 
					if (debug)
						console.log('parse3 isQoute past_space:', left, right, chr, ':', str.charAt(right), keyname, ":", key_or_value);                    
					if (keyname) {
						string_recieved(key_or_value);
					} else {
						keyname = key_or_value;
						left = right + 1;
					}
				}
			}

		}
		return;

	};

	sub_parse3(0, o);
	if (parse3count === parse3countMax)
		console.log('parse3 done with :', parse3count, '"' + text + '"\n', o);
	if (parse3count > parse3countMax)
    {console.trace('process.exit(2) from (parse3count > parse3countMax) : '); process.exit(2);} //slow inspect each element

    if (debug)
		console.log('parse3 done with : length=', text.length, '"' + text + '"\n', o);
	return o;
};

var test = function (ref, text, lxon) {
	var o = parse3(lxon,1);
    if (o.object_ended_at) delete o.object_ended_at;
	if (JSON.stringify(o) !== JSON.stringify(ref)) {
		debug = true;
		console.log('\n\n\n\n\n\n\n');
		console.log('\n\n\n\n');
		o = parse3(lxon,1);
        if (o.object_ended_at) delete o.object_ended_at;
		console.log('Failed ', text, '\n Text     :', lxon, '\n Should be :', JSON.stringify(ref, null, 4), '\n Result   :', JSON.stringify(o, null, 4));
		console.log('    :', JSON.stringify(o) + ";" + '\n     ', JSON.stringify(ref));
		process.exit(2);
	} else {
		if (debug)
		console.log('Pass ', text);
	}
}

var parse_compare = function (text, context_vars) {

	var o1 = parse_v1(text, context_vars);
	var o3 = parse3(text,1);
    if (o3.object_ended_at) delete o3.object_ended_at;
	if (JSON.stringify(o1) !== JSON.stringify(o3)) {
		console.log('parse_compare Failed: ', text, '\nref     :', JSON.stringify(o1, null, 4), '\n Result   :', JSON.stringify(o3, null, 4));
		console.log('--------------------: ', text, '\n    ref_1   :', JSON.stringify(o1), '\n   Result_3 :', JSON.stringify(o3));
		process.exit(2);
	}
	return o3;
}

var unit_test = function () {

	parse3countMax = 1000;

	//console.log('start Quic JSOL2', JSOL2("a: 1, b: 2, \"quotedKey\": 3, 'aposQuotedKey': 4"));

	//console.log('start Quic parse2', JSON.stringify(parse2("a: 1, b: 2, \"quotedKey\": {obj:3,val:'text'}, 'apos\nQuotedKey': 4, , vals:{sub:'5'} xxx:x3 ,val6:text value , and"), null, 4));
	//console.log('start Quic parse3', JSON.stringify(parse3(			"obj:sub"            ), null, 4));

	var reference;

	reference = {
		obj : "\\"
	};
	test(reference, "Simple escapes 00a", "obj:'\\\\'");

	reference = {
		obj : "\'"
	};
	test(reference, "Simple escapes 00b", "obj:'\\''");

	reference = {
		obj : 1
	};
	test(reference, "Simple values  00c", "obj:1");
	reference = {
		obj : "1"
	};
	test(reference, "Simple values  00d", "obj:'1'");

    reference =  {"style":"warn","array":["you were here last at here.this_page_info    "],"you were here last at here.this_page_info    ":"on"};
    test(reference, "Simple values  00e", "style=warn 'you were here last at here.this_page_info    '"); 
    
    
	reference = {
		obj : "sub"
	};
	test(reference, "Simple obj 01a", "obj:sub");
	test(reference, "Simple obj 01b", "obj: sub");
	test(reference, "Simple obj 01c", "obj :sub");
	test(reference, "Simple obj 01d", "obj : sub");

	test(reference, "Simple obj 03a", "obj'sub'");
	test(reference, "Simple obj 03b", "'obj'sub ");
	test(reference, "Simple obj 03c", '"obj"sub ');
	test(reference, "Simple obj 03d", "obj'sub");

	test(reference, "Simple obj 04a", "{obj: sub}");
	test(reference, "Simple obj 04b", "[obj: sub]");
	test(reference, "Simple obj 04b", "(obj: sub)");

	reference = {
		array : ["obj"],
		obj : "on"
	};
	test(reference, "Simple obj 05", "obj");
    
    reference = {"array":["obj1","obj2","obj3"],"obj1":"on","obj2":"on","obj3":"on"};
    test(reference, "Simple obj 05", "obj1 obj2 obj3");

	//arrays
	reference = {
		array : ["obj", "o2"],
		obj : "on",
		o2 : "on"
	};
	test(reference, "Simple obj 05a", "obj,o2");
	test(reference, "Simple obj 05b", "{obj,o2}");

    
    
	//arrays and object mixed
	reference = {
		obj : true,
		array : ["o2"],
		o2 : "on"
	};
	test(reference, "Simple obj 05c", "{obj:true,o2}");
	test(reference, "Simple obj 05d", "{obj:'true',o2}");

    //top terminating object
     reference = {"array":["obj","o2","o3"],"obj":"on","o2":"on","o3":"on"};
    test(reference, "Simple obj 06a", "{obj,o2,{o3}} text");
    
	//named  objects
	reference = {
		ab : {
			cd : 12
		}
	};
	test(reference, "Simple obj 10a", "{ab:{cd:12}}");

	//named array objects
	test(reference, "Simple obj 10aa", "{ab{cd:12}}");
	reference = {
		"ab" : {
			"cd" : 12,
			"sw" : true
		}
	};
	test(reference, "Simple obj 10b", "{ab{cd:12},sw=true}");
    test(reference, "Simple obj 10c", "{ab{cd:12};sw=true}");
	test(reference, "Simple obj 10d", "{ab{cd:12} ,sw=true}");
	test(reference, "Simple obj 10e", "{ab{cd:12}, sw=true}");
	test(reference, "Simple obj 10f", "{ab:{cd:12}, sw=true}");

	//function
	reference = {
		ab : {
			Function : true,
			cd : 12
		}
	};
	test(reference, "Simple obj 11c", "{ab(cd:12)}");

	//functional examples
	reference = {
		"Style" : "Todo",
		"placeholder" : "Type here what to do",
		"array" : ["autosave"],
		"autosave" : "on"
	};
	test(reference, "Simple obj 20a", "{Style=Todo,placeholder:'Type here what to do' autosave}");
	test(reference, "Simple obj 20b", "{Style=Todo,placeholder:'Type here what to do'; autosave}");
	test(reference, "Simple obj 20c", ' {   "Style": "Todo",     "placeholder": "Type here what to do",      "autosave"}');
    reference = {"Action":"Edit","placeholder":"What needs to be done (tab to save)","autosave":"yes"};
    test(reference, "Simple obj 20d", ' {Action:"Edit","placeholder":"What needs to be done (tab to save)","autosave":yes}');
 
    reference =  {"icon":"icon-block-black box-incoming-b","from":"Z$USER","where":"id=Operator.id","form":"Operator/Inbox","Title":"Inbox","Style":"UserBar"};
    test(reference, "Simple BCB 21a", '{ icon="icon-block-black box-incoming-b" from=Z$USER where="id=Operator.id" form=Operator/Inbox Title="Inbox" Style=UserBar}');
    reference =   {"file":"~/All/StandardPageClose"};
    test(reference, "Simple obj 21b", "(file=~/All/StandardPageClose)");

    
 
	reference = {
		"regex" : "regex:/create\\s+table/i",
		"rl_context" : "regex:/create\\s+table\\s+(\\w+)/i"
	};
	test(reference, "Simple obj 21b", ' {regex:"regex:/create\\\\s+table/i",rl_context:"regex:/create\\\\s+table\\\\s+(\\\\w+)/i"}');
    



	//simple unexpected results
	reference = {
		obj : "sub)"
	};
	test(reference, "Simple obj 90a", "(obj'sub)"); //this would be invalid   ==  "obj": "sub)"


	console.log('Pass unit_test');
}

parse3countMax = 99999;
unit_test();

//choose the default parser
//exports.parse = parse_v1;
exports.parse = parse4;
//exports.parse = parse_compare;
//process.exit(2);

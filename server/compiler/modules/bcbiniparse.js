"use strict";
/*
speed/memory performance  is not important
ease of use is important
 */

var zx = require('../zx.js');

exports.parse = function (str, filename, obj) {
	//tries to emulate bcb (borland c++ builder) tag includes
	/*
	strings with " can extend multiple lines,
	anything that is not key= format ends up as a last string

	more accurately : bcb extracts the tags ( multi line capable) what remains after is returned in the final string
	this wont work for the compiler: we dont know what tags we are going to be using,

	extract everything with key=value   // key has no quotes
	everything else is one string

	a line that contains only " is followed by strings and ended by another line with only "  or the end of file/block


	 */

	//line by line
	//first get word no delimiters word=  else ignore
	//   if next is " then escape upto next "

	var vale,
	p;

	str = str.trim();
    var strb4=str;
	var loops = 0;
	var debuglevel = 0;

	if (debuglevel > 5)
		console.log('\n\n\n\nXZXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXBCB\n', str);

	//tag
	var tage = zx.delimof(str, [' ', '\n']);
	var tag = str.substring(0, tage).trim();
	str = str.substring(tage + 1).trim();
    
	//console.log('tag:', tag);

	obj.tag = tag;
	obj.srcinfo.filename = filename;
	var nonkey = [];
	while (str !== "") {
		if (loops++ > 500)
			console.log('\n\n\n\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXLoooping to many times',loops,' srtlength:',str.length);//, str);

		var val = "",
		key = "";

		var keye = zx.delimof(str, ['"', '=', ' ', '\n']);
		var keyd = str.substring(keye, keye + 1).trim();

		//console.log("str",str,"keyd",keyd,"keye",keye);


		if (keyd === "=") {
			key = str.substring(0, keye).trim().toLowerCase();
			key = key.replace(/\-/g, "_"); // v2 fixups

			str = str.substring(keye + 1).trim();
			//console.log("strx ",key, str,"keye",keye);
			if (str.substring(0, 1) === '"') {
				//console.log('Quoted key:',str);
				if (str.substring(0, 2) !== '"\n') {
					str = str.substring(1).trim();
					vale = zx.delimof(str, ['"']);
					val = str.substring(0, vale).trim();
					str = str.substring(vale + 1).trim();
				} else {
					//multi line ending on a solatary "
					//console.log(' Single Quote key:',str);
					p = str.indexOf('\n"\n');
					if (p >= 0) {
						val = str.substring(2, p).trim();
						//console.log(' Single Quote val:',val);
						str = str.substring(p + 3).trim();
						//console.log(' Single Quote str:',str);
					} else {
						if (str.slice(-2) === '\n"')
							str = str.slice(0, -2);
						val = str.substring(2).trim();
						//console.log(' no terminator found:',val);
						str = '';
					}
					//console.log('strkeyval:',key,"val:",val,'...',str);
				}

			} else {
				//todo also accept assign=val="...";
				//todo this should only take one word
				var aword = zx.parseword(str);
				zx.removeword(str);
				str = zx.removeword(str);
				//console.log('str testqt keyval:',key," aword",aword,"ss1:"+str.substring(0,1)+":",'  ...'+str);

				if (str.substring(0, 2) === '="') {

					str = str.substring(2).trim();
					vale = zx.delimof(str, ['"']);
					val = aword + "=" + str.substring(0, vale).trim();
					str = str.substring(vale + 1).trim();
					//console.log('kkkkkkkkkkkkkkkkkkkkkkkkstr =qt keyval:',key," aword",aword,"val:",val,'  ...',str);
				} else {

					//check agains form=~\\All\\Operator\\Inbox

					vale = zx.delimof(str, ['\n', ' ']);
					val = aword + str.substring(0, vale).trim();
					str = str.substring(vale + 1).trim();
					//console.log('********************* str =nonqt keyval:',key," aword",aword,"val:",val,'  ...',str);
				}

				//console.log('keyval eol:',key," aword",aword,"xstr",xstr,"val:",val,'...',str);
			}

			//console.log('keyval key:',key," aword",aword,"xstr",xstr,"val:",val,'...',str);
			if (obj[key] === undefined)
				obj[key] = [];
			obj[key].push(val);
			//console.log('keyval key z:',key," aword",aword,"xstr",xstr,"val:",val,'...',str);

		} else if (keyd === '"') {
			//console.log('nonkeyval a:',str.substring(0,2),str);
			if (str.substring(0, 2) === '"\n') {
				//console.log('nonkeyval Single Quote Tag:',str);
				p = str.indexOf('\n"\n');
				if (p >= 0) {
					val = str.substring(2, p).trim();
					//console.log('nonkeyval Single Quote val:',val);
					str = str.substring(p + 3).trim();
					//console.log('nonkeyval Single Quote str:',str);
				} else {
					if (str.slice(-2) === '\n"')
						str = str.slice(0, -2);
					val = str.substring(2).trim();
					//console.log('nonkeyval no terminator found:',val);
					str = '';
				}
				//console.log('nonkeyval double quoted val:',val);
				nonkey.push(val); //TODO should val be split on \n first?
			} else {
				str = str.substring(1).trim();
				vale = zx.delimof(str, ['"']);
				val = str.substring(0, vale).trim();
				//console.log('nonkeyval:',key,"val:",val,'...',str);
				str = str.substring(vale + 1).trim();
				nonkey.push(val);
			}

		} else if (keyd === '') {
			vale = zx.delimof(str, ['\n']);
			val = str.substring(0, vale).trim();
			nonkey.push(val);
			str = str.substring(vale + 1).trim();
			//console.log('------------------------abort on unknown CR type:',keyd,' at ',keye,' in ',str);
			//return;
		} else {
			console.log('------------------------abort on unknown key type:', key, key.toString('hex'), ' at ', keye, ' in ', str);
			nonkey.push("ERROR-ABORT");
			break;
		}

	}
    
    if (loops > 500)
			console.log('\n\n\n\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXLooped to many times\n', strb4);


	obj.nonkeyd = nonkey;
	//console.log('obj val:VVVVVVVVVVVVVVVVVVVVVVVVVVVVV\n',obj,"\n^^^^^^^^^^^^^^^^^^^^^^^^^^");

	//now interpret any qualic information


	//if (savestr.indexOf('gen_id')>0) process.exit(2);
	if (debuglevel > 5)
		console.log('obj val:VVVVVVVVVVVVVVVVVVVVVVVVVVVVV\n', obj, "\n^^^^^^^^^^^^^^^^^^^^^^^^^^");
	return obj;

};

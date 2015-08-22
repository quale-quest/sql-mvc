"use strict";
// Server-side Code


var db = require("../../server/database/DatabasePool");
var fs = require('fs');
var path = require('path');
var jt = require('./json_tree');
var ss = require('socketstream');
var app_utils = require("../lib/app_utils");

var config = db.load_config('', '');

//http://stackoverflow.com/questions/2218999/remove-duplicates-from-an-array-of-objects-in-javascript
function arrayContains(arr, val, equals) {
	var i = arr.length;
	while (i--) {
		if (equals(arr[i], val)) {
			return true;
		}
	}
	return false;
}

function removeDuplicates(arr, equals) {
	var originalArr = arr.slice(0);
	var i,
	len,
	j,
	val;
	arr.length = 0;

	for (i = 0, len = originalArr.length; i < len; ++i) {
		val = originalArr[i];
		if (!arrayContains(arr, val, equals)) {
			arr.push(val);
		}
	}
}

function objEqual(o1, o2) {
	if (o1.endpoint && o1.endpoint !== o2.endpoint)
		return false;
	if (o1.Style && o1.Style !== o2.Style)
		return false;

	return true;
}

var prep_debug__tool = function (str) {
	var obj = JSON.parse(str);

	//dedupe the array
	var filename;
	for (filename in obj) {
		var file = obj[filename];
		removeDuplicates(file, objEqual);
	}

	var output = [];
	jt.html("root", obj, output);

	console.log('prep_debug__tool: \n\n', output.join('\n'));
	return output.join('\n');

}

exports.ProcessDebugRequest = function (cmds) {
	console.log('ProcessDebugRequest cmds:', JSON.stringify(cmds, null, 4));

	// dev mode can debug with key not set, or short key, production mode the key must be at least 8 chars.
	var oktodebug = false;
	if ((config.run.debugkey!==undefined)&&(config.run.debugkey === cmds.auth))
		oktodebug = true;
	if (!oktodebug)
		return '<pre>Not Authorised' + '</pre>';

	switch (cmds.fn) {

	case "Rebuild": {
            app_utils.queue_compiler('all',null,null); 
            app_utils.call_compiler();
			var fn = path.resolve('output/built_complete');
			console.log('Rebuild unlinkSync :', fn);
			try {
				fs.unlinkSync(fn);
			} catch (e) {}
			ss.api.publish.all('BuildNotify', '#debugBuildNotify', 'Started rebuild'); // Broadcast the message to everyone
			return '<pre></pre>';
		}
		break;

	case "Console": {
			try {

				var fn = path.resolve('output/consol.txt');
				try {
					console.log('ProcessDebugRequest cons cmds:', fn);
					return '<pre>' + fs.readFileSync(fn).toString() + '</pre>';
				} catch (e) {
					return '<pre>Not found:' + fn + '</pre>';
				};

			} catch (e) {};
		}
		break;
	case "Errors": {
			var fn = path.resolve('output/error_log.json');
			console.log('ProcessDebugRequest err cmds:', fn);
			return '' + prep_debug__tool(fs.readFileSync(fn).toString()) + '';
			try {}
			catch (e) {
				return '<pre>Not found:' + fn + '</pre>';
			};
		}
		break;
	case "Model": {}
		var fn = path.resolve('output/Model.json');
		try {
			console.log('ProcessDebugRequest model cmds:', fn);
			return '<pre>' + fs.readFileSync(fn).toString() + '</pre>';
		} catch (e) {
			return '<pre>Not found:' + fn + '</pre>';
		};

		break;
	case "Controllers": {}
		var fn = path.resolve('output/Controllers.json');
		try {
			console.log('ProcessDebugRequest cont:', fn);
			return '<pre>' + fs.readFileSync(fn).toString() + '</pre>';
		} catch (e) {
			return '<pre>Not found:' + fn + '</pre>';
		};

		break;
	case "Views": {}
		var fn = path.resolve('output/Views.json');
		try {
			console.log('ProcessDebugRequest views:', fn);
			return '<pre>' + fs.readFileSync(fn).toString() + '</pre>';
		} catch (e) {
			return '<pre>Not found:' + fn + '</pre>';
		};

		break;

	}

	return '<pre>some debug info</pre>';

}

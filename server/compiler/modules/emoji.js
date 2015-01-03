"use strict";
//Emoji implementation
// to use open file with <pre process=emoji>
//    Emojis are wrapped in smiley and sad face like:
// example:   <pre process=emoji>This is new mail :)incoming envelope:(
//


//var path = require('path');
//var fs = require('fs');
//var zx = require('../zx');
var emoji = require('emoji');

exports.module_name='emoji.js';

exports.preprocessor_emoji = function (zx, str) {
    if (emoji.textToHTML===undefined)
        {console.error('!!!!!!!!!!emoji patch not applied - check installation:');process.exit(2);}
        
	var o = {
		left : str
	};
	var res = '';
	while (zx.extractEscapedStringFrom(o, ":)", ":(", 0)) {
		//        console.log('preprocessor_emoji escapes',o);

		var html = emoji.textToHTML(o.content);
		//res += o.left + "EMOJI:" + o.content  + ":";
		res += o.left + html;
		o.left = o.right;
		//process.exit(1);
	}
	res += o.left;
	//    console.log('preprocessor_emoji output:',res);
	return res;
};

exports.app_html_insert = function (/*zx*/
) {
	//TODO have plugin automatically insert header files
	return '<!--emoji-->' + '\n' +
	'<link href="http://cdn.staticfile.org/emoji/0.2.2/emoji.css" rel="stylesheet" type="text/css" />' + '\n' +
	'<script src="http://cdn.staticfile.org/jquery/2.1.0/jquery.min.js"></script>' + '\n' +
	'<script src="http://cdn.staticfile.org/emoji/0.2.2/emoji.js"></script>	' + '\n' +
	'' + '\n';
};

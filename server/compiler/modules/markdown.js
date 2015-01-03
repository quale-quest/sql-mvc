"use strict";

//var path = require('path');
//var fs = require('fs');
//var zx = require('../zx');
var marked = require('marked');
//var markdown = require( "markdown" ).markdown;

marked.setOptions({
	gfm : true,
	tables : true,
	breaks : true,
	pedantic : false,
	sanitize : false,
	smartLists : true,
	smartypants : false
});

exports.preprocessor_md = function (zx, str) {

	//  console.log( '>>>>>',str,'<<<<<' );
	//  str=markdown.toHTML( str ) ;
	str = marked(str);
	//console.log( '>>>>>',str,'<<<<<' );
	return str;
};

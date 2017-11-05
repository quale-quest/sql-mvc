"use strict";

var hogan = require("hogan.js");
var marked = require('marked');

exports.module_name = 'hogan_ext.js';

marked.setOptions({
	gfm : true,
	tables : true,
	breaks : true,
	pedantic : false,
	sanitize : false,
	smartLists : true,
	smartypants : false
});

exports.compile_render = function (zx, cx , Template) {

    //escape text embeded
    if (cx.Text) {
        cx.Text = cx.Text.replace(/{{/g,'@@[@@[');		
        cx.Text = cx.Text.replace(/}}/g,'@@]@@]');		
    }
    
	cx.proper = function () {
			return function (val) {
				var template = hogan.compile(val);
                //console.log('properproperproperproperproperproperproperproperproperproperproperproper:',cx);
				var Result = template.render(cx);
				var res = zx.Beautify(String(Result));
				//console.log('properproperproperproperproperproperproperproperproperproperproperproper:',res);
				return res;
			};
		}

	cx.quotes = function () {
			return function (val) {
				var template = hogan.compile(val);                
				var Result = template.render(cx);                
                Result = Result.replace(/\n/g,' ');				
                Result = Result.replace(/\'/g,'"');				
				return "'"+Result+"'";
			};
		}
        

	cx.marked = function () {
			return function (val) {
				var template = hogan.compile(val);                
				var Result = template.render(cx);
                Result = marked(Result);
                Result = Result.replace(/\n/g,'<br>');				
                Result = Result.replace(/\'/g,'"');				
				return Result;
			};
		}
	cx.urlescape = function () {
			return function (val) {
				var template = hogan.compile(val);                
				var Result = template.render(cx);
                Result = encodeURIComponent(Result);
                //Result = Result.replace(/\'/g,'"');				
				return Result;
			};
		}                
        
        
	var code = hogan.compile(Template);
	var Result = code.render(cx);
    Result = Result.replace(/\@\@\[\@\@\[/g,'{{');		
    Result = Result.replace(/\@\@\]\@\@\]/g,'}}');		
    	

    return Result;
}

    
    

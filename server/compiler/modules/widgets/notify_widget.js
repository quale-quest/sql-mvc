"use strict";
/*
speed/memory performance  is not important
ease of use is important
 */

var fileutils = require('../../../compiler/modules/fileutils.js');
var path = require('path');
var fs = require('fs');
var page = require('../../modules/page.js');
var hogan = require("hogan");
var gets = require('../../zx.js').gets;

exports.module_name='notify_widget.js';
exports.tags=[{name:"notify"},{name:"help"},{name:"infrom"},{name:"warning"},{name:"success"},{name:"failure"}];



var get_style = function (zx, o, Key) { //used for g960,container and notify  //this can be made common into a style plugin
	var Value = "";
	if (o.localstyle !== undefined) {
		Value = zx.UIsl[o.localstyle + Key];
	} else {
		if (o.style)
			Value = zx.UIsl[o.style + Key];
	}

	if ((Value === undefined) || (Value === "")) //not set so use the unstyled value
		Value = zx.UIsl[Key];
	if (Value === undefined)
		return "";

	return Value;
};



var notify = exports.tag_notify = function (zx, line_obj) {
    line_obj.style=zx.gets(line_obj.style)  
    var template=get_style(zx, line_obj,"NotifyDiv");

    line_obj.Text=zx.expressions.TextWithEmbededExpressions(zx, line_obj, line_obj.nonkeyd, "mt", "tag_help");	
    var result = hogan.compile(template).render(line_obj);
    zx.mt.lines.push(result);
    
    //console.warn('tag_help:',line_obj,template,result);
};

exports.tag_help = function (zx, line_obj) {
      line_obj.style="Help";
      notify(zx, line_obj);
}

exports.tag_infrom = function (zx, line_obj) {
      line_obj.style="Infrom";
      notify(zx, line_obj);
}
exports.tag_warning = function (zx, line_obj) {
      line_obj.style="Warning";
      notify(zx, line_obj);
}

exports.tag_success = function (zx, line_obj) {
      line_obj.style="Success";
      notify(zx, line_obj);
}

exports.tag_failure = function (zx, line_obj) {
      line_obj.style="Failure";
      notify(zx, line_obj);
}







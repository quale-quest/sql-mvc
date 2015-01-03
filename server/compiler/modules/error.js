"use strict";
//This is meant to uniformly handle errors and warnings the should be passed back to the programmer,

//2 types of error is passed,

//var path = require('path');
var fs = require('fs');
//var zx = require('../zx');

exports.module_name='error.js';

function print_error(zx, err) {

	var message =
		'--error compiling  ' + zx.main_page_name +
		'  msg:' + err.message +
		'\n-- on line:' + (+err.source_line) +
		' col:' + err.source_col +
		' file:' + (err.source_file) +
		' context:' + err.context +
		'\n-- msg:' + (err.text ? err.text.replace(/\n/g, ';') : '');
	console.warn(message);
	return message;
}

exports.write_getquery = function (zx, err) {
	var script = print_error(zx, err);
	fs.writeFileSync(zx.error_file_name, script); //for easy debugging - when this file reloads it means there was an error
	exports.error_log.push({
		endpoint : "getquery",
		err : err,
		script : script
	});
};
exports.write_unknown = function (zx, err) {
	exports.error_log.push({
		endpoint : "unknown",
		err : err.toString(),
		source : zx.line_obj
	});
};

exports.log_nofile_warning = function (zx, text, fn, source_line_obj) {
	exports.error_log.push({
		endpoint : "NoFile",
		at : text,
		filename : fn,
		source : source_line_obj
	});
};

exports.log_NoSoftCodec_warning = function (zx, text, Style, source_line_obj) {
	exports.error_log.push({
		endpoint : "NoSoftCodec",
		at : text,
		Style : Style,
		source : source_line_obj
	});
};

exports.log_noStyle_warning = function (zx, text, Style, source_line_obj) {
	exports.error_log.push({
		endpoint : "NoStyle",
		at : text,
		Style : Style,
		source : source_line_obj
	});
};

exports.log_noQuale_warning = function (zx, text, Quale, source_line_obj) {
	exports.error_log.push({
		endpoint : "NoQuale",
		at : text,
		Quale : Quale,
		source : source_line_obj
	});
};
exports.log_SQL_warning = function (zx, text, Quale, source_line_obj) {
	exports.error_log.push({
		endpoint : "SQL Logic error",
		at : text,
		Quale : Quale,
		source : source_line_obj
	});
};
exports.log_validation_fail = function (zx, text, script, validation_obj) {
	var errtxt = print_error(zx, validation_obj);
	exports.error_log.push({
		endpoint : "InValid",
		level : "fail",
		at : text,
		errtxt : errtxt,
		script : script,
		validation_obj : validation_obj
	});
	script = errtxt + script;
	fs.writeFileSync(zx.error_file_name, script); //for easy debugging - when this file reloads it means there was an error
};

exports.commit = function (zx) {
	fs.writeFileSync(zx.error_log_file_name, JSON.stringify(exports.error_log_obj, null, 4));
};

exports.shut_down = function (zx) {
	exports.commit(zx);
};

exports.done_page = function (zx, page) {
	//console.warn("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX name ",page.name);
	if (exports.error_log.length > 0) {
		exports.error_log_obj[page.name] = exports.error_log;
		exports.error_log = [];
		exports.commit(zx);
	}
};

exports.start_up = function (/*zx*/
) {
	//console.warn("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX error start_up");
	exports.error_log = [];
	exports.error_log_obj = {};
	exports.known_error = new Error("known error");
};

"use strict";
/*
speed/memory performance  is not important
ease of use is important
 */
var hogan = require("hogan"), fs = require("fs");
var deepcopy = require('deepcopy');
var extend = require('node.extend');

exports.module_name = 'async_data.js';
/*
The purpose here is to provide a structure to do adhoc async updates and processing for large files

 */

exports.check_Async_Binary_Fields = function (zx, fld, line_object) {
	try {
		var baserecord_ref = 0;

		if (fld.f.Async !== undefined) { //,Async:{BlobField:"PICTUR",BlobType:"PICT_MIME",NameField:"PICT_NAME",DescField:"PICT_DESC",ThumbNail:"PICT_TN",ThumbType:"PICT_TN_MIME",MimeTypeValid:"image"}
			//console.log('check_Async_Binary_Fields fn - ', fld);
			var filename = require.resolve("./async_data.sql");
			//console.log('check_Async_Binary_Fields fn - ' + filename);
			var sql = fs.readFileSync(filename, 'utf8');
			//console.log('check_Async_Binary_Fields fn - ' + sql);
			var template = hogan.compile(sql);
			var lcx = deepcopy(fld.f.Async);
			lcx.table = fld.f.to;
			lcx.pkf = fld.f.pkname;
			lcx.sp_number = 1;
			var sql = template.render(lcx);

			//console.log('check_Async_Binary_Fields fn - ' + sql);

			if (zx.pass === 5) {
				var pn = zx.main_page_name + "." + zx.sql.sub_proc_index;
				//console.log('check_Async_Binary_Fields fn - ' + zx.sql.sub_proc_index);
				var indx = zx.CurrentPageIndex + (+zx.sql.sub_proc_index);

				//console.log('check_Async_Binary_Fields fn B - ' + zx.sql.sub_proc_index);

				baserecord_ref = zx.dbu.write_script(zx, true, indx, pn, sql, fld.f.Async);
				zx.sql.sub_proc_index++;
			}

			// exports.set_async_data(tableid, fld_obj.cf[0].Async);
		}

	} catch (e) {
		zx.error.caught_exception(zx, e, "check_Async_Binary_Fields 170105, : ", fld);
		throw zx.error.known_error;
	}
	return baserecord_ref;
}

exports.plug_field_check = function (zx, line_object,field) {
//console.log('async data from :', field);
    if (field.Async !== undefined)
	if (field.Async.Target !== undefined) {
		//ok it exist
		//destination defined in the project config,json
		var fileinfo = deepcopy(zx.config.async[field.Async.Target]);
		//console.log('async data from :', fileinfo);
		//local quale overides the file info, so copy in then back
		extend(fileinfo, field);
		extend(field, fileinfo);
	}
	//zx.Container.Tabs=[{Item:0,List:[]}];
};


exports.start_pass = function (/*zx, line_objects*/
) {
	//zx.Container.Tabs=[{Item:0,List:[]}];
};

exports.done_div = function (/*zx, line_objects*/
) { //dinviner does not use this yet - TODO expand diviner...


};

exports.tag_xelement = function (zx, o) { //overrides or extends the ui
	//console.log('tag_element name:',o.name,' el:',zx.gets(o.code));
	var code = zx.gets(o.code);
	code = code.replace(/!<=/g, ">");
	zx.UIsl[o.name] = code;
};

exports.init = function (global_zx) {

	//console.warn('init Element_widget:');
	//zx = global_zx;

};
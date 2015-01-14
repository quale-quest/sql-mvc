"use strict";
/*The stach :{{#e}}<br>:::{{0}},{{1}}{{/e}}
produces a table from 2d array :
"e":[ ["a","b"],["c","d"],["e","f"]
 */

/*
speed/memory performance  is not important
ease of use is important
 */

/*
Method: table
requires meta data for creating table widgets:

4 formats for meta data exist, all can be used together:

1) Inline  format, comments (-- or / * * /) to add attributes inline with the field list, where the primary field index is taken from the field on which the comment is made
2) Outline ini format, outside of the statement  to add attributes  on per field name basis
3) External model to model data specified in a "model"
4) ini style arrays, per attribute with each field on order in a list indexed according to the field list order

The select statement can be either ini style select=,from=where=orderby=  or a "natural" sql statement.


relaxed jsol notation - https://github.com/mbest/js-object-literal-parse
or https://www.npmjs.org/package/jsonic

 */
var zx = require('../../zx.js');
var hogan = require("hogan");
//var deepcopy = require('deepcopy');
//var extend = require('node.extend');

exports.module_name = 'table_widget.js';

var assignfeature = exports.assignfeature = function (o, r, i, nameto, namefrom, defaultto) {
	var ftl = String(zx.gets(o[namefrom])).split(',');
	var ft;
	if (ftl === undefined)
		ft = '';
	else
		ft = ftl[i];

	//if (nameto=="substyle" && i==0   ) console.log('assignfeature: ',i,nameto,namefrom,'..',ft,'..',defaultto,r,o[namefrom]);
	if ((ft !== undefined) && (ft !== '')) {
		r[nameto] = ft;
	} else if (defaultto !== undefined)
		r[nameto] = defaultto;

	//console.log('assignfeature: ',nameto,ft,defaultto,r);
};

var auto_assignfeature = exports.auto_assignfeature = function (o, r, i) {
	//console.log('auto_assignfeature: ',o);
	for (var name in o) {
		//var ftl=zx.gets(o[name]);
		//console.log('auto_assignfeature: ',name,ftl);
		if (r[name] === undefined) {
			assignfeature(o, r, i, name, name);
		}
	}
};

var any_pk_methods = function (o, namefrom) {
	var do_imply_pk = 0;
	var ftl = zx.gets(o[namefrom]).split(',');

	if (ftl !== undefined)
		ftl.forEach(function (r) {
			if ((r.substring(0, 1) === 'p') ||
				(r.substring(0, 1) === 'e') ||
				(r.substring(0, 1) === 'l') ||
				(r.substring(0, 1) === 's') ||
				(r.substring(0, 1) === 't') ||
				(r.substring(0, 1) === 'i') ||
				(r.substring(0, 1) === 'r'))
				do_imply_pk = 1;
		});

	return do_imply_pk;
};

var update_pk_name = function (zx, tcx) {
	if (tcx.implied_pk_found >= 0)
		return;
	if (tcx.implied_pk_name === '') //todo could be expanded to one pk per table relation
	{
		//console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXupdating pk_name: ',zx.default_pk_name,tcx);
		tcx.implied_pk_name = zx.default_pk_name.toLowerCase();
	}
};

var prep_query = function (zx, cx, tcx, o) {
	/*
	Table level
	 */

	var LimitRecordCount = 300;

	if (o.first !== undefined)
		LimitRecordCount = +zx.gets(o.first);
	if (o.show !== undefined)
		LimitRecordCount = +zx.gets(o.show);
	if (tcx.isform)
		LimitRecordCount = 1;
	//var virtual=zx.gets(o.virtual); //used to indicate there is no master record in the links


	if (o.select !== undefined) //build ini style query
	{
		/*
		Ini style Query level
		 */

		//TODO this will not work for many queries.. it must get file names from the database, we cannot parse well enough to have (selects) and CTE
		var fieldnamelist = zx.gets(o.select);
		var fieldnames = fieldnamelist.split(',');

		var method = {};

		assignfeature(o, method, 0, "methods", "methods", "v"); //early check
		var do_imply_pk = 0;
		//console.log('fields.forEach: ',fields);
		o.use_pk = do_imply_pk = any_pk_methods(o, "methods");

		if (0)
			if (do_imply_pk) { // first field is the pointer
				//impliedpk = fieldnames.length;

				//we need the default table pk
				//for now hard code to ref  TODO detect the correct pk name
				var pk_name = 'ref'; //dbu.getpkname(zx.gets(o.from));

				fieldnamelist += ',' + pk_name + ' as pk_ref';
				fieldnames = fieldnamelist.split(',');
				//console.log('first field references the pk: ',impliedpk,fieldnames);
				//process.exit(2);
			}

		tcx.query = 'select ';
		if (+cx.table.autoinsert_internal > 0)
			tcx.query += ' first ' + cx.table.autoinsert_internal + ' ';
		else
			tcx.query += ' first ' + LimitRecordCount + ' ';

		if (o.skip !== undefined)
			tcx.query += ' skip ' + zx.gets(o.skip) + " ";
		tcx.query += fieldnamelist;

		/* add implied keys - unless aggregating*/
		if (o.groupby === undefined) {
			if (+cx.table.autoinsert_internal > 0)
				tcx.implied_pk_name = 'INSERT_REF';
			if (tcx.implied_pk_name !== '')
				tcx.query += ',' + tcx.implied_pk_name;

		}

		if (o.from !== undefined)
			tcx.query += ' from ' + zx.gets(o.from);
		else
			tcx.query += ' from datafile ';

		if (+cx.table.autoinsert_internal > 0) {
			tcx.query += ' right join Z$INSERTREF on ref = INSERT_REF';
			//where is used to set default values
		} else {
			if (o.join !== undefined)
				tcx.query += ' left join ' + zx.gets(o.join);
			if (o.leftjoin !== undefined)
				tcx.query += ' left join ' + zx.gets(o.leftjoin);
			if (o.rightjoin !== undefined)
				tcx.query += ' right join ' + zx.gets(o.rightjoin);

			if (o.where !== undefined)
				tcx.query += ' where ' + zx.gets(o.where);
			if (o.groupby !== undefined)
				tcx.query += ' group by ' + zx.gets(o.groupby);
			if (o.orderby !== undefined)
				tcx.query += ' order by ' + zx.gets(o.orderby);
		}
	}
	//should take the output from the query and process it in the complete way
	//prepare query

	//console.log('Query is :',tcx.query);

	//this is really useful to get this validation from the database... other drivers must try and implement the same...


	var queryx = queryx = zx.stripBrackets(zx.expressions.ConstantExpressions(zx, o, tcx.query, "paramitizedstatement" /*,"prep_query"*/
			));

	// console.log('=================================\nquery in :',tcx.query,
	//           '\n=================================\nquery out:',queryx);

	if (pass === 1) {
		//cannot verify table fields on the first pass for  new database because the model would not have been committed yet
	} else {
		var res = zx.dbu.getquery_info.future(null, zx, "validate_table", queryx, o);
		//console.log('Query result is ',res.result);
		if (res.result.status === "err") {
			console.log('>>>>>>>>>>>>>>>Throwing known error (2)');
			throw zx.error.known_error;
		}
		tcx.field_details = res.result.output;
		tcx.param_details = res.result.input;

		//process.exit(2);
		// tcx.field_details
		tcx.field_details.forEach(function (field, i) {
			var info = zx.dbu.get_meta_info(field);
			var r = {
				indx : i,
				name : field.alias,
				cf : [{}

				],
				info : info
			};
			//console.log('tcx.field_details.forEach is ',field);
			//conditional formatting is where the field types can change depending on content of itself or others
			tcx.fields.push(r);

			if ((tcx.implied_pk_name !== "") &&
				((tcx.implied_pk_name.toLowerCase() === (field.alias || 'NULL').toLowerCase()) ||
					(tcx.implied_pk_name.toLowerCase() === (field.name || 'NULL').toLowerCase()))) {
				tcx.implied_pk_found = i;
				tcx.implied_pk = i;
				//console.log('tcx.field_details.found is ',i,field);
			}
		});
	}
};

var formulatemodel_quale = exports.formulatemodel_quale = function (zx, cx, tcx, o) {

	//console.log('formulatemodel_quale:',o);

	//build - QICC style query
	//console.log('--------------build - QICC style query',o);

	//table level stuff
	//console.log('--------------cx was',cx);
	cx.table = o.q.Table;
	//console.log('--------------cx now is',cx.autoinsert_internal);
	//console.log('\n\nformulatemodel_quale tablestyle:',cx.table.tablestyle);
	//console.log('\n\nformulatemodel_quale cx.Fields:',o.q.Fields);
	tcx.query_original = o.q.query;
	tcx.query = o.q.query; //thats it!!!


	//console.log('done - QICC style query',tcx.query);


	//fixup standard stuff in fields
	o.q.Fields.forEach(function (field) {
		//var info=zx.dbu.get_meta_info(field);
		//console.log('formulatemodel_quale.forEach is ',field.name);

		var r = {
			indx : field.indx,
			name : field.name,
			cf : [field],
			info : {}

		};
		//console.log('tcx.field_details.forEach is ',field);
		//conditional formatting is where the field types can change depending on content of itself or others
		//var r=deepcopy(field);
		//field.cf=[];
		//field.cf[0]=r;

		r.cf.forEach(function (field) {
			//title
			if (field.title === undefined)
				field.title = field.name.replace(/\'/g, "");

			//find the primary key field
			//console.log('find the primary key field :',field.name,field.pointer);
			if (field.pointer === undefined) {
				//console.log('Text base pointer for :',field.name,field.point,(typeof field.point === 'string'));
				if (typeof field.point === 'string') {
					//console.log('Text base pointer for :',field.name,field.point);
					var ptr = field.point.split(".");
					var ptrfield = '',
					ptrtable = field.table;
					if (ptr.length > 1) {
						ptrfield = ptr[1];
						ptrtable = ptr[0];
					} else
						if (ptr.length > 0) {
							ptrfield = ptr[0];
						}
					//console.log('Text base pointer search :',ptrfield,ptrtable);
					o.q.Fields.some(function (wip) {
						if ((wip.name === ptrfield) && (wip.table === ptrtable)) {
							field.pointer = wip.indx;
							if (field.to === undefined)
								field.to = wip.table;
							//console.log('PrimaryKey found for  ',field.name,field.pointer);
							return true;
						} else
							return false;
					});

					//console.log('Text PrimaryKey found for  ',field.name,field.pointer,field.to,cfi);
					if ((field.pointer === undefined) && (zx.pass === 1)) {
						zx.error.log_SQL_warning(cx.zx, "Undefined or unknown point field or table :" + field.point, zx.line_obj);
					}
				} else
					o.q.Fields.some(function (wip) {
						if ((field.table === wip.table) && (wip.PrimaryKey === 'true')) {
							field.pointer = wip.indx;
							field.to = wip.table;
							//console.log('PrimaryKey found for  ',field.name,field.pointer);
							return true;
						} else
							return false;
					});
			}
		});
		tcx.fields.push(r);
	});

	if (+cx.table.autoinsert_internal > 0) { //for inserts we have to modify the query
		tcx.query = tcx.query_original;

		var p = tcx.query.indexOf('left');
		if (p > 0)
			tcx.query = tcx.query.substring(0, p);
		p = tcx.query.indexOf('right');
		if (p > 0)
			tcx.query = tcx.query.substring(0, p);
		p = tcx.query.indexOf('join');
		if (p > 0)
			tcx.query = tcx.query.substring(0, p);
		p = tcx.query.indexOf('where');
		if (p > 0)
			tcx.query = tcx.query.substring(0, p);
		p = tcx.query.indexOf('group');
		if (p > 0)
			tcx.query = tcx.query.substring(0, p);
		p = tcx.query.indexOf('order');
		if (p > 0)
			tcx.query = tcx.query.substring(0, p);
		tcx.query += ' right join Z$INSERTREF on ref = INSERT_REF ';
		//console.log('--------------cx now is :',cx.table);
		//console.log('--------------cx.Fields now is :',o.q.Fields);

		o.q.Fields.some(function (wip) {
			if ((wip.PrimaryKey === 'true')) {
				tcx.implied_pk_name = wip.name;
				return true;
			} else
				return false;
		});
		//console.log('--------------tcx.implied_pk_name :',tcx.implied_pk_name);
		if (tcx.implied_pk_name !== '')
			tcx.query = tcx.query.replace(tcx.implied_pk_name, 'INSERT_REF');

		//only 1 record on a insert
		var pat = /select\s+first\s+\d+/i;
		//console.log('regex first test :',tcx.query.search(pat),tcx.query);
		if (tcx.query.search(pat) >= 0) {

			tcx.query = tcx.query.replace(pat, "select first " + cx.table.autoinsert_internal + " ");
			//console.log('regex first match :');
		} else
			tcx.query = tcx.query.replace(/select\s/i, "select first " + cx.table.autoinsert_internal + " ");
		//console.log('autoinsert_internal :',tcx.query);

	}

};

var formulatemodel_ini = exports.formulatemodel_ini = function (zx, cx, tcx, o) {
	cx.table = o;
	//cx.name=zx.gets(o.name);
	//cx.caption=zx.gets(o.caption);
	//cx.debug=zx.gets(o.debug);
	//cx.SubStyle=zx.gets(o.substyle);
	//cx.Style=zx.gets(o.style);

	//console.log('cx.table.:',cx.table);
	cx.table.tablestyle = zx.gets(cx.table.tablestyle);

	tcx.isform = tcx.isform || zx.gets(o.view).toLowerCase() === "form";

	//var HideIfEmpty=zx.gets(o.virtual);
	//var FolderName=zx.gets(o.FolderName);

	//var buttons=zx.gets(o.buttons).split(',');  //buttons  - bottom left buttons - save,add,add5 and user defined
	//var buttonscontext=zx.gets(o.context);             //used in the bottom left buttons widget to pass additional info to the widget
	//var Options=zx.gets(o.Options).split(',');
	//console.log('prep_query:');
	prep_query(zx, cx, tcx, o);
	//console.log('done prep_query:');
	if (tcx.implied_pk_found === -1) {
		//no pk found add it to query
	}

	//fill the fields from model sheet definitions
	//fill  the fields from ini style models (where defined), or defaults
	var form = zx.gets(o.form).split(','); //relates to link widgets
	tcx.fields.forEach(function (r) {
		var i = r.indx;

		//this applies to titles or footer or data

		assignfeature(o, r, i, "fieldorder", "fieldorder", i);
		assignfeature(o, r, i, "pointer", "pointer", i);
		//assignfeature(o,r,i,"codec","codec");
		assignfeature(o, r, i, "to", "to", zx.gets(o.from));

		assignfeature(o, r.cf[0], i, "title", "title", '' + r.name.replace(/\'/g, ""));
		//assignfeature(o,r.cf[0],i,"codec","codec"); //dual...

		assignfeature(o, r.cf[0], i, "substyle", "substyles", "");
		assignfeature(o, r.cf[0], i, "size", "size", 20);
		assignfeature(o, r.cf[0], i, "width", "width", 20);
		//assignfeature(o,r,i,"totals","totals");
		//assignfeature(o,r,i,"totals2","totals2");
		assignfeature(o, r.cf[0], i, "methods", "methods", "v");

		auto_assignfeature(o, r.cf[0], i);

		r.cf.forEach(function (r) {
			r.widget = "text";
			r.Type = r.methods.substring(0, 1); //methods converto into type and action
			r.List = r.methods.substring(1);
			//console.log('methods ',r.Type,r.List);
			if (r.Type === 'p') {
				r.form = form.shift();
				if (r.pointer === undefined)
					r.pointer = i - 1;
				if (r.pointer < 0) {
					r.pointer = tcx.implied_pk;
				}
				update_pk_name(zx, tcx, r); //TODO - is this correct?? a pointer to another record affects this records primary key ..? does not seem right....
				//if this is a bug it will only be affecting if the a pointer field is the last after some editing fields ... then the editing output would go to the wrong fields...if they exists in that table...

			}
			//else if (r.use_pk)
			if ((r.Type === 'e') || (r.Type === 'l') || (r.Type === 's') || (r.Type === 't') || (r.Type === 'i') || (r.Type === 'r')) {
				if (r.pointer === undefined)
					r.pointer = tcx.implied_pk;
				update_pk_name(zx, tcx, r);
			}

		});

	});

	if (tcx.implied_pk_found > 0)
		tcx.fields[tcx.implied_pk_found].cf[0].Type = 'h';

	tcx.fields.forEach(function (r) {
		r.cf.forEach(function (r) {
			//short-hands
			//console.log('methods ',r.Type,r.List,(r.Type==='v' && r.List!=="") );
			if (r.Type === '') {
				r.Type = 'Text';
				r.Action = 'View';
			}
			if (r.Type === 'v' && r.List !== "") {
				r.Type = 'Lookup';
				r.Action = 'View';
			}
			if (r.Type === 'v') {
				r.Type = 'Text';
				r.Action = 'View';
			}
			if (r.Type === 'p') {
				r.Type = 'Link';
				r.Action = 'Link';
			}
			if (r.Type === 'e') {
				r.Type = 'Text';
				r.Action = 'Edit';
			}
			if (r.Type === 'l') {
				r.Type = 'Lookup';
				r.Action = 'Edit';
			} //xref 2 values
			if (r.Type === 's') {
				r.Type = 'Select';
				r.Action = 'Edit';
			} //just by one value
			if (r.Type === 't') {
				r.Type = 'Tick';
				r.Action = 'Edit';
			}
			if (r.Type === 'i') {
				r.Type = 'Pick';
				r.Action = 'Edit';
			}
			if (r.Type === 'r') {
				r.Type = 'Radio';
				r.Action = 'Edit';
			}
			if (r.Type === 'h') {
				r.Type = 'Hide';
				r.Action = 'View';
			} //headers and footers will override action with view
		});

		//  tcx.fields[i]=r;
	});

	//console.log('formulatemodel: ',tcx.query ,"\n",o,"\n=============================\n",tcx.fields,tcx.fields[0]);
};

var formulatemodel = exports.formulatemodel = function (zx, cx, o) {
	// reads model from ini style or comment style
	//could be a separate part or in dbg.js

	var tcx = zx.TableContexts[cx.tid];
	if (tcx === undefined)
		tcx = {
			name : cx.tid,
			implied_pk_name : ""
		};
	tcx.implied_pk_found = -1;
	tcx.implied_pk = 0; //just use the first field to start
	tcx.fields = [];

	//console.log('Ini object:',o);

	// console.log('formulatemodel implied_pk_name: ',tcx);
	if (o.q === undefined)
		formulatemodel_ini(zx, cx, tcx, o);
	else
		formulatemodel_quale(zx, cx, tcx, o);

	cx.fields = tcx.fields;
	cx.query = tcx.query;

	//console.log('done formulatemodel:',tcx);

	//attach to field widgits
	//tcx.fields.forEach(function (r) {r.cf.forEach(function (r) {}); });

	//console.log('complete formulatemodel attached widgits:',tcx);
	zx.TableContexts[cx.tid] = tcx;
};

var generatetable = exports.generatetable = function (zx, cx) {

	var html = zxTable(cx);
	//console.log('generatetable: ',html);
	html = html.replace(/\[/g, "{");
	html = html.replace(/\]/g, "}");

	return html;
	//exit (2);
};

var exec_query = function (zx, o, QueryType) {
	//var ReplaceText= zxContainerOpen(zx,o);
	//zx.mt.lines.push(ReplaceText);
	//console.log('\n\n\nexec_query: ');//,o,ReplaceText,zx.mt.lines );


	var cx = {
		"proper" : function () {
			return function (val) {
				var template = hogan.compile(val);
				var Result = template.render(cx);
				var res = zx.Beautify(String(Result));
				//console.log('properproperproperproperproperproperproperproperproperproperproperproper:',res);
				return res;
			};
		}

	};
	//TODO make a method to pluginto here
	//TODO make this plugins available to ($ select...$)
	cx.zx = zx; //short hand

	zx.sql.cidi += 1;
	cx.tid = 't' + zx.sql.cidi;
	cx.tid_name = cx.tid;
	if ((QueryType === "List") || (QueryType === "Dict")) {
		cx.tid_name = zx.gets(o.name);
	}
	//console.log('cx.table.tablestyle:');
	cx.CurrentTableInheritStyle = "";
	//console.log('formulatemodel:');

	try {
		formulatemodel(zx, cx, o);
	} catch (e) {
		zx.error.caught_exception(zx, e, " exec_query -114812, formulatemodel ");
		throw zx.error.known_error;
	}
	//console.log('generatetable call:',QueryType);
	if (QueryType === "Table") {
		try {
			var tabletext = generatetable(zx, cx, o);
		} catch (e) {
			zx.error.caught_exception(zx, e, " exec_query -114813, generatetable ");
			throw zx.error.known_error;
		}
		zx.mt.lines.push(tabletext);
		try {
			zx.dbg.table_make_script(zx, cx, o, QueryType);
		} catch (e) {
			zx.error.caught_exception(zx, e, " exec_query -114814,  table_make_script");
			throw zx.error.known_error;
		}

	}
	if ((QueryType === "List") || (QueryType === "Dict")) {
		try {
			zx.dbg.table_make_script(zx, cx, o, QueryType);
		} catch (e) {
			zx.error.caught_exception(zx, e, " exec_query -114535,  table_make_script-list ");
			throw zx.error.known_error;
		}
	}

};

exports.tag_softcodec = function (zx, o) {
	//console.log('tag_softcodec name:',o.name,' enc:',zx.gets(o.encoder),' dec:',zx.gets(o.decoder));
	zx.softcodecs[o.name] = {
		name : o.name,
		encoder : zx.gets(o.encoder),
		decoder : zx.gets(o.decoder)
	};
};

exports.tag_table = function (zx, o) {
	//console.log('tag_table q:',o);
	//if (o.q) console.log('tag_table num:',(+o.q.Table.autoinsert>0));

	//top insert
	var ai = false;
	if (o.q && o.q.Table.autoinsert === "top") {
		ai = true;
		o.q.Table.autoinsert_internal = 1;
	}
	if (o.autoinsert === "top") {
		ai = true;
		o.autoinsert_internal = 1;
	}

	if (ai)
		exec_query(zx, o, "Table");
	if (o.q)
		o.q.Table.autoinsert_internal = 0;
	o.autoinsert_internal = 0;

	//normal table with optional single insert
	if (o.q && (+o.q.Table.autoinsert > 0)) {
		o.q.Table.autoinsert_internal = +o.q.Table.autoinsert;
	}
	if ((+o.autoinsert > 0)) {
		o.autoinsert_internal = +o.autoinsert;
	}
	exec_query(zx, o, "Table");

	//bottom insert
	ai = false;
	if (o.q && o.q.Table.autoinsert === "bottom") {
		ai = true;
		o.q.Table.autoinsert_internal = 1;
	}
	if (o.autoinsert === "bottom") {
		ai = true;
		o.autoinsert_internal = 1;
	}
	if (ai)
		exec_query(zx, o, "Table");

	//console.log('tag_table done:');
};

exports.tag_form = function (zx, o) {

	//console.log('tag_form:', o);

	var ai = false;
	if (o.q && o.q.Table.autoinsert === "top") {
		ai = true;
		o.q.Table.autoinsert_internal = 1;
	}
	if (o.autoinsert === "top") {
		ai = true;
		o.autoinsert_internal = 1;
	}

	var q = o;
	if (o.q)
		q = o.q.Table;
	q.view = "form";
	q.tablestyle = "Form";
	console.log('tag_form:', o);
	exec_query(zx, o, "Table");
};

exports.tag_list = function (zx, o) {
	//JS object of key:values output by name  into the fullstash structure
	//console.log('tag_list:',o);
	o.view = "list";
	o.tablestyle = "List";

	var values = zx.gets(o.values);
	if (values !== "") {
		if (values === "..")
			values = zx.gets(o.nonkeyd);
		values = values.replace(/\n/, " "); //1 line
		//console.warn('tag_list values:', values);
		var name = zx.gets(o.name);
		zx.dbg.emit_mt_obj(zx, name, values);
		return;
	}

	if (zx.gets(o.from) === "")
		o.from = "DataFile";
	if ((zx.gets(o.from) === "DataFile") && (zx.gets(o.select) === ""))
		o.select = "valu,Name"; //TODO get this field names from a  config file per table
	if ((zx.gets(o.select) === ""))
		o.select = "Ref,Name"; //TODO get this field names from a  config file per table
	if ((zx.gets(o.from) === "DataFile") && (zx.gets(o.where) === ""))
		o.where = "Context='" + zx.sql_escapetoString(zx.gets(o.name)) + "'";
	o.MakeList = 1;

	exec_query(zx, o, "Dict");

};

exports.tag_array = function (zx, o) {
	//JS array of values output by name  into the fullstash structure
	o.view = "list";
	o.tablestyle = "List";
	o.MakeList = 1;
	exec_query(zx, o, "List");

};

exports.init = function (zx) {
	//validates and translates v2 tag contents to .divin input
	//console.warn('init table_widget:');

	zx.TableContexts = {};
	zx.softcodecs = {};
};

var table_style = function (cx, Key) {
	var StyleTemplate;
	var InheritLook = cx.table.tablestyle + "Data" + "_Inherit";
	if (cx.table.tablestyle === undefined)
		cx.table.tablestyle = '';
	var firstLook = cx.table.tablestyle + "Data" + Key;
	var secondLook = cx.CurrentTableInheritStyle + "Data" + Key;
	var thirdLook = "Data" + Key;

	//console.log("table_style StyleTemplate:",firstLook+' 2:'+secondLook+' 3:'+thirdLook);

	if ((StyleTemplate === undefined) && (cx.table.tablestyle !== "")) {
		StyleTemplate = cx.zx.UIsl[firstLook];
		if (StyleTemplate === undefined) {
			var InheritStyle = cx.zx.UIsl[InheritLook];
			//console.log("table_style InheritStyle:",firstLook+' 2:'+InheritStyle+' 3:'+InheritLook,InheritStyle+"Data"+Key);
			if (InheritStyle !== undefined)
				StyleTemplate = cx.zx.UIsl[InheritStyle + "Data" + Key];
		}
		if (StyleTemplate === undefined)
			zx.error.log_noStyle_warning(cx.zx, "ErrorNo.table.tablestyle: 1:", firstLook, 0);
	}

	if ((StyleTemplate === undefined) && (cx.CurrentTableInheritStyle !== "")) {
		StyleTemplate = cx.zx.UIsl[secondLook].trim();
		if (StyleTemplate === undefined)
			zx.error.log_noStyle_warning(cx.zx, "ErrorNoCurrentInherittable_style: 2:", secondLook + ' 3:' + thirdLook, 0);
	}

	if (StyleTemplate === undefined) //not set so use the unstyled value - setting a style to "" will blank the default value - it wont use the default as the Q is stripped later
	{
		if ((thirdLook !== secondLook) || (thirdLook !== firstLook))
			zx.error.log_noStyle_warning(cx.zx, "WarnUsingGenerictable_style: 3:", thirdLook + ' instead of 1:' + firstLook + ' or 2:' + secondLook, 0);
		StyleTemplate = cx.zx.UIsl[thirdLook];
	}

	if (StyleTemplate === undefined) {
		zx.error.log_noStyle_warning(cx.zx, "ErrorNotable_styleAtAll: 1:", firstLook + ' 2:' + secondLook + ' 3:' + thirdLook, 0);
		if (1) //debug
			StyleTemplate = "(NotFound:" + Key + ")"; //if we dont want to return anything use  as the value ""
		else
			StyleTemplate = "";
	}

	if (StyleTemplate.substring(0, 8) === 'inherit:') {
		var inherit = StyleTemplate.substring(8);
		StyleTemplate = cx.zx.UIsl[inherit];
		if (StyleTemplate === undefined) {
			StyleTemplate = '';
			zx.error.log_noStyle_warning(zx, "ErrorNoInheritedtable_style: 1:", "inherit:" + inherit + " from:", zx.line_obj);
		}

	}

	StyleTemplate = StyleTemplate.trim();

	StyleTemplate = StyleTemplate.replace("$CRLF$", "\n");
	var template = hogan.compile(StyleTemplate);
	var Result = template.render(cx);
	//console.log("table_style hogan:",Key,">>",cx.pop,">>",StyleTemplate,">>",Result);


	cx.pop = Result;
	return Result; //TrimQ(Result);
};

var zxTable = exports.zxTable = function (cx) {
	/*much simpler than zx.exe as we dont have to worry about order of output
	 */
	//Divine-PrepFormatAndData-Redo on Server
	//Divine-TopTitle
	//Divine-table_content
	//Divine-Wrap+table_content

	//Divine-SetIsEmpty
	//Divine-PostConditionalParams
	//Divine-BottomLeftButtons
	//Divine-BottomRightButtons
	//Divine-TailDiv
	//Divine-Final_DebugResult +TopTileResult+ Pager + OpenResult+TableFieldScripts


	var html = "";
	//Divine-PrepFormatAndData-Redo on Server
	//exports.Validate(cx);
	//Divine-TopTitle

	//Divine-New-Transpose  swaps field layout, cols and row - not the input

	//console.log("DataStyle",cx.Static.Format,cx.Static.DataStyle);

	//console.log("Static",cx);
	try {
		cx.pop = table_style(cx, 'TopTitle');
		if (cx.pop !== "") {
			html += cx.pop;
			//console.log("DataStyle",cx.zx.line_obj);
		}
	} catch (e) {
		zx.error.caught_exception(zx, e, " TopTitle -114823,  ");
		throw zx.error.known_error;
	}
	//Divine-table_content
	html += table_content(cx); //Should push direct to div

	//Divine-SetIsEmpty
	//Divine-PostConditionalParams   - hide the table if blank,
	//Divine-BottomLeftButtons  -MoveTo compiler+static+metaupdate
	//Divine-BottomRightButtons -MoveTo compiler+static+metaupdate
	//Divine-TailDiv
	//Divine-Final_DebugResult +TopTileResult+ Pager + OpenResult+TableFieldScripts

	return html;
};

var table_content = function (cx) {
	//divine-TitlesGeneratedAfterTheBodyInCaseItsEmpty-redo moved to server
	//divine-How to handle empty data sets-todo
	//divine-ForEachRecord-done
	//divine-LimitRecords-todo server side caching and paging
	//divine-ConditionalFiltering-mode to server
	//divine-RecordSeperator
	//  divine-RecordContent
	//divine-RecordTerminator
	//divine-RecordStyleAndCellBorder
	//divine-UniqueTableIdIfNeeded
	//divine-AdvanceRecord
	//divine-StoreWebAndOrFile
	//divine-EndOfTableBody
	//divine-AddGraphingScripts
	//  divine-DoFooter
	//divine-MoreGraphingScripts
	//divine-Header with results of body accessable-redo Header in Div-dont delay record output
	//divine-ContentHeadStyling
	//divine-ContentBodyStyling
	//divine-ContentFootStyling
	//divine-ContentGraphStyling
	//divine-ContentDebugStyling
	//divine-GlobalVariableLastCount


	//divine-TitlesGeneratedAfterTheBodyInCaseItsEmpty-redo moved to server
	//The divine method generates a simple header as part of the start of the table,
	//More complex headers are generated by the meta dat into a seprate div,
	// Firther more complex headers are "filled" by replacing sections with ID's at the top

	//divine-How to handle empty data sets-todo
	//The DivStubs starts out hidden, and if no data arrives they will remain hidden


	cx.DisplayCount = 0;
	//divine-ContentHeadStyling
	//  if (scx.Graph=="true") {//divine-AddGraphingScript    html +=  zxGraphHead(cx,...);     }


	//divine-Header with results of body accessible
	//console.warn("table_content:",cx.table);
	cx.pop = row_content(cx, "Head");
	table_style(cx, 'HeadRow');
	table_style(cx, 'Head');
	//console.warn("Head-row_content:",cx.pop);
	cx.head_html = cx.pop;

	//divine-StoreWebAndOrFile
	//divine-ForEachRecord-done

	//Divine-new subroutine
	//divine-ContentBodyStyling -done
	cx.pop = row_content(cx, "Body");
	table_style(cx, 'BodyRow');
	table_style(cx, 'BodyArray');

	table_style(cx, 'Body');
	//console.warn("Head-BodyContent:",cx.pop);
	cx.body_html = cx.pop;

	//divine-StoreWebAndOrFile

	//divine-AdvanceRecord -not needed it is an array
	//divine-DoFooter

	cx.pop = row_content(cx, "Foot");
	table_style(cx, 'FootRow');
	table_style(cx, 'Foot');
	//console.warn("Foot-row_content:",cx.pop);
	cx.foot_html = cx.pop;

	//divine-EndOfTableBody
	//divine-AddGraphingScripts

	table_style(cx, 'Wrap');
	//divine-MoreGraphingScripts
	//divine-ContentBodyStyling
	//divine-ContentFootStyling-

	//divine-footer for javascript  creating of objects from, like YUI
	//TODO   html+=row_content(cx,"Scripts");


	//divine-ContentGraphStyling-redo something that works with html5
	//same stuff like for YUI may work for this also

	//divine-accumulated scripts
	//  html += ss.tmpl[scx.DataStyle + 'DynamicScripts'].render(cx);

	//divine-ContentDebugStyling-redo server side debug text output - maybe use a popup
	//divine-GlobalVariableLastCount-toServer server side functionality

	var html = cx.pop;

	//Send final content if any
	if (html !== "") {
		html = html.replace(/\$CRLF\$/g, "\n"); //useful when generating CSV or other non html files
		html = html.replace(/&rmnbsp;/g, ""); // to remove &nbsp
	}

	return html;
};

var eval_widget = function (cx, field, HeaderOrBodyOrFooter) {
	//Find the field widget custom plugin
	var done = false;
	var widget_object = zx.Element_widget; //other house keeping tasks can be called to the object
	var widget_Type_fn = zx.Element_widget.construct_widget_from_element;

	if (field.widget !== undefined) {
		var tag = field.Type.toLowerCase();
		var widget = field.widget.toLowerCase();
		done = zx.plugins.some(function (entry) {
				var widget_name = widget + '_widget_' + tag;
				if (entry[widget_name] !== undefined) {
					widget_object = entry; //other house keeping tasks can be called to the object
					widget_Type_fn = entry[widget_name];
					return true;
				}
				return false;
			});
	}

	cx.pop = "";
	widget_Type_fn(cx, field, field.indx, HeaderOrBodyOrFooter); //updates cx
};

var row_content = function (cx, HeaderOrBodyOrFooter) {
	//new moved part of table content into subroutine (to share better with header and footer


	//divine-RecordContent
	try {
		var html = "";
		//Build the row of Objects
		//console.log("cx.fields",cx.fields);

		cx.FieldVisibleCount = 0;

		//divine-ForEach_FormatField_FieldSeperator_FieldCell_Or_FirstField-done
		for (var j = 0; j < cx.fields.length; j++) {
			//console.log("cx.fields[j]:",cx.fields[j]);
			//for (var i=0; i < cx.fields[j].cf.length; i++) {

			cx.field = cx.fields[j];
			cx.field.f = cx.field.cf[0];
			//console.log("cx.field:",cx.field);

			if (cx.field.f.Action !== 'Hide') {
				try {
					eval_widget(cx, cx.field, HeaderOrBodyOrFooter);
				} catch (e) {
					zx.error.caught_exception(zx, e, " eval row_field -114835, field[" + j + "] : ");// + JSON.stringify(cx.field));
					throw zx.error.known_error;
				}
				if (cx.field.f.Type !== 'Hide') {
					try {
						if (j === 0)
							table_style(cx, HeaderOrBodyOrFooter + 'FirstFieldCell');
						else
							table_style(cx, HeaderOrBodyOrFooter + 'FieldCell');
						html = html + cx.pop;
					} catch (e) {
						zx.error.caught_exception(zx, e, " wrap row_field -122505, field[" + j + "] : ");// + JSON.stringify(cx.field));
						throw zx.error.known_error;
					}
				}
			}
			cx.pop = "";
			//divine-check_boxes_per_record:todo

		}

		cx.pop = html;

		//TODO first row different handling if 'RecordSeperator' is required - possibly extend moustache to have a way to specify separator symbol..
		/////   {{#people}}<tr>    <td>{{FullName}}</td>    <td>{{WorkEmail}}</td> </tr>{{/people/,}} -- {{/people/,}} /, indicates separator string is specified for when the loop occurs

		table_style(cx, HeaderOrBodyOrFooter + 'RecordWrap');

		//divine-CellBorder-redone hogan2context, using hogan access to static formatting info
		//CellBorder is transparent from this code as it can be read direct from static data by the hogan template

		//divine-RecordTerminator


		//divine-UniqueTableIdIfNeeded-redone -- hogan2context
		//there is always a table id called Data.ContainerId
	} catch (e) {
		zx.error.caught_exception(zx, e, " row_content -114831, " + HeaderOrBodyOrFooter);
		throw zx.error.known_error;
	}

	return cx.pop;
};

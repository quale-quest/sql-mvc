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



 */
var zx = require('../../zx.js');
var ide = require("../../../../server/IDE/debugger");
var deepcopy = require('deepcopy');
var extend = require('node.extend');

//var deepcopy = require('deepcopy');
//var extend = require('node.extend');

exports.module_name = 'table_widget.js';
exports.tags = [{
		name : "softcodec"
	}, {
		name : "table",
		complex : true
	}, {
		name : "form",
		complex : true
	}, {
		name : "list",
		complex : true
	}, {
		name : "array",
		complex : true
	}
];

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


var formulatemodel_quale = exports.formulatemodel_quale = function (zx, cx, tcx, o) {

	//console.log('formulatemodel_quale:',o);

	//build - QICC style query
	//console.log('--------------build - QICC style query',o);

	//table level stuff
	//console.log('--------------cx was',cx);
	cx.table = o.q.Table;
     
     cx.param={};
     zx.copy_params(cx.param,o);
     //console.log('\n\ formulatemodel_quale:');  zx.stringify_2(cx); 
	//console.log('--------------cx now is',cx.autoinsert_internal);
	//console.log('\n\nformulatemodel_quale tablestyle:',cx.table.tablestyle);
	//console.log('\n\nformulatemodel_quale cx.Fields:',o.q.Fields);
	tcx.query_original = o.q.query;
	tcx.query = o.q.query; //thats it!!!

	var table_alias = cx.table.from;
	if (cx.table.alias) table_alias=cx.table.alias;

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
		//this should be part of the driver code
/*	The insert record works as follows:
	Only the field from the query is kept,
	then the field names are joined with the Z$INSERTREF table, without any
	actual records from the main table.
	i.e. the main table only supplies the field structure, it does not supply any values.
*/		
        
		o.q.Fields.some(function (wip) {
			if ((wip.PrimaryKey === 'true')) {
				tcx.implied_pk_name = wip.name;
				return true;
			} else
				return false;
		});        
        
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
		tcx.query += ' right join Z$INSERTREF on '+tcx.implied_pk_name+' = INSERT_REF ';
        
		//console.log('cx.table.autoinsert_internal > 0 122423: ',tcx.implied_pk_name,tcx.query);
		//process.exit(2);        
        
		//console.log('--------------cx now is :',cx.table);
		//console.log('--------------cx.Fields now is :',o.q.Fields);


		//console.log('--------------tcx.implied_pk_name :',tcx.implied_pk_name);
		if (tcx.implied_pk_name !== '')
			tcx.query = tcx.query.replace(tcx.implied_pk_name, 'INSERT_REF');

		//console.log('autoinsert_internal ??? :',tcx.query);
		var pat = /select\s+first\s+\d+/i;
		if (tcx.query.search(pat) < 0) pat = /select\s/i;
		var FirstFirst="";
		var LastFirst="";
		
		if (zx.fb25||zx.mssql12) {
			//only 1 record on a insert - replace first or insert first FirstFirst
			FirstFirst="select " + zx.dbu.sqltype(zx,"first "," ","top ") + cx.table.autoinsert_internal + " ";
		} else if (zx.mysql57) { 
			FirstFirst="select ";
			LastFirst= " Limit 1 ";
		} else throw new Error("dialect code missing");
		
		tcx.query = tcx.query.replace(pat, FirstFirst )+LastFirst;
		//console.trace('autoinsert_internal :',tcx.query);
			
	}
	//o.q.query = tcx.query;
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
	//if (o.q === undefined)
	//	formulatemodel_ini(zx, cx, tcx, o);
	//else
	formulatemodel_quale(zx, cx, tcx, o);
    //console.log("\r\n tcx.query A:"+tcx.query,"\r\n\r\n\r\n");
	cx.fields = tcx.fields;
	cx.query = zx.dbu.sql_make_compatable(zx,tcx.query);
	//console.log("\r\ncx.query B:"+tcx.query);
	//console.log("\r\ncx.query BB:"+cx.query);

	//zx.dbg.emit_comment(zx,"cx.query:"+cx.query);
	//console.log("\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\ncx.query:"+tcx.query);

	//map widget fields to real fields
	try {
		tcx.fields.forEach(function (forfield) {
			forfield.cf.forEach(function (r) {
				if (r.widget !== undefined) {
					zx.forFields(r.widget, function (field, key) {
						//console.log('forFields( r.widget) : ', field, key, r);
						try {
							tcx.fields.some(function (srch) {

								if (typeof field === 'string') {
									//console.log('forFields( some) : ', srch, 'f:', field, ' ...', key, forfield.name);
									if (srch.name.toLowerCase().trim() === field.toLowerCase().trim()) {
										//console.log('forFields( r.widget)srch : ', key, '=', srch.indx, srch.name, forfield.name);
										if (forfield.w === undefined)
											forfield.w = {};
										forfield.w[key] = +srch.indx + 1; //+1 is to skip the table row number col
									}
								}
							});

						} catch (e) {
							zx.error.caught_exception(zx, e, " error in mapping widget field :" + field + " key:" + key + " for:" + forfield.name);
							throw new Error("local known error");
						}

					});
				}
			});
		});
	} catch (e) {
		zx.error.caught_exception(zx, e, " error in mapping widget fields to real fields ");
		throw new Error("local known error");
	}

	tcx.fields.forEach(function (r) {
		r.cf.forEach(function (r) {
			zx.eachplugin(zx, "plug_field_check", zx.line_object, r);
		});
	});

	//console.log('done formulatemodel:',tcx.query);

	//attach to field widgits
	//tcx.fields.forEach(function (r) {r.cf.forEach(function (r) {}); });

	//console.log('complete formulatemodel attached widgits:',tcx);
	zx.TableContexts[cx.tid] = tcx;
};

var generatetable = exports.generatetable = function (zx, cx) {

	var html = zxTable(cx);
	//console.log('generatetable: ',html);
	//html = html.replace(/\[/g, "{");   causes a problem for pattern validation - it is used to "pop" moustaches for runtime evaluation  [[0]]
	html = html.replace(/\[\[\[/g, "{{{"); 
	html = html.replace(/\]\]\]/g, "}}}");
	html = html.replace(/\[\[/g, "{{"); 
	html = html.replace(/\]\]/g, "}}");

	return html;
	//exit (2);
};

var exec_query = function (zx, o, QueryType) {
	//var ReplaceText= zxContainerOpen(zx,o);
	//zx.mt.lines.push(ReplaceText);
	//console.log('\n\n\nexec_query: ');//,o,ReplaceText,zx.mt.lines );

    //TODO make a method to pluginto here
	//TODO make this plugins available to ($ select...$)
    var cx = {};
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
		//console.log('autoinsert_internal 386 :',cx.query);
		//console.log('formulatemodel:');
	} catch (e) {
		zx.error.caught_exception(zx, e, " exec_query -114812, formulatemodel ");
		throw new Error("local known error");
	}
	//console.log('generatetable call:',QueryType);
	if (QueryType === "Table") {
		try {
			var tabletext = generatetable(zx, cx, o);
		} catch (e) {
			zx.error.caught_exception(zx, e, " exec_query -114813, generatetable ");
			throw new Error("local known error");
		}
		zx.mt.lines.push(tabletext);
		try {
			zx.dbg.table_make_script(zx, cx, o, QueryType);
		} catch (e) {
			zx.error.caught_exception(zx, e, " exec_query -114814,  table_make_script");
			throw new Error("local known error");
		}

	}
	if ((QueryType === "List") || (QueryType === "Dict")) {
		try {
			zx.dbg.table_make_script(zx, cx, o, QueryType);
		} catch (e) {
			zx.error.caught_exception(zx, e, " exec_query -114535,  table_make_script-list ");
			throw new Error("local known error");
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
	
	if (o.q.Table==undefined) {
		zx.error.log_syntax_warning(zx, 'Syntax err: Table() or Form() missing all header info ', zx.err, zx.line_obj);
		return;
	}
	
	
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
	//console.log('tag_form:', o);
	exec_query(zx, o, "Table");
};

exports.tag_list = function (zx, o) {
	//JS object of key:values output by name  into the fullstash structure
	//console.log('tag_list:',o);
	o.view = "list";
	o.tablestyle = "List";

	var values = o.values;
	if (values) {
		var name = zx.gets(o.name);
		if (values.array)
			delete values.array;
		//console.log('tag_list:',name,JSON.stringify(values) );
		zx.static_stash.Data[name] = values;
		return;
	}

	var DictionaryTableName = 'Z$DICTIONARY';//TODO get the DictionaryTableName from the config file
	if (zx.gets(o.from) === "")
		o.from = DictionaryTableName;
	if ((zx.gets(o.from) === DictionaryTableName) && (zx.gets(o.select) === ""))
		o.select = "valu,Name"; //TODO get this field names from a  config file per table
	if ((zx.gets(o.select) === ""))
		o.select = "Ref,Name"; //TODO get this field names from a  config file per table
	if ((zx.gets(o.from) === DictionaryTableName) && (zx.gets(o.where) === ""))
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
	zx.static_stash.TablesIndex ={};
};
var esc = function (txt) {
	if (txt==undefined) return ' undefined ';
return txt.replace(/{/g,'{ ').replace(/}/g,' }').replace(/</g,' &lt ').replace(/>/g,' &gt ');
	//return txt.replace('{',' %7B ').replace('}',' %7D ').replace('<','&lt').replace('>','&gt');
}	
var table_style = function (cx, Key) {
	var StyleTemplate;
	var StyleTemplateFrom;
	var InheritLook = cx.table.tablestyle + "Data" + "_Inherit";
	if (cx.table.tablestyle === undefined)
		cx.table.tablestyle = '';
	var firstLook = cx.table.tablestyle + "Data" + Key;
	var secondLook = cx.CurrentTableInheritStyle + "Data" + Key;
	var thirdLook = "Data" + Key;
	var debug ={};
	
	
	debug.tries = [];
	//debug.firstLook = firstLook;
	//debug.secondLook = secondLook;
	//debug.thirdLook = thirdLook;
	//console.log("table_style StyleTemplate:"+cx.table.tablestyle+' 1:'+firstLook+' 2:'+secondLook+' 3:'+thirdLook);

	if ((StyleTemplate === undefined) && (cx.table.tablestyle !== "")) {
		StyleTemplate = cx.zx.UIsl[firstLook];
		StyleTemplateFrom='firstLook:'+firstLook+':'+esc(StyleTemplate);
		debug.tries.push(StyleTemplateFrom);
		if (StyleTemplate === undefined) {
			var InheritStyle = cx.zx.UIsl[InheritLook];
			//debug.tries.push('Inherit:'+InheritLook+' '+InheritStyle+' ');
			//console.log("table_style InheritStyle:",firstLook+' 2:'+InheritStyle+' 3:'+InheritLook,InheritStyle+"Data"+Key);			
			debug.tries.push('InheritLook:'+InheritLook+':'+InheritStyle||'Not Found');
			
			if (InheritStyle !== undefined) {
				var ihs=InheritStyle + "Data" + Key;
				StyleTemplate = cx.zx.UIsl[ihs];
				//console.log('StyleTemplate : ',ihs,esc(StyleTemplate));
				StyleTemplateFrom='first Inherit:'+ihs+':'+esc(StyleTemplate);
				debug.tries.push(StyleTemplateFrom);
			}	
		}
		if (StyleTemplate === undefined)
			zx.error.log_noStyle_warning(cx.zx, "ErrorNo.table.tablestyle: 1:", firstLook, 0);
	}

	if ((StyleTemplate === undefined) && (cx.CurrentTableInheritStyle !== "")) {
		StyleTemplate = cx.zx.UIsl[secondLook].trim();
		StyleTemplateFrom='secondLook:'+secondLook+':'+esc(StyleTemplate);
		debug.tries.push(StyleTemplateFrom);		
		if (StyleTemplate === undefined)
			zx.error.log_noStyle_warning(cx.zx, "ErrorNoCurrentInherittable_style: 2:", secondLook + ' 3:' + thirdLook, 0);
	}

	if (StyleTemplate === undefined) //not set so use the unstyled value - setting a style to "" will blank the default value - it wont use the default as the Q is stripped later
	{
		if ((thirdLook !== secondLook) || (thirdLook !== firstLook))
			zx.error.log_noStyle_warning(cx.zx, "WarnUsingGenerictable_style: 3:", thirdLook + ' instead of 1:' + firstLook + ' or 2:' + secondLook, 0);
		StyleTemplate = cx.zx.UIsl[thirdLook];
		StyleTemplateFrom='thirdLook:'+thirdLook+':'+esc(StyleTemplate);
		debug.tries.push(StyleTemplateFrom);			
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
		StyleTemplateFrom='resolved inherit:'+inherit+':'+esc(StyleTemplate);
		debug.tries.push(StyleTemplateFrom);			
		
		if (StyleTemplate === undefined) {
			StyleTemplate = '';
			zx.error.log_noStyle_warning(zx, "ErrorNoInheritedtable_style: 1:", "inherit:" + inherit + " from:", zx.line_obj);
		}

	}

	StyleTemplate = StyleTemplate.trim();
	debug.Found = esc(StyleTemplate);
	debug.FoundFrom = StyleTemplateFrom;
	StyleTemplate = StyleTemplate.replace("$CRLF$", "\n");
    //console.log('properproperproperproperproperproperproperproperproperproperproperproper xxxxxx:',StyleTemplate);
	var Result = zx.hogan_ext.compile_render(zx, cx , StyleTemplate);
	//console.log("table_style hogan:",Key,">>",cx.pop,">>",StyleTemplate,">>",Result);

	//console.log("table_style debug:",debug);
	cx.table_style[Key] = deepcopy(debug);
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
	cx.fieldDebug = {};
	
	cx.fieldDebug.table =deepcopy(cx.table);
	cx.table_style = {};
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
		throw new Error("local known error");
	}
	//Divine-table_content
	html += table_content(cx); //Should push direct to div
	
	//validation	
	console.log('\n\nexports.zxTable:',cx.table);
	var T={validator:cx.table.validator};
	zx.forFields(cx.fields, function (field, key) {
		if (field.f.validator||field.f.List) {
			var F={
				//i:field.f.indx,
				//n:field.f.name,
				length:field.f.length,
				size:field.f.size,
				validator:field.f.validator,
				Pick:field.f.Pick,
				List:field.f.List
				};
			//console.log("validation field:",field.f);
			extend(true, F,T[field.f.indx]);
			T[field.f.indx] = F;
		}
	});	
	zx.static_stash.TablesIndex[cx.tid] = T;	
	
	//debugging styles
	cx.fieldDebug.table_style =deepcopy(cx.table_style);
	
	zx.forFields(cx.fields, function (field, key) {
		if (!cx.fieldDebug[field.f.name]) cx.fieldDebug[field.f.name] = {};		
		cx.fieldDebug[field.f.name].Qualia = field.f;
	});
	
	//Divine-SetIsEmpty
	//Divine-PostConditionalParams   - hide the table if blank,
	//Divine-BottomLeftButtons  -MoveTo compiler+static+metaupdate
	//Divine-BottomRightButtons -MoveTo compiler+static+metaupdate
	//Divine-TailDiv
	//Divine-Final_DebugResult +TopTileResult+ Pager + OpenResult+TableFieldScripts
	
	//console.log("\r\ntreeview:",JSON.stringify(cx.fieldDebug,null,4));
	//console.warn("zx.conf.debugging :",zx.conf.debugging);		
	if (zx.conf.debugging.element_class_trees) {
		
		var treeview = ide.json_tree_view("Field Style Debug",cx.fieldDebug);
		html += "<pre class=\"devdebugvisable \"> " + treeview + "</pre>";
		}
	
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
    //console.log('\n\nwrap context:');  zx.stringify_2(cx); 
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
					zx.error.caught_exception(zx, e, " eval row_field -114835, field[" + j + "] : "); // + JSON.stringify(cx.field));
					throw new Error("local known error");
				}
				if (cx.field.f.Type !== 'Hide') {
					try {
						if (j === 0)
							table_style(cx, HeaderOrBodyOrFooter + 'FirstFieldCell');
						else
							table_style(cx, HeaderOrBodyOrFooter + 'FieldCell');
						html = html + cx.pop;
					} catch (e) {
						zx.error.caught_exception(zx, e, " wrap row_field -122505, field[" + j + "] : "); // + JSON.stringify(cx.field));
						throw new Error("local known error");
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
		throw new Error("local known error");
	}

	return cx.pop;
};

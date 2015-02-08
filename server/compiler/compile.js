"use strict";
/*jshint node: true */

/*
latest node :

sudo npm cache clean -f
sudo npm install -g n
sudo n stable
 */
/*
Nomenclature
Page.json  is the parsed representation of the page in json memory
complete fully expanded through all includes

Procedure :
from a folder
if pages.json does not exist, create adding Index.htm as first item.
for each file in pages.json

Parse into equivalent js onject

expands all #include tags going down
Create  goto and labels over include files
adds links/menus/buttons to pages.json
produces .json .moustache, .sql, .js  files


Milestone 1
Parse files, producing single .page.json file per page
Do this for all pages - examine outputs
parse the structure of conditionals in sql and mt

Milestone 2
implements contexts for operator,master, abstract master
parse the queries and conditionals into  sql script (firebird)
manually run the scripts from flamerobin, or run automatically form node js fb api
keep example static file
output basic unformatted .moustache to examine the data

Milestone 3
expand the moustache parsing of the static data, into full UI define-able template elements
extend moustache functions if needed.



Milestone X
post back data bay be stored in REDIS to speed-up database .. if it gives a performance benefit over GTT
Possibly add redis as a back end function for firebird, to the data don't have to come out via front-end to .nodejs.

Make conditional block so we dont always have to use include files


Compiler warnings errors and info
warnings :
.missing.txt lists mising script files

todo warn if <script is used ... it wont be executed when dom is injected,
replace with a <#jscript tag, to store away for execution after the dom injection
...there is not much of this maybe search manually ....






 */


 
var program = require('commander');
//var XLSX =  require('xlsx');
var fs = require('fs');
var path = require('path');

//var mmh3 = require('murmurhash3');

var page = require('./modules/page.js');

var diviner = require('./modules/diviner.js');

var zx = require('./zx.js');

var db = require("../../server/database/DatabasePool");

var dirxww = 493;
/* octal 0755 */
//var bcb = require('./modules/bcbiniparse.js');

var fsx = require('node-fs');

var Sync = require('sync'); // https://github.com/ybogdanov/node-sync

var fileutils = require('./modules/fileutils.js');

var queue_file_to_be_compiled = function (zx, dfn) {
	var fileobj,
	br,
	name;
	console.log('queue_file_to_be_compiled:', dfn);

	if (dfn !== '') {
		dfn = path.resolve(dfn);
		//console.log('resolve:',dfn);
		if (zx.endsWith(dfn, "Index" + zx.app_extn)) {
			//path.relative
			br = fileutils.locateclosestbuildroot(zx, dfn.replace(zx.app_extn, ''));
			//console.log('locateclosestbuildroot:',br.filename);
			if (br.filename === undefined) {
				//console.warn('can not find locateclosestbuildroot:', br.filenam);
				//return;
			}
			zx.pages.push({
				name : '//' + br.filename,
				obj : "filedepIndex",
				wildcard : true
			});
			zx.pages = zx.deduplicate_byname(zx.pages);
		} else {
			fileobj = zx.depends[dfn];
			//console.log('Dependancy  :',dfn,' >>>',fileobj);

			if (fileobj !== undefined) {
				//console.log('zx.depends :',fileobj.parents);

				for (name in fileobj.parents) {
					if (fileobj.parents.hasOwnProperty(name)) {
						zx.pages.push({
							name : name,
							obj : "filedeps"
						});
						zx.pages = zx.deduplicate_byname(zx.pages);
					}
				}
			}
		}
	}

};

var start_page_compiler = function (zx) {
		zx.missingfiles = [];
		zx.includedfiles = [];
        zx.line_obj={};
        zx.linkfiles = [];
}
var seq_main = function () {
	var cmd,
	fileobj,
	filelist,
	f,
	fn,
	fileContents,
	name;
	program
	.version('0.0.1')
	.usage('<keywords>')
	.parse(process.argv);

	if (!program.args.length) {
		program.help();
	} else {
		//console.log('Keywords: ' + program.args);

		//console.log('start main', Date());

		zx.UIsl = {};

		zx.UIsl = require('./Elements_UI_7.json');
		//console.log('Require zx.UIsl:', zx.UIsl);

		zx.default_pk_name = 'ref';

		zx.debug = 1;
		zx.debug_conditional_structure = 0;
        start_page_compiler(zx);


		
		zx.depends = {};
		zx.mainfiles = [];
		zx.BlockIndex = 0;
		zx.root_folder = path.resolve(path.join('./Quale/')) + '/';
		//console.log('zx.root_folder :', zx.root_folder);
		zx.build_roots = ["Config", "Custom", "Standard", "Lib", ""];
		//if dev mode zx.build_roots.unshift("sandbox");
		zx.output_folder = path.resolve('./output/') + '/';
		zx.hogan_folder = path.resolve('./client/templates/') + '/';
		zx.app_folder = 'Guest';
		zx.app_incl_extn = zx.app_extn = '.quicc';

		if (fs.existsSync(zx.output_folder + 'depends.json')) {
			fileContents = fs.readFileSync(zx.output_folder + 'depends.json');
			if (fileContents !== "") {
				zx.depends = JSON.parse(fileContents);
			}
		}
		//possibly all plugins should move here


		zx.dbg = require('../database/db_fb_sql_gen.js');
		zx.plugins.push(zx.dbg);

		zx.db_update = require('../database/db_fb_sql_updater.js');
		zx.plugins.push(zx.db_update);

		zx.template_control = require('./modules/template_control.js');
		zx.plugins.push(zx.template_control);

		zx.quic = require('./modules/quic.js');
		zx.plugins.push(zx.quic);

		zx.models = require('./modules/models.js');
		zx.plugins.push(zx.models);

		zx.plugins.push(page);

		zx.Container_widget = require('./modules/widgets/G960_widget.js');
		zx.plugins.push(zx.Container_widget);

		zx.Container_widget = require('./modules/widgets/Container_widget.js');
		zx.plugins.push(zx.Container_widget);

		zx.notify_widget = require('./modules/widgets/notify_widget.js');
		zx.plugins.push(zx.notify_widget);
        
        
		zx.action_widget = require('./modules/widgets/action_widget.js');
		zx.plugins.push(zx.action_widget);

		zx.Element_widget = require('./modules/widgets/Element_widget.js');
		zx.plugins.push(zx.Element_widget);

		zx.table_widget = require('./modules/widgets/Table_widget.js');
		zx.plugins.push(zx.table_widget);

		zx.flow_control = require('./modules/flow_control.js');
		zx.plugins.push(zx.flow_control);

		zx.Inject_procedures = require('./modules/Inject_procedures.js');
		zx.plugins.push(zx.Inject_procedures);

		zx.expressions = require('./modules/expressions.js');
		zx.plugins.push(zx.expressions);

		zx.var_control = require('./modules/var_control.js');
		zx.plugins.push(zx.var_control);

		zx.script_control = require('./modules/script_control.js');
		zx.plugins.push(zx.script_control);

		zx.error = require('./modules/error.js');
		zx.plugins.push(zx.error);

		zx.async_data = require('./modules/async_data.js');
		zx.plugins.push(zx.async_data);        
        
        
		zx.markdown = require('./modules/markdown.js');
		zx.plugins.push(zx.markdown);

		zx.emoji = require('./modules/emoji.js');
		zx.plugins.push(zx.emoji);

		zx.wildcard = false;
		zx.eachplugin(zx, "start_up", 0);

		zx.queue_file_to_be_compiled = queue_file_to_be_compiled;

		/* var output_folder='./Output/';

		try {remove.removeSync(output_folder);} catch (err) {}
		try {fs.mkdirSync(output_folder);
		} catch (err) {
		console.error("cannot create output folder",err);
		process.exit(2);
		}
		 */

		if (zx.pages.length === 0) {

			if (program.args.length > 0) {
				cmd = program.args[0];
			}

			if (cmd === 'app') {
				if (program.args.length > 1) {
					zx.app_folder = program.args[1];
				}
				f = /*zx.root_folder+*/
					"//" + zx.app_folder + "/Index";
				if (program.args.length > 2) {
					if (program.args[2] === 'all') {
						zx.wildcard = true;
					} else {
						if (program.args[2].substring(0, 2) === '//') {
							f = program.args[2];
						} else {
							f = /*zx.root_folder+*/
								"//" + zx.app_folder + "/" + program.args[2];
						}
					}

				}
				zx.pages.push({
					name : f,
					obj : "args"
				});

			} else if (cmd === 'file') {

				if (program.args.length < 2) {
					console.warn('invalid , expected : file filename ');
					return;
				}
				fn = program.args[1];
				fileobj = zx.depends[fn];
				console.warn('Dependancy  :', fileobj);
				//console.warn('zx.depends :',zx.depends);

				for (name in fileobj.parents) {
					if (fileobj.parents.hasOwnProperty(name)) {
						zx.pages.push({
							name : name,
							obj : "filedeps"
						});
					}
				}

			} else if (cmd === 'deltafile') { // used by the file monitor to pass a list of files that have changed

				if (program.args.length < 2) {
					console.warn('invalid , expected : load filename ');
					return;
				}
				fn = program.args[1];
				if (!fs.existsSync(fn)) {
					console.warn('deltafile does not exist no changes found :', fn);
					return;
				}

				filelist = fs.readFileSync(fn, 'utf8').split(/\r\n|\r|\n/);
				//console.log('filelist  :', filelist);

				filelist.forEach(function (dfn) {
					queue_file_to_be_compiled(zx, dfn);

				});

				zx.pages = zx.deduplicate_byname(zx.pages);
				//console.log('compiling  :', zx.pages);

			} else if (cmd === 'all') { // TODO compile all index.htm in the whole tree
				// compile all the menus
				//this is done with a shell command at the moment
				//currently this is being done by a bash shell .. change so windows would also work
				console.warn('compiling :', cmd);
			} else {
				console.warn('invalid command expected[app|file|deltafile] got :', cmd);
				return;
			}

		}

		//console.log('file list:', zx.pages);
		zx.pgi = 0;
		seq_pages(zx);

	}
};

var get_model_files = function (zx, path) {
	//scan for applicable models in many folders
	var re = new RegExp('^Models', "i");
	//console.warn('get_model_files for:',path,re,'rel:',path);
	var filelist_m = fileutils.getDropinFileList(zx, re, path, zx.line_obj, 130128);
	re = new RegExp('^Controllers', "i");
	var filelist_c = fileutils.getDropinFileList(zx, re, path, zx.line_obj, 130129);
	re = new RegExp('^MC.', "i");
	var filelist_d = fileutils.getDropinFileList(zx, re, path, zx.line_obj, 130130);

    //console.warn('got model_files for --M:',filelist_m);
    //console.warn('got model_files for --C:',filelist_c);
    //console.warn('got model_files for --D:',filelist_d);
	
    var list = filelist_c.concat(filelist_m, filelist_d);
    //console.warn('got model_files for --:',list);

	return list;
}

var seq_page = function (zx) {

           
    console.warn('\n\n\n=============================================================================Page ', zx.pages[zx.pgi].name);
    start_page_compiler(zx);
    zx.eachplugin(zx, "start_page", zx.pages[zx.pgi]);
	zx.eachplugin(zx, "init", zx.line_objects); //to be deprecated
        

	//var fn = zx.dbg.calcfilelocation(zx,zx.pages[zx.pgi])+zx.app_extn
	try {
		zx.file_stack = [];
		delete zx.err;

		zx.config = db.load_config(zx.root_folder, zx.pages[zx.pgi].name);
		//console.warn('zx.config located : ',zx.config);
		//process.exit(2);


		var result = zx.dbu.databaseUtils.sync(null, zx.root_folder, zx.pages[zx.pgi].name, zx.pages[zx.pgi].name);
		zx.conf = result[1].conf; //.rambase;
		//console.warn('database synced on config A',result);
		//console.warn('database synced on config ',JSON.stringify(zx.conf, null, 4) );
        

        zx.CurrentPageIndex = 1; //default until pass 5
           
        
		var fn = fileutils.locatefile(zx, zx.pages[zx.pgi].name, zx.root_folder, "Compile " + zx.pages[zx.pgi].name, 120022);
		//console.warn('file located : ',fn);

		zx.model_files = get_model_files(zx, fn);

	} catch (e) {
		zx.error.caught_exception(zx, e, " seq_page db/config start mark-114231 ");
	}

	if (fn.indexOf('SaleForm') >= 0) {
		console.log('compiling SaleForm to linkfiles: ', fn, zx.pages[zx.pgi]);
		{console.trace('process.exit(2) from SaleForm : '); process.exit(44);}
	}
	if (fn === "") {
		console.warn('file not found ', zx.Current_rel_file, fn);
		zx.error.log_nofile_warning(zx, "InputFileNameBlank:", "", 0);
		return;
		//process.exit(34);
	} else {
		zx.pushArray(zx.mainfiles, zx.pages[zx.pgi]);
		fn += zx.app_extn;
		zx.file_name = zx.Current_file_name;
		zx.main_page_name = zx.Current_main_page_name;
		zx.rel_file = zx.Current_rel_file;
		zx.build_root = zx.Current_build_root;

		//console.log('\n\n\nfile...................................................................',main_page_name);
		//console.warn('\n\n\n========================================================================done Page ',zx.main_page_name );
		//console.warn('',zx.rel_file,fn );
		page.appendToDepenance(zx, fn);

		zx.error_log_file_name = zx.output_folder + 'error_log.json';
		zx.error_file_name = zx.output_folder + 'last_error.txt';
		var lokfn = zx.output_folder + 'last_ok.txt';

		var ofn = zx.output_folder + zx.rel_file;
		var fnh = zx.hogan_folder + zx.rel_file + '.html';
		//console.log('fnh:',fnh);
		var fnhp = path.dirname(fnh);
		//console.log('fullhoganpath:',fnhp);
		try {
			fsx.mkdirSync(fnhp + '/', dirxww, true);
		} catch (err) {
			if (err.code !== 'EEXIST')
				console.error("cannot create template folder", err);
		}
		//console.log('ofn:',path.dirname(ofn));
		try {
			fsx.mkdirSync(path.dirname(ofn) + '/', dirxww, true);
			fsx.mkdirSync(zx.output_folder + '/Audit/', dirxww, true);
			fsx.mkdirSync(zx.output_folder + '/Internal/', dirxww, true);
		} catch (err) {
			if (err.code !== 'EEXIST')
				console.error("cannot create output folders for ", err);
		}

		try {
			//console.log('RecurseParseFileToObject:',fn);
			zx.obj = page.RecurseParseFileToObject(zx, fn);
			//console.log('RecurseParseFileToObject done:',fn);
		} catch (e) {
			zx.error.caught_exception(zx, e, " RecurseParseFileToObject mark-114232 ");
			throw zx.error.known_error;
		}

      
        
        
		zx.missingfiles = zx.deduplicate(zx.missingfiles);
		zx.linkfiles = zx.deduplicate_byname(zx.linkfiles);

		fs.writeFileSync(ofn + '.json', JSON.stringify(zx.obj, null, 4));
		fs.writeFileSync(ofn + '.missing.txt', JSON.stringify(zx.missingfiles, null, 4));
		fs.writeFileSync(ofn + '.includedfiles.txt', JSON.stringify(zx.includedfiles, null, 4));

		fs.writeFileSync(zx.output_folder + 'mainfiles.txt', JSON.stringify(zx.mainfiles, null, 4));

		//console.log('writing zx.depends:',zx.depends);
		fs.writeFileSync(zx.output_folder + 'depends.json', JSON.stringify(zx.depends, null, 4));
		try {
			//console.log('diviner.compile:');
			diviner.compile(zx, zx.obj);
			//console.log('diviner.compile done:');
		} catch (e) {
			zx.error.caught_exception(zx, e, " diviner.compile mark-114233 ");
			throw zx.error.known_error;
		}
		fs.writeFileSync(ofn + '.linkfiles.txt', JSON.stringify(zx.linkfiles, null, 4));

		if (zx.wildcard || zx.pages[zx.pgi].wildcard === true) {
			// console.log('wildcard adding pages:',zx.linkfiles);
			//console.log('B4p zx.pages:',zx.pages," lf:",zx.linkfiles);
			zx.pushArray(zx.pages_addiing, zx.linkfiles);
			//console.log('ap zx.pages:',zx.pages);
			zx.pages_addiing = zx.deduplicate_byname(zx.pages_addiing);
			//console.log('WC zx.pages:',zx.pages);
			//if (zx.pgi==2) process.exit(1);
		}

		fs.writeFileSync(ofn + '.mt.txt', JSON.stringify(zx.mt, null, 4));
		fs.writeFileSync(ofn + '.sql.txt', JSON.stringify(zx.sql, null, 4));

		//html file

		//console.log('page...........................................',fnh);

		var script = zx.sql.script.join('\n');
		script = script.replace(/``/g, '"');
		script = script.replace(/\/\*\*\*\//g, ':');

		var mtscript = zx.mt.lines.join('\n'); //fix: to remove the artificial \n we must make take input \n 's as part of the source - so the output template is formatted the same as the input
		//validate this using a prepare command
		//err=zx.dbu.check_script(script);//runs the script, map the error back to a template file and line
		//output the error, sql line, template file and line


		//now write the output
		fs.writeFileSync(ofn + '.sql', script); //for easy debuging

		zx.eachplugin(zx, "before_validate_script", 0);

		if (zx.err !== undefined) {
			script = zx.sql.testhead + script + zx.sql.testfoot;
			zx.error.log_validation_fail(zx, 'Compile Error', script, zx.err);
			console.log('>>>>>>>>>>>>>>>Throwing known error (1)');
			throw zx.error.known_error;
		} else {}

		console.log('validate_script...........................................', zx.main_page_name, JSON.stringify(script, null, 4).length);
		var valid = zx.dbu.validate_script.sync(null, zx, zx.main_page_name, script);
		//console.log('validate_script...........................................',valid);
		//if (valid.result) {};
		//console.log('validate_scriptxxx-----------------------------',valid);
		if (valid === 'ok') { //only update when no syntax errors exist
			console.log('Script validated - no error ' + zx.main_page_name);
			fs.writeFileSync(
				fnh,
				mtscript);

			zx.dbu.write_script(zx,false, zx.CurrentPageIndex ,zx.main_page_name, script,'');

			console.log('Wrote script to database - ' + zx.main_page_name, 'size:', script.length);

			var errtxt = zx.sql.testhead + script + zx.sql.testfoot + mtscript;
			fs.writeFileSync(lokfn, errtxt); //for easy debugging - when this file reloads it means there was an error

		} else {
            script = zx.sql.testhead + script + zx.sql.testfoot;
            fs.writeFileSync(zx.error_file_name, script);
			if (valid.message.match(/count of column list and variable list do not match/)) {
				console.log('Quale definition missing - ', valid);				//definition
				zx.error.log_SQL_fail(zx, 'Quale definition missing',
                        "Each field in a table select statement must have a -:{} even if empty.",{}, {});
                
				throw zx.error.known_error;
			} else {
				console.log('Script validation failed - ', valid);
				
				zx.error.log_validation_fail(zx, 'Script validation failed', script, valid);				
				throw zx.error.known_error;
			}
		}
	}

	return;
};

var deepcopy = require('deepcopy');
var seq_pages = function (zx) {
	while (zx.pgi < zx.pages.length) {
		while (zx.pgi < zx.pages.length) {

			try {
				seq_page(zx);
			} catch (e) {
				zx.error.caught_exception(zx, e, " iterating pages mark-114230 ");
			}
			zx.eachplugin(zx, "done_page", zx.pages[zx.pgi]);

			zx.pgi++;
		} //for pages

		//console.log('wildcard pages_addiing:',zx.pages_addiing);
		zx.pushArray(zx.pages, zx.pages_addiing);
		zx.pages_addiing = [];
		zx.pages = zx.deduplicate_byname(zx.pages);
	} {
		//console.log('page...........................................\n',zx.pages[zx.pgi],zx.obj);
		console.log('\n...........................................all done\n');
	}

};


console.log('compiler started');
if (!fs.existsSync("Quale")) {
    // Do something
    console.log('The compiler must be run with the current working directory being the root of the project to be compiled.');
    console.trace('process.exit(2) from existsSync Quale : '); process.exit(2);
}

Sync(function () {

	//	for (var i = 0; i < 25; i++)
	//		console.log('');
	console.log(Date());

	zx.pages = [];
	zx.pages_addiing = [];
	zx.plugins = [];

	zx.dbu = require('../database/db_fb_sql_util.js');
	zx.plugins.push(zx.dbu);

	console.log('opening database');
	try {

		//console.log('starting main');
		seq_main();
		//console.log('done main');
	} catch (e) {
		// If some of async functions returned an error to a callback
		// it will be thrown as exception
		console.error(e);
		zx.dbu.exit();
		console.log("!!!!!!!!!!Exception!!!!!!!!!:", e);
		throw e;
	}

	//console.log("shuting_down");
	zx.eachplugin(zx, "shut_down", 0);
	//console.log("shut_down");
	zx.dbu.exit();
});
//eof

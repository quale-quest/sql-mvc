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


var hogan = require('ss-hogan/node_modules/hogan.js');
 
var program = require('commander');
var fs = require('fs');
var path = require('path');
var page = require('./modules/page.js');
var diviner = require('./modules/diviner.js');
var zx = require('./zx.js');
var db = require("../../server/database/DatabasePool");
var fsx = require('node-fs');
var fileutils = require('../lib/fileutils.js');

var dirxww = 493; /* octal 0755 */
zx.TemplateHashPrefix = 'a';
var search_paths = ['./node_modules/','../node_modules/','../../node_modules/'];



var queue_file_to_be_compiled = function (zx, dfn) {
	var fileobj,
	br,
	name;
	//console.log('queue_file_to_be_compiled:', dfn);

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
			/* zx.depends holds details for testing if a "include" file has changed, then which file(s) is to be compiled to update all dependencies */
			fileobj = zx.depends[dfn];
			console.log('Dependancy  :',dfn,' >>>',fileobj);

			if (fileobj !== undefined) {
				//console.log('zx.depends :',fileobj.parents);

				for (name in fileobj.parents) {
					if (fileobj.parents.hasOwnProperty(name)) {
						//console.log('queue_file_to_be_compiled pushing:', name);
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

function getDirectories(srcpath,Filter) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
  
  console.log('getFiles:' + getFiles('.', null, /widget/gi));
}

var List_Pages = function (zx,msg) {
		zx.forFields(zx.pages, function (obj,key) {
			console.log(msg, obj.name);
		});	
}		

var AddDependedFilesToBeCompiled = function (zx,fn) {				

	var fileobj = zx.depends[fn],name;
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


		//console.log('Require zx.UIsl:', zx.UIsl);

		zx.default_pk_name = 'ref';
		zx.transaction_active = true;
		zx.compiler_active = true;
		zx.debug = 1;
		zx.debug_conditional_structure = 0;
		zx.exit_on_error=1;
        start_page_compiler(zx);

        zx.pass=0;
		
		zx.depends = {};
        zx.children = {};
		zx.mainfiles = [];
		zx.BlockIndex = 0;
        
        zx.root_folder = process.cwd()+ path.sep;// path.resolve(path.join('.'+path.sep+'Quale'+path.sep)) + path.sep;

        
        zx.config = db.load_config(zx.root_folder, '');//always in Quale/Config
		//console.log('zx.config :', zx.config);
		zx.fb25=false; //just for making mssql
		zx.fb30=false;
		zx.mysql57=false;
		zx.mssql12=false; // MS Sql Server
		zx.pgsql=false; // Postgres
		zx.odsql=false; // Oracle
		
        if (zx.config.db.dialect=="fb25")    zx.fb25=true;
		if (zx.config.db.dialect=="mysql57") zx.mysql57=true;
		if (zx.config.db.dialect=="mssql12") zx.mssql12=true;
		if (zx.config.db.dialect=="pgsql90") zx.pgsql90=true;
		if (zx.config.db.dialect=="odsql11") zx.odsql11=true;
		
		

        
		console.log('zx.root_folder :', zx.root_folder);
		zx.build_roots = ["Quale/Config", "Quale/Custom", "Quale/Standard", "Quale/Lib"]; 
		zx.build_roots.push("Quale/Database/"+zx.config.db.dialect); //database dependant files
        
        //order find first file
        /*  Application folders :   
                    Sandbox,   // File in development that is intended to be deleted soon
                    Custom,    // Files permanently customised for this installation
                    Standard,  //Where the main standard app goes
                    
            Libraries
                    Lib     Libraries provided by a package
                    
            With in the folders we have a app structure and the files are over layed to form one virtual folder structure
                Home
                All
                Elements
                FootMenu
                MainMenu
                Models
                Controllers
                Layout
                Popup
                    
        */
        
        //Find Installable drop-in folders
		
		search_paths.forEach(function(sp) {			
			if (fs.existsSync(sp)) {
				fileutils.getDropinPackages(sp,/sql-mvc-di/,zx.config.packages, zx.build_roots);
				fileutils.getDropinPackages(sp,/sql-mvc-di/,zx.config.db.packages, zx.build_roots);
			}		
		});

        
        //Add plug-in folders
        zx.build_roots.push(""); //last one MUST be "" 


        console.error("\r\n\r\nQuale Search path ",zx.build_roots);
        console.error("==================================================================== ");
        
		//if dev mode zx.build_roots.unshift("sandbox");
		zx.output_folder = path.resolve('./output/') +path.sep;
        
        //must be created early so we have place to write errors to
		//try {remove.removeSync(zx.output_folder);} catch (err) {}
		try {fs.mkdirSync(zx.output_folder);
		} catch (err) {
          if (err.code!=='EEXIST'){
            console.error("cannot create output folder",err);
            process.exit(2);
          }
		}
		zx.sql_log_file_name = zx.output_folder + 'sql_log.json'; 
		zx.error_file_name = zx.output_folder + 'last_error.txt';	
		zx.sql_log_file_obj=[];
		zx.error_log_file_name = zx.output_folder + 'error_log.json';
        
        zx.hogan_folder = path.resolve('./client/templates/') +path.sep;
        
		zx.hogan_folder_compiled =  path.resolve('./database/files/') +path.sep;

		zx.app_folder = 'Guest';
		zx.app_incl_extn = zx.app_extn = '.quicc';

        try {
            if (fs.existsSync(zx.output_folder + 'depends.json')) {
                fileContents = fs.readFileSync(zx.output_folder + 'depends.json');
                if (fileContents !== "") {
                    zx.depends = JSON.parse(fileContents);
                }
            }
        } catch (e) {
            zx.depends = {};
        }
        
        try {
            if (fs.existsSync(zx.output_folder + 'children.json')) {
                fileContents = fs.readFileSync(zx.output_folder + 'children.json');
                if (fileContents !== "") {
                    zx.children = JSON.parse(fileContents);
                }
            }
        } catch (e) {
            zx.children = {};
        }
		zx.dbg = require('../database/db_fb_sql_gen.js');
		zx.plugins.push(zx.dbg);
		zx.dbg.var_actaul = zx.config.db.var_actaul;

		zx.db_update = require('../database/db_fb_sql_updater.js');
		zx.plugins.push(zx.db_update);

		zx.template_control = require('./modules/template_control.js');
		zx.plugins.push(zx.template_control);

		zx.quic = require('./modules/quic.js');
		zx.plugins.push(zx.quic);

		zx.models = require('./modules/models.js');
		zx.plugins.push(zx.models);

        zx.page=page;
		zx.plugins.push(page);

		zx.hogan_ext = require('./modules/hogan_ext.js');        
		zx.plugins.push(zx.hogan_ext);   
		console.error("zx.config.branding :",zx.config.branding);		
		require('./modules/plugins.js').build(zx,zx.config.packages,zx.config.db.packages);		
        
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



		if (zx.pages.length === 0) {

			if (program.args.length > 0) {
				cmd = program.args[0].toLowerCase();
			}

			if (cmd === 'index') {
                console.log('index builds file:');
				if (program.args.length > 1) {
					f = program.args[1];
				
				zx.pages.push({
					name : f,
					obj : "args"
				});
                }
			} else if (cmd === 'app') {
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
                
                
			} else if (cmd === 'all') {
                //all [Application[/LandingPage]] 
                var prefix='Quale/Standard/';
                zx.app_folder='';
				if (program.args.length > 1) {
					zx.app_folder = program.args[1];
				}
                zx.wildcard = true;
                
                //get a list of folders that contain Index.quicc 
                var files_ = fileutils.getFiles(prefix+zx.app_folder,null , /Index.quicc/);
                //console.log('index builds files:',files_);
                 
                zx.forFields(files_,function (filename) {
                    filename = '//'+filename.slice(prefix.length,-6); //-6 = legth of .quicc
                    console.log('index builds files each:',filename);
                    zx.pages.push({
                        name : filename,
                        obj : "args"
                        });
                });               

			} else if (cmd === 'file') {

				if (program.args.length < 2) {
					console.warn('invalid , expected : file filename ');
					return;
				}
				AddDependedFilesToBeCompiled(zx,program.args[1]);


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
				console.log('filelist  :', filelist);

				filelist.forEach(function (dfn) {
					queue_file_to_be_compiled(zx, dfn);

				});

				zx.pages = zx.deduplicate_byname(zx.pages);
				console.log('compiling  :', zx.pages);
			
			} else {
				console.warn('invalid command expected[app|file|deltafile|index] got :', cmd);
				return;
			}

		}

		//List_Pages(zx,'input page list:');
		zx.pgi = 0;
		seq_pages(zx);
		List_Pages(zx,'final page list:');		

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
	re = new RegExp('^Elements', "i");
	var filelist_e = fileutils.getDropinFileList(zx, re, path, zx.line_obj, 130130);
    
    
    //console.warn('got model_files for --M:',filelist_m);
    //console.warn('got model_files for --C:',filelist_c);
    //console.warn('got model_files for --D:',filelist_d);
    //console.warn('got model_files for --E:',filelist_e);
	
    var list = filelist_c.concat(filelist_m, filelist_d,filelist_e);
    //console.warn('got model_files for --:',list);

	return list;
}

var seq_page = function (zx) {

    //List_Pages(zx,'wip page list:');       
    console.warn('\n\n\n=============================================================================Page ', zx.pages[zx.pgi].name);	
	//console.warn('Checking Z process.exit(2); ');process.exit(2);
    start_page_compiler(zx);
	//console.warn('Checking A process.exit(2); ');process.exit(2);
    zx.eachplugin(zx, "start_page", zx.pages[zx.pgi]);
	zx.eachplugin(zx, "init", zx.line_objects); //to be deprecated
        
	//console.warn('Checking process.exit(2); ');process.exit(2);
	
	//var fn = zx.dbg.calcfilelocation(zx,zx.pages[zx.pgi])+zx.app_extn
	try {
		zx.file_stack = [];
		delete zx.err;

		//zx.config = db.load_config(zx.root_folder, zx.pages[zx.pgi].name);
		//console.warn('zx.config located : ',zx.config);
		//process.exit(2);


		var result,done=false;
        zx.dbu.databaseUtils(zx.root_folder, zx.pages[zx.pgi].name, zx.pages[zx.pgi].name
        ,function cb(err,res,rambase){
            //console.warn('database connecting on config AA',err,res,rambase);
			  rambase.transaction_active = true;
              zx.conf = rambase.conf;
              //result = res;
              done=true;
              
            
        } );
        while(!done) { 
		  var deasync_const=15;
          require('deasync').sleep(deasync_const);
        }
		
		//console.warn('database synced on config ',JSON.stringify(zx.conf, null, 4) );
        

        zx.CurrentPageIndex = 1; //default until pass 5
        //console.trace('set CurrentPageIndex ',zx.CurrentPageIndex );
        
		var fn = fileutils.locatefile(zx, zx.pages[zx.pgi].name, zx.root_folder, "Compile " + zx.pages[zx.pgi].name, 120022);
		//console.warn('file located : ',fn);

		zx.model_files = get_model_files(zx, fn);
		//console.log('\r\n...........................................seq_page get_model_files:',zx.CurrentPageIndex,' : ',zx.pgi);		
		//console.warn('zx.model_files :',zx.model_files);

	} catch (e) {
		zx.error.caught_exception(zx, e, " seq_page db/config start mark-114231 ");
	}

      

	//console.warn('Checking process.exit(2); ');process.exit(2);
	


	if (fn === "") {
		console.warn('file not found ', zx.Current_rel_file, fn);
		zx.error.log_nofile_warning(zx, "InputFileNameBlank:", "", 0);
		return false;
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


		var lokfn = zx.output_folder + 'last_ok.txt';

		var ofn = zx.output_folder + zx.rel_file;
		var fnh = zx.hogan_folder + zx.rel_file + '.html';
        var fnhc = zx.hogan_folder_compiled + zx.rel_file + '.html.js';
		//console.log('fnh:',fnh);
		/*no longer used
        //var fnhp = path.dirname(fnh);
		//console.log('fullhoganpath:',fnhp);
		//try {
		//	fsx.mkdirSync(fnhp + '/', dirxww, true);
		//} catch (err) {
		//	if (err.code !== 'EEXIST')
		//		console.error("cannot create template folder", err);
		//}
```````*/
		try {
			fsx.mkdirSync(path.dirname(fnhc) + '/', dirxww, true);
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
			throw new Error("local known error 117010");
		}

      
        
        
		zx.missingfiles = zx.deduplicate(zx.missingfiles);
		zx.linkfiles = zx.deduplicate_byname(zx.linkfiles);

		fs.writeFileSync(ofn + '.json', JSON.stringify(zx.obj, null, 4));
		fs.writeFileSync(ofn + '.missing.txt', JSON.stringify(zx.missingfiles, null, 4));
		fs.writeFileSync(ofn + '.includedfiles.txt', JSON.stringify(zx.includedfiles, null, 4));

		fs.writeFileSync(zx.output_folder + 'mainfiles.txt', JSON.stringify(zx.mainfiles, null, 4));

		//console.log('writing zx.depends:',zx.depends);
		fs.writeFileSync(zx.output_folder + 'depends.json', JSON.stringify(zx.depends, null, 4));
        fs.writeFileSync(zx.output_folder + 'children.json', JSON.stringify(zx.children, null, 4));
		try {
			//console.log('diviner.compile:');
			diviner.compile(zx, zx.obj);
			//console.log('diviner.compile done:');
		} catch (e) {
			zx.error.caught_exception(zx, e, " diviner.compile mark-114233 ");
			throw new Error("local known error 117011");
		}
		
		var LinkFilesTxT = ((zx.wildcard || zx.pages[zx.pgi].wildcard === true)?"wildcard==true ":"wildcard==false ") + JSON.stringify(zx.GetNamesInArray(zx.linkfiles), null, 4);
		fs.writeFileSync(ofn + '.linkfiles.txt',LinkFilesTxT );
	
		if (zx.wildcard || zx.pages[zx.pgi].wildcard === true) { //wildcard is true for compiling 'ALL' or 'APP'
			// console.log('wildcard adding pages:',zx.linkfiles);
			//console.log('B4p zx.pages:',zx.pages," lf:",zx.linkfiles);
			zx.pushArray(zx.pages_addiing, zx.linkfiles);
			//console.log('ap zx.pages:',zx.pages);
			zx.pages_addiing = zx.deduplicate_byname(zx.pages_addiing);
			//console.log('WC zx.pages:',zx.pages);
			//if (zx.pgi==2) process.exit(1);
		}
		//console.log('.zx.pages_addiing:',zx.GetNamesInArray(zx.pages_addiing));

		fs.writeFileSync(ofn + '.mt.txt', JSON.stringify(zx.mt, null, 4));
		fs.writeFileSync(ofn + '.sql.txt', JSON.stringify(zx.sql, null, 4));

		//html file

		//console.log('page...........................................',fnh);

		var script = zx.sql.script.join('\n');
		script = script.replace(/``/g, '"');
		script = script.replace(/\/\*\*\*\//g, zx.config.db.var_actaul);		

	    script = zx.dbu.sql_make_compatable_final_pass(zx,script);

        fs.writeFileSync(ofn + '.mt', zx.mtscript);
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
			throw new Error("local known error 117013");
		} else {}

		console.log('validate_script...........................................', zx.main_page_name, JSON.stringify(script, null, 4).length);		
		var valid = "ok";
		if (zx.fb25) {
			var opens = "-- assign_params";
			var closes = "res=res||'}}]';";
			var script_v = script.replace(opens,opens+"\r\nif (1=0) then begin").replace(closes,closes+'\r\nEND'); //validate only dont execute any of the code
			valid = zx.dbu.validate_script(zx, "validate_script :"+ zx.main_page_name, script_v);
		}

		//console.log('validate_script...........................................',valid);
		//if (valid.result) {};
		//console.log('validate_scriptxxx-----------------------------',valid);
		if (valid === 'ok') { //only update when no syntax errors exist
			//console.log('Script validated - no error ' + zx.main_page_name);
            if (zx.cache_page_in_app) { //we can still write pages to go with the first open of the app, like the index page
            //todo need an interface to set cache_page_in_app
            fs.writeFileSync(fnh,zx.mtscript);
            zx.cache_page_in_app=0;
            
            }
                
            var so=hogan.compile(zx.mtscript, {asString: true}) ;  
            
            
            so = "(function(){var ht=Hogan.Template,sst=require('socketstream').tmpl;" 
                 +'sst[\'' + zx.main_page_name.substring(2).replace(/[\/\\]/g, "-") + '\']=new ht(' + so + ');'
                 +'}).call(this);';    
            
            //console.log('Wrote template - ' + so);    

            var mtjs = '' +so + '';    
            fs.writeFileSync(fnhc,mtjs);    

            //console.trace('Writing script to database - ' + zx.main_page_name, 'size:', script.length," spi:",zx.CurrentPageIndex);       
			if (zx.CurrentPageIndex==undefined) throw new Error("zx.CurrentPageIndex==undefined");
			zx.dbu.write_script(zx,true, zx.CurrentPageIndex ,zx.main_page_name,zx.mtHash, script,'');
			//console.log('Wrote script to database - ' + zx.main_page_name, 'size:', script.length);

			var errtxt = zx.sql.testhead + script + zx.sql.testfoot + zx.mtscript;
			fs.writeFileSync(lokfn, errtxt); //for easy debugging - when this file reloads it means there was an error

		} else {
            console.log('Script failed to validate :',valid);
            script = zx.sql.testhead + script + zx.sql.testfoot;
            fs.writeFileSync(zx.error_file_name, script);
			if (valid.message.match(/count of column list and variable list do not match/)) {
				console.log('Quale definition missing - ', valid);				//definition
				zx.error.log_SQL_fail(zx, 'Quale definition missing',
                        "Each field in a table select statement must have a -:{} even if empty.",{}, {});
                
				throw new Error("local known error 117014");
			} else {
				console.log('Script validation failed - ', valid);
				
				zx.error.log_validation_fail(zx, 'Script validation failed', script, valid);				
				throw new Error("local known error 117015");
			}
		}
	}

	//console.warn('seq_page exit(2); ');process.exit(2);
	return true;
};

var deepcopy = require('deepcopy');
var seq_pages = function (zx) {
	while (1) { 
		while (zx.pgi < zx.pages.length) {
            var ok;
			try {
				//console.log('\r\n...........................................seq_pages CurrentPageIndex:',zx.CurrentPageIndex,' : ',zx.pgi);
				ok = seq_page(zx);
			} catch (e) {
				zx.error.caught_exception(zx, e, " iterating pages mark-114230 ");
			}
            if (!ok)     {
                    console.log('\n...........................................No output,No Exception, suggests compiler caught it`s own error, throwing now\n');                    
				throw new Error("No output,No Exception, - known error");
      		}                
			zx.eachplugin(zx, "done_page", zx.pages[zx.pgi]);

			zx.pgi++;
		} //for pages

		zx.pushArray(zx.pages, zx.pages_addiing);
		zx.pages_addiing = [];
		zx.pages = zx.deduplicate_byname(zx.pages);
		if (zx.pgi >= zx.pages.length) break;		
	} {
		//console.log('page...........................................\n',zx.pages[zx.pgi],zx.obj);
		console.log('\n...........................................all done\n');
	}

};


console.log('compiler started');
var ui=false;
search_paths.forEach(function(sp) {	ui|=fs.existsSync(sp+"sql-mvc-ui-dark") });

if (!fs.existsSync("Quale")||!ui) {
    // Do something
	console.log('\r\n...........................................');
    console.log('The compiler must be run with the current working directory being the root of the project to be compiled.');
	console.log('In addition at least one UI package must be available from the current working directory such as node_modules/sql-mvc-ui-dark  .');
	
    console.log('\r\nprocess.exit(2) from existsSync Quale : '); 
	console.log('...........................................');
	process.exit(2);
}

//Sync(function () {

	//	for (var i = 0; i < 25; i++)
	//		console.log('');
	console.log(Date());

	zx.pages = [];
	zx.pages_addiing = [];
	zx.plugins = [];
    zx.debug_options = {};

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
        console.log(e.stack);
		throw e;
	}

	console.log("shuting_down");
	zx.eachplugin(zx, "shut_down", 0);
	console.log("shut_down");
	zx.dbu.exit();
	console.log("dbu.exited");
//});
//eof

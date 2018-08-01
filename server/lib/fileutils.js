"use strict";
//

var path = require('path');
var fs = require('fs');

exports.module_name='fileutils.js';

exports.changefileextn = function (str, newextn) { //must include the .    //todo test
	return str.substring(0, str.length - path.extname(str).length) + newextn;
};

var locateclosestbuildroot = exports.locateclosestbuildroot = function (zx, fn) {
	// locates the closest root this file is part of
	var filename = fn + fn; //any string longer than fn
	var build_root;
	//console.log('locateclosestbuildroot   :',fn );
	zx.build_roots.forEach(function (root_name) {
		var build_rel = path.resolve(path.join(zx.root_folder, root_name));
		var rel = path.relative(build_rel, fn);
		//if (zx.pass<1)  console.log('    relative  154240 : from ',zx.root_folder,' via:',root_name,' to:',fn, ' is:', rel);
		if (rel.length < filename.length) {
			filename = rel;
			build_root = root_name;
			//console.log('    locateclosestbuildroot thus far  :',filename,'p:',build_root,':' );
		}
	});
    //console.log('    locateclosestbuildroot final  :',filename,'p:',build_root,':' );
	return {
		filename : filename,
		build_root : build_root
	};
};

exports.locatefile = function (zx, fn, current_page, line_obj, trce) {
	//finds the first file to match the exact file name
	zx.Current_file_name = '';
	zx.Current_main_page_name = '';

	if (fn === undefined || fn === '') {
		//console.warn('locatefile filename empty from',current_page,zx.line_obj,trce );
		//?? this is before the multi-pass compiler kicks in...?? if (zx.pass==pass_max)
		zx.error.log_nofile_warning(zx, "NoFileSpecified:" + trce, "", zx.line_obj);
		return "";
	}

    
    //if (zx.pass<1) console.log(' file name   154245 :',fn );
	if (fn.substring(0, 2) === "//") //abs path
	{
		fn = fn.substring(2);
	}
	fn = fn.replace(zx.app_extn, '');

	//backward comparable with ini ~ format
	fn = zx.dbg.adapt_filename(fn);
    
    //if (zx.pass<1) console.log(' file name   154246 :',fn );
    //if (zx.pass<1) console.log('current_page  154246 :',current_page );
    //current_page is now zx.root_folder
	// dont see the point of this - 
    var br = locateclosestbuildroot(zx, current_page.replace(zx.app_extn, '')); //path.join(zx.root_folder,fn));
	//if (zx.pass<1) console.log(' locateclosestbuildroot    :',br ,fn,' current_page:',current_page);
    //if (zx.pass<1) console.log(' file name    171843 :',fn );//, br.filename);
    //process.exit(2);
	zx.build_roots.some(function (root_name)
		//var root_name = "../../lib";
	{
		
		var search_path = path.join(zx.root_folder, root_name,br.filename);
		//if (zx.pass<1) console.log('search_path 154246  :',search_path );

		//var rel = path.relative(zx.root_folder, search_path);
		//console.log('relative   :',rel );

		var build_rel = path.resolve(path.join(zx.root_folder, root_name));
		//console.log('build_rel   :',build_rel );


		//console.log('zx.root_folder :',zx.root_folder );
		//console.log('lengths 154246: ',search_path.length,build_rel.length,search_path,build_rel );
		while (search_path.length >= build_rel.length - 1) {
			var ffn = path.join(search_path, fn);
			//TODO have debug mode that shows this to the user: if he cant figure out why his files arnt being seen
			//console.log('    trying 171021: ',ffn+zx.app_extn );
			if (fs.existsSync(ffn + zx.app_extn)) {
				zx.Current_rel_file = path.relative(build_rel, ffn);
				//console.log('locatefile Found 171020  :',ffn );
                //process.exit(2);
				//console.log('               :',zx.Current_rel_file );


				zx.Current_file_name = ffn;
				zx.Current_main_page_name = "//" + zx.Current_rel_file;
				zx.Current_build_root = root_name;

				return true;
			}
			//else console.log('No file at locatefile: ',ffn );

			search_path = path.dirname(search_path);
		}
		return false;
	});

	if (zx.Current_file_name !== '')
		return zx.Current_file_name;

	if (zx.pass === 1) {
		console.log('!!!!!No file found for : ', fn, trce);
		zx.error.log_nofile_warning(zx, "FileNotFound - search: " + trce, fn, zx.line_obj);
	}

	return "";
};

exports.getDropinFileList = function (zx, regex, current_page , line_obj, trce
) {
	//makes a list of files that meet a search criteria
	var filelist = [];
	var br = locateclosestbuildroot(zx, current_page.replace(path.extname(current_page), ''));
	//console.log(' locateclosestbuildroot    :',br ,trce);
	zx.build_roots.some(function (root_name)
		//var root_name = "../../lib";
	{
		//console.log(' file name     :',fn );
		var search_path = path.join(zx.root_folder, root_name, br.filename);
		//console.log('current_page   :',current_page,search_path );

		//var rel = path.relative(zx.root_folder, search_path);
		//console.log('relative   :',rel );

		var build_rel = path.resolve(path.join(zx.root_folder, root_name));
		//console.log('build_rel   :',build_rel );


		//console.log('zx.root_folder :',zx.root_folder );
		//console.log('lengths : ',search_path.length,build_rel.length,search_path,build_rel );

		inheritFiles(path.resolve(search_path), filelist, path.resolve(build_rel), regex);
        //console.log(' getDropinFileList  building  :',filelist);
		return false;
	});
    //console.log(' getDropinFileList    :',filelist);
	return filelist;
};

var getFiles = exports.getFiles = function(dir, files_, regex,maxdepth) { //regular recursive search
	files_ = files_ || [];
	maxdepth = maxdepth || 99;
	
	//console.log('getFiles :',dir,fs.statSync(dir))
	if (typeof files_ === 'undefined')
		files_ = [];
	if (!fs.existsSync(dir)) {
		//console.log('getFiles !isDirectory:',dir);
		return files_;
	}	
	var files = fs.readdirSync(dir);

		//console.log('getFiles found:',files);
	for (var i in files) { //is this ok??? should it not be foreach???  TODO
		//console.log('getFiles checking:',i);
		if (!files.hasOwnProperty(i))
			continue;
		var name = files[i];
		var pathname = path.join(dir , name);
		if (fs.statSync(pathname).isDirectory()) {
			if (maxdepth>1)
				getFiles(pathname, files_, regex,maxdepth-1);
		} else {
			//console.log('getFiles regex:',pathname);
			if ((regex !== undefined)&&(regex !== null)) {
				if (!regex.test(name)) {
					//console.log('getFiles regex test!:',name, ' x:',regex);
					continue;
				}
			}
			files_.push(pathname);
            //console.log('getFiles found:',pathname);
		}
	}
    
    //console.log('getFiles found list:',files_);
	return files_;
}

function inheritFiles(dir, files_, root, regex_prefix, regex_extn, debug) { //backward search TODO untested

	//console.log('inheritFiles:',root,' where:',regex_prefix,'*',regex_extn,' in ',dir);
	files_ = files_ || [];
	if (typeof files_ === 'undefined')
		files_ = [];
	try {
		var files = fs.readdirSync(dir);
		files.forEach(function (name) {
			var pathname = path.join(dir, name);
			//if (debug === 1)
				//console.log('inheritFiles pathname:', pathname);
			if (regex_prefix !== undefined) {
				if (regex_prefix.test(name)) {
					//pathname = pathname + " vvvv";
					files_.push(pathname); // + i.toString());
					if (fs.statSync(pathname).isDirectory()) {
						//inheritFiles(path.resolve(pathname),files_,path.resolve(pathname),regex);//,1);

						//all files(matching optional exten) under a matching directory is considered matched
						getFiles(path.resolve(pathname), files_, regex_extn);
					}
				}
			} else
				files_.push(pathname); //+ i.toString());

		});
	} catch (e) { //no action is needed we are just searching to existent files
	}

	if (dir.length > root.length)
		inheritFiles(path.resolve(path.join(dir ,'..')), files_, root, regex_prefix);
        
    // console.log('inheritFiles found list:',files_);    
	return files_;
}


var getDropinPackages = exports.getDropinPackages = function(dir, dir_regex,package_list, files_) { //regular recursive search
	files_ = files_ || [];
	if (typeof files_ === 'undefined')
		files_ = [];
	var files = fs.readdirSync(dir);
    //console.log('getFiles found:',files);
    
    
    
    
	for (var i in files) { //is this ok??? should it not be foreach???  TODO
		if (!files.hasOwnProperty(i))
			continue;
		var name = files[i];
        if (dir_regex && !dir_regex.test(name)) continue;
            
		//var pathname = path.join(dir , name);
        var libname = path.join(dir , name, 'Quale', 'Lib');
        try {
            if (fs.statSync(libname).isDirectory()) {
                console.log('getFiles pathname:',libname);
                files_.push(libname);           
            } else {
            }
        } catch (err) {}
	}
    
    //console.log('getFiles plugin package_list:',package_list);
	for (var i in package_list) { //is this ok??? should it not be foreach???  TODO
		if (!package_list.hasOwnProperty(i))
			continue;
		var name = package_list[i];
		//check if package not already found
		var found = files_.findIndex(function(e) {
			return (e.indexOf(name) > -1);
		});
		if (found<0) {
			var libname = path.join(dir , name, 'Quale', 'Lib');
			try {
				if (fs.statSync(libname).isDirectory()) {
					//console.log('getFiles plugin pathname:',libname);
					files_.push(libname);           
				} else {
				}
			} catch (err) {}
		}
	}
        
    
    //console.log('getFiles found list:',files_);
	return files_;
}

/*function UnitTest() {
console.log('getFiles:' + getFiles('.', null, /widget/gi));
console.log('\n got inheritFiles:' + inheritFiles(path.resolve('.'), null, path.resolve('../..'), /.json/gi));
}

console.log('getFiles:' + getDropinPackages('node_modules/',/sql-mvc/, null));
process.exit(2);

*/





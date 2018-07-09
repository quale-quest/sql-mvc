"use strict";
//var fs = require('fs');
var path = require('path');
var fs = require('fs-extra');
var deepcopy = require('deepcopy');
var fileutils = require('../../lib/fileutils.js');
exports.module_name = 'plugins.js';

var search_paths = ['./node_modules/','../node_modules/'];

//build app.html
var build_injectpoint = function (txt,packages,path,name) {

		
	var field = '{{'+name+'_inject_point}}';
	var val='';
	packages.forEach(function(pk) {	
		search_paths.forEach(function(sp) {			
			let fn = sp+pk+'/'+path+name+'.html_fragment';						
			//console.log('build_injectpoint :',fn,'\t\t fx:',fs.existsSync(fn));
			if (fs.existsSync(fn)) {				
				//console.log('build_injectpoint :',fn,' ');
				val += fs.readFileSync(fn).toString();
				//console.log('build_injectpoint val:',val.length,'\t\t ');
			}
		});	
	});
	//console.log('build_injectpoint valx:',val.length,'\t\t ');
	txt=txt.replace(field,val);
	
return txt;	
}

exports.build_file = function (zx,packages,from_folder,from_fn,to_fn) {
	
	console.log('plugins.build from_folder:',from_folder);
	//console.log('plugins.build packages:',packages);
	//console.log('plugins.build from_fn:',from_fn);
	
	
	
	if (from_folder==null) {		
		console.log('plugins.build copySync:',from_fn,' to_fn:',to_fn);
		fs.copySync(from_fn,to_fn);
	}
	else {
		console.log('plugins.build from_fn:',from_fn,' to_fn:',to_fn);
		var text = fs.readFileSync(from_fn).toString();		
		let text_list = text.match(/{{.+_inject_point}}/gi);
		//console.log('plugins.build text_list:',text_list);
		if (text_list!=null) {
			text_list.forEach(function(ip) {
				ip = ip.replace('_inject_point}}','').replace('{{','');
				//console.log('plugins.build ip:',ip);
				text= build_injectpoint(text,packages,from_folder,ip);
			});
		}
		//console.log('plugins.build to_fn:',to_fn);
		fs.writeFileSync(to_fn,text);
	}
	
}
exports.find_and_build_files = function (zx,packages,from_folder,src_folder,from_ext,to_folder,maxdepth) {

	maxdepth = maxdepth||1;
	packages.forEach(function(pk) {	
		search_paths.forEach(function(sp) {
			var foldername = sp+pk+'/'+src_folder;	
			//console.log('find_and_build_files foldername:',foldername);
			var files = fileutils.getFiles(foldername, null, from_ext, maxdepth);
			//console.log('find_and_build_files files:',files);
			files.forEach(function(filename) {	
				var to_file = path.join(to_folder,path.relative(foldername,filename));
				fs.ensureDirSync(path.dirname(to_file));
				//path.relative(foldername,filename)				
				
				//console.log('find_and_build_files foldername:',foldername);
				//console.log('find_and_build_files filename  :',filename);
				
				//console.log('find_and_build_files relative  :',path.relative(foldername,filename));
				//console.log('find_and_build_files to_folder :',path.dirname(to_file));
				//console.log('find_and_build_files to_file   :',to_file);
				exports.build_file(zx,packages,from_folder,filename,to_file);
			});
		});	
	});
}

	
exports.build = function (zx,config_packages,parent_packages) {
	let packages = (config_packages||[]).concat(parent_packages||[]);
	let src = 'client/source/';
	
	exports.find_and_build_files(zx,packages,null,'client/code/',/\.js$/i,'client/code/',3);
	
	exports.find_and_build_files(zx,packages,null,'client/static/others/',/\.js$/i,'client/static/others/',2);
	exports.find_and_build_files(zx,packages,null,'client/static/others/',/\.css$/i,'client/static/others/',2);
	exports.find_and_build_files(zx,packages,null,'client/static/others/',/\.html$/i,'client/static/others/',2);
	
	exports.find_and_build_files(zx,packages,null,'client/static/images/',/\.png$/i,'client/static/images/',2);
	exports.find_and_build_files(zx,packages,null,'client/static/images/',/\.jpg$/i,'client/static/images/',2);
	exports.find_and_build_files(zx,packages,null,'client/static/images/',/\.jpeg$/i,'client/static/images/',2);
	exports.find_and_build_files(zx,packages,null,'client/static/images/',/\.ico$/i,'client/static/images/',2);
	
	exports.find_and_build_files(zx,packages,src,'client/templates/Widgets/',/\.html$/i,'client/templates/Widgets/');
	
	exports.build_file(zx,packages,src,'client/source/app.html','client/views/app.html');
	
}
//eof
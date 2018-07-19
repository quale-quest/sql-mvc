"use strict";
/*jshint browser: true, node: false, jquery: true */
/*  */

// Load `*plugin*.js` under current directory 
exports.ary=[];
/*
require('fs').readdirSync(__dirname + '/').forEach(function(file) {
  if (file.match(/plugin.*\.js$/) !== null && file !== 'plugins.js') {
    var name = file.replace('.js', '');
	console.log('loading plugin :',name);
    exports[name] = require('./' + file);
	exports.ary.push(exports[name]);
  }
});

*/


exports.require_plugin = function (name) { 
	console.log('loading plugin :',name);
    exports[name] = require('./' + name+'.js');
	exports.ary.push(exports[name]);    
}

exports.init_client_plugin_mt_functions = function (obj,ss_tmpl) {     
	exports.ary.forEach(function(plugin) {
		console.log('init_client_plugin_mt_functions:',plugin.name);
		plugin.init_client_plugin_mt_functions(obj,ss_tmpl);
	});	
}

exports.init_after_render = function (Target) {     
	exports.ary.forEach(function(plugin) {
		console.log('init_after_render:',plugin.name);
		if (plugin.init_after_render)
			plugin.init_after_render(Target);
	});	
}


/*Plugin list has to be updated by compiler as the client side does not have access to require('fs') */
/*Start Of Plugins */
exports.require_plugin('base_plugins');
{{plugin_inject_point}}

/*End Of Plugins */


/**
 * New App Generator
 * -----------------
 * Generates skeleton files needed to create a new application
 */

'use strict';

require('colors');
var os = require('os');
var fs = require('fs'),
path = require('path'),
log = console.log,
dir_mode = '0755',
spawn = require('child_process').spawn,
// Private
success = function (name, alternative) {
	return log(' ✓'.green, name, (alternative || '').grey);
},

// TODO - investigate whether this would be better
// using the async version of fs.mkdir - PJENSEN
checkRootDirectory = function (name) {

	if (!fs.existsSync(name))
		return true;

	log('Sorry the \'' + name + '\' directory already exists. Please choose another name for your app.');
	return false;

};

var fse = require('fs-extra');

var generatorss = require('socketstream/lib/cli/generate');

exports.generate = function (program) {
	var source = path.join(__dirname, '../../'); //new_project
	var target = program.args[1];
    var runmode = 'dev';
    if (program.args[2]) runmode = program.args[2];
	var cp = function (name) {
		fse.copySync(path.join(source, name), path.join(target, name));
	}
	if (checkRootDirectory(target)) {

		//uses socket stream's generate for a empty project
		log("SQL-MVC will call socketstream's new function now ...");
		program.minimal = true;
		generatorss.generate(program);
		//some of above files are copied async,and there is no call back, so they may overwrite our files, so we first wait .....
		log("SQL-MVC will add its base functions now ...");
		setTimeout(function () {

			//copy basic files
            cp('README.md');
            cp('doc');
			cp('client');
			cp('server/database');
			cp('server/IDE');
			cp('server/rpc');
            cp('server/lib');
            cp('lib/query-proc');
			cp('Quale');
			cp('app.js');

			//  add package dependencies
			var pack = JSON.parse(fs.readFileSync(path.join(target, 'package.json')).toString());
			log("package to ", pack.dependencies);
			pack.dependencies["node-firebird"] = "0.1.4";
            pack.dependencies["busboy"] = "^0.2.9";
            pack.dependencies["deepcopy"] = "^0.4.0";
            pack.dependencies["fs-extra"] = "^0.16.3";
            pack.dependencies["mime-types"] = "^2.0.8";
            pack.dependencies["node-uuid"] = "^1.4.2";
            pack.dependencies["node.extend"] = "^1.1.3";
            pack.dependencies["temp"] = "^0.8.1";
            pack.dependencies["hogan"] = "^1.0.2";            

			if (!pack.scripts)
				pack.scripts = {};
			pack.scripts["install"] = "sql-mvc patch";

			fse.outputJSONSync(path.join(target, 'package.json'), pack);

			//  add package dependencies
			var conf = JSON.parse(fs.readFileSync(path.join(target, 'Quale/Config/config.json')).toString());
            conf.run_mode=runmode;
			fse.outputJSONSync(path.join(target, 'Quale/Config/config.json'), conf);            
            
			// add short cut to compiler
			fse.outputFileSync(path.join(target, 'check.sh'), path.resolve(__dirname, '../../server/compiler/check.sh'));
            fs.chmodSync(path.join(target, 'check.sh'), '755');
            //fse.outputFileSync(path.join(target, 'check.sh'), path.resolve(__dirname, '../../check.sh'));

			fse.outputFileSync(path.join(target, 'sql-mvc'), "#!/usr/bin/env bash\n" + path.resolve(__dirname, '../../bin/sql-mvc') + ' "$@"\n');
			fs.chmodSync(path.join(target, 'sql-mvc'), '755');

			log("SQL-MVC is done ...");
			log("Edit your database config in Quale/Config/config.json");
			log("Install the app with : \n    cd " + target + "\n    [sudo] npm install\n    ./sql-mvc patch");
			log("Run the app with : \n    node app.js");

		}, 3000)

	}

}

var patch = function (to, target, program) {
	var source = path.join(__dirname, '../../install/Patches');
	var zxPatch = function (folder, module, filename) {
		var src = path.join(source, module, 'new_' + filename);
		if (!fs.existsSync(src)) {
			log("patch not found");
			return;
		}
		var tar = path.join(target, folder, filename);
		if (!fs.existsSync(tar)) {
			log("patch target folder not found - ensure npm install completed on your project - \n    ", tar);
			return;
		}
		log("patching ", src, ' to ', tar);
		fse.copySync(src, tar);
	}

	zxPatch('node_modules/ss-hogan/node_modules/hogan.js/lib', 'ss-hogan', 'compiler.js');
	zxPatch('node_modules/ss-hogan', 'ss-hogan', 'client.js');
	zxPatch('node_modules/ss-hogan', 'ss-hogan', 'engine.js');
	if (to === 'host') {
		zxPatch('node_modules/marked/lib', 'marked', 'marked.js');
		zxPatch('node_modules/emoji/lib', 'emoji', 'emoji.js');
	}
}

var udffn = '/usr/lib/firebird/2.5/UDF/q_UDFLibC2.so';

var make_udf = function (tar, program, callback) {

	if (fs.existsSync(udffn)) {
		log("udf installed already: ");
		callback();
		return;
	}

	var target = path.resolve(__dirname, '../../');

	log("\n\n\nmake udf...", path.resolve(__dirname, '../../server/udf'));

	var command = spawn('make', ['clean'], {
			cwd : path.resolve(target, 'server/udf')
		});
	command.stdout.on('data', function (chunk) {
		log("make clean: ", String(chunk));

	});

	command.on('close', function (code) {
		var command2 = spawn('make', ['all'], {
				cwd : path.resolve(target, 'server/udf')
			});
		command2.stdout.on('data', function (chunk) {
			log("make all: ", String(chunk));
		});

		command2.on('close', function (code) {
			if (!fs.existsSync(udffn)) {
				log("Install could not install the udf, attempting with sudo ...".red);

				var command3 = spawn('make', ['sudo'], {
						cwd : path.resolve(target, 'server/udf')
					});
				command3.stdout.on('data', function (chunk) {
					log("make sudo: ", String(chunk));
				});

				command3.on('close', function (code) {
					if (!fs.existsSync(udffn)) {                    
                        log("Install could not copy the udf, you may need to do :".red);
						log("   [sudo] sql-mvc udf\n   or manually with:\n        [sudo] cp " + path.join(target, 'server/udf/q_UDFLibC') + " " + udffn);
                        callback(false);
					} else {
						callback(true);
						log("Installing the udf succeeded!");
					}
				});


			} else {
				callback(true);
				log("Installing the udf succeeded!");
			}

		});

	});

}

exports.patch = function (program) {
	var target = path.resolve('./');
	log("patching target", target);
	patch('app', target, program);
	//make_udf(target, program, function (code) {
		log("now you can do\n    node app.js\n");
	//});

}


exports.patchhost = function (program) {
	var target = path.resolve(__dirname, '../../');
	log("patching target", target);
	patch('host', target, program);
	fs.chmodSync(path.join(target, 'server/compiler/check.sh'), '755');

	//make_udf(target, program, function (code) {
	//	log("now you can do\n    sql-mvc new demo-app\ncd demo-app\nnpm install\nnode app.js\n");
	//});
    var postscript='install/install_script.sh';
    if (os.platform().substring(0, 3)!=='win') {    
        fs.chmodSync(path.join(target,postscript), '755');
        //var command = 
        log("When / if prompted for [more] or password press enter");
        
        var exec = require('child_process').exec, child;

        child = exec(postscript,
          function (error, stdout, stderr) {
            if (error !== null) {
              console.log('exec error: ' + error);
            }
        });
      

    }    
}
exports.post_script = function (program) {
	var target = path.resolve(__dirname, '../../');
	log("post_script target", target);
    var postscript='install/post_script.sh';
    if (os.platform().substring(0, 3)!=='win') {    
        fs.chmodSync(path.join(target,postscript), '755');        
        //var exec = require('child_process').exec;
        var ls    = spawn(postscript, []);

        ls.stdout.on('data', function (data) {
          console.log('stdout: ' + data);
        });

        ls.stderr.on('data', function (data) {
          console.log('stderr: ' + data);
        });

        ls.on('close', function (code) {
          console.log('child process exited with code ' + code);
        });
    }    
}

exports.forever = function (program) {
	var target = path.resolve(program.args[1]);

	var params = ['-o', path.join(target, 'output/4eva_out.log'),
		'-e', path.join(target, 'output/4eva_err.log'),
		'--workingDir', target, 'start',
		'-c', '/usr/local/bin/node', path.join(target, 'app.js')];
	log("\nspawn forever ", params, '\n');
	var child = spawn('/usr/local/bin/forever', params, {
			detached : true,
			stdio : ['ignore', 'ignore', 'ignore']
		});
	child.unref();

}
exports.check = function (program) {

}

exports.udf = function (program) {
	var target = path.resolve(__dirname, '../../');
	make_udf(target, program, function (code) {
		log("then you can do\n    sql-mvc new demo-app\n    cd demo-app\n    npm install\n    node app.js\n");
	});

}

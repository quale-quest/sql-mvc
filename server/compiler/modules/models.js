"use strict";
/*
speed/memory performance  is not important
ease of use is important
 */

exports.module_name = 'models.js';
exports.tags = [{
		name : "controller"
	}, {
		name : "controllerdone"
	}, {
		name : "use"
	}, {
		name : "model"
	}, {
		name : "modeldone"
	}, {
		name : "model_show",
		man_page : "Will list all available models and controllers and print details of one named as the first paramanter into the web page."
	}, {
		name : "debug",
		man_page : "Will enable additional console output for platform debugging."
	}, {
		name : "compoundstatementdone",
		man_page : "Internal use - Reserved."
	}

];

var deepcopy = require('deepcopy');
var extend = require('node.extend');
var fs = require('fs');

exports.tag_model = function (zx, line_obj) {
	//console.log('tag_controller:',line_obj);
	if (line_obj.save !== undefined)
		return; //not interested in model save blocks
	if (line_obj.q === undefined)
		return;
	if (line_obj.q.query === undefined)
		return;
	if (zx.gets(line_obj.q.query) === '')
		return;
	if (zx.pass == 1) {
		//console.log('remove leading lines  B :', line_obj.body.substring(0,20));
		//var query=line_obj.q.query.trim();
		//console.log('tag_model:',query,line_obj );
		var query = line_obj.body; //.trim();
		zx.db_update.Prepare_DDL(zx, null, query, line_obj)

		//       console.log('tag_model:',query);//,line_obj );
		// console.log('tag_model quale:',line_obj.q.quale_context,zx.q.contexts[line_obj.q.quale_context]  );
		//       var result=zx.db_update.model();
	}

	//console.log('tag_model:',line_obj.nonkeyd );
	//this must execute the actual ddl commands (using the db tool
};
exports.tag_controller = function (zx, line_obj) {
	//console.log('tag_controller:',line_obj );
	//return exports.tag_model(zx, line_obj);
}

exports.done_pass = function (zx, line_obj) {
	if (zx.pass === 1) {
		//console.log(' model db_update.update:');
        //console.log('Prepareing DDL:');
		zx.dbg.AutoMaticDLL(zx, line_obj);
        //console.log('Executing DDL:');
		zx.db_update.update(zx);
        //console.log('Done DDL:');
		//console.log(' model db_update.update done:');
	}
};

exports.tag_controllerdone = exports.tag_modeldone = function (zx, line_obj) {
	//console.log('tag_modeldone:',line_obj.nonkeyd );
};

exports.tag_use = function (zx, line_obj) { //blank use in model inheritance
};

exports.tag_CompoundStatementDone = function (zx, line_obj) {
	//console.log('tag_modeldone:',line_obj.nonkeyd );
};

exports.tag_debug = function (zx, line_obj) {
	//console.log('tag_debug:',zx.debug_options );
};

//model code interpreted here in pass 0
exports.tag_pass0_use = function (zx, line_obj) {

	if (line_obj.array)
		line_obj.use = line_obj.array[0]; //one positional arg

	line_obj.nonkeyd = '';
	if (line_obj.testing)
		console.log('tag_pass0_use :', line_obj); //process.exit(2);
};
exports.tag_pass0_model = function (zx, line_obj) {
	line_obj.ignore = true;
};
exports.tag_pass0_controller = function (zx, line_obj) {
	if (line_obj.save !== undefined)
		zx.saving_models = zx.gets(line_obj.save);
	else {
		if (line_obj.array !== undefined)
			zx.saving_models = zx.gets(line_obj.array[0]);
	}
	//i now wan this as the first quert line_obj.ignore=true;
};
exports.tag_pass0_controllerdone = exports.tag_pass0_modeldone = function (zx, line_obj) {
	zx.saving_models = '';

	//console.trace('tag_pass0_modeldone :', line_obj); process.exit(2);
};

exports.tag_compoundstatementdone = function (zx, line_obj) { //blank use in model inheritance
};

exports.tag_pass0_compoundstatementdone = exports.tag_pass0_modeldone = function (zx, line_obj) {
	zx.saving_models = '';
	//console.log('tag_pass0_compoundstatementdone :', line_obj);// process.exit(2);
};


var controller_subsitiution = function (zx, obj, str) {
    if (!str) return str;
    
    var maxcount=100;
	var matched = str.match(/controller\.([\w\.]+)/);
    if (!matched) return str;
	
	while (matched&&maxcount-->0) {
        var val='';
        //console.log('controller_subsitiution matched:', matched);
        var models = zx.model_defines[matched[1]];
        if (models)
            models.forEach(function (model) {
                if (model.body) {
                    val = val + model.body.trim()
                    //console.log('embedded controller models.forEach:', model.body.trim());                
                }    
        });
        
        var len=('controller.').length + matched[1].length;
        //console.log('use controller matched:', matched);
		//console.log('use controller matched index :', matched.index,matched[1],val);
        str=str.substring(0,matched.index) + val + str.substring(matched.index+len) 
        //console.log('use controller substituted :', matched.index,matched[1],val);
        matched = str.match(/controller\.([\w\.]+)/);
	}
   
    
    return str;
    //process.exit(2);

}


exports.process_pass0 = function (zx, par) {
	var name,
	line_obj = par.line_obj;
	if (line_obj.ignore)
		return;

    line_obj.nonkeyd = controller_subsitiution(zx, line_obj, line_obj.nonkeyd);
    line_obj.body = controller_subsitiution(zx, line_obj, line_obj.body);
	if (line_obj.q)
		line_obj.q.query = controller_subsitiution(zx, line_obj, line_obj.q.query);
	
    
	//this here is used more for controllers, saving/using buttons and others as model/contoller items
	if ((line_obj.save !== undefined) || zx.saving_models !== '') {
		//store this model
		line_obj.part_of_model = line_obj.save || zx.saving_models;
		name = zx.saving_models;
		if (name === '')
			name = zx.gets(line_obj.save);
		//console.log(' models process_pass0 :', name, zx.show_longstring(JSON.stringify(line_obj)));
		if (zx.model_defines[name] === undefined)
			zx.model_defines[name] = [];
		zx.model_defines[name].push(line_obj);
		//console.log('store model in :', name,zx.show_longstring(JSON.stringify(line_obj)));


	} else {
		//par.blocks.push(line_obj);
	}
}

var local_subsitiution = function (zx, obj, str) {
    if (!str) return str;
    var maxcount=100;
	var matched = str.match(/parameter\.(\w+)/);
    if (!matched) return str;
	
	while (matched&&maxcount-->0) {
        var val=obj[matched[1]]||'';
        var len=('parameter.').length + matched[1].length;
        //console.log('use controller matched:', matched);
		//console.log('use controller matched index :', matched.index,matched[1],val);
        str=str.substring(0,matched.index) + val + str.substring(matched.index+len) 
        //console.log('use controller substituted :', matched.index,matched[1],val);
        matched = str.match(/parameter\.(\w+)/);
	}
    //console.log('use controller substituted complete :', str);
    return str;
    //process.exit(2);

}

exports.process_pass01 = function (zx, par) {
	var name,
	blocks = [],
	line_obj = par.line_obj;
	//console.log(' process_pass01 :', par.line_obj.tag, ' use:',par.line_obj.use,' part of:',line_obj.part_of_model);
	if ((line_obj.use !== undefined)&&(line_obj.part_of_model===undefined)) //combine the stored module with the new values
	{
		if (line_obj.testing)
			console.log('process_pass01 use:', line_obj);

		name = zx.gets(line_obj.use);
		var models = zx.model_defines[name];
		//console.log('use models in :', name, Object.keys(zx.model_defines),' sm:',zx.saving_models);
		if (models !== undefined) {
			var linecopy = deepcopy(line_obj);
			delete linecopy.use;
			//console.log('use models in linecopy:', name, linecopy);
			delete linecopy.tag;
			delete linecopy.nonkeyd;
			delete linecopy.q;
			models.forEach(function (model) {
				var modelcopy = deepcopy(model);
				delete modelcopy.srcinfo;

				if (modelcopy.tag === "controller") {
					linecopy = extend(modelcopy, linecopy); //second one has the priority
					delete linecopy.tag;
					delete linecopy.nonkeyd;
					delete linecopy.q;
				} else {

					if (line_obj.testing)
					    console.log('process_pass01 each:', modelcopy);

					var lineextn = extend(modelcopy, linecopy); //second one has the priority

					if (line_obj.testing && line_obj.q.query)
						console.log('-------------------------------\nuse model in each :', name, lineextn.q.query);

					lineextn.srcinfo.file_stack.push({
						filename : model.filename,
						start_line : model.start_line
					});

					if (lineextn.save)
						delete lineextn.save;
					if (lineextn.part_of_model) {
						lineextn.part_of_model_used = lineextn.part_of_model;
						delete lineextn.part_of_model;
					}

					lineextn.body = local_subsitiution(zx, lineextn, lineextn.body);
					if (lineextn.q)
						lineextn.q.query = local_subsitiution(zx, lineextn, lineextn.q.query);
					lineextn.nonkeyd = local_subsitiution(zx, lineextn, lineextn.nonkeyd);
                    //console.log('-------------------------------\nblocks.push(lineextn) :', lineextn.nonkeyd);

					blocks.push(lineextn);
				}

			});
			if (blocks.length > 0) {

				//console.log('use model insertArrayAt :',par.indx, par.line_objects.length,blocks.length);
				//
				//if (name==='allbutton') fs.writeFileSync('output/debug1.json', JSON.stringify(zx.line_objects, null, 4));
				//console.log('use model insert  :',par.indx, blocks);
				zx.insertArrayAt(zx.line_objects, par.indx + 1, blocks);
				//var rem =
				zx.line_objects.splice(par.indx, 1); //remove the current use statement
				//console.log('use model removed  :',par.indx, rem);
				//console.log('use model insertArrayAt :',par.indx, par.line_objects);
				//if (name==='allbutton')fs.writeFileSync('output/debug2.json', JSON.stringify(zx.line_objects, null, 4));

				//console.log('use model done insertArrayAt :',par.indx, par.line_objects.length);
			}
		}
		//process.exit(2);
	}

};

exports.tag_model_show = function (zx, line_obj) {
	var html,
	contrl;
	html = Object.keys(zx.model_defines)
		if (line_obj.array)
			contrl = line_obj.array[0];

		if (contrl) {
			html += JSON.stringify(zx.model_defines[contrl], null, 4);
		}

		zx.mt.lines.push("<pre>" + html + "</pre>");
};

exports.start_page = function (zx) {
	zx.model_defines = {};
	zx.saving_models = '';
}

exports.start_up = function (zx) {
	zx.model_defines = {};
	zx.saving_models = '';
};

//===========================================================

"use strict";
/*
speed/memory performance  is not important
ease of use is important
 */

exports.module_name = 'models.js';
exports.tags=[{name:"controller"},{name:"controllerdone"},
{name:"use"},{name:"model"},{name:"modeldone"}];

var deepcopy = require('deepcopy');
var extend = require('node.extend');
var fs = require('fs');

exports.tag_controller = exports.tag_model = function (zx, line_obj) {
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

exports.done_pass = function (zx, line_obj) {
	if (zx.pass === 1) {
		//console.log(' model db_update.update:');
		zx.db_update.update(zx);
		//console.log(' model db_update.update done:');
	}
};

exports.tag_controllerdone = exports.tag_modeldone = function (zx, line_obj) {
	//console.log('tag_modeldone:',line_obj.nonkeyd );
};

exports.tag_use = function (zx, line_obj) { //blank use in model inheritance
};

//model code interpreted here in pass 0
exports.tag_pass0_use = function (zx, line_obj) {

	line_obj.use = zx.gets(line_obj.nonkeyd);
	line_obj.nonkeyd = '';
	//console.log('tag_pass0_use :', line_obj)
};
exports.tag_pass0_controller = exports.tag_pass0_model = function (zx, line_obj) {

	if (line_obj.save !== undefined)
		zx.saving_models = zx.gets(line_obj.save);
	//console.log('tag_pass0_model :', line_obj)
};
exports.tag_pass0_controllerdone = exports.tag_pass0_modeldone = function (zx, line_obj) {
	zx.saving_models = '';

	//console.log('tag_pass0_modeldone :', line_obj)
};

exports.process_pass0 = function (zx, par) {
	var name,
	line_obj = par.line_obj;

	//this here is used more for controllers, saving/using buttons and others as model/contoller items
	if ((line_obj.save !== undefined) || zx.saving_models !== '') {
		//store this model
        line_obj.part_of_model =line_obj.save|| zx.saving_models;
		name = zx.saving_models;
		if (name === '')
			name = zx.gets(line_obj.save);
		//console.log(' models process_pass0 :', name, zx.show_longstring(JSON.stringify(line_obj)));
		if (zx.model_defines[name] === undefined)
			zx.model_defines[name] = [];
		zx.model_defines[name].push(line_obj);
		//console.log('store model in :', name);//, line_obj);


	} else {		
			//par.blocks.push(line_obj);
	}
}

exports.process_pass01 = function (zx, par) {
	var name,
	blocks = [],
	line_obj = par.line_obj;
    //console.log(' process_pass01 :', par.line_obj.use);
	if (line_obj.use !== undefined) //combine the stored module with the new values
	{
		name = zx.gets(line_obj.use);
		var models = zx.model_defines[name];
		//console.log('use models in :', name, Object.keys(zx.model_defines));
		if (models !== undefined) {
			var linecopy = deepcopy(line_obj);
			delete linecopy.use;
			//console.log('use models in :', name, linecopy);
			delete linecopy.tag;
			delete linecopy.nonkeyd;
			delete linecopy.q;
			models.forEach(function (model) {
				var modelcopy = deepcopy(model);
				delete modelcopy.srcinfo;

				var lineextn = extend(modelcopy, linecopy); //second one has the priority
				//if (lineextn.tag === 'table')
				//console.log('use model in each :', name, lineextn);
				lineextn.srcinfo.file_stack.push({
					filename : model.filename,
					start_line : model.start_line
				});
                delete lineextn.use;
                if (lineextn.save) delete lineextn.save;
                if (lineextn.part_of_model) {
                lineextn.part_of_model_used = lineextn.part_of_model;
                delete lineextn.part_of_model;
                }
                
				blocks.push(lineextn);

			});
			if (blocks.length > 0) {
                
                //console.log('use model insertArrayAt :',par.indx, par.line_objects.length,blocks.length);
                //
                //if (name==='allbutton') fs.writeFileSync('output/debug1.json', JSON.stringify(zx.line_objects, null, 4));
                //console.log('use model insert  :',par.indx, blocks);    
				zx.insertArrayAt(zx.line_objects, par.indx+1, blocks);
                //var rem = 
                zx.line_objects.splice(par.indx, 1);                
                //console.log('use model removed  :',par.indx, rem);    
                //console.log('use model insertArrayAt :',par.indx, par.line_objects);
                //if (name==='allbutton')fs.writeFileSync('output/debug2.json', JSON.stringify(zx.line_objects, null, 4));
                
                //console.log('use model done insertArrayAt :',par.indx, par.line_objects.length);
			}
		}

	}

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

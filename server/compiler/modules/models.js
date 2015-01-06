"use strict";
/*
speed/memory performance  is not important
ease of use is important
 */

/*



 */
exports.module_name='models.js';
 
exports.tag_model = function (/*zx, line_obj*/
) {

	//if (zx.pass==1)  console.log('tag_model:',line_obj );
	//console.log('tag_model:',line_obj.nonkeyd );
	//this must execute the actaul ddl commands (using the db tool
};

exports.tag_modeldone = function (zx, line_obj) {
   //console.log('tag_modeldone:',line_obj.nonkeyd );
}

exports.start_up = function (zx) {


	zx.model_defines = {};
    zx.saving_models='';
};

//===========================================================

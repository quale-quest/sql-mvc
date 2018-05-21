"use strict";
/*
speed/memory performance  is not important
ease of use is important
 */
/*
Purpose is handle flow control separate from database engine, so db engine is easier to port

 */

/*
strategy dealing with conditionals

conditional is evaluated to single if statement
if there is a "block tag" a additional opening begin is placed
each tag gets wrapped in a begin/end
on elseblock	we do  end else begin statements
on unblock	we do a end statement

The block "names" are  pushed on a stack in the compiler
named  elseblock and unblock the name is only used as a warning(or error) that the blocking is misaligned


for each blockif and elseblock a mt variable is emitted to sync the data between mt and db

 */

/*
strategy dealing with conditionals
flow control is done in flowcontrol.js based on this pattern
cond=true;
if (cond) cond=.....
if (cond) cond=.....
output (key<=cond)
if (cond)
begin
end
else
begin
end

any db language code can ge generated as long as it follows this flow pattern
the else part is optional

it does not matter what the db is  as long as it can produce the
fullstach json format


 */

exports.module_name='flow_control.js';
exports.tags=[
{name:"ifblock",dontparseparam:true,man_page:"Alias for ifquery."},
{name:"ifquery",dontparseparam:true,man_page:"a conditional execution against the database wrap the SQL in ()."},
{name:"elseblock",man_page:"Alias for elsequery."},
{name:"elsequery",man_page:"Every ifquery may have one optional elsequery."},
{name:"unblock",man_page:"Alias for endquery."},
{name:"endquery",man_page:"Every ifquery must have one endquery to signify the end of the conditional."},
{name:"include",man_page:"Include a quicc file from the inheritance tree."},
{name:"logout",man_page:"Logout the current session."},
{name:"dialect",man_page:"Compiler directive for specifying code for specific SQL engines."},
{name:"sqlcomment",man_page:"emit a comment into sql target."}

];
 
 var debug=false;
var append_conditional = function (a, b, pre, post) {
	b.forEach(function (entry) {
		a.push({
			pre : pre,
			cond : entry,
			post : post
		});
	});
};

exports.is_conditional = function (zx, o) {

	//common conditional keys - they have to be all true else the operation is skipped

	//if (zx.pass==1)
	//only build the consolidated conditionals on the first pass ...?
	if (o.and_if === undefined)
		o.and_if = [];

	if (o.when !== undefined) { //make the database query and add it to if exists list
		append_conditional(o.and_if, zx.getA(o.when),
			'not '+zx.conf.db.var_global_get+'run_procedure=\'',
			'\'');
	}

    var keyqry =   
            "select " + zx.config.db.sql_First1+" "+zx.conf.db.platform_user_table.user_pk_field+" from "+
             zx.conf.db.platform_user_table.user_table_name + " where "+
             zx.conf.db.platform_user_table.user_pk_field+"="+ zx.config.db.var_actaul+ "operator$ref and  "+
             zx.conf.db.platform_user_table.user_keys_field + " containing '"+zx.config.db.sql_Limit1+'"';
             
	if (o.key !== undefined) { //make the database query and add it to if exists list
		append_conditional(o.and_if, zx.getA(o.key),"not exists ("+keyqry,"')");
	}
	if (o.notkey !== undefined) { //make the database query and add it to if(not) exists list
        append_conditional(o.and_if, zx.getA(o.notkey),"exists ("+keyqry,"')");
	}
	if (o.ifkey !== undefined) { //make the database query and add it to if exists list
    
    //console.log('ifkey conditionals is :',keyqry,zx.getA(o.ifkey));
        append_conditional(o.and_if, zx.getA(o.ifkey),"not exists ("+keyqry,"')");
	}
	if (o.ifnotkey !== undefined) { //make the database query and add it to if(not) exists list
        append_conditional(o.and_if, zx.getA(o.ifnotkey),"exists ("+keyqry,"')");
	}

	if (o.ifempty !== undefined) { //make the database query and add it to if(not) exists list
		append_conditional(o.and_if, zx.getA(o.ifempty), ' ', '==\'\''); //this is correct - negative test
	}
	if (o.ifnotempty !== undefined) { //make the database query and add it to if(not) exists list
		append_conditional(o.and_if, zx.getA(o.ifnotempty), ' ', '!=\'\''); //this is correct - negative test
	}
	if (o.ifblank !== undefined) { //make the database query and add it to if(not) exists list
		append_conditional(o.and_if, zx.getA(o.ifblank), ' ', '==\'\''); //this is correct - negative test
	}
	if (o.ifnotblank !== undefined) { //make the database query and add it to if(not) exists list
		append_conditional(o.and_if, zx.getA(o.ifnotblank), '', '!=\'\''); //this is correct - negative test
	}
	if (o.ifnumber !== undefined) { //make the database query and add it to if(not) exists list
		append_conditional(o.and_if, zx.getA(o.ifnumber),
			' (', ' similar to \'[[:DIGIT:]]*\')'); //this is correct -already  negative test
	}
	if (o.ifnotnumber !== undefined) { //make the database query and add it to if(not) exists list
		append_conditional(o.and_if, zx.getA(o.ifnotnumber),
			'not (', ' similar to \'[[:DIGIT:]]*\')'); //this is correct - already negative test
	}

	if (o.ifrandom !== undefined) { //make the database query and add it to if(not) exists list
		//random=100  means at random 1 in 100 will execute
		append_conditional(o.and_if, zx.getA(o.ifrandom),
			'(select cast (rand()* ', 'as integer) from RDB$DATABASE)!=1'); //this is correct - negative test
	}

	if (o.ifexists !== undefined) { //make the database query and add it to if(not) exists list
		//console.warn('Flowcontrol ifexists :' );
		append_conditional(o.and_if, zx.getA(o.ifexists), ' not exists '); //this is correct - negative test
	}
	if (o.ifnotexists !== undefined) { //make the database query and add it to if(not) exists list
		append_conditional(o.and_if, zx.getA(o.ifnotexists), ' exists '); //this is correct - negative test
		//delete o.ifnotexists;
	}
	if (o["if"] !== undefined) { //make the database query and add it to if(not) exists list
		append_conditional(o.and_if, zx.getA(o["if"]), ' not '); //this is correct - negative test
	}

	if (o.and_if.length === 0) { //no conditions
		return false; //no conditions
	}

	return true; //conditions exist
};

exports.checkForEmbeddedIf = function (zx, line_obj) {

	//database
	// if (line_obj.tag=='table')
	//   console.log('checkForEmbeddedIf is :',line_obj);

    if ((line_obj.tag=='ifblock')||(line_obj.tag=='ifquery')) {
	   //console.log('checkForEmbeddedIf ifblock  :');
       return;
    }
	if (!exports.is_conditional(zx, line_obj)) { //no conditions
		//unconditional block - this does not have a end label

		exports.beginblock(zx, line_obj);
		return;
	}

	exports.eval_start(zx, line_obj);
	if (line_obj.and_if.length > 0) {
		//produce the db script code to resolve the query
		exports.eval_cond(zx, line_obj, line_obj.and_if);
	}

	exports.EmitCondition(zx, line_obj);
};

exports.eval_start = function (zx, line_obj) {
	//this initiates an evaluation sequince
	return zx.dbg.eval_start(zx, line_obj);
};

exports.eval_cond = function (zx, line_obj, conditionals) {
	//This is a AND (conditions)
	return zx.dbg.eval_cond(zx, line_obj, conditionals);
};

exports.EmitCondition = function (zx, line_obj) {
	//compiles conditional db script
	//this is conditional so we need to emit a value to moustache also
	var local_immediate_block_id  = "";
	if (line_obj.Block === undefined) { //not a goto block
		zx.vid++;
		local_immediate_block_id  = "F" + zx.vid;
		zx.fc.immediate_block_id  = local_immediate_block_id ;
        if (debug) console.log('zx.fc.immediate_block_id  = immediate_block_id 195852 : ',local_immediate_block_id );
	} else { //goto block
		local_immediate_block_id  = line_obj.Block;
		zx.fc.blockactive[local_immediate_block_id ] = true;
	}

	zx.mt.lines.push("{{#" + local_immediate_block_id  + "}}");
	zx.dbg.EmitConditionAndBegin(zx, line_obj,local_immediate_block_id,'123:'+ local_immediate_block_id+" : " + line_obj.tag );

	return line_obj;
};

exports.beginblock = function (zx, line_obj) {
	//compiles sql   if there is no goto this wont begin a real block
	if (line_obj.Block !== undefined) {
		zx.dbg.EmitUnconditionalBegin(zx, line_obj,'125:'+ " : " + line_obj.tag );
	}

	return line_obj;
};

exports.tag_sqlcomment = function (zx, o) {
	console.log('+++++++++++++++++++++++++++++++++++++++++');
	console.log(o.nonkeyd.trim());
	
	zx.dbg.emit_comment(zx,'+++++++++++++++++++++++++++++++++++++++++');	
    zx.dbg.emit_comment(zx,o.nonkeyd.trim());	
}

exports.tag_ifquery = exports.tag_ifblock = function (zx, o) {
	//unnamed blocks, and named blocks
	// no real code most the work is done by the common conditional tags
    //console.log('tag_ifblock: ',o.nonkeyd);
    //debug=true;
    //if (debug) console.log('tag_ifblock: ',o.Block,'...',o);
    
    o.nonkeyd = o.nonkeyd.trim();
    //console.log('tag_ifblock nonkeyd: ',o.nonkeyd);    
    if ((o.nonkeyd)&&(o.nonkeyd!=''))
	    append_conditional(o.and_if, ["("+o.nonkeyd+")"], ' not '); //this is correct - negative test
    
    exports.eval_start(zx, zx.line_obj);
	if (zx.line_obj.and_if.length > 0) {
		//produce the db script code to resolve the query
		exports.eval_cond(zx, zx.line_obj, zx.line_obj.and_if);
	}
    else {
        console.log('tag_ifquery: has no conditionals !!!! ');
    }

	exports.EmitCondition(zx, zx.line_obj);        
     
    zx.fc.block_stack.push(zx.fc.immediate_block_id);
    zx.fc.blockactive[zx.fc.immediate_block_id ] = true;
    //console.log('tag_ifquery: block_stack  ', zx.fc.block_stack);
    delete zx.fc.immediate_block_id;
	
};

exports.elseblock = function (zx, line_obj) {
    var local_immediate_block_id = zx.fc.immediate_block_id;
    if (local_immediate_block_id===undefined)
        local_immediate_block_id = zx.fc.block_stack[zx.fc.block_stack.length-1];  
	
	//zx.dbg.emitAppendComment(zx,"elseblock : "+zx.dbg.LengthOf_sql_stack_unwind_location(zx)+ " typ:" + zx.dbg.TypeOf_sql_stack_unwind_location(zx));
	
	zx.mt.lines.push("{{/" + local_immediate_block_id  + "}}");
	zx.dbg.elseblock(zx, line_obj);
	zx.mt.lines.push("{{^" + local_immediate_block_id  + "}}");
	return line_obj;
};

exports.implicid_unblock = function (zx, line_obj) {
    
	if (zx.fc.immediate_block_id  !== undefined) { //immediate blocks can only last 1 instruction
        //zx.dbg.emitAppendComment(zx,"implicid_unblock : "+zx.fc.immediate_block_id+" : " + line_obj.tag);
		zx.dbg.unblock(zx, line_obj,"imp "+line_obj.tag,"");

		zx.mt.lines.push("{{/" + zx.fc.immediate_block_id  + "}}");
		delete zx.fc.immediate_block_id ;
		return true;
	}

	return false;
};


exports.explicid_unblock = function (zx, line_obj,mysqlendif) {
    //zx.dbg.emitAppendComment(zx,"explicid_unblock : "+zx.fc.block_stack.length+" : " + line_obj.tag);
    //console.log('explicid_unblock: block_stack  ', line_obj.Label, zx.fc.block_stack);
	if (!exports.implicid_unblock(zx, line_obj)) {
		//zx.dbg.emitAppendComment(zx,"explicid_unblock a: "+zx.dbg.LengthOf_sql_stack_unwind_location(zx)+ zx.dbg.TypeOf_sql_stack_unwind_location(zx));
		var local_immediate_block_id  = line_obj.Label;
        if (line_obj.Label===undefined){
            local_immediate_block_id = zx.fc.block_stack.pop();
            if (local_immediate_block_id===undefined)
                console.trace('could not unblock: ');
        }
        
		//console.trace('unblock: ',local_immediate_block_id ,zx.fc.blockactive,zx.fc.blockactive[local_immediate_block_id ]);
		zx.dbg.unblock(zx, line_obj,"expl "+line_obj.tag + " : " + local_immediate_block_id,mysqlendif);
		if (zx.fc.blockactive[local_immediate_block_id ] !== undefined) {
			zx.mt.lines.push("{{/" + local_immediate_block_id  + "}}");
		}

	} else {
		zx.dbg.emitAppendComment(zx,"explicid_unblock b: "+zx.dbg.LengthOf_sql_stack_unwind_location(zx)+ zx.dbg.TypeOf_sql_stack_unwind_location(zx));
	}
	return line_obj;
};

exports.tag_elsequery = exports.tag_elseblock = function (zx, o) {

	//if (active_pass!=zx.pass) return;
	exports.elseblock(zx, o);
};

exports.tag_endquery = exports.tag_unblock = function (zx, o) {
	//if (active_pass!=zx.pass) return;
	//console.log('unblock Tag ',i,o );
	exports.explicid_unblock(zx, o, "");
};

exports.tag_dialect = function (zx, o) {
}	
exports.dialect_eval = function (zx, o) {
	//if (active_pass!=zx.pass) return;
	//console.log('tag_dialect Tag ',o);
	//console.log('tag_dialect Tag ',o.array );
	var dialect_version = zx.conf.db.dialect.match(/([A-z]+)([0-9]+)/i);
	var dialect_num = parseInt(dialect_version[2]) || 0;
	
	zx.dialect_active = 1;
	if (o.array) {
		var included=0;
		var excluded=0;		
		if (o.array[0]!='all') {
			zx.dialect_active = 0;			
			o.array.forEach(function (cond) {
				//console.log('tag_dialect forEach:',cond );
				if (cond.substring(0,1)=="!") {
					if (zx.conf.db.dialect.match(cond.substring(1))) zx.dialect_active = 0;
				} else {
					var gt=(cond.substring(0,1)==">");
					var lt=(cond.substring(0,1)=="<");
					if (gt||lt) {
						cond = cond.substring(1);
						var versions = cond.match(/([A-z]+)([0-9]+)/i);
						//console.log('tag_dialect match ',cond,versions.length,versions );
						if (versions.length>2) {
							if (zx.conf.db.dialect.match(versions[1])) { //dialect name
								var num = parseInt(versions[2]) || 0;
								if ( (gt&&(num<dialect_num)) || (lt&&(num>dialect_num)) ) {
								    zx.dialect_active = 1;	
								}
								//console.log('tag_dialect length ',zx.dialect_active,cond,'\r\n num,dialect:',num,dialect_num,'\r\ntesting version:', versions ,'\r\ndialect_version:',dialect_version);
							}
						}
					} else {
						if (zx.conf.db.dialect.match(cond)) zx.dialect_active = 1;
					}
				}	
			});
		}
	}
	//console.log('tag_dialect final:',zx.dialect_active );
	//process.exit(2);
};

exports.tag_logout = function (zx, line_obj) {
    return zx.dbg.emit_log_out(zx, line_obj);
};

exports.tag_include = function (/*zx, o*/
) {};



exports.start_item = function (zx, line_obj) {
	//if (active_pass!=zx.pass) return true;
	//console.warn('Flowcontrol start_item :' );
	exports.checkForEmbeddedIf(zx, line_obj);
};
exports.done_item = function (zx, line_obj) {
	//if (active_pass!=zx.pass) return true;
	exports.implicid_unblock(zx, line_obj);
};

exports.start_pass = function (zx, line_objects) {
	//if (active_pass!=zx.pass) return true;
	line_objects.forEach(function (line_obj) {
		line_obj.and_if = [];
	});
    debug=false;
	zx.fc.block_stack_unwind = [];
    zx.fc.block_stack = [];
	zx.dialect_active = 1;
};

exports.init = function (zx) {
	//each type of database generator would be different ,//including noSQL
	zx.fc = {};
	zx.fc.blockactive = {};
    
};
exports.done = function (/*zx, line_objects*/
) {};

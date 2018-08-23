"use strict";

var temp = require('temp'),
path = require('path'),
os = require('os');
var fs = require('fs');
var plugins = require('../../client/code/app/plugins.js');
var fileutils = require('../../server/lib/fileutils.js');
var deepcopy = require('deepcopy');

//var ss = require('socketstream');
var Hogan = require('ss-hogan/client.js');
var HoganC = require('ss-hogan/node_modules/hogan.js/lib/compiler.js');
var winston = require('winston');
var extend = require('node.extend');

var qq_tmpl_cache =  {};
var sst =  {};
var ht = Hogan.Template;

var update_in_widgit_template = function (filename, text) {
            var fn = path.basename(filename)
            fn = fn.substr(0, fn.lastIndexOf('.'));
            
            var codes = HoganC.compile(text,{asString: true});
            //console.log("serverside compiled codes :",fn,codes); 
            var fncall = codes.slice(0,16);
            if (fncall!=='function(c,p,i){') {
                console.log("Server side render fails unit test - unexpected function type from Hogan compile 133005:",fncall); 
                process.exit(2);
            }            
            codes = "sst['Widgets-"+fn+"']=new ht("+codes + ")";
            eval(codes); //this creates the hogan script - it does not do the rendering
    
}    

var files_ = fileutils.getFiles(path.join(__dirname,'../../client/templates/Widgets'));
//console.log("serverside render files_ :",files_);

 for (var key in files_) {
        if (files_.hasOwnProperty(key)) {         
            var text = fs.readFileSync(files_[key]).toString();
            update_in_widgit_template(files_[key],text);
        }
    }                    

//unit test compare basic template
update_in_widgit_template("ssr_unit_test.html","abc{{name}}");
//console.log("serverside compiled :",sst);    
var lcx = {name:"efg"};
var retval = sst['Widgets-ssr_unit_test' ].render(lcx);
if (retval!=='abcefg') {
    console.log("Server side render fails unit test - unexpected function type from Hogan compile 133006:",retval); 
    process.exit(2);

}

//the server side rendering is a mirror of the client side rendering
var update_in_mem_template = function (page_id,mtHash, text) {	
		//var ht = Hogan.Template; //local variable used in script eval is evaluating
		//var t = require('socketstream').tmpl; //local variable used in script eval is evaluating
        
        
		var sc = text.replace(/,sst=require\('socketstream'\)\.tmpl/,''); //local variable used in script eval is evaluating
        
        //console.log("\n\n\nupdate_in_mem_template :",page_id,sc,'\n\n\n');
		eval(sc); //this creates the hogan script - it does not do the rendering
        qq_tmpl_cache[page_id]=mtHash;
	}

var render_from_fullstash = function (cx,cont_content,cb) {	
   cb(cx,cont_content);
}

/*
PAGE_0 : contacting
PAGE_1 : login
PAGE_2 : main
PAGE_3 : debug
PAGE_4 : maintenance
*/
exports.render_inject = function (page,html_inp,html_inject,LoadedInstance,cx) { 
	//switch visible page
	if (page=='login') html_inp=html_inp.replace(/<div id="PAGE_1" class="zxPage" style="display: none;">/,'<div id="PAGE_1" class="zxPage" style="display: block;">');	
	else               html_inp=html_inp.replace(/<div id="PAGE_2" class="zxPage" style="display: none;">/,'<div id="PAGE_2" class="zxPage" style="display: block;">');	

    //html_inp=html_inp.replace(/en0_style/,'style');
	//console.log("render_inject :",cx.obj[0]);
    var inits =  '<script type="text/javascript" language="javascript">\r\n'
				+'first_page_rendered=true;\r\n'
				+'first_page_container="#maincontainer";\r\n'
				+"LoadedInstance='"+LoadedInstance+"';\r\n"
				+"qq_page_id = '"+cx.obj[0].Stash+"';\r\n"
				+"qq_cid = '"+cx.obj[0].Data.cid+"';\r\n"
				+"qq_session ='"+cx.obj[0].Session+"';\r\n"
				+'</script>\r\n';
    
    var container_start = 'id="maincontainer">';
    var cont_content = container_start+ html_inject + inits;
    //console.log("template cx.obj[0] :",cx.obj[0]);
    //console.log("template cont_content :",cont_content);
    var html=html_inp.replace(container_start,cont_content);
    
    //console.log("template html :",html);
	
	//code from app.js
	var where = 'console.log("LoadedInstance:",LoadedInstance);';	
	var Onload = '\r\n' + where+ '\r\n'
		+ "$('#maincontainer').off('click', '.showtree', function () {$( this ).next().toggle();});\r\n"
		+ "$('#maincontainer').off('click', 'ul.tree .plus', function () {	$( this ).next().toggle();	});\r\n"
		+ "$('#maincontainer').on('click', '.showtree', function () {$( this ).next().toggle();});\r\n"
		+ "$('#maincontainer').on('click', 'ul.tree .plus', function () {	$( this ).next().toggle();	});\r\n"
		+ "\r\n";
    
	html=html.replace(where,Onload);
	
    return html;
    //render_from_fullstash(cx,html); 
}

var static_stash_postfix='-static_stash';	
var render_now = function (cx,sst,page_id,cb,msg) {	
	//console.log(msg,static_stash);	
	var tmpl = sst[page_id];
	var qq_static_stash = deepcopy(sst[page_id+static_stash_postfix]);
	//console.log("qq_static_stash :",qq_static_stash);
	var qq_static_stash_Data = sst[page_id+static_stash_postfix].Data;
	if (qq_static_stash_Data) {
		extend(true, cx.obj[0].Data,qq_static_stash_Data);		
		//extend(true, qq_stache[cx.obj[0].Data.cid],qq_static_stash_Data);
	}		
	delete qq_static_stash.Data;
	var inits =  '\r\n<script type="text/javascript" language="javascript">'
				+'\r\n qq_static_stash=' + JSON.stringify(qq_static_stash,null,4) + ';'
				+'\r\n qq_stache={};qq_stache['+cx.obj[0].Data.cid+']=' + JSON.stringify(cx.obj[0].Data,null,4)
				+';\r\n</script>\r\n';
	//console.log("render_now inits :",inits);			
	
	
	var htmlx = inits + tmpl.render(cx.obj[0].Data);
    render_from_fullstash(cx,htmlx,cb); 	//   render_from_fullstash(cx,tmpl.render(cx.obj[0].Data),cb); 
}

exports.render = function (switchPage,target,qq_page_id,jsonstring,template_filename,cb) {    
    var mtHash=0;
    var cx={};
    try {  
		if (jsonstring==null ) throw new Error("jsonstring missing in render");
		var page_id = qq_page_id.substr(2).replace(/\//g,'-');
		cx.obj = JSON.parse(jsonstring);
		//console.log("cx.obj.mtHash :",cx.obj[0].mtHash);
		//console.log("cx.obj[0].Session :",cx.obj[0].Session);
		//console.log("cx.obj[0].Data :",cx.obj[0].Data);
		//console.log("jsonstring :",jsonstring);
            cx.obj[0].Data.Session =  cx.obj[0].Session;
            plugins.init_client_plugin_mt_functions(cx.obj[0].Data,sst);
            //console.log("cx.obj.mtHash :",cx.obj[0].Data);
            
            var tmpl = sst[page_id];
            var in_mem_hash = qq_tmpl_cache[page_id];

            if (tmpl && !in_mem_hash) {
                //there is a template with no record of live loading - so it is used as it - template is in app.js 
                console.log("template loaded from app.js :"); 
				render_now(cx,sst,page_id,cb,"template loaded from app.js:");  
            } else {                
                if ((in_mem_hash===cx.obj.mtHash)&&(in_mem_hash))
                    { //the in mem template is up to date
                        console.log("template loaded in memory cache :");
						render_now(cx,sst,page_id,cb,"template loaded in memory cache :");
                    } else {
                        //the in mem template does not exist or is out dated                      
                        var fn='./database/files' + qq_page_id + ".html.js";
                        //console.log("template loading :",fn);                        
                        var text = fs.readFileSync(fn).toString();
                        update_in_mem_template(page_id,cx.obj.mtHash,text); 
						//console.log("sst_static_stash readFile:",Object.keys(sst));
						render_now(cx,sst,page_id,cb,"template loaded from jqxhr :"); 
                    }
            }
        } catch (e) {        
            console.log('severside_render render threw:',e); 
			console.log(jsonstring);
            winston.error('severside_render render: threw',e);
        }
    
}

//
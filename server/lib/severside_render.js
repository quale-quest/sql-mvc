"use strict";

var temp = require('temp'),
path = require('path'),
os = require('os');
var fs = require('fs');
var zx_client_side_plugins = require('../../client/code/app/zx_client_side_plugins.js');
var fileutils = require('../../server/lib/fileutils.js');

//var ss = require('socketstream');
var Hogan = require('ss-hogan/client.js');
var HoganC = require('ss-hogan/node_modules/hogan.js/lib/compiler.js');


var qq_tmpl_cache =  [];
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
   cb(cont_content);
}


exports.render_inject = function (html_inp,html_inject) { 
    html_inp=html_inp.replace(/id="PAGE_2" style="display: none;"/,'id="PAGE_2" x2style="display: none;"');
    html_inp=html_inp.replace(/en0_style/,'style');

    var inits = '<script type="text/javascript" language="javascript">first_page_rendered=true;first_page_container="#maincontainer";</script>\n';
    
    var container_start = 'id="maincontainer">';
    var cont_content = container_start+ html_inject + inits;
    //console.log("template cx.obj[0] :",cx.obj[0]);
    //console.log("template cont_content :",cont_content);
    var html=html_inp.replace(container_start,cont_content);
    
    //console.log("template html :",html);
    
    return html;
    //render_from_fullstash(cx,html); 
}

exports.render = function (qq_page_id,jsonstring,template_filename,cb) {    
    var mtHash=0;
    var cx={};
      
    var page_id = qq_page_id.substr(2).replace(/\//g,'-');
    cx.obj = JSON.parse(jsonstring);
    //console.log("cx.obj.mtHash :",cx.obj[0].mtHash);
    //console.log("cx.obj[0].Session :",cx.obj[0].Session);
    //console.log("cx.obj[0].Data :",cx.obj[0].Data);
            cx.obj[0].Data.Session =  cx.obj[0].Session;
            zx_client_side_plugins.fill_data(cx.obj[0].Data,sst);
            //console.log("cx.obj.mtHash :",cx.obj[0].Data);
            
            var tmpl = sst[page_id];
            var in_mem_hash = qq_tmpl_cache[page_id];

            if (tmpl && !in_mem_hash) {
                //there is a template with no record of live loading - so it is used as it - template is in app.js 
                console.log("template loaded from app.js :");
                render_from_fullstash(cx,tmpl.render(cx.obj[0].Data),cb); 
            } else {                
                if ((in_mem_hash===cx.obj.mtHash)&&(in_mem_hash))
                    { //the in mem template is up to date
                        console.log("template loaded in memory cache :");
                        render_from_fullstash(cx,tmpl.render(cx.obj[0].Data),cb); 
                    } else {
                        //the in mem template does not exist or is out dated
                      
                        var fn='./database/files' + qq_page_id + ".html.js";
                        //console.log("template loading :",fn);
                        
                        var text = fs.readFileSync(fn).toString();
                        update_in_mem_template(page_id,cx.obj.mtHash,text); 
                        tmpl = sst[page_id];  
                        //console.log("template loaded :",page_id,sst,tmpl);                        
                        render_from_fullstash(cx,tmpl.render(cx.obj[0].Data),cb); 
                        //console.log("render_from_fullstash done :",fn);
                    }
            }
    
    
}

//
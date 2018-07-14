"use strict";
/*jshint browser: true, node: false, jquery: true */
/*  */

var precompiled = {Data:{}};  
var sst;          

var unpack_elements = function (cx,attr) {
	//decodes the content sent by the 'repack' function used in an element
    cx.f = {};
    if (attr !== undefined) {        
        var jsonobj = '{' + attr + '}';
        try {
            cx.f = JSON.parse(jsonobj);
        } catch (e) {
            console.log('unpack_elements failed:', e);
        }
        //console.log('cx.obj.Data.pick vals:',cx.f);
    }
}                

            
var init_client_plugin = function (obj) {            
            console.log('init_client_plugin client side plugin :',obj);
			obj.Data.lookup = function () {
				return function (ctx) {
					console.log('obj.Data.lookup:',this,ctx,ctx[0]);
					var look = ctx[0][this[1]];
					var findkey = this[0];
					if (look === undefined)
						return 'unknown-' + this[1];
					//console.log('obj.Data.lookup obj:',look,findkey);
					var retval = look[findkey];
					if (retval === undefined)
						retval = look.unknown;
					if (retval === undefined)
						retval = 'unknown';
					return retval;
				};
			};

			obj.Data.ick = function (ths, ctx, _, fn) {
				//console.log('obj.Data.lookup:',this,ctx,ctx[0]);
                if ( sst) { //redbin: client side plugins cannot server side render client side hogans - mark 194901
                
                
				var cx = {};
				var items = [];
				if (ths[0] !== "")
					items = ths[0].split(",");
                    
				//console.log('obj.Data.pick obj:',fn,ths);
                unpack_elements(cx,ths[4]);

				var look = ctx[0][ths[1]]; //this[1] is the name of the lookup list and look is the dictionary
				//var findkey = ths[0];
				if (look === undefined)
					return 'unknown list-' + ths[1];

				cx.par = ths;
				//console.log('obj.Data.pick obj:',look,findkey,this);
				var retval = "";
				for (var k in look) {
					if (look.hasOwnProperty(k)) {
						cx.ItemVal = k;
						cx.ItemTxt = look[k];
						if (cx.ItemTxt.substring(1, 8) !== "fblank:") {
							if (retval !== "")
								retval += sst['Widgets-' + fn + 'FieldEditSeperator'].render(cx);
							if (items.indexOf(cx.ItemVal) >= 0)
								retval += sst['Widgets-' + fn + 'FieldEdit'].render(cx);
							else
								retval += sst['Widgets-' + fn + 'FieldEditUnChecked'].render(cx);
							//console.log("new Option:",SelTxt,SelVal,toSel.options[toSel.length-1]);
						}
					}
				}

				//console.log("new pick:",retval);
                } else retval = 'redbin: client side plugins cannot server side render client side hogans - mark 194901 ';
				return retval;
			};

			obj.Data.radio = function () {
				return function (ctx, _) {
					return obj.Data.ick(this, ctx, _, 'Radio');
				};
			};
			obj.Data.pick = function () {
				return function (ctx, _) {
					//console.log('obj.Data.lookup:',this,ctx,ctx[0]);
					return obj.Data.ick(this, ctx, _, 'Pick');
				};
			};

			obj.Data.upload = function ( ctx, _) {
               //_ is the current context dom object
				//console.log('obj.Data.upload:',ctx[0].Session,this,ctx,ctx[0]);
                //console.log('obj.Data.upload:',ths[0],ctx,ctx[0]);
                var ths=this;
                //ths is a array of the parameters passed from the element fragment
                //   first is normally the text content of the field
                //   second is a field (sub)type 
                //    [4] is attributes passed in f.
                //console.log('obj.Data.upload fn:');
                //console.log('obj.Data.upload _:');
                //console.log('obj.Data.upload ths[0]:',ths);
				var lcx = {},retval='';
                
				var items = ths[0].split(",");
				if (ths[0] === "")
					items = [];
                unpack_elements(lcx,ths[4]); // repack function in element
                lcx.Session=ctx[0].Session;
				//console.log('lobj.Data.pick obj:',qq_session,qq_Stash);

				lcx.par = ths;
                //console.log('Widgets-Uploader(',lcx);
                if (sst) //redbin: client side plugins cannot server side render client side hogans - mark 194901
				   retval = sst['Widgets-Uploader' ].render(lcx);
                   else {retval = 'redbin: client side plugins cannot server side render client side hogans - mark 194901 ';
                   console.log(retval);
                   }
				//console.log("new Option:",SelTxt,SelVal,toSel.options[toSel.length-1]);
				

				//console.log("new uploader:",retval);
				return retval;
			};
            
            
			obj.Data.codec_date = function () {
				return function () {
					var ta = this[0].split(" ");
					if (ta.length < 1)
						return this[0];
					return ta[0];
				};
			};
			obj.Data.codec_stamp = function () {
				return function () {
					var ta = this[0].split(".");
					if (ta.length < 1)
						return this[0];
					return ta[0];
				};
			};
            
}

exports.name= 'base_plugins'; 

exports.init_client_plugin_mt_functions = function (obj,ss_tmpl) {     
    //console.log('filling client side plugin :',obj);
    sst=ss_tmpl;
    obj.lookup = precompiled.Data.lookup;
    obj.ick = precompiled.Data.ick;
    obj.radio = precompiled.Data.radio;
    obj.pick = precompiled.Data.pick;
    obj.upload = precompiled.Data.upload;
    obj.codec_date = precompiled.Data.codec_date;
    obj.codec_stamp = precompiled.Data.codec_stamp;
	//fill_data_InjectPoint
	
}  


init_client_plugin(precompiled);    
  
  






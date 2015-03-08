"dont use strict";
/*jshint browser: true, node: false, jquery: true */
/* qq App */

        
var zx_view_page='#PAGE_3';       
var zx_prev_page='#PAGE_3';
var qq_session,qq_cid;

var zx_switch_page = function (div){
    console.log("zx_switch_page :",div );
    if (div!==zx_view_page)
       {
        zx_prev_page=zx_view_page;
        zx_view_page = div;        
        $('.zxPage').hide();        
        $(div).show();
       } 
}

zx_switch_key = function (){
zx_switch_page(zx_prev_page);
}

ss.event.on('switchPage', function (div /*, page, message*/
) {

zx_switch_page(div);

return;

});

ss.event.on('updateDiv', function (div, message) {

	//must still compile table template format to html

	// replace the current content
	return $('#content').html(message); //just a sub at the moment wont realy write like this

});

// Listen out for newData events coming from the server
qq_stache = {}; //global
qq_tmpl_cache ={};

// Private functions

var pad2 = function (number) {
	return (number < 10 ? '0' : '') + number;
};

var timestamp = function () {
	var d = new Date();
	return d.getHours() + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
};

var valid = function (text) {
	return text && text.length > 0;
};

var loginvalid = function (text) {

	return text && text.length >= 0;
};

//===========================event initialisers - WIP to be moved to  some plugin location
// the location should probably be a static js file per module being served from the web/cdn
jQuery.collapsible = function(selector, identifier) {
	
	//toggle the div after the header and set a unique-cookie
	$(selector).click(function() {
		$(this).next().slideToggle('fast', function() {
			if ( $(this).is(":hidden") ) {
				//make persistent ..redo $.cookie($(this).prev().attr("id"), 'hide');
				$(this).prev().children(".placeholder").removeClass("collapse").addClass("expand");
			}
			else {
				//make persistent ..redo $.cookie($(this).prev().attr("id"), 'show');
				$(this).prev().children(".placeholder").removeClass("expand").addClass("collapse");
			}
		});
		return false;
	}).next();

	
	//show that the header is clickable
	$(selector).hover(function() {
		$(this).css("cursor", "pointer");
	});

	/*
	 * On document.ready: should the module be shown or hidden?
	 */
	var idval = 0;	//increment used for generating unique ID's
	$.each( $(selector) , function() {

		$($(this)).attr("id", "module_" + identifier + idval);	//give each a unique ID

		if ( !$($(this)).hasClass("collapsed") ) {
			$("#" + $(this).attr("id") ).append("<span class='placeholder collapse'></span>");
		}
		else if ( $($(this)).hasClass("collapsed") ) {
			//by default, this one should be collapsed
			$("#" + $(this).attr("id") ).append("<span class='placeholder expand'></span>");
		}
		
		//what has the developer specified? collapsed or expanded?
		if ( $($(this)).hasClass("collapsed") ) {
			$("#" + $(this).attr("id") ).next().hide();
			$("#" + $(this).attr("id") ).children("span").removeClass("collapse").addClass("expand");
		}
		else {
			$("#" + $(this).attr("id") ).children("span").removeClass("expand").addClass("collapse");
		}

	//make persistent ..redo 
    /*
		if ( $.cookie($(this).attr("id")) == 'hide' ) {
			$("#" + $(this).attr("id") ).next().hide();
			$("#" + $(this).attr("id") ).children("span").removeClass("collapse").addClass("expand");
		}
		else if ( $.cookie($(this).attr("id")) == 'show' ) {
			$("#" + $(this).attr("id") ).next().show();
			$("#" + $(this).attr("id") ).children(".placeholder").removeClass("expand").addClass("collapse");
		}
	*/	

		idval++;
	});

};

var zxInitTabs = function () {
	/*===================
	TAB STYLE
	===================*/
    var tab_index;
    for(tab_index=0;tab_index<5;tab_index++)
    {  
    var GroupName="ContainerGroup"+tab_index;
	$(".tab-block"+GroupName).hide(); //Hide all content
	//currently this only works for 1 tab per page - this can be expanded

	var zxindex = 1;
	try {
		zxindex = sessionStorage.getItem('PAGETAB-' + GroupName + '-' + qq_page_id);
	} catch (e) {}

	if (zxindex === undefined || zxindex === null)
		zxindex = 1;

	$(".Tab"+GroupName+" li:nth-child(" + zxindex + ")").addClass("active").show(); //Activate the tab
	$(".tab-block"+GroupName+":nth-child(" + zxindex + ")").show(); //Show the tab content

	//On Click Event
	$(".Tab"+GroupName+" li").click(function () {
        var group_name=$(this).parent().attr('class').match(/Tab(ContainerGroup\w)/)[1];
        //console.log('Clicked'+qq_page_id);
        //console.log('zxInitTabs click:', group_name );
		var zxindex = $(".Tab"+group_name+" li").index($(this)) + 1;

		$(".Tab"+group_name+" li").removeClass("active"); //Remove any "active" class
		$(this).addClass("active"); //Add "active" class to selected tab
		$(".tab-block"+group_name).hide(); //Hide all tab content

		var activeTab = $(this).find("a").attr("href"); //Find the href attribute value to identify the active tab + content
		$(activeTab).show(); //Fade in the active ID content

		try {
			sessionStorage.setItem('PAGETAB-' + group_name + '-' + qq_page_id, (zxindex));
		} catch (e) {}
		return false;
	});
    }
    
    /*===================
	LIST-ACCORDION
	===================*/	  

	$('.list-accordionClass').accordion({
		header: ".title",
        heightStyle: 'content',
        collapsible: true
	});
    
    /*======================
	COLLAPSIBLE PANEL STYLE
	========================*/
	$.collapsible(".collapse-bar");
    
    
};

var zxInit_usermenu = function () {
	$('.admin-user').addClass('active');
	$('.sub-menu').slideToggle('fast');

};

var zx_right_toggle_menu = function () {
    $('#panel-right').toggleClass('panel-close panel-open',500, 'easeOutExpo');
};

var zx_gallery_adaptive_touch_init  = function () {
  
     // See if this is a touch device
     if ('ontouchstart' in window)
     {
        // Set the correct body class
        $('body').removeClass('no-touch').addClass('touch');
       
        // Add the touch toggle to show text
        $('div.qiui1gallery_boxInner img').click(function(){
           $(this).closest('.qiui1gallery_boxInner').toggleClass('touchFocus');
        });
     }
  
};

var zx_SyntaxHighlighter_init = function () {
//    SyntaxHighlighter.all();
};


              
var static_zx_hide_leftbar = 0;
var zxAdapt_menus = function () {

	if (document.body.clientWidth >= 640)
		return; //big enough to fit side by side

	static_zx_hide_leftbar = !static_zx_hide_leftbar;
	//old -- $('#panel-right').toggleClass('panel-close panel-open',500, 'easeOutExpo');


	//alert('ss:' + SmallScreen + ' wh:' + static_zx_hide_leftbar);
	//$('#panel-right').toggleClass('panel-close panel-open',500, 'easeOutExpo');
	//$('#header').toggle();


	//$('#shortcur-bar').toggle(static_zx_hide_leftbar);
	//$('#sidebar').toggle(static_zx_hide_leftbar);
	$('#sidebar').width( "100%");
	$('#sidebar').toggle(!static_zx_hide_leftbar);
	$('#content').toggle(static_zx_hide_leftbar);

	$('#footer-wrap').toggle(static_zx_hide_leftbar);

};

var parse_json_attributes = function (cx,attr) {
    cx.f = {};
    if (attr !== undefined) {        
        var jsonobj = '{' + attr + '}';
        try {
            cx.f = JSON.parse(jsonobj);
        } catch (e) {
            console.log('parse_json_attributes failed:', e);
        }
        //console.log('cx.obj.Data.pick vals:',cx.f);
    }
}                


var render_from_fullstash = function (cx,html) {
                
			//console.log("cx.Data  :",cx.obj.Stash,cx.obj.Data);
			$(cx.obj.Target).html(html);
//            $(cx.obj.Target).find("script").each(function(i) {
//                    eval($(this).text()); --seems already to be executing scripts...
//                });

			//TODO-10002  Create a registration type function to register events to elements after fullstash loads


			$(".qq-range-value").each(function (/*index*/
				) {
				$(this).addClass("foo");
				//console.log( "init qq-range-value",index + ": " ,  +$( this ).attr("data-max"),$( this ) );

				var orientation = $(this).attr("data-orientation");
				if (orientation === "")
					orientation = "horizontal";
				var max = $(this).attr("data-max");
				if (max === "")
					max = 100;
				else
					max = +max;
				var min = $(this).attr("data-min");
				if (min === "")
					min = 0;
				else
					min = +min;
				var step = $(this).attr("data-step");
				if (step === "")
					step = 1;
				else
					step = +step;
				var value = $(this).attr("data-value");
				if (value === "")
					value = min;
				else
					value = +value;
				var width = $(this).attr("data-width");
				if (width === "")
					width = 138;
				else
					width = +width;

				if (orientation === "horizontal")
					$(this).css('width', width);
				// else  $(this).css('height',width);

				$(this).slider({
					'showMarkers' : true,
					animate : true,
					distance : 0,
					max : max,
					min : min,
					orientation : orientation,
					step : step,
					value : value,
					range : false,
					values : null,

					slide : function (event, ui) {
						//the slider widget must maintain this structure..
						var input_el = $(this)[0].children[0];
						input_el.value = ui.value;
					},
					change : function (event, ui) {
						//console.log( "update qq-range-value", $( this ) );
						//the slider widget must maintain this structure..
						var input_el = $(this)[0].children[0];
						//console.log( "update find input",input_el );
						input_el.value = ui.value;
						$(input_el).trigger('change');
					}
				});

			});

			$(cx.obj.Target).off('click', '#usermenu', zxInit_usermenu);
			$(cx.obj.Target).on('click', '#usermenu', zxInit_usermenu);

			$(cx.obj.Target).off('click', '.right-toggle', zx_right_toggle_menu);
			$(cx.obj.Target).on('click', '.right-toggle', zx_right_toggle_menu);
            
            
          

			/*======================
			DATE PICKER
			========================*/
			/*--Datepicker--*/
			$(".datepicker").datepicker({
				showButtonPanel : true,
				dateFormat : 'yy-mm-dd'
			});
			/*======================
			DATE TIME PICKER  - http://trentrichardson.com/examples/timepicker/
			========================*/
			/*--Datepicker--*/
			//debugger;
			$(".datetimepicker").datetimepicker({
				showButtonPanel : true,
				stepMinute : 5,
				dateFormat : 'yy-mm-dd',
				timeFormat : 'HH:mm:ss'
			});

			if (1) {
				$('.data-table').dataTable();
				$('.data-grid').dataTable({
					"sPaginationType" : "full_numbers",
					"bSort" : false
				});
				$('.data-table-theme').dataTable({
					"sPaginationType" : "full_numbers"
				});

				$('.data-table-noConfig').dataTable({
					"bPaginate" : false,
					"bLengthChange" : false,
					"bFilter" : true,
					"bSort" : false,
					"bInfo" : false,
					"bAutoWidth" : false
				});
			}
			if (0) {
				/*======================
				SELECT BOX
				========================*/

				$(".chzn-select").chosen();
				$(".chzn-select-deselect").chosen({
					allow_single_deselect : true
				});
			}
			/*======================
			INPUT UNIFROM
			========================*/
			/*--Input files style--*/

			// $(".input-uniform input[type=file],.input-uniform input[type=radio],.input-uniform input[type=checkbox], input[type=file]").uniform();

			$("select, textarea, input, a.button, button").uniform();
			$(".uniform-input").uniform();

			console.log("setup menu  :");
			$('.menu').initMenu();
			console.log("done setup menu  :");

			//WIP - Location to load post-stache scripts
			zxInitTabs();

			static_zx_hide_leftbar = 0;
			zxAdapt_menus();
			$(cx.obj.Target).off('click', '#header', zxAdapt_menus);
			$(cx.obj.Target).on('click', '#header', zxAdapt_menus);

			capture_enter();
            zxUploaderInit(); //todo make this conditional call only if it is inclueded
            zx_gallery_adaptive_touch_init();
            zx_SyntaxHighlighter_init();

}

var update_in_mem_template = function (page_id,mtHash, text) {	
		var ht = Hogan.Template;
		var t = require('socketstream').tmpl;
		var sc = text;
		eval(sc);
        qq_tmpl_cache[page_id]=mtHash;
	}
var process_new_data = function (cx) {
	//console.log("Static",o.Datasets[oi].Static,cx.Static );

	//todo if a obj arrives but its static data is not there yet then, it must be queue'd
	// this can be expanded to a whole dependency system
	//  for now we will presume the 'correct' order

	//console.log("ObjQueue",cx.obj.Object,cx.Static );
	switch (cx.obj.Object) {

	case "fullstash": { //
			//console.log("cx.Data  :",cx.obj.Stash,cx.obj.Data);
			//zxhogan parametrised function
			cx.obj.Data.lookup = function () {
				return function (ctx) {
					//console.log('cx.obj.Data.lookup:',this,ctx,ctx[0]);
					var look = ctx[0][this[1]];
					var findkey = this[0];
					if (look === undefined)
						return 'unknown-' + this[1];
					//console.log('cx.obj.Data.lookup obj:',look,findkey);
					var retval = look[findkey];
					if (retval === undefined)
						retval = look.unknown;
					if (retval === undefined)
						retval = 'unknown';
					return retval;
				};
			};

			cx.obj.Data.ick = function (ths, ctx, _, fn) {
				//console.log('cx.obj.Data.lookup:',this,ctx,ctx[0]);
				var cx = {};
				var items = [];
				if (ths[0] !== "")
					items = ths[0].split(",");
                    
				//console.log('cx.obj.Data.pick obj:',fn,ths);
                parse_json_attributes(cx,ths[4]);

				var look = ctx[0][ths[1]]; //this[1] is the name of the lookup list and look is the dictionary
				//var findkey = ths[0];
				if (look === undefined)
					return 'unknown list-' + ths[1];

				cx.par = ths;
				//console.log('cx.obj.Data.pick obj:',look,findkey,this);
				var retval = "";
				for (var k in look) {
					if (look.hasOwnProperty(k)) {
						cx.ItemVal = k;
						cx.ItemTxt = look[k];
						if (cx.ItemTxt.substring(1, 8) !== "fblank:") {
							if (retval !== "")
								retval += ss.tmpl['Widgets-' + fn + 'FieldEditSeperator'].render(cx);
							if (items.indexOf(cx.ItemVal) >= 0)
								retval += ss.tmpl['Widgets-' + fn + 'FieldEdit'].render(cx);
							else
								retval += ss.tmpl['Widgets-' + fn + 'FieldEditUnChecked'].render(cx);
							//console.log("new Option:",SelTxt,SelVal,toSel.options[toSel.length-1]);
						}
					}
				}

				//console.log("new pick:",retval);
				return retval;
			};

			cx.obj.Data.radio = function () {
				return function (ctx, _) {
					return cx.obj.Data.ick(this, ctx, _, 'Radio');
				};
			};
			cx.obj.Data.pick = function () {
				return function (ctx, _) {
					//console.log('cx.obj.Data.lookup:',this,ctx,ctx[0]);
					return cx.obj.Data.ick(this, ctx, _, 'Pick');
				};
			};

			cx.obj.Data.upload = function ( ctx, _) {
               //_ is the current context dom object
				//console.log('cx.obj.Data.upload:',this,ctx,ctx[0]);
                //console.log('cx.obj.Data.upload:',ths[0],ctx,ctx[0]);
                var ths=this;
                //ths is a array of the parameters passed from the element fragment
                //   first is normally the text content of the field
                //   second is a field (sub)type 
                //    [4] is attributes passed in f.
                //console.log('cx.obj.Data.upload fn:');
                //console.log('cx.obj.Data.upload _:');
                //console.log('cx.obj.Data.upload ths[0]:',ths);
				var lcx = {};
                
				var items = ths[0].split(",");
				if (ths[0] === "")
					items = [];
                parse_json_attributes(lcx,ths[4]);
                lcx.Session=cx.obj.Session;
				//console.log('lcx.obj.Data.pick obj:',qq_session,qq_Stash);

				lcx.par = ths;
                console.log('Widgets-Uploader(',lcx);
				var retval = ss.tmpl['Widgets-Uploader' ].render(lcx);
				//console.log("new Option:",SelTxt,SelVal,toSel.options[toSel.length-1]);
				

				//console.log("new uploader:",retval);
				return retval;
			};
            
            
			cx.obj.Data.codec_date = function () {
				return function () {
					var ta = this[0].split(" ");
					if (ta.length < 1)
						return this[0];
					return ta[0];
				};
			};
			cx.obj.Data.codec_stamp = function () {
				return function () {
					var ta = this[0].split(".");
					if (ta.length < 1)
						return this[0];
					return ta[0];
				};
			};

			qq_stache[cx.obj.Data.cid] = cx.obj.Data; //set global
			console.log("qq_stache.cid  :", cx.obj.Data.cid,cx.obj.Stash);
            qq_page_id = cx.obj.Stash;
            qq_cid = cx.obj.Data.cid;
            qq_session =cx.obj.Session;
             
            var tmpl = ss.tmpl[qq_page_id];
            var in_mem_hash = qq_tmpl_cache[qq_page_id];

            if (tmpl && !in_mem_hash) {
                //there is a template with no record of live loading - so it is used as it - template is in app.js 
                console.log("template loaded from app.js :");
                render_from_fullstash(cx,tmpl.render(cx.obj.Data)); 
            } else {                
                if (in_mem_hash===cx.obj.mtHash)
                    { //the in mem template is up to date
                        console.log("template loaded in memory cache :");
                        render_from_fullstash(cx,tmpl.render(cx.obj.Data)); 
                    } else {
                        //the in mem template does not exist or is out dated
                      
                        //check the localStorage
                        in_mem_hash = localStorage.getItem("qq-tmpl_hash-"+qq_page_id);
                        if (in_mem_hash===cx.obj.mtHash) {
                            console.log("template loaded in local storage cache :");
                            var text = localStorage.getItem("qq-tmpl_html-"+qq_page_id);  
                            update_in_mem_template(qq_page_id,cx.obj.mtHash,text); 
                            tmpl = ss.tmpl[qq_page_id];                            
                            render_from_fullstash(cx,tmpl.render(cx.obj.Data));                             
                        } else {
                            //get from the CDN    
                            
                            // request the new template
                            var qq_page_id_path='/files?'+qq_page_id.replace(/-/g, "/")+'.html.js';
                            console.log("invalid  storage object :",qq_page_id_path);
                                
                            var jqxhr =  $.get( qq_page_id_path, function(text) {
                                    //console.log("got template :",text);
                                    console.log("template loaded from CDN :");
                                    update_in_mem_template(qq_page_id,cx.obj.mtHash,text);
                                    tmpl = ss.tmpl[qq_page_id];   
                                    var htmlx = tmpl.render(cx.obj.Data);
                                    console.log("template loaded from CDN :",htmlx);
                                    render_from_fullstash(cx,htmlx); 
                                    
                                    //write storage object also
                                    localStorage.setItem("qq-tmpl_html-"+qq_page_id,text); 
                                    localStorage.setItem("qq-tmpl_hash-"+qq_page_id,cx.obj.mtHash);  //presume the latest one has the hash rerequire                      
                                    
                                    })                        
                                    .fail(function() {
                                    alert( "error - could not load the template" );
                                    });
                                                            
                            
                            
                            
                        }    
                      
                      
                    }        
                    

            } 
            
		}
		break; //Content
	case "Action": {}

		break; //Action

		//default we can delete unknown objects
	} //switch class
};

ss.event.on('newData', function (div, message) {
	//object queue and dispatcher
	//first we will just use it locally , later we will cache the header globally to late/ajax data can also be parsed
	var cx = {}; //context
	var html = '';
	cx.the = {}; //work space

	cx.ContainerCache = []; //dynamic data
	cx.ContainerQueue = [];

	cx.dynamicrequestqueue = []; //list of dynamic data to request or wait for from the server


	//console.log('client got newData',message);
	//$('#content').html(message);
	var o = JSON.parse(message);

	//var zxFormater = require('/zxFormater.js');
	if (o !== null)
		for (var oi = 0, NumberOfObjects = o.length; oi < NumberOfObjects; oi++) {

			cx.obj = o[oi];
			//cannot be sure the data has arrived - we cannot access meta data  cx.Meta    = o[o.Datasets[dsi].Meta];

			process_new_data(cx);

		} //for NumberOfObjects
	// final
	html = "";
	//


	return;

});



ss.event.on('BuildComplete', function (file,excludes) {
   file=file.substring(2).replace(/[\/\\]/g, '-');
   //console.log("BuildComplete result  :", file,excludes);
   //console.log("BuildComplete compare :", qq_page_id,qq_session);
   
   if ((qq_session!==excludes)&&(qq_page_id===file)) {
       zxnav_reload();
   }
  
 });
 
ss.event.on('BuildNotify', function (div,message) {
   //console.log("BuildNotify result  :", div,message);
  $(div).html('<pre>'+Date()+' : '+message+'</pre>');
 });
 
ss.event.on('debugresult', function (div,message,fn) {


       // console.log("debugresult  :", message);
        var html = message;//ss.tmpl[cx.obj.Stash].render(cx.obj.Data);
        //console.log("cx.Data  :",fn);
        $(div).html(html);
          
  $(div).off('click', '.showtree', function () {$( this ).next().toggle();});
  $(div).off('click', 'ul.tree .plus', function () {	$( this ).next().toggle();	});               
  $(div).on('click', '.showtree', function () {$( this ).next().toggle();});
  $(div).on('click', 'ul.tree .plus', function () {	$( this ).next().toggle();	});             
});


// Listen out for newMessage events coming from the server
ss.event.on('newMessage', function (message) {

	// Example of using the Hogan Template in client/templates/chat/message.jade to generate HTML for each message
	var html = ss.tmpl['chat-message'].render({
			message : message,
			time : function () {
				return timestamp();
			}
		});

	// Append it to the #chatlog div and show effect
	return $(html).hide().appendTo('#chatlog').slideDown();

});

//bind crucial lib  functions to root so they are accessable by qq js
var DeltaList = [];
exports.delta = function (cell) {
	console.log("server-typ-container-pk-f-v ", cell, DeltaList);

	DeltaList.push(cell);

	if (cell.typ === 'click') { // should warn if changes has been made
	}
	if (cell.typ === 'change') { // if immediate is on it should save without caching

		//for now cache
		return;
	}

	var data = JSON.stringify(DeltaList);

	DeltaList = [];
	deltacount = 0;
	$('#deltacounter1').text(deltacount);
	$('#deltacounter2').text(deltacount);

	return exports.sendClick(data, function (success) {
		if (success) {
			return $('#myMessage').val('');
		} else {
			return alert('Oops! Unable to send message');
		}
	});

};
zx_delta = exports.delta;
// bind to the helpbutton action

zxnav_reload = function () {
    //in place reloading  without saving - preserve changes -todo
    
	DeltaList = [];
    var message = {
        cid : qq_cid,
        pkf : 0,
        valu : '',
        typ : 'click'
    };  
    DeltaList.push(message);   
    var data = JSON.stringify(DeltaList);    
    DeltaList = [];         
    
	deltacount = 0;
	$('#deltacounter1').text(deltacount);
	$('#deltacounter2').text(deltacount);

	return exports.sendClick(data, function (success) {
		if (success) {
			return $('#myMessage').val('');
		} else {
			return alert('Oops! Unable to send message');
		}
	});

};


$(".zxlink").click(function () {
	// Grab the message from the text box
	var text = $(this).attr('id') + ' abc';

	// Call the 'send' funtion (below) to ensure it's valid before sending to the server
	return exports.sendClick(text, function (success) {
		if (success) {
			return $('#myMessage').val('');
		} else {
			return alert('Oops! Unable to send message');
		}
	});

});

// sharing code between modules by exporting function
exports.sendClick = function (text, cb) {

	return ss.rpc('ServerProcess.NavSubmit', text, cb);

};

// bind to the login form and submit the fields after validation
if (0) {
	$('#LoginForm').click(function () {
		return exports.sendLogin($('#LoginName').val(), $('#LoginInput').val(), function (success) {
			if (success) {
				return $('#myMessage').val('');
			} else {
				return alert('Username or password is invalid, please retry.');
			}
		});
	});

} else {
	$('#LoginForm').on('submit', function () {

		// Grab the message from the text box
		// Call the 'send' funtion (below) to ensure it's valid before sending to the server
		return exports.sendLogin($('#LoginName').val(), $('#LoginInput').val(), $('#LoginPage').val(), function (success) {
			if (success) {
				return $('#myMessage').val('');
			} else {
				return alert('Username or password is invalid, please retry.');
			}
		});
	});
}

//
// sharing code between modules by exporting function
exports.sendLogin = function (LoginName, LoginInput, Page, cb) {
	if (loginvalid(LoginName) && loginvalid(LoginInput)) {
		return ss.rpc('ServerProcess.LoginAction', LoginName, LoginInput,Page, cb);
	} else {
		return cb(false);
	}
};

// during initial debug auto-login so we can debug tables
$(function () {
    ss.rpc('ServerProcess.connected');
});

// Show the chat form and bind to the submit action
var debug_button_fn = function (fn) {

	// Grab the message from the text box
    fn.auth = $('#auth-code').val()
	var text = JSON.stringify(fn);

	// Call the 'send' funtion (below) to ensure it's valid before sending to the server
	return exports.sendDebug(text, function (success) {
		if (success) {
			return ;//$('#auth-code').val('');
		} else {
			//return alert('Oops! Unable to send message');
		}
	});
};

$('#DebugViewConsole').on('click', function () {return debug_button_fn({fn:'Console'}); });
$('#DebugViewErrors').on('click', function () {return debug_button_fn({fn:'Errors'}); });
$('#DebugViewModel').on('click', function () {return debug_button_fn({fn:'Model'}); });
$('#DebugViewControllers').on('click', function () {return debug_button_fn({fn:'Controllers'}); });
$('#DebugViewViews').on('click', function () {return debug_button_fn({fn:'Views'}); });
$('#DebugRebuild').on('click', function () {return debug_button_fn({fn:'Rebuild'}); });


// sharing code between modules by exporting function
exports.send = function (text, cb) {
	if (valid(text)) {
		return ss.rpc('ServerProcess.sendBroadcastMessage', text, cb);
	} else {
		return cb(false);
	}
};

exports.sendDebug = function (text, cb) {
	if (valid(text)) {
		return ss.rpc('ServerProcess.sendDebugMessage', text, cb);
	} else {
		return cb(false);
	}
};





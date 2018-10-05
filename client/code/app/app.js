"dont use strict";
/*jshint browser: true, node: false, jquery: true */
/* qq App */


var plugins = require('./plugins.js');
/*var without var goes into dom root*/ //zx_za_cdv = require('./za_cdv.js');   

   
var simpleautotest=0;    //set to 1 to automatically post records to demo todo site
//var zx_active_page='#PAGE_2';   - set in html
var zx_prev_page='#PAGE_99';
var zx_app_page='#PAGE_2';
var zx_Q_page='#PAGE_3';   //ctrl-Q toggles between them    
var zx_Login_page='#PAGE_1';

var qq_session,qq_cid;
var popStateInProgress=false;


var zx_switch_page = function (div){
    console.log("zx_switch_page new:",div," old:",zx_active_page );
    if (div!==zx_active_page)
       {
        zx_prev_page=zx_active_page;
        zx_active_page = div;        
        $('.zxPage').hide();   //hides all pages      
        $(div).show();
       } 
}

zx_switch_key = function (){
	//alert('zx_switch_key '+zx_prev_page ); 
	if (zx_active_page!=zx_Q_page) {
		zx_switch_page(zx_Q_page);	
	} else {
		$('.devdebugvisable').show();        			
		zx_switch_page(zx_prev_page);		
	}
}

ss.event.on('switchPage', function (div) {
zx_switch_page(div);
return;
});

ss.event.on('logout', function (div) {
window.location.replace("Login");
console.log('logout reload');
return;
});

ss.event.on('updateDiv', function (div, message) {

	//must still compile table template format to html

	// replace the current content
	return $('#content').html(message); //just a sub at the moment wont realy write like this

});

// Listen out for newData events coming from the server
qq_stache = qq_stache||{}; //global created in server side render also, so don't overwrite
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




//alert('make init_from_fullstash_internal');
init_from_fullstash_internal = function (Target) {
//TODO-10002  Create a registration type function to register events to elements after fullstash loads

//            $(Target).find("script").each(function(i) {
//                    eval($(this).text()); --seems already to be executing scripts...
//                });

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

			$(Target).off('click', '#usermenu', zxInit_usermenu);
			$(Target).on('click', '#usermenu', zxInit_usermenu);

			$(Target).off('click', '.right-toggle', zx_right_toggle_menu);
			$(Target).on('click', '.right-toggle', zx_right_toggle_menu);
            
            
          

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
			if (1) {
				//$("input, a.button, button").uniform();
				$("select, textarea").uniform();
				$(".uniform-input").uniform();

				console.log("setup menu  :");
				$('.menu').initMenu();
				console.log("done setup menu  :");
			}

			//WIP - Location to load post-stache scripts
			zxInitTabs();

			static_zx_hide_leftbar = 0;
			zxAdapt_menus();
			$(Target).off('click', '#header', zxAdapt_menus);
			$(Target).on('click', '#header', zxAdapt_menus);

			capture_enter();
            zxUploaderInit(); //todo make this conditional call only if it is inclueded
			
			plugins.init_after_render(Target); //this will execute the code in plugin.js
		
            zx_gallery_adaptive_touch_init();
            zx_SyntaxHighlighter_init();
            //alert("init_from_fullstash_internal");
//            zx_cdv();
			if (simpleautotest) {
				setTimeout(function () {
					var event = new Event('change', {'bubbles': true,'cancelable': true});
					var s= document.getElementById("edit-120000000-1");
					console.log("on setTimeout :",Date.now() );
					s.value = Date.now();
					s.dispatchEvent(event);
					}
				, 1000)
			}
		window.onbeforeunload = exports.ClosingBrowser;	
		
		Validate_On_Page_Load();
		
		
		$( "input" ).focusout(function(e) {
			//console.log("focusout:",e);
			let Cell=FindCell(e);
			if (!check_validity(Cell,Cell.el).isValid) {
				if (hold_focus_at) 
					{
						//console.log("focusout HOLD:");
						hold_focus_at.focus();
					} //else console.log("focusout NO HOLD:");	
			} //else console.log("focusout Valid");	
			
		});
}

var render_from_fullstash = function (cx,html) {
                
			//console.log("cx.Data  :",cx.obj.Stash,cx.obj.Data);
			console.log("cx.Target  :",cx.obj.Target);
			$(cx.obj.Target).html(html);
			
			if (cx.obj.Target.indexOf('modal')>0)
			    $(cx.obj.Target).modal();

            init_from_fullstash_internal(cx.obj.Target);
			//alert("render_from_fullstash");
}


var update_in_mem_template = function (page_id,mtHash, text) {	
		var ht = Hogan.Template; //this local variable is used in the script eval is evaluating
		var t = require('socketstream').tmpl; //this local variable is used in the script eval is evaluating
		var sc = text; //this local variable is used in the script eval is evaluating
		//console.log("update_in_mem_template  eval:",sc);
		eval(sc); //this creates the hogan script - it does not do the rendering
        qq_tmpl_cache[page_id]=mtHash;
	}
	
var static_stash_postfix='-static_stash';	
var render_now = function (cx,ss,qq_page_id,msg) {
	//console.log(msg,static_stash);
	var tmpl = ss.tmpl[qq_page_id];
	
	qq_static_stash = ss.tmpl[qq_page_id+static_stash_postfix];
	if ((qq_static_stash)&&(qq_static_stash.Data)) {
		$.extend(true, cx.obj.Data,qq_static_stash.Data);
		$.extend(true, qq_stache[cx.obj.Data.cid],qq_static_stash.Data);
	}
	
	var htmlx = tmpl.render(cx.obj.Data);
    render_from_fullstash(cx,htmlx); 	
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
            cx.obj.Data.Session =  cx.obj.Session;
            plugins.init_client_plugin_mt_functions(cx.obj.Data,ss.tmpl);

			qq_stache[cx.obj.Data.cid] = cx.obj.Data; //set global
			console.log("qq_stache.cid  :", cx.obj.Data.cid,cx.obj.Stash);
            qq_page_id = cx.obj.Stash;
            qq_cid = cx.obj.Data.cid;
            qq_session =cx.obj.Session;
             
            var tmpl = ss.tmpl[qq_page_id];
            var in_mem_hash = qq_tmpl_cache[qq_page_id];
			
			//console.log("qq_stache.cid tmpl :", qq_page_id);
			//console.log("qq_stache.cid tmpl :", qq_page_id,ss.tmpl);

            if (tmpl && !in_mem_hash) {
                //there is a template with no record of live loading - so it is used as it - template is in app.js 				                
				render_now(cx,ss,qq_page_id,"template loaded from app.js :");				
            } else {                
                if (in_mem_hash===cx.obj.mtHash)
                    { //the in mem template is up to date
						render_now(cx,ss,qq_page_id,"template loaded in memory cache :");
                    } else {
                        //the in mem template does not exist or is out dated
                        var ls_prefix = 'qq-tmpl_';
                        //check the localStorage
                        in_mem_hash = localStorage.getItem(ls_prefix+"hash-"+qq_page_id);
                        if (in_mem_hash===cx.obj.mtHash) {
                            console.log("template loaded in local storage cache :");
                            var text = localStorage.getItem(ls_prefix+"html-"+qq_page_id);  
                            update_in_mem_template(qq_page_id,cx.obj.mtHash,text); 
                            
							render_now(cx,ss,qq_page_id,"template loaded in localStorage :");                            
                        } else {
                            //get from the CDN    
                            
                            // request the new template
                            var qq_page_id_path='/files?'+qq_page_id.replace(/-/g, "/")+'.html.js';
                            console.log("invalid  storage object :",qq_page_id_path);
                                
                            var jqxhr =  $.get( qq_page_id_path, function(text) {
                                    //console.log("got template :",text);
                                    console.log("template loaded from CDN :");
									
                                    update_in_mem_template(qq_page_id,cx.obj.mtHash,text);                                    
									render_now(cx,ss,qq_page_id,"template loaded from jqxhr :");                            									
                                    
                                    //write storage object also
                                    localStorage.setItem(ls_prefix+"html-"+qq_page_id,text); 
                                    localStorage.setItem(ls_prefix+"hash-"+qq_page_id,cx.obj.mtHash);  //presume the latest one has the hash rerequire                      
                                    
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

var forFields = exports.forFields = function (object,callback) {
//returns true and stops if a match is found - acts like arr.some

    if (Array.isArray(object))         
        return object.some(callback);
        
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            if (callback( object[key],key,object)===true) return;
        }
    }                    
    return false;
}   


var indent = exports.indent = function (dent) {
	var str = '';
	for (var i = 0; i < dent; ++i) {
		str += ' ';
	}
	return str;
};


var replace_string_in_object = function (object,depth) {
//returns true and stops if a match is found - acts like arr.some
    if (!depth) depth=0;
    if (depth>30) return;
    forFields(object, function (field, key,obj1) {        
        if (typeof field === 'object') {
            //console.log(indent(depth)+'',key,':');
            //console.log(indent(depth)+'  { ');
            replace_string_in_object(field,depth+1)
            //console.log(indent(depth)+'  } //',key);
        }else{
            if (typeof field === 'string') {
                //console.log(indent(depth)+' ==',typeof field ,key,(String(field)));
                var newstr = field.replace(/CRLF/g, '\n');   
                obj1[key]=newstr;
                //console.log(indent(depth)+' ->',typeof field ,key,newstr);
            }    
            
        }
    });
                  
    return false;
}                        


ss.event.on('newData', function (div, message) {
	//object queue and dispatcher
	//first we will just use it locally , later we will cache the header globally to late/ajax data can also be parsed
	var cx = {}; //context
	var html = '';
	cx.the = {}; //work space

	cx.ContainerCache = []; //dynamic data
	cx.ContainerQueue = [];

	cx.dynamicrequestqueue = []; //list of dynamic data to request or wait for from the server

    if (simpleautotest)
		console.log('client got newData',message);

	//$('#content').html(message);
	var o = JSON.parse(message);

	//var zxFormater = require('/zxFormater.js');
	if (o !== null) {
		replace_string_in_object(o,0);
		if (o[0].ErrorMessage=='invaliduser') {
			//console.log('client got newData:',o[0].ErrorMessage);
			$('#InvalidUser').show();
			setTimeout(function () {$('#InvalidUser').hide();}, 2000);        
			}
			
		if (o[0].Target=="#maincontainer") $(".simplemodal-close").trigger("click");
		if (!popStateInProgress) {
			if (o[0].Target=="#maincontainer") {
				var ho = {cid:o[0].Data.cid,stash:o[0].Stash};
				console.log('history.pushState >',ho);
				history.pushState(ho, o[0].Stash,'#'+o[0].Stash);// +  ".html");
				
			}
		}
		popStateInProgress=false;
		
		for (var oi = 0, NumberOfObjects = o.length; oi < NumberOfObjects; oi++) {

			cx.obj = o[oi];
			//cannot be sure the data has arrived - we cannot access meta data  cx.Meta    = o[o.Datasets[dsi].Meta];

			process_new_data(cx);

		} //for NumberOfObjects
	}	
	// final
	html = "";
	//


	return;

});


ss.event.on('BuildStarted', function (file,excludes) {
   file=file.substring(2).replace(/[\/\\]/g, '-');
   //console.log("BuildComplete result  :", file,excludes);
   //console.log("BuildComplete compare :", qq_page_id,qq_session);
   
   if (((qq_session!==excludes)&&(qq_page_id===file))||(qq_page_id==='all')) {
       zx_switch_page('#PAGE_4');
   }
  
 });
 
ss.event.on('BuildComplete', function (file,excludes) {
   if (file!=='all') file=file.substring(2).replace(/[\/\\]/g, '-');
   console.log("BuildComplete result  :", file,excludes);
   console.log("BuildComplete compare :", qq_page_id,qq_session);
   
   if ((qq_session!==excludes)&&((qq_page_id===file)||(file==='all'))) {
       zxnav_reload();
   }
 // alert("BuildComplete");
 });
 
ss.event.on('BuildNotify', function (div,message) {
   //console.log("BuildNotify result  :", div,message);
  $(div).html('<pre>'+Date()+' : '+message+'</pre>');
  // alert("BuildNotify");
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
var DeltaList = {};
exports.delta = function (cell) {
	console.log("server-typ-container-pk-f-v ", cell);
	
	delete  cell.pk;
	
	cell.id = '"'+cell.cid+'-'+cell.pkf+'"';
	DeltaList[cell.id] = cell;
	//DeltaList.push(cell);
	console.log("exports.delta DeltaList ", DeltaList);

	if (cell.typ === 'click') { // should warn if changes has been made
	}
	if (cell.typ === 'change') { // if immediate is on it should save without caching

		//for now cache
		return;
	}

	var data = JSON.stringify(DeltaList);
	console.log("exports.delta data", data);
	DeltaList = {};
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
	zxnav_load(qq_cid);
}

zxnav_load = function (cid) {	
    //in place reloading  without saving - preserve changes -todo
    popStateInProgress=true;
	DeltaList = {};
    var message = {
        cid : cid,
        pkf : 0,
        valu : '',
        typ : 'click'
    };  
    //DeltaList.push(message);   
	message.id = '"'+message.cid+'-'+message.pkf+'"';
	DeltaList[message.id] = message;
    var data = JSON.stringify(DeltaList); 
	console.log("history.zxnav_load ", data);	
    DeltaList = {};         
    
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

	return ss.rpc('ServerProcess.NavSubmit', text,LoadedInstance, cb);

};

exports.ClosingBrowser = function (event) {
	return ss.rpc('ServerProcess.ClosingBrowser', '',LoadedInstance, null);
};


exports.LoadFromBrowserBackNavigation = function () {
	return ss.rpc('ServerProcess.BrowserBack', '',LoadedInstance, null);
};

var SubmitLoginOnce=new Date().getTime();
// bind to the login form and submit the fields after validation
if (1) {
	
	$('#RegisterNewUser').click(function () {return exports.sendLogin('SelfServe', 'SelfServe','RegisterNewUser');});
	$('#ForgotPassword').click(function () {return exports.sendLogin('SelfServe', 'SelfServe','ForgotPassword');});	
	$('#LoginButton').click(function () {return exports.sendLogin($('#LoginName').val(), $('#LoginInput').val(),$('#LoginPage').val());	});

} else {
	console.log("Init LoginForm submit  :");	
	if (1) $('#UserLoginForm').on('submit', function (e) {
		// Grab the message from the text box
		// Call the 'send' funtion (below) to ensure it's valid before sending to the server
		e.preventDefault(); 
		e.stopImmediatePropagation();
		var dt = new Date().getTime()-SubmitLoginOnce;
		SubmitLoginOnce=new Date().getTime();
		console.log("LoginForm submit  :",dt,SubmitLoginOnce,[$('#LoginName').val(),$('#LoginInput').val(), $('#LoginPage').val()]);
		if (dt>300) {			
			exports.sendLogin($('#LoginName').val(), $('#LoginInput').val(), $('#LoginPage').val(), function (success) {
				if (success) {
					return $('#myMessage').val('');
				} else {
					return alert('Username or password is invalid, please retry.');
				}
			});
		}
		return false; 
	});
}

//
// sharing code between modules by exporting function
sendLogin = exports.sendLogin = function (LoginName, LoginInput, Page, cb) {
    console.log('exports.sendLogin',[LoginName, LoginInput, Page]);
	if (loginvalid(LoginName) && loginvalid(LoginInput)) 
		return ss.rpc('ServerProcess.LoginAction', LoginName, LoginInput,Page,LoadedInstance, cb);

};

// After load attempt initial auto loging - configured from server Quale/Config.json
$(function () {
    //alert('first_page_rendered :'+ typeof first_page_rendered);
    if (typeof first_page_rendered == "undefined") first_page_rendered=0;
    if (first_page_rendered) {
        //alert('first_page_renderedX'); 
        init_from_fullstash_internal(first_page_container);
    }     
   else ss.rpc('ServerProcess.connected',first_page_rendered,LoadedInstance);
    
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
		return ss.rpc('ServerProcess.sendBroadcastMessage', text,LoadedInstance, cb);
	} else {
		return cb(false);
	}
};

exports.sendDebug = function (text, cb) {
	if (valid(text)) {
		return ss.rpc('ServerProcess.sendDebugMessage', text,LoadedInstance, cb);
	} else {
		return cb(false);
	}
};


console.log('app.js loaded Version 1.08');


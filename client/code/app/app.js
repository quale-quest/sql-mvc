"dont use strict";
/*jshint browser: true, node: false, jquery: true */
/* qq App */

ss.event.on('switchPage', function (div/*, page, message*/) {
	//alert ('test1'+div);
	$('.zxPage').hide();
	$(div).show();

	return;

});

ss.event.on('updateDiv', function (div, message) {

	//must still compile table template format to html

	// replace the current content
	return $('#content').html(message); //just a sub at the moment wont realy write like this

});

// Listen out for newData events coming from the server
qq_stache = {}; //global

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
var zxInitTabs = function () {
	/*===================
	TAB STYLE
	===================*/

	$(".tab-block").hide(); //Hide all content
	//currently this only works for 1 tab per page - this can be expanded

	var zxindex = 1;
	try {
		zxindex = sessionStorage.getItem('PAGETAB-' + document.title);
	} catch (e) {}

	if (zxindex === undefined || zxindex === null)
		zxindex = 1;

	$(".mytabs li:nth-child(" + zxindex + ")").addClass("active").show(); //Activate the tab
	$(".tab-block:nth-child(" + zxindex + ")").show(); //Show the tab content

	//On Click Event
	$(".mytabs li").click(function () {
		var zxindex = $(".mytabs li").index($(this)) + 1;

		$(".mytabs li").removeClass("active"); //Remove any "active" class
		$(this).addClass("active"); //Add "active" class to selected tab
		$(".tab-block").hide(); //Hide all tab content

		var activeTab = $(this).find("a").attr("href"); //Find the href attribute value to identify the active tab + content
		$(activeTab).show(); //Fade in the active ID content

		try {
			sessionStorage.setItem('PAGETAB-' + document.title, (zxindex));
		} catch (e) {}
		return false;
	});

};


var zxInit_usermenu = function () {
	$('.admin-user').addClass('active');
	$('.sub-menu').slideToggle('fast');
};


var process_new_data =  function(cx)
{
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
						var items = ths[0].split(",");
						if (ths[0] === "")
							items = [];
						//console.log('cx.obj.Data.pick obj:',fn,ths);
						if (ths[4] !== undefined) {
							cx.f = {};
							var jsonobj = '{' + ths[4] + '}';
							try {
								cx.f = JSON.parse(jsonobj);
							} catch (e) {
								console.log('cx.obj.Data.pick failed:', e);
							}
							//console.log('cx.obj.Data.pick vals:',cx.f);
						}

						var look = ctx[0][ths[1]]; //this[1] is the name of the lookup list and look is the dictionary
						//var findkey = ths[0];
						if (look === undefined)
							return 'unknown-' + ths[1];

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
					console.log("qq_stache.cid  :", cx.obj.Data.cid);
					var html = ss.tmpl[cx.obj.Stash].render(cx.obj.Data);
					//console.log("cx.Data  :",cx.obj.Stash,cx.obj.Data);
					$(cx.obj.Target).html(html);

					//TODO-10002  Create a registration type function to register events to elements after fullstash loads


					$(".qq-range-value").each(function (/*index*/) {
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
                    
                    capture_enter();

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
	if (valid(text)) {
		return ss.rpc('ServerProcess.NavSubmit', text, cb);
	} else {
		return cb(false);
	}
};

// bind to the login form and submit the fields after validation
if (0) {
	$('#LoginForm').click(function () {
		return exports.sendLogin($('#LoginName').val(), $('#LoginInput').val(), function (success) {
			if (success) {
				return $('#myMessage').val('');
			} else {
				return alert('Username or Password is invalid, please retry.');
			}
		});
	});

} else {
	$('#LoginForm').on('submit', function () {

		// Grab the message from the text box
		// Call the 'send' funtion (below) to ensure it's valid before sending to the server
		return exports.sendLogin($('#LoginName').val(), $('#LoginInput').val(), function (success) {
			if (success) {
				return $('#myMessage').val('');
			} else {
				return alert('Username or Password is invalid, please retry.');
			}
		});
	});
}

//
// sharing code between modules by exporting function
exports.sendLogin = function (LoginName, LoginInput, cb) {
	if (loginvalid(LoginName) && loginvalid(LoginInput)) {
		return ss.rpc('ServerProcess.LoginAction', LoginName, LoginInput, cb);
	} else {
		return cb(false);
	}
};

// during initial debug auto-login so we can debug tables
$(function () {
	setTimeout(function () {
		$('#LoginForm').submit();
	}, 1000);

});

// Show the chat form and bind to the submit action
$('#RealTimeChatForm').on('submit', function () {

	// Grab the message from the text box
	var text = $('#myMessage').val();

	// Call the 'send' funtion (below) to ensure it's valid before sending to the server
	return exports.send(text, function (success) {
		if (success) {
			return $('#myMessage').val('');
		} else {
			//return alert('Oops! Unable to send message');
		}
	});
});

// sharing code between modules by exporting function
exports.send = function (text, cb) {
	if (valid(text)) {
		return ss.rpc('ServerProcess.sendBroadcastMessage', text, cb);
	} else {
		return cb(false);
	}
};



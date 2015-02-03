"use strict";
/*
speed/memory performance  is not important
ease of use is important
 */

/*
Actions = SQL procedure buttons, save and Links to forms are all the same operations

SaveChanges,
Execute independent SQL procedure
Follow Link (execute reload based procedure)

for actions without forms the destination is a reload of the same page - or no reload (sometimes)
Save
Script Button
links are just buttons that save and then link - // the UI can decide not to submit changes if the save button is not pressed - or prompt user ("save changes ?")

# independent procedure vs link procedure vs reload procedure
a independent procedure can be called anywhere but has limited access to the context    (not implemented)
a link procedure executes in another page's context
a reload procedure happens in this page context on reload
Only one procedure can be executed...?
//
each link can have its own specific procedure stored in the context
we can have a common procedure and each link can call it with parameters
we can have a proper stored procedure which is called with parameters


// save button is hard coded to onclick="return(zxnav(event,0,0));"  //and update data is passed
zxnav(Row_context,fieldoffset_in_row)  // rows start being generated for 1, so 0 is reserved for reload
we can pass only one param=  to procedures, if the need more params
we do updates to known tables and the procedure reads it parameters from the tables.


//when a independent procedure is executed:
not available : ##, operator. and master. substitutions
the following is available:
:operator_pkv :this_pkv :this_pkf   //primary_key_value  / fieldname
//PAGE_PARAMS would be the fields in the absence of a this_pkv, but this is not yet implemented
// :master_ref is not known - and should not be, it can be derived from the pk or PAGE_PARAMS...?

procedure names are global - be carefull of nameing confilicts
procedures that must be  deleted must be flagged deprecated=date
the compiler will then remove them over time  if they are not used, and give warnings if someone does use them


#Validatition
Server side SQL triggers
can emit errors back to user, by placing a record in autonomous transaction
Server side procedure
Client side UI code



 */

var fileutils = require('../../../compiler/modules/fileutils.js');
var path = require('path');
var fs = require('fs');
var page = require('../../modules/page.js');
var hogan = require("hogan");

exports.module_name='action_widget.js';

var gets = require('../../zx.js').gets;
	

var styleif = function (val, str) {
	if (val === undefined)
		return "";
	if (val === "")
		return "";
	return str.replace("{{pop}}", val);
};

var action_style = function (zx, o, Key) {
	var Value = "";
	if (o.localstyle !== undefined) {
		Value = zx.UIsl[o.localstyle + Key];
	} else {
		if (o.style !== undefined)
			zx.Defaultaction_style = o.style; //set new style for the rest of the buttons

		if (zx.Defaultaction_style !== "")
			Value = zx.UIsl[zx.Defaultaction_style + Key];
	}

	if ((Value === undefined) || (Value === "")) //not set so use the unstyled value
		Value = zx.UIsl[Key];
	if (Value === undefined)
		return "";

	return Value;
};

var zxAction_start = function (zx, o) {
	zx.action.level = 1;
	//console.warn('zxAction_start:',o);
	return action_style(zx, o, "ActionDiv");
};

var zxAction_end = function (zx, o) {
	//console.warn('zxAction_end:',o);
	zx.action.level--;
	if (zx.action.level === 0)
		return action_style(zx, o, "ActionEndDiv");
	else
		return action_style(zx, o, "ActionEndSub");
};

var zxAction = function (zx, o, type) { //type should be deprecated

	if (o.submenu !== undefined)
		return ""; //control signal is ignored - not sure where or if this is used

	if (gets(o.name) !== "") //menu name indicates a ui only action
	{
		//sub menu - increase a level - return title
		zx.action.level++;
        var result = action_style(zx, o, "ActionHead");
        o.Title = zx.FirstBeauty(gets(o.title), gets(o.name));
        result = hogan.compile(result).render(o);
        
		return result;
	}

	//if (o.form===undefined) return "";
	var QryRef = zx.dbg.link_from(zx, o);
	var QryUrl = "return(zxnav(event," + QryRef + "));";

	return zxActionUrl(zx, o, type, QryUrl);
};

var zxActionUrl = function (zx, o, type, QryUrl) {
	//AnsiString zxAction(TStrings *TagParams,int Type)   //combines menu,button,sqlbutton and scriptbutton  - to outphase the old ones
	//type special values are 0 99 101 201
	//Type gets modified depending on the keyword that called it

	//console.log('zxAction:',o);


	/*  majour issue here ...
	this is not simple to convert the conext value substitution needs to be sql capable not jsut static text like above....

	ContextValue does: pwsubsitute constant values, then runs query if its a select, returns the (result and true) or false if its empty

	in the compiler this has to be replaced by:
	the query must be constructed from const texts + context variables in the sql context equivelent to #master.#, operator.# etc
	the query value then must become a moustache {{F}} value
	 */

	/*
	TODO-spans
	AS LeftSpan=ExtractQ(TagParams,"LeftSpan");
	if (LeftSpan!="")
{
	AS Param;
	AS Result;
	ParseParamFromString(LeftSpan,Param,20);
	ContextValue(Sqld,StripQ(LeftSpan),Result,"ElementValue:");
	LeftSpan="ls:"+LeftSpan+"<span class=\""+Param+"\">" + Result + "</span>";
	}

	AS RightSpan=ExtractQ(TagParams,"rightspan");
	if (RightSpan!="")
{
	AS Param;
	AS Result;
	ParseParamFromString(RightSpan,Param,20);
	ContextValue(Sqld,StripQ(RightSpan),Result,"ElementValue:");
	RightSpan="<span class=\""+Param+"\">" + Result + "</span>";
	}
	 */

	o.li_class = styleif(o.li_class, " class=\"{{pop}}\" ");
	o.IconSpan = styleif(o.icon, "<span class=\"{{pop}}\"></span>");
	o.Icon = styleif(o.glymph, "{{pop}}");

	o.RightSpan = "";
	o.LeftSpan = o.IconSpan;
     
	//QryUrl should be complete // excluding the on click script
	var result = action_style(zx, o, (zx.action.level <= 1) ? "ActionMain" : "ActionSub");
	o.Title = zx.Beautify(gets(o.title)); //use proper
    o.url = QryUrl;
    o.Glymph = o.Icon;
    
    
    result = hogan.compile(result).render(o);
    //console.log('zxActionUrl 093805:',result, o);
    
	//console.log('zxActionx:',result,"QryUrl:",QryUrl,"titlestr:",titlestr,gets(o.title),o.title,"IconSpan:",IconSpan, o);

	//console.log('zxActionz:',result, o);

	return result;
};

var getDecoratedMenuObject = function (zx, o, text_in) {
	var obj = {};
	obj.indx = zx.parsenumeric(text_in);
	obj.text = zx.removenumeric(text_in);
	obj.title = zx.Beautify(obj.text);
	return obj;
};

var tag_menuscan_recurse = function (zx, o, menuhdr) {

	//var ofile=o.menuname[0];
	//var menu=zx.action.menu[o.menuname[0]];
	//console.warn('tag_menugen str:',JSON.stringify(zx.action.menu, null, 4));
	//console.warn('\n\n\ntag_menuscan_recurse:',zx.action.level,JSON.stringify(menuhdr, null, 4));
	var fn,
	menu_objs,
	menu_obj,
	obj,
	p;
	var menu = zx.sortObj(menuhdr.menu);
	for (var i in menu) {
		if (!menu.hasOwnProperty(i))
			continue;
		var item = menu[i];
		if (item.menu !== undefined) { //sub menu
			menu_objs = [];

			// get info from file name
			obj = getDecoratedMenuObject(zx, o, i);
			o.name = obj.title;
			o.title = o.name;

			//get info from file
			p = item.conf.indexOf(i);
			fn = item.conf.substr(0, p + i.length + 1) + zx.app_extn;

			//console.warn('tag_menuscan_recurse open sub:', p, i, JSON.stringify(item, null, 4), fn);
			if (fs.existsSync(fn)) {
				menu_objs = page.ParseFileToObject(zx, fn, "dropinmenu");
				//console.warn('tag_menuscan_recurse menu_objs aa:', JSON.stringify(menu_objs, null, 4));
			}

			if (menu_objs.length < 1) { //no file or no obj in file
				//console.warn('tag_menuscan_recurse plain supermenu:', JSON.stringify(o, null, 4), fn);
				tag_menu(zx, o);
			} else {
				menu_obj = menu_objs[0];
				menu_obj.tag = 'menu';
				if ((menu_obj.title === undefined) && (menu_obj.name === undefined))
					menu_obj.title = o.title;
				if (menu_obj.title === undefined)
					menu_obj.title = menu_obj.name;
				if (menu_obj.name === undefined)
					menu_obj.name = menu_obj.title;
				//console.warn('tag_menuscan_recurse menu_objs:',p,i,JSON.stringify(item, null, 4),fn);
				tag_menu(zx, menu_obj);
			}

			delete o.name; //make sure next is not a sub menu also
			tag_menuscan_recurse(zx, o, item);
			//console.warn('tag_menuscan_recurse close sub:',JSON.stringify(item, null, 4));
			exports.tag_menuend(zx, o);

		} else {
			if (item.filename !== undefined) { //menu item
				//console.warn('tag_menuscan_recurse menu item:',JSON.stringify(item, null, 4));
				delete o.name; //make sure it default to a item
				fn = item.filename.replace(path.extname(item.filename), '');
				menu_objs = page.ParseFileToObject(zx, item.filename, "dropinmenu");
				//console.warn('tag_menuscan_recurse menu_objs bb:',menu_objs,' into ',zx.line_obj_current_tag_index);
				//produce the menu item

				var br = fileutils.locateclosestbuildroot(zx, fn);
				zx.linkfiles.push({
					name : "//" + br.filename,
					obj : o
				});
				o.form = br.filename;
				obj = getDecoratedMenuObject(zx, o, fileutils.changefileextn(i, ''));
				o.title = obj.title;
                //console.warn('tag_menuscan_recurse bbb:',br);
				if (menu_objs.length < 1) { //no definition so use beutified file name
					//console.warn('tag_menuscan_recurse locateclosestbuildroot:',br);
					tag_menu(zx, o);
				} else { //defined in the file


					for (var indx = 0; indx < menu_objs.length; indx++) {
                        if (menu_objs[indx].title === undefined)
                            menu_objs[indx].title = o.title;
                        if (menu_objs[indx].form === undefined)
                            menu_objs[indx].form = o.form;                    
						menu_objs[indx].tag = 'menu';
                        menu_objs[indx].srcinfo.current_tag_index=indx;
                        
                        //console.warn('tag_menuscan_recurse fff:',indx,menu_objs);
						tag_menu(zx, menu_objs[indx]);
                        //console.warn('tag_menuscan_recurse ggg:');
					}

				}
                //console.warn('tag_menuscan_recurse done zzz:',br);
			}
		}

	}
	//console.warn('tag_menuscan_recurse done');
};

exports.tag_menuscan = function (zx, o) {
	//<#MenuScan menuname=MainMenu from=user_table_name where=user_pk_field=Operator.user_pk_field>
	/*
	Inherits all applicable files and directories with the name starting with name specified in menuname= quale
	extracts them by name as objects under the main name - remove duplicates
	directories are sub menus
	files make menu items
	depending on the widget one, two or more levels deep


	 */
	//console.warn('tag_menuscan:',o);
	if (o.menuname === undefined) {
		zx.error.log_noQuale_warning(zx, "menuname not defined in menuscan", "menuname", o);
		return;
	}

	var ofile = gets(o.menuname);
	//scan for applicable menus in many folders
	//scans the file_stack for menus in the folder named in the menuname= quale
	//   scans inheritance libraries
	var filelist = [];
	var re = new RegExp('^' + ofile, "i");
    //console.warn('tag_menuscan for:',ofile,re,'rel:',o.srcinfo.file_stack[0].filename);
	filelist = fileutils.getDropinFileList(zx, re, o.srcinfo.file_stack[0].filename, zx.line_obj, 130024);

	//console.warn('tag_menuscan filelist:',filelist,'relative to:',o.srcinfo.file_stack[0].filename);
	//build/add to structure
	if (filelist.length > 0) {
		filelist.forEach(function (filename) {
			//var br=fileutils.locateclosestbuildroot(zx,filename.replace(path.extname(filename),''));
			var p = filename.indexOf(ofile) + ofile.length;
			var str = filename.substring(p);
			if (str.substr(0, 1) === '/')
				str = str.substring(1);
			if (str.substr(0, 1) === '/')
				str = str.substring(1);
			if (str === '') { //root
			} else {

				if (fs.statSync(filename).isDirectory()) {}
				else {
					//test there is not also a directory (or file without an extension) with the same name -
					//  this means this fiel is a stub for dropinmenu tag for the description of the menu header.
					var dn = fileutils.changefileextn(filename, '');
					//console.warn('tag_menuscan isDirectory:', dn);
					if (fs.existsSync(dn)) {}
					else {

						var parts = str.split(path.sep);
						parts.unshift(ofile);
						//console.warn('tag_menuscan parts:',parts);
						// console.warn('    tag_menuscan level b4 each:',JSON.stringify(zx.action.menu, null, 4));
						//if (zx.action.menu[ofile] === undefined ) zx.action.menu[ofile]={items:{}};
						var level = zx.action;

						parts.forEach(function (name, i) {
							//console.warn('    tag_menuscan level:',i,parts.length,name,level.menu[name]);
							if (level.menu[name] === undefined) {
								//console.warn('    tag_menuscan level creating >>>>>>>>>>>>:',name,' in ',level);
								level.menu[name] = {};
							}

							//console.warn('    tag_menuscan level acc b4:',JSON.stringify(zx.action.menu, null, 4));
							if (i < parts.length - 1) {
								if (level.menu[name].menu === undefined) {

									level.menu[name].menu = {}; //trace:('j,i:'+jj + ' ' + i)}
									level.menu[name].conf = path.dirname(filename);

								}

							} else {
								level.menu[name].filename = filename;
							}
							var newlevel = level.menu[name];
							//console.warn('    tag_menuscan level acc:',JSON.stringify(zx.action.menu, null, 4));
							level = newlevel;
						});
					}

				}
			}

			//console.warn('tag_menuscan str:',str);

		});
		//console.warn('tag_menugen start');
		//if (zx.action.menu[ofile]!==undefined)
		{
			//console.warn('tag_menugen input:',JSON.stringify(zx.action.menu[ofile].menu, null, 4));
			tag_menuscan_recurse(zx, o, zx.action.menu[ofile]);
		}
	}
};

var tag_menustart = exports.tag_menustart = function (zx, o) {
	//to join it with the auogen menus' o.filename - extract only the file anme part as the name for the menu....
	var ReplaceText = zxAction_start(zx, o);
	zx.mt.lines.push(ReplaceText);
	//console.warn('menustartX:',o,ReplaceText);
};
exports.tag_menuend = function (zx, o) {

	//if (active_pass!=zx.pass) return ;
	var ReplaceText = zxAction_end(zx, o);
	zx.mt.lines.push(ReplaceText);
	//console.warn('Menuend:',o,ReplaceText);
};

var tag_menu = exports.tag_menu = function (zx, o) {

	//if (active_pass!=zx.pass) return ;
	//console.warn('Menu:',o);
	if (gets(o.name) === "Start")
		return tag_menustart(zx, o);

	if (o.from === undefined)
		o.from = zx.conf.db.platform_user_table.user_table_name;
	if (o.where === undefined)
		o.where = zx.conf.db.platform_user_table.user_pk_field + '=Operator.' + zx.conf.db.platform_user_table.user_pk_field;

	var ReplaceText = zxAction(zx, o, 0);
	zx.mt.lines.push(ReplaceText);
	//console.warn('MenuX:',o,ReplaceText);
};


exports.tag_link = function (zx, o) {
	if (o.style === undefined)
		o.style = "Link";
	exports.tag_menu(zx, o);
};

exports.tag_button = function (zx, o) {
	if (o.style === undefined)
		o.style = "Button";
	exports.tag_menu(zx, o);
};

exports.tag_sqlbutton = function (zx, o) {
	//if (active_pass!=zx.pass) return ;
	//console.warn('tag_sqlbutton:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
	var ReplaceText = zxAction(zx, o, 2);
	//console.warn('tag_sqlbutton:',o,ReplaceText);
	zx.mt.lines.push(ReplaceText);
};
exports.tag_scriptbutton = exports.tag_sqlbutton;

exports.tag_dropinmenu = function (/*zx, line_obj*) {
	//ignore this here is is used in menu scan
	};

	exports.start_pass = function (/*zx, line_objects*/
) {
	//console.log('zx.action.menu:',zx.action.menu);
};

exports.start_item = function (/*zx, line_obj*/
) {};
exports.done_item = function (/*zx, line_obj*/
) {};
exports.done = function (/*zx, line_objects*/
) {};

exports.init = function (zx) {
	//validates and translates v2 tag contents to .divin input

	//console.warn('init action_widget:');

	zx.action = {};
	zx.action.level = 0;
	zx.action.menu = {};

};

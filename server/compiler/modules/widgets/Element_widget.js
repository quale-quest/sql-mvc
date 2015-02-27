"use strict";
/*
speed/memory performance  is not important
ease of use is important
 */
var fs = require('fs');
exports.module_name = 'element_widget.js';
exports.tags=[{name:"element"}];

var zx;
var getFieldStyleSub = function (CompoundKey) {
	var Result = zx.UIsl[CompoundKey];
	if (Result === undefined)
		return Result;
	if (Array.isArray(Result))
		Result = Result.join('');
	return String(Result).trim();
};

var getFieldStyle = function (cx, SubStyle, Type, Class, Action, Key) {
	var Result = '';
	/*
	Field style inheritance:
	Root is a simple text display field    - FieldView="$displayvalue$"
	Style(from context that the field is is (table or container or document))
	+ Substyle is  Slider Stars Link Button Href,LRef,Form  -- selected per field - display enhancement
	+ Type is Text,Numeric,Radio,Tick,Select,Action - per field  - format enhancement  - (Href,LRef,Form) should be format enhancement
	Class = "Field"
	Action View/Edit/Link - Input or display only

	DisplayEnhancement is least important - mostly cosmetic
	Style (can be inherited from the page,container or table) is a displayEnhancement
	SubStyle is also a display enhancement
	Type is a Format Enhancement can affect functionality
	Action View/Edit is a base function - only fall back to view if no other edit formats are available

	 */

	//console.log('getFieldStyle aa: ',cx.table);

	var Style = zx.properCase(cx.table.tablestyle);
	SubStyle = zx.properCase(SubStyle);
	Type = zx.properCase(Type);
	Class = zx.properCase(Class);
	Action = zx.properCase(Action);

	var Try;
	var Generic;
	Key = '_' + Key;

	//try first table specific styles
	Try = Style + SubStyle + Type + Class + Action + Key;
	Result = getFieldStyleSub(Try); //sbtca
	if (Result === undefined) {
		Try = SubStyle + Type + Class + Action + Key; //just without the table
		//Generic=Try; no need to warn
		Result = getFieldStyleSub(Try); //btca
	}
	if (Result === undefined) {
		Try = Style + Type + Class + Action + Key;
		Generic = Try;
		Result = getFieldStyleSub(Try); //stca
	}
	if (Result === undefined) {
		Try = Style + Class + Action + Key;
		Generic = Try;
		Result = getFieldStyleSub(Try); //sca - extra new in Divout
	}

	//generic styles

	if (Result === undefined) {
		Try = Type + Class + Action + Key;
		Generic = Try;
		Result = getFieldStyleSub(Try); //tca
	}
	if (Result === undefined) {
		Try = Type + Class + Action + Key;
		Generic = Try;
		Result = getFieldStyleSub(Try); //tca
	}
	if (Result === undefined) {
		Try = Class + Action + Key;
		Generic = Try;
		Result = getFieldStyleSub(Try); //ca
	}

	if (Result === undefined) {
		Try = Action + Key;
		Generic = Try;
		Result = getFieldStyleSub(Try); //a
	}
	if (Result === undefined) {
		Try = Class + "View" + Key;
		Generic = Try;
		Result = getFieldStyleSub(Try); //cv
	}
	if (Result === undefined) {
		Try = "View" + Key;
		Generic = Try;
		Result = getFieldStyleSub(Try); //v
	}

	if (Result === undefined) {
		Result = '';
		zx.error.log_noStyle_warning(zx, "ErrorNoFieldStyle: 1:", "Style:" + Style + " SubStyle:" + SubStyle + " Type:" + Type + " Class:" + Class + " Action:" + Action + " Key:" + Key +
			" SpecificElement==" + Style + SubStyle + Type + Class + Action + Key +
			" GenericElement==" + Action + Key, zx.line_obj);
	} else {
		if (Generic !== undefined) {
			zx.error.log_noStyle_warning(zx, "WarnNoClassUsingGenericFieldStyle: 1:", Generic + " instead of Style:" + Style + " SubStyle:" + SubStyle + " Type:" + Type + " Class:" + Class + " Action:" + Action + " Key:" + Key + " ==" + Style + SubStyle + Type + Class + Action + Key, zx.line_obj);
		}
	}
	//console.log('getFieldStyle: ',Style,"ss:",SubStyle,"t:",Type,"c:",Class,"a:",Action,'k:',Key,'Result:',Result);
	if (Result.substring(0, 8) === 'inherit:') {
		var inherit = Result.substring(8);
		Result = getFieldStyleSub(inherit);
		if (Result === undefined) {
			Result = '';
			zx.error.log_noStyle_warning(zx, "ErrorNoInheritedgetFieldStyle: 1:", "inherit:" + inherit + " from:" + Try, zx.line_obj);
		}

	}
	//console.log('getFieldStyle: ', Style, "ss:", SubStyle, "t:", Type, "c:", Class, "a:", Action, 'k:', Key, 'Result:', Result);
	if (Result === undefined) {
		zx.error.log_noStyle_warning(zx, "no style info at all: 99:");
		//    process.exit(2);
	}
	Result.replace(/\$CRLF\$/g, "\n");

	//convenience function to pass quale to cleint side widget
    
	
    //var show=0;
	Result = zx.process_tags(Result, 'repack(', ')', 0, function (value) {
    //console.log('repacking process_tags a: ', value);
		var a = value.split(',') || [value];
		var r = '"o":1'; //object dimention
        //show=1;
		a.forEach(function (p) {
//            if (r!=='') r+=',';
			r += "{{#field.f."+p+"}},\""+p+"\":\"{{field.f."+p+"}}\"{{/field.f."+p+"}}";
                 
		});
        //console.log('repacking process_tags: ', r);
        return r;
	});
    //if (show) console.log('repacking process_tags result: ', Result);

	return (Result);
};

var fieldSubItem = function (cx, FT) {
	var FieldHtml = '',
	template,
	tt;
	/* happens in sql script - implement with a softcodec
	AS hrefDisplay;
	if (DisplayValue=="")
	hrefDisplay = "________";
	else
	hrefDisplay=DisplayValue;
	 */
	try {
		//console.log('fieldSubItem a0: ',FT.cf[0].Action,FT.cf[0].form);
		if (FT.cf[0].Action === 'Link') //
		{
			//console.log('fieldSubItem A: ',cx.pop,FT);
			cx.QryOffset = zx.dbg.link_from_table(cx.zx,cx, FT);
			//  cx.QryUrl = "return(zxnav(event,{{0}},"+QryOffset+"));";

			tt = getFieldStyle(cx, FT.cf[0].substyle, FT.cf[0].Type, "Field", FT.cf[0].Action, "Main");
			//console.log('fieldSubItem A2: ',FT.SubStyle,FT.cf[0].Type,"Field",FT.cf[0].Action,ts);
			if (tt !== '') {
				//template = hogan.compile(tt);
				//FieldHtml = template.render(cx); //pop
                FieldHtml =  zx.hogan_ext.compile_render(zx, cx , tt); 
			}
			//console.log('fieldSubItem link: ',FieldHtml);
			//process.exit(2);

		} //ptr
		else if (FT.cf[0].Action === 'Edit') // this displays when edit is disabled
		{ //edit
			//console.log('fieldSubItem B: ',cx.pop,FT);
			//this kills the table  cx.tid=1111;

			cx.QryOffset = zx.dbg.edit_from_table(zx, cx, FT);

			tt = getFieldStyle(cx, FT.cf[0].substyle, FT.cf[0].Type, "Field", FT.cf[0].Action, "Main");
			if (tt !== '') {

				//template = hogan.compile(tt);
				//FieldHtml = '' + template.render(cx); //pop
                FieldHtml =  zx.hogan_ext.compile_render(zx, cx , tt); 
			}
			//console.log('fieldSubItem B2: ',FieldHtml,tt,FT);
		} else {
			//console.log('fieldSubItem C: ', cx.pop, FT);
			tt = getFieldStyle(cx, FT.cf[0].substyle, FT.cf[0].Type, "Field", FT.cf[0].Action, "Main");
			//console.log('fieldSubItem C1: ', tt);
			if (tt !== '') {
				//template = hogan.compile(tt);
				//FieldHtml = template.render(cx); //pop
                FieldHtml =  zx.hogan_ext.compile_render(zx, cx , tt); 
			}
			//console.log('fieldSubItem C2: ', FieldHtml, tt, FT);
		}

	} catch (e) {
		console.log('fieldSubItem 120818: ', FieldHtml, tt, FT);
		zx.error.caught_exception(zx, e, " fragment -120818, : " + tt);
		throw zx.error.known_error;
	}

	return FieldHtml;
};

var formatField = function (cx, FT /*, itemindex*/
) {

	//console.log('formatField: ',cx.pop,FT);
	if (FT.Type !== 'Hide') {

		if (FT.cf[0].Action === 'Edit')
			cx.EditCount++;

		var result = '';
		try {
			result += '' + fieldSubItem(cx, FT, FT.cf[0].Action);
			cx.pop = result + '';

		} catch (e) {
			zx.error.caught_exception(zx, e, " formatField -120556, fieldSubItemt : " + "\ncx: " + JSON.stringify(cx));
			throw zx.error.known_error;
		}
		//console.log('formatField B: ',cx.pop,FT);

		/*div wraps individual radios all into one*/
		try {
			var ts = getFieldStyle(cx, FT.cf[0].substyle, FT.cf[0].Type, "Field", FT.cf[0].Action, "Div");
			//var template = hogan.compile(ts);
            //console.log('template.render(cx): -----------------------------------',cx.field);
			//cx.pop = '' + template.render(cx); //pop
            cx.pop =  zx.hogan_ext.compile_render(zx, cx , ts);  
            
		} catch (e) {
			zx.error.caught_exception(zx, e, " formatField -120555, hogan fragment : " + JSON.stringify(ts) + "\ncx: " + JSON.stringify(cx));
			throw zx.error.known_error;
		}

		//console.log('fieldSubItem X2: ',ts,cx.pop);

		//this is produces scripts for executing after the page has loaded
		//template = hogan.compile(getFieldStyle(cx, FT.substyle, FT.cf[0].Type, "Field", FT.cf[0].Action, "Script"));        
		//cx.TableFieldScripts += template.render(cx); //cs.id displayvalue size maxsize value variable ContextHelp
        cx.TableFieldScripts += zx.hogan_ext.compile_render(zx, cx , getFieldStyle(cx, FT.substyle, FT.cf[0].Type, "Field", FT.cf[0].Action, "Script"));  

	} //h

	return '' + cx.pop;
};

exports.construct_widget_from_element = function (cx, widget, j, HeaderOrBodyOrFooter) { //construct_widget_from_element
	//field widgets normally sit in tables not by themselves .....
	//console.log('construct_widget_from_element a: ',cx.table,HeaderOrBodyOrFooter,widget);
	if (HeaderOrBodyOrFooter === 'Head') {
		//console.log('rendering..:');
		//var template = hogan.compile(getFieldStyle(cx,widget.cf[0].substyle,widget.cf[0].Type,"Field","View",HeaderOrBodyOrFooter));

		//cx.TableFieldScripts += template.render(cx);  //cs.id displayvalue size maxsize value variable ContextHelp
		//console.log('...rendered:');
		cx.pop = '';
	} else if (HeaderOrBodyOrFooter === 'Foot')
		cx.pop = '';
	else {
		//cx.pop='[['+(+widget.indx+1)+']]';
		cx.f_index = String(+widget.indx + 1);
		cx.pop = cx.f_index;
		//console.log('construct_widget_from_element b: ',cx.pop,widget);
		cx.pop = formatField(cx, widget, j);
		//console.log('construct_widget_from_element c: ',cx.pop,widget);
		//process.exit(2);
	}
	// console.log('construct_widget_from_element: ',HeaderOrBodyOrFooter,widget);
};

exports.start_pass = function (/*zx, line_objects*/
) {
	//zx.Container.Tabs=[{Item:0,List:[]}];
};

exports.done_div = function (/*zx, line_objects*/
) { //dinviner does not use this yet - TODO expand diviner...


};

exports.shut_down = function (zx) {    
    var str='';
    
    zx.forFields(zx.UIsl, function (el,key) {
        //console.log('ul element name:',key,' el:',el);
        var es=zx.gets(el,'\n    ');
        //es = es.replace(/\/>/g, "\\#>");
        //console.log('ul element name:',key,' el:',es);
        str = str +"\n\nelement("+key+")\n    "+es;
    });
    //console.log('ul element str:',str);
    fs.writeFileSync(zx.output_folder + 'elements.quicc',"<#"+str+"/>" );
}

exports.start_up = function (zx) {
    zx.UIsl = {};

	//zx.UIsl = require('../../Elements_UI_7.json');
}

exports.tag_element = function (zx, o) { //overrides or extends the ui
    if (zx.pass!==1) return;
    if (!o.name) o.name=o.array[0];
    if (!o.name) return;
    var code = o.body.trim();    
    code = code.replace(/!<=/g, ">");
    //code = code.replace(/\\#>/g, "\/>");
	//console.log('tag_element name:',o.name,code);//.name,' el:',zx.gets(o.code));
	zx.UIsl[o.name] = code;
};

exports.init = function (global_zx) {

	//console.warn('init Element_widget:');
	zx = global_zx;

};


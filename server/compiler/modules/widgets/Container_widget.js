"use strict";
/*
speed/memory performance  is not important
ease of use is important
 */
 
var hogan = require("hogan")
exports.module_name='container_widget.js';
 
var get_style = function (zx, o, Key) { //used for g960,container and notify  //this can be made common into a style plugin
	var Value = "";
	if (o.localstyle !== undefined) {
		Value = zx.UIsl[o.localstyle + Key];
	} else {
		if (o.style !== undefined)
			zx.Container.Style = o.style; //set new style for the rest of the buttons

		if (zx.Container.Style !== "")
			Value = zx.UIsl[zx.Container.Style + Key];
	}

	if ((Value === undefined) || (Value === "")) //not set so use the unstyled value
		Value = zx.UIsl[Key];
	if (Value === undefined)
		return "";

	return Value;
};

var zxContainerSubst = function (zx, o, Result) {

    o.tabid = "TabID" + zx.Container.Tabs[0].List[zx.Container.Tabs[0].Item].tab + String(zx.Container.Tabs[0].Item) ;   
	if (Result.indexOf("{{tabid}}") > 0) 		
		zx.Container.Tabs[0].Item++;
    //console.log('zxContainerSubst : ',Result,o);
    Result = hogan.compile(Result).render(o);
    //console.log('zxContainerSubst done: ',Result);
	Result = Result.replace(/\$CRLF$/g, "\n");
	return Result;
};

var zxContainerOpen = function (zx, o) {
   
	if (o.style !== undefined)
		zx.Container.Style = o.style;

	//Push the current strings
	var newcontianer = {
		Item : 0,
        Indx : zx.Container.ContainerIndex,
		List : []
	};
    
    o.tab =  zx.gets(o.tab); //make sure it is a single string
    if (zx.pass==1)
            newcontianer.List.push(o);   
        else
             newcontianer.List = zx.Container.TabLists[newcontianer.Indx] ;    

	zx.Container.Tabs.unshift(newcontianer);
	var content='';
	for (var i = 0; i < zx.Container.Tabs[0].List.length; i++) {
        var tab_item=zx.Container.Tabs[0].List[i];        
        if (tab_item.title===undefined) tab_item.title = zx.Beautify(zx.Container.Tabs[0].List[i].tab);
        o.tabid="TabID" + zx.Container.Tabs[0].List[i].tab + String(i);
        var item = get_style(zx, o, "ContainerItemList");
        //console.log('zxContainerOpen items: ',tab_item);
        content += hogan.compile(item).render(tab_item);
	}
    
    o.TabList=content;    
	var Result = get_style(zx, o, "ContainerOpen");
    
	Result = zxContainerSubst(zx, o, Result);

	return Result;
};

var zxContainerNext = function (zx, o /*, Type*/
) {
	//TODO  conditional container should disable all other elements up to its closure -new feature
	var Result = "";
    //console.log('zxContainerNext a: ',o.tab,zx.pass );
    o.tab =  zx.gets(o.tab); //make sure it is a single string
    if (zx.pass==1) zx.Container.Tabs[0].List.push(o);
	//if we have no more tab titles then drop to static divs
	if (zx.Container.Tabs[0].List.length <= zx.Container.Tabs[0].Item) {
		Result = zxContainerClose(zx, o);
		Result += zxContainerOpen(zx, o);
		return Result;
	}

	Result = get_style(zx, o, "ContainerNext");
	if (Result === "") //no next so close and re-open
	{
		Result = get_style(zx, o, "ContainerClose") + get_style(zx, o, "ContainerOpen");
		//console.log('zxContainerOpen Result: ',Result );
	}

	Result = zxContainerSubst(zx, o, Result);
	return Result;

};

var zxContainerClose = function (zx, o) {
	var Result = get_style(zx, o, "ContainerClose");
	// not realy needed and messes up the next tab switch due to removing the title zxContainerSubst(TagParams,Result);

	//pop the parent stings
	if (zx.Container.Tabs[0].List.length > 0) {
        zx.Container.TabLists[zx.Container.Tabs[0].Indx]=zx.Container.Tabs[0].List ;    
		zx.Container.Tabs.shift();
	}
	return Result;
};

exports.tag_container = function (zx, o) {
     zx.Container.ContainerIndex++; 
	var ReplaceText = zxContainerOpen(zx, o);
	zx.mt.lines.push(ReplaceText);
	//console.log('tag_container: ',o,ReplaceText,zx.mt.lines );
};

exports.tag_nextcontainer = function (zx, o) {
	var ReplaceText = zxContainerNext(zx, o, 98);
	zx.mt.lines.push(ReplaceText);
};

exports.tag_closecontainer = function (zx, o) {
	var ReplaceText = zxContainerClose(zx, o);
	zx.mt.lines.push(ReplaceText);
};

exports.start_pass = function (zx /*, line_objects*/
) {

    
	zx.Container.Tabs = [{
			Item : 0,
			List : []
		}
	];
    zx.Container.ContainerIndex=0;
    
};
exports.done_pass = function (zx, line_obj) {
	if (zx.pass === 1) {
		//console.log(' model db_update.update:');
		zx.db_update.update(zx);
		//console.log(' model db_update.update done:');
	}
};

exports.done_div = function (/*zx, line_objects*/
) { //dinviner does not use this yet - TODO expand diviner...

	//TODO close any open containers before the div ends

};
exports.start_page = function (zx) {
    zx.Container.Style = "";
}

exports.start_up = function (zx) {
	//validates and translates v2 tag contents to .divin input
    

	//console.warn('init container_widget:');
	zx.Container = {};
    zx.Container.TabLists=[];
	zx.Container.Style = "";

};
